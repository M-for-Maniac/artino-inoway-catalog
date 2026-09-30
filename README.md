# ARTINO × INOWAY V4.1 — Bilingual Local Catalog Workflow

This version keeps the public catalog static and GitHub Pages compatible while supporting **English / Persian language switching**.

## Public catalog

- `index.html` — public bilingual catalog shell
- `script.js` — embedded catalog data + language/rendering logic
- `styles.css` — responsive layout, dark mode, print styles and Persian right-to-left support
- `data/catalog.json` — source catalog data in English with Persian counterparts

The language preference is saved in the browser. Persian uses right-to-left layout; English uses left-to-right layout.

## Bilingual data structure

Stable IDs, image paths and the existing English fields remain unchanged. Persian counterparts use `_fa` fields, for example:

- `name` / `name_fa`
- `role` / `role_fa`
- `intro` / `intro_fa`
- `description` / `description_fa`
- `summary` / `summary_fa`
- `specs` / `specs_fa`
- `status` / `status_fa`
- `client` / `client_fa`

This avoids changing the existing IDs and keeps image-management tooling compatible.

## Catalog manager

`admin.html` remains the local record and image-management tool. It now carries bilingual product fields and includes a Persian/English direction toggle. Exporting JSON preserves both language versions.

## Image workflow

`tools/add_image.py` still reads `data/catalog.json`, adds the optimized image path to the selected item, and then calls `tools/build_catalog.py`.

`tools/build_catalog.py` synchronizes the complete bilingual `catalog.json` data block into `script.js` without changing the rendering logic.

## Publish

From the repository root:

`PUBLISH_CATALOG.ps1`

The publishing script synchronizes `script.js`, shows Git changes, asks for confirmation, then commits and pushes.

## GitHub Pages

No server or package manager is required. The catalog remains a static GitHub Pages site.

## PDF and image loading notes

- The catalog uses eager image loading for catalog and project cards so GitHub Pages does not defer gallery assets unexpectedly.
- Image URLs are resolved against the active page URL, making them safe when the repository is served from a GitHub Pages subpath.
- PDF export renders from a dedicated in-page export surface rather than an off-screen negative-z-index element, which prevents blank PDF output in Chromium-based browsers.
- Project and product PDFs include all images in the relevant `images` array.


## Local testing

The catalog can be opened directly from `index.html`. Browser security rules around `file://` can vary, so GitHub Pages or a local HTTP server is recommended for final verification. The catalog now safely handles browsers that deny `localStorage` on `file://` pages.

## PDF export

The PDF buttons generate a dedicated A4 print layout rather than printing the catalog UI. Choose **Save as PDF** in the browser print dialog. Project/product exports include the complete `images[]` gallery, and the full catalog export includes the complete project galleries.


## Local image testing

The catalog uses the normal `images/` paths on HTTP/GitHub Pages. When opened directly with `file://`, it loads `image-fallbacks.js`, generated from the image paths referenced by `catalog.json`, so Windows file-origin restrictions do not prevent catalog images from rendering. Run `tools/build_catalog.py` after adding or changing catalog image references to regenerate the fallback map. `IMAGE_TEST.html` provides a simple direct-image diagnostic.
