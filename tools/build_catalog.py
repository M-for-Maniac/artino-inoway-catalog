#!/usr/bin/env python3
"""Sync data/catalog.json into the public script.js data block."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "catalog.json"
SCRIPT = ROOT / "script.js"

data = json.loads(DATA.read_text(encoding="utf-8"))
script = SCRIPT.read_text(encoding="utf-8")
serialized = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
new_script, count = re.subn(
    r"const CATALOG_DATA=\{.*?\};",
    "const CATALOG_DATA=" + serialized + ";",
    script,
    count=1,
    flags=re.DOTALL,
)
if count != 1:
    raise SystemExit("Could not find the CATALOG_DATA block in script.js")
SCRIPT.write_text(new_script, encoding="utf-8")
print(f"SYNCED: {DATA.relative_to(ROOT)} -> {SCRIPT.relative_to(ROOT)}")
