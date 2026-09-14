#!/usr/bin/env python3
"""Add an optimized source image to a catalog item.

The user only needs to provide the source image, catalog item ID and image role.
Company, category, title and the next sequence number are derived automatically
from data/catalog.json and the existing image files.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "catalog.json"

def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")

def normalize_category(value: str) -> tuple[str, str]:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    raw = value.strip()
    raw_slug = slug(raw)
    for c in data.get("categories", []):
        if raw == c["id"] or raw_slug == slug(c["id"]) or raw_slug == slug(c.get("name", "")):
            folder = slug(c["id"])
            folder = re.sub(r"^(artino|inoway)-", "", folder)
            return c["id"], folder
    folder = re.sub(r"^(artino|inoway)-", "", raw_slug)
    return raw, folder

def next_sequence(outdir: Path, company: str, folder: str, title: str, item_id: str, role: str) -> int:
    """Find the next unused sequence for this exact catalog image identity."""
    prefix = f"{slug(company)}-{slug(folder)}-{slug(title)}-{slug(item_id)}-{slug(role)}-"
    highest = 0
    if outdir.exists():
        for p in outdir.glob(prefix + "*.jpg"):
            m = re.search(r"-(\d+)\.jpg$", p.name, re.I)
            if m:
                highest = max(highest, int(m.group(1)))
    return highest + 1

p = argparse.ArgumentParser(description="Add and link an optimized image to an existing catalog item")
p.add_argument("--image", required=True, help="Full path to the original/source image")
p.add_argument("--item", required=True, help="Existing catalog item ID")
p.add_argument("--role", default="detail", choices=["main", "detail", "hero", "gallery", "thumbnail"], help="What the image is used for")
a = p.parse_args()

src = Path(a.image).expanduser().resolve()
if not src.exists() or not src.is_file():
    raise SystemExit("Image not found: " + str(src))

try:
    data = json.loads(DATA.read_text(encoding="utf-8"))
except Exception as exc:
    raise SystemExit(f"Could not read {DATA}: {exc}")

item = next((x for x in data.get("items", []) if x.get("id") == a.item), None)
if item is None:
    raise SystemExit(f"Catalog item not found: {a.item}. Create/save the item in admin.html and update data/catalog.json first.")

company = item.get("company")
if company not in {"artino", "inoway"}:
    raise SystemExit(f"Catalog item {a.item} has an invalid company: {company!r}")

category_id, folder = normalize_category(item.get("category", ""))
if not folder:
    raise SystemExit(f"Catalog item {a.item} has no valid category. Set its category in admin.html first.")

outdir = ROOT / "images" / company / folder
outdir.mkdir(parents=True, exist_ok=True)
seq = next_sequence(outdir, company, folder, item.get("name", "item"), a.item, a.role)
filename = f"{slug(company)}-{slug(folder)}-{slug(item.get('name', 'item'))}-{slug(a.item)}-{slug(a.role)}-{seq:02d}.jpg"
out = outdir / filename

with Image.open(src) as im:
    im = ImageOps.exif_transpose(im).convert("RGB")
    im.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
    im.save(out, "JPEG", quality=84, optimize=True, progressive=True)

relative = out.relative_to(ROOT).as_posix()
images = item.setdefault("images", [])
if relative not in images:
    images.append(relative)
DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

build = ROOT / "tools" / "build_catalog.py"
subprocess.run([sys.executable, str(build)], check=True)

print("\nIMAGE ADDED SUCCESSFULLY")
print("SOURCE   :", src)
print("ITEM     :", item.get("name"), f"({a.item})")
print("COMPANY  :", company)
print("CATEGORY :", category_id)
print("ROLE     :", a.role)
print("SEQUENCE :", f"{seq:02d}")
print("OUTPUT   :", out)
print("PATH     :", relative)
print("SYNCED   : data/catalog.json + script.js")
print("\nYou can now review the catalog and run PUBLISH_CATALOG.ps1")
