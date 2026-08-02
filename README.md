# Plantitas 🌿

Archivo personal de plantas domésticas gestionado desde ChatGPT.

## Regla principal

Las fichas publicadas deben estar completas y confirmadas. Una ficha con campos “Sin confirmar” no se considera útil y no puede aparecer en la web.

La información se valida de dos formas:

- Los datos del ejemplar y de su cultivo los confirma Juanjo o se comprueban mediante fotografías adecuadas.
- La taxonomía, los cuidados, la toxicidad, las plagas y los tratamientos se contrastan con fuentes oficiales, científicas, universitarias o técnicas.

## Flujo obligatorio

1. Juanjo envía fotografías de la planta.
2. Se abre un borrador privado de recopilación en `borradores/`.
3. Se identifica la planta con un nivel explícito de confianza.
4. Se investigan y contrastan todos los datos botánicos y de cuidados.
5. Se hacen las preguntas necesarias, una por una.
6. Se solicitan fotografías concretas cuando sean necesarias para confirmar un dato.
7. Se completa el control de publicación de la plantilla.
8. Solo entonces se mueve la ficha terminada a `fichas/` y se añade a `fichas/index.json`.

Los borradores no aparecen en la página. Los Markdown publicados son la fuente de verdad y la web solo los presenta.

## Estructura

- `plantillas/FICHA-PLANTA.md`: plantilla maestra y control de publicación.
- `borradores/`: recopilación de plantas aún incompletas; no visible en la web.
- `fichas/`: fichas completas y confirmadas.
- `imagenes/`: fotografías organizadas por ejemplar.
- `index.html`, `styles.css` y `app.js`: visualizador.
- `.github/workflows/pages.yml`: publicación automática.

## Convención de nombres

Usar minúsculas y guiones, sin espacios ni tildes:

- Ficha: `fichas/monstera-deliciosa-salon.md`
- Borrador: `borradores/monstera-deliciosa-salon.md`
- Imágenes: `imagenes/monstera-deliciosa-salon/2026-08-02-01.webp`

Si existen dos ejemplares de la misma especie, añadir su ubicación o un número.

## Publicación

La fuente de GitHub Pages debe ser **GitHub Actions**.

https://juanjopas.github.io/Plantitas/
