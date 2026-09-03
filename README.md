# ARTINO × INOWAY — Responsive Master Catalog V3

V3 makes the main catalog **portable**. The public catalog no longer needs `fetch()` to load its catalog data, so `index.html` can be opened directly from phone storage (`file://`) and still render the catalog.

## Works in
- Windows / desktop browsers
- Android / mobile browsers that allow local HTML files
- Localhost
- GitHub Pages
- Other static hosting

## Architecture
`data/catalog.json` is the editable source of truth.

The public `index.html` / `script.js` contains an embedded copy of that data so the public catalog is self-contained.

After editing `data/catalog.json`, run:

`node build-catalog.js`

This updates the embedded public data.

## Catalog Manager
Open `admin.html`.

It supports:
- add product / solution
- edit product / solution
- delete product / solution
- add project
- edit project
- delete project
- import JSON
- export JSON

Because browsers cannot reliably rewrite local files, the manager exports `catalog.json`. Replace the package's `data/catalog.json`, then run the build script before publishing.

## GitHub Pages
This package is compatible with GitHub Pages because it is a static site: HTML, CSS, JavaScript, JSON and images only.

A future backend is optional. It is not required for the catalog's public experience.

## Image paths
Use relative paths such as:

`images/artino/signage-01.jpg`

Replace the placeholder image with your actual image while keeping the path/name, or update the path in the catalog manager.

## Publishing
For GitHub Pages:
1. Put the package contents in a GitHub repository.
2. Push changes.
3. Enable GitHub Pages for the repository.
4. The catalog becomes a live responsive website.

## Important
This is still a master framework. Verify product specifications, dates, standards, project claims, client permissions and technical details before external publication.
