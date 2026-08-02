const FICHAS_INDEX = "fichas/index.json";

const listElement = document.querySelector("#plant-list");
const contentElement = document.querySelector("#content");
const searchElement = document.querySelector("#search");
const countElement = document.querySelector("#count");

let plants = [];
let selectedSlug = null;

function parseFrontMatter(markdown) {
  if (!markdown.startsWith("---")) return { data: {}, body: markdown };

  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: markdown };

  const raw = markdown.slice(4, end).trim();
  const data = {};

  for (const line of raw.split("\n")) {
    const separator = line.indexOf(":");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^[\"']|[\"']$/g, "");
    data[key] = value;
  }

  return { data, body: markdown.slice(end + 4).trim() };
}

function titleFrom(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function normalizeForSearch(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolveRelativeAssets(container, filePath) {
  container.querySelectorAll("img[src]").forEach((image) => {
    const src = image.getAttribute("src");
    if (!src || /^(https?:|data:)/i.test(src)) return;
    image.src = new URL(src, new URL(filePath, window.location.href)).href;
    image.loading = "lazy";
  });
}

function setUrl(slug) {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set("ficha", slug);
  else url.searchParams.delete("ficha");
  history.replaceState({}, "", url);
}

function renderList(items = plants) {
  countElement.textContent = items.length;
  listElement.innerHTML = "";

  for (const plant of items) {
    const button = document.createElement("button");
    button.className = `plant-link${plant.slug === selectedSlug ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `<strong>${escapeHtml(plant.title)}</strong><small>${escapeHtml(plant.meta.nombre_cientifico || plant.meta.ubicacion || "Ficha de seguimiento")}</small>`;
    button.addEventListener("click", () => showPlant(plant.slug));
    listElement.appendChild(button);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderEmpty(filtered = false) {
  contentElement.innerHTML = filtered
    ? `<div class="empty"><div class="empty-icon">🔎</div><h2>Sin coincidencias</h2><p>Prueba con otro nombre, especie o ubicación.</p></div>`
    : `<div class="empty"><div class="empty-icon">🪴</div><h2>La colección está preparada</h2><p>La primera ficha aparecerá aquí cuando se añada al índice.</p></div>`;
}

function showPlant(slug) {
  const plant = plants.find((item) => item.slug === slug);
  if (!plant) {
    selectedSlug = null;
    setUrl(null);
    renderList();
    renderEmpty();
    return;
  }

  selectedSlug = slug;
  setUrl(slug);
  renderList();

  const chips = [
    plant.meta.nombre_cientifico,
    plant.meta.ubicacion,
    plant.meta.confianza_identificacion ? `Confianza: ${plant.meta.confianza_identificacion}` : null,
    plant.meta.ultima_revision ? `Revisada: ${plant.meta.ultima_revision}` : null
  ].filter(Boolean);

  const safeMarkdown = DOMPurify.sanitize(marked.parse(plant.body));
  contentElement.innerHTML = `
    ${chips.length ? `<div class="meta">${chips.map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join("")}</div>` : ""}
    <div class="markdown-body">${safeMarkdown}</div>
  `;
  resolveRelativeAssets(contentElement, plant.path);
  window.scrollTo({ top: document.querySelector(".layout").offsetTop - 90, behavior: "smooth" });
}

function filterPlants(query) {
  const normalized = normalizeForSearch(query.trim());
  const filtered = normalized
    ? plants.filter((plant) => plant.searchText.includes(normalized))
    : plants;

  renderList(filtered);

  if (!filtered.length && normalized) renderEmpty(true);
  else if (!selectedSlug && filtered.length) showPlant(filtered[0].slug);
}

async function fetchPlants() {
  const indexResponse = await fetch(FICHAS_INDEX, { cache: "no-store" });
  if (!indexResponse.ok) throw new Error(`No se pudo leer el índice de fichas (${indexResponse.status})`);

  const filenames = await indexResponse.json();
  if (!Array.isArray(filenames)) throw new Error("El índice de fichas no es válido");

  const files = filenames.filter((name) =>
    typeof name === "string" &&
    name.toLowerCase().endsWith(".md") &&
    name.toLowerCase() !== "readme.md"
  );

  const loaded = await Promise.all(files.map(async (filename) => {
    const path = `fichas/${filename}`;
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`No se pudo leer ${filename}`);
    const markdown = await response.text();
    const parsed = parseFrontMatter(markdown);
    const slug = filename.replace(/\.md$/i, "");
    const title = parsed.data.nombre || titleFrom(parsed.body, slug);

    return {
      slug,
      title,
      path,
      body: parsed.body,
      meta: parsed.data,
      searchText: normalizeForSearch([
        title,
        parsed.data.nombre_cientifico,
        parsed.data.ubicacion,
        parsed.data.resumen,
        parsed.body
      ].filter(Boolean).join(" "))
    };
  }));

  return loaded.sort((a, b) => a.title.localeCompare(b.title, "es"));
}

async function init() {
  try {
    plants = await fetchPlants();
    const requested = new URL(window.location.href).searchParams.get("ficha");
    renderList();

    if (!plants.length) {
      renderEmpty();
      return;
    }

    showPlant(plants.some((plant) => plant.slug === requested) ? requested : plants[0].slug);
  } catch (error) {
    console.error(error);
    contentElement.innerHTML = `<div class="error"><div class="empty-icon">🌧️</div><h2>No se pudieron cargar las fichas</h2><p>Comprueba la conexión y vuelve a intentarlo. El repositorio sigue conservando todos los documentos.</p></div>`;
  }
}

searchElement.addEventListener("input", (event) => filterPlants(event.target.value));
init();
