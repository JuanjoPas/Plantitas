# Plantitas Agent Instructions

## Authority

- Gentle AI is the sole development harness for this repository.
- Use the active Gentle AI routing rules for direct work, delegated work, SDD, and RDD.
- Do not introduce alternative orchestration, review, memory, or delivery workflows.
- Use SDD artifacts from `openspec/` and Engram according to the active session preflight.
- RDD receipts are the delivery authority whenever review mode is enabled.
- GGA reads this file as its project review-rules source; it complements RDD and does not replace it.

## Project Context

- This is a static GitHub Pages site using vanilla HTML, CSS, JavaScript, JSON, and Markdown.
- Published plant records in `fichas/` are the source of truth; the web viewer only renders them.
- Incomplete records MUST remain in `borradores/` and MUST NOT appear on the published site.
- Publish a record only after all required information is complete and confirmed according to `README.md` and `plantillas/FICHA-PLANTA.md`.
- When publishing or renaming a record, keep `fichas/index.json` synchronized.
- Use lowercase hyphenated filenames without spaces or accents.
- Store specimen images under `imagenes/{specimen}/`.

## Verification

- No automated test runner, linter, formatter, type checker, or build step currently exists.
- Verify changes against the publication checklist in `README.md` and the relevant rendered-page behavior.
- Treat the GitHub Pages workflow as deployment evidence, not as a substitute for content validation.
- Never invent botanical facts. Taxonomy, care, toxicity, pests, and treatments require authoritative sources; specimen-specific facts require user confirmation or adequate photographs.
