#!/usr/bin/env python3
"""Add an optimized source image to a catalog item or reference project."""
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
    return re.sub(r"[^a-z0-9]+", "-", str(value or "").lower()).strip("-")

def normalize_category(value: str) -> tuple[str, str]:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    raw = value.strip()
    raw_slug = slug(raw)
    for c in data.get("categories", []):
        if raw == c["id"] or raw_slug == slug(c["id"]) or raw_slug == slug(c.get("name", "")):
            folder = re.sub(r"^(artino|inoway)-", "", slug(c["id"]))
            return c["id"], folder
    return raw, re.sub(r"^(artino|inoway)-", "", raw_slug)

def next_sequence(outdir: Path, prefix: str) -> int:
    highest = 0
    if outdir.exists():
        for p in outdir.glob(prefix + "*.jpg"):
            m = re.search(r"-(\d+)\.jpg$", p.name, re.I)
            if m:
                highest = max(highest, int(m.group(1)))
    return highest + 1

p = argparse.ArgumentParser(description="Add and link an optimized image to a catalog item or reference project")
p.add_argument("--image", required=True, help="Full path to the original/source image")
group = p.add_mutually_exclusive_group(required=True)
group.add_argument("--item", help="Existing catalog item ID")
group.add_argument("--project", help="Existing reference project ID")
p.add_argument("--role", default="detail", choices=["main", "detail", "hero", "gallery", "thumbnail"], help="What the image is used for")
a = p.parse_args()

src = Path(a.image).expanduser().resolve()
if not src.exists() or not src.is_file():
    raise SystemExit("Image not found: " + str(src))

data = json.loads(DATA.read_text(encoding="utf-8"))
if a.project:
    record = next((x for x in data.get("projects", []) if x.get("id") == a.project), None)
    record_type = "project"
else:
    record = next((x for x in data.get("items", []) if x.get("id") == a.item), None)
    record_type = "item"
if record is None:
    raise SystemExit(f"Catalog {record_type} not found: {a.project or a.item}")

company = record.get("company", "artino")
if record_type == "project":
    outdir = ROOT / "images" / "projects"
    outdir.mkdir(parents=True, exist_ok=True)
    prefix = f"project-{slug(record.get('name','project'))}-{slug(record.get('id','project'))}-{slug(a.role)}-"
    filename_base = prefix
else:
    if company not in {"artino", "inoway"}:
        raise SystemExit(f"Catalog item has an invalid company: {company!r}")
    _, folder = normalize_category(record.get("category", ""))
    if not folder:
        raise SystemExit(f"Catalog item {record.get('id')} has no valid category.")
    outdir = ROOT / "images" / company / folder
    outdir.mkdir(parents=True, exist_ok=True)
    prefix = f"{slug(company)}-{slug(folder)}-{slug(record.get('name','item'))}-{slug(record.get('id','item'))}-{slug(a.role)}-"
    filename_base = prefix

seq = next_sequence(outdir, prefix)
out = outdir / f"{filename_base}{seq:02d}.jpg"
with Image.open(src) as im:
    im = ImageOps.exif_transpose(im).convert("RGB")
    im.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
    im.save(out, "JPEG", quality=84, optimize=True, progressive=True)

relative = out.relative_to(ROOT).as_posix()
images = record.setdefault("images", [])
if relative not in images:
    images.append(relative)
DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

subprocess.run([sys.executable, str(ROOT / "tools" / "build_catalog.py")], check=True)
print("\nIMAGE ADDED SUCCESSFULLY")
print("SOURCE :", src)
print("RECORD :", record.get("name"), f"({record.get('id')})")
print("TYPE   :", record_type)
print("ROLE   :", a.role)
print("OUTPUT :", out)
print("PATH   :", relative)
print("SYNCED : data/catalog.json + script.js")
