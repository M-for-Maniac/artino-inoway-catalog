# ARTINO × INOWAY V4.1 — Local Catalog Workflow

This version keeps the public catalog static and GitHub Pages compatible while making the local catalog/image workflow explicit.

## The four pieces

- `index.html` — public catalog
- `admin.html` — local catalog record manager
- `data/catalog.json` — source catalog data
- `tools/add_image.py` — local image intake, naming, optimization and catalog linking

`script.js` contains an embedded copy of `catalog.json` so the public catalog also works when opened locally.

## Recommended workflow

### A. Create or edit a catalog item

1. Open `admin.html`.
2. Add/edit the product, solution or project information.
3. Click **Download JSON**.
4. Replace the repository's `data/catalog.json` with the downloaded file.

For existing items, you can also edit the JSON directly if preferred.

### B. Add an image

**Keep the original image wherever it already is on your computer.** Do not manually copy it into the repository first.

In `admin.html`, use **Image Naming & Processing Generator** to enter:

- company
- category
- item ID
- title
- role
- sequence
- full local source-image path

Copy the generated command into the VS Code terminal while the terminal is opened at the repository root.

Example:

`python tools/add_image.py --image "C:\Artino Photos\New Project\IMG_4837.jpg" --company artino --category artino-acrylic --item A-ACR-002 --title "Illuminated Acrylic Display" --role detail --seq 01`

The tool automatically:

1. reads the original image from its existing location;
2. creates the correct repository folder;
3. generates the canonical filename;
4. corrects EXIF orientation;
5. converts to RGB JPEG;
6. resizes to a maximum of 1800px;
7. optimizes the file;
8. adds the resulting path to the matching item in `data/catalog.json`;
9. synchronizes the embedded catalog data in `script.js`.

The processed file will appear under:

`images/<company>/<category>/<canonical-filename>.jpg`

### C. Add more images

Repeat the command with sequence numbers such as `02`, `03`, `04`.

### D. Review

Open `index.html` locally or check the GitHub Pages site. Confirm the images and catalog content.

### E. Publish

From the repository root, run:

`PUBLISH_CATALOG.ps1`

The script synchronizes `script.js`, shows the Git changes, asks for confirmation, then runs `git add`, `git commit` and `git push`.

Your existing Git authentication is used. No GitHub token is stored in the website.

## Image naming convention

`company-category-title-itemID-role-sequence.jpg`

Example:

`artino-acrylic-illuminated-acrylic-display-a-acr-002-detail-01.jpg`

## Important distinction

The `tools/add_image.py` script is **not ChatGPT's image-generation tool**. It is a local catalog asset tool for preparing images you already have.

## GitHub Pages

No server, package.json or homepage property is required for the static public catalog.
