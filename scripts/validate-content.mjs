#!/usr/bin/env node
// Publication gate for the static site.
// Validates fichas/index.json against the published fichas/*.md files before
// the Pages workflow stages the _site/ artifact. Dependency-free by design:
// only node:fs/promises and node:path (see design.md).

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const FICHAS_DIR = path.join(ROOT, "fichas");
const INDEX_FILE = path.join(FICHAS_DIR, "index.json");

const SAFE_FILENAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;
const EXCLUDED_FILES = new Set(["README.md"]);
const REQUIRED_FIELDS = [
  "id",
  "nombre",
  "nombre_cientifico",
  "ubicacion",
  "estado",
  "confianza_identificacion",
  "fecha_alta",
  "ultima_revision",
  "imagen_principal",
  "resumen"
];
const DATE_FIELDS = ["fecha_alta", "ultima_revision"];
const FORBIDDEN_PLACEHOLDERS = ["Sin confirmar", "AAAA-MM-DD"];
// Front matter must close within this many lines; unbounded blocks are rejected.
const FRONT_MATTER_MAX_LINES = 60;

const diagnostics = [];
const report = (file, reason) => diagnostics.push(`${file}: ${reason}`);

// Parses the flat `key: value` front matter block, mirroring the app.js parser.
// Reports and returns null when the block is missing or never closes.
function parseFrontMatter(text, file) {
  const lines = text.split("\n");
  if (lines[0].trim() !== "---") {
    report(file, "missing opening front matter marker ---");
    return null;
  }
  let end = -1;
  for (let i = 1; i < lines.length && i <= FRONT_MATTER_MAX_LINES; i += 1) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) {
    report(file, `front matter block does not close within ${FRONT_MATTER_MAX_LINES} lines`);
    return null;
  }
  const data = {};
  for (const line of lines.slice(1, end)) {
    const separator = line.indexOf(":");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    data[key] = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
  }
  return data;
}

// Accepts only real calendar dates in strict YYYY-MM-DD form.
function isRealDate(value) {
  if (!DATE_SHAPE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// Validates index.json shape, filename safety, and uniqueness.
// Returns the list of valid indexed filenames.
function validateIndex(rawIndex) {
  let entries;
  try {
    entries = JSON.parse(rawIndex);
  } catch {
    report("fichas/index.json", "malformed JSON");
    return [];
  }
  if (!Array.isArray(entries)) {
    report("fichas/index.json", "index must be a JSON array of filenames");
    return [];
  }
  const valid = [];
  const seen = new Set();
  for (const entry of entries) {
    if (typeof entry !== "string" || !SAFE_FILENAME.test(entry)) {
      report("fichas/index.json", `unsafe or malformed filename: ${JSON.stringify(entry)}`);
    } else if (seen.has(entry)) {
      report("fichas/index.json", `duplicate entry: ${entry}`);
    } else {
      seen.add(entry);
      valid.push(entry);
    }
  }
  return valid;
}

// Validates one published ficha front matter block.
function validateFicha(filename, text) {
  const file = `fichas/${filename}`;
  const data = parseFrontMatter(text, file);
  if (!data) return;
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) report(file, `missing or empty required field: ${field}`);
  }
  if (data.estado && data.estado !== "publicada") {
    report(file, `estado must be "publicada", found "${data.estado}"`);
  }
  for (const field of DATE_FIELDS) {
    if (data[field] && !isRealDate(data[field])) {
      report(file, `invalid date in ${field}: "${data[field]}" (expected a real YYYY-MM-DD date)`);
    }
  }
  for (const [field, value] of Object.entries(data)) {
    for (const placeholder of FORBIDDEN_PLACEHOLDERS) {
      if (value.includes(placeholder)) {
        report(file, `forbidden placeholder "${placeholder}" in field: ${field}`);
      }
    }
  }
}

let rawIndex;
try {
  rawIndex = await readFile(INDEX_FILE, "utf8");
} catch {
  report("fichas/index.json", "index file is missing or unreadable");
}
const indexed = rawIndex === undefined ? [] : validateIndex(rawIndex);

let dirNames;
try {
  dirNames = await readdir(FICHAS_DIR);
} catch {
  report("fichas/", "fichas directory is missing or unreadable");
  dirNames = [];
}
const onDisk = dirNames.filter(
  (name) => name.toLowerCase().endsWith(".md") && !EXCLUDED_FILES.has(name)
);
const diskSet = new Set(onDisk);
const indexSet = new Set(indexed);

// Bidirectional agreement: every indexed file exists, every published file is indexed.
for (const name of indexed) {
  if (!diskSet.has(name)) report("fichas/index.json", `indexed file does not exist: fichas/${name}`);
}
for (const name of onDisk) {
  if (!indexSet.has(name)) report(`fichas/${name}`, "published ficha is not listed in fichas/index.json");
}

for (const name of indexed) {
  if (diskSet.has(name)) {
    validateFicha(name, await readFile(path.join(FICHAS_DIR, name), "utf8"));
  }
}

if (diagnostics.length > 0) {
  console.error(`Content validation failed with ${diagnostics.length} problem(s):`);
  for (const diagnostic of diagnostics) console.error(`  - ${diagnostic}`);
  process.exitCode = 1;
} else {
  console.log(`Content validation passed (${indexed.length} published ficha(s)).`);
}
