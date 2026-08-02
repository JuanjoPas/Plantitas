# Plantitas 🌿

Archivo personal de plantas domésticas gestionado desde ChatGPT.

## Cómo funciona

1. Juanjo envía fotografías y los datos reales de una planta.
2. ChatGPT identifica la especie con un nivel explícito de confianza.
3. Contrasta en fuentes oficiales, científicas, universitarias o técnicas la información que pueda variar o entrañar riesgo.
4. Crea una ficha Markdown a partir de `plantillas/FICHA-PLANTA.md`.
5. Guarda la ficha en `fichas/` y sus imágenes en `imagenes/<identificador>/`.
6. El visualizador web descubre automáticamente las fichas y permite buscarlas y leerlas.

Los archivos Markdown son la fuente de verdad. La web solo los presenta.

## Estructura

- `plantillas/FICHA-PLANTA.md`: plantilla maestra.
- `fichas/`: una ficha por planta.
- `imagenes/`: fotografías organizadas por planta.
- `index.html`, `styles.css` y `app.js`: visualizador.
- `.github/workflows/pages.yml`: publicación automática en GitHub Pages.

## Convención de nombres

Usar minúsculas y guiones, sin espacios ni tildes:

- Ficha: `fichas/monstera-deliciosa-salon.md`
- Imágenes: `imagenes/monstera-deliciosa-salon/2026-08-02-01.jpg`

Si hay dos ejemplares de la misma especie, añadir su ubicación o un número al identificador.

## Publicación

El proyecto incluye el flujo oficial de despliegue para GitHub Pages. En la configuración del repositorio, la fuente de Pages debe ser **GitHub Actions**.

La página prevista es: https://juanjopas.github.io/Plantitas/
