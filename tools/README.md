# Catalog image workflow

## The simple version

You do **not** need to rename, move or prepare your original photo first.

Keep the original wherever it already lives on your computer, for example:

`C:\Artino Photos\New Project\IMG_4837.jpg`

Then open `admin.html` and use **Image Intake**:

1. Paste the full local path to the original image.
2. Choose the catalog item from the dropdown.
3. Choose what the image is for: Main, Detail, Hero, Gallery or Thumbnail.
4. Copy the generated command.
5. Paste it into the VS Code terminal opened at the catalog repository root.

The command is intentionally short:

`python tools/add_image.py --image "C:\Artino Photos\New Project\IMG_4837.jpg" --item "A-ACR-002" --role "detail"`

## What the tool decides automatically

You do **not** enter these anymore:

- company
- category
- item title
- sequence number
- filename
- repository destination

The tool reads the selected item from `data/catalog.json` and derives all of them.

For example, if the item is:

- Company: Artino
- Category: Acrylic Fabrication
- ID: A-ACR-002
- Name: Illuminated Acrylic Display

and this is the first Detail image, it creates something like:

`images/artino/acrylic/artino-acrylic-illuminated-acrylic-display-a-acr-002-detail-01.jpg`

If you run the same command again for another Detail image, it automatically uses `02`, then `03`, and so on.

## What happens to the original?

Nothing. The original stays where it is. The tool creates a separate optimized catalog copy.

The catalog copy is:

- corrected for EXIF orientation
- converted to RGB JPEG
- resized to a maximum of 1800px on its longest side
- compressed and optimized
- placed under `images/<company>/<category>/`

The tool then:

1. adds the new image path to the matching item in `data/catalog.json`;
2. runs `tools/build_catalog.py`;
3. synchronizes the embedded catalog data in `script.js`.

## New categories

Create a category in `admin.html` first. After adding/editing it, click **Download JSON** and replace the repository's `data/catalog.json` with the downloaded file. Then the image tool will recognize the new category automatically.

## Terminal location

The VS Code terminal must be opened at the **catalog repository root** — the folder containing `index.html`, `admin.html`, `script.js`, `data/` and `tools/`.

## Publish

After reviewing the result, run `PUBLISH_CATALOG.ps1` from the repository root.

No GitHub token is stored in the website.
