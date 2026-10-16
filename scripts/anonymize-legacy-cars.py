#!/usr/bin/env python3
"""Read legacy cars via the publishable key and write anonymized Preview fixtures.

Does not print or write PII. Does not write to any database.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from urllib.parse import urlparse

LEGACY_REF = "ukzuybqfuvhmygyivcnp"
PUBLIC_IMAGE_PATH_PREFIX = "/storage/v1/object/public/car-images"
DEST_COLUMNS = {
    "id",
    "make",
    "model",
    "year",
    "price",
    "engine",
    "volume",
    "gearbox",
    "body_type",
    "color",
    "mileage",
    "tech_inspection",
    "steering_wheel",
    "interior_color",
    "country",
    "region",
    "city",
    "images",
    "image",
    "image_url",
    "created_at",
    "views",
}

FUEL_MAP = {
    "dīzelis": "Dīzelis",
    "benzīns": "Benzīns",
    "benzins": "Benzīns",
    "elektriskais": "Elektriskais",
    "hibrīds": "Hibrīds (Benzīns)",
    "hibrids": "Hibrīds (Benzīns)",
    "benzīns/gāze": "Benzīns / Gāze",
    "benzins/gaze": "Benzīns / Gāze",
    "benzīns / gāze": "Benzīns / Gāze",
}

VOLUME_IN_ENGINE = re.compile(
    r"^\s*(\d+(?:[.,]\d+)?)\s*(?:l|dīzelis|benzīns|hibrīds|elektriskais)?\s*$",
    re.I,
)
FUEL_IN_ENGINE = re.compile(
    r"(dīzelis|benzīns\s*/\s*gāze|benzīns/gāze|benzīns|hibrīds|elektriskais)",
    re.I,
)


def req(url: str, key: str, extra_headers: dict | None = None) -> dict:
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
        "Prefer": "count=exact",
        "Range": "0-999",
    }
    if extra_headers:
        headers.update(extra_headers)
    request = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(request, timeout=60) as resp:
        body = resp.read().decode("utf-8")
        return {
            "status": resp.status,
            "headers": {k.lower(): v for k, v in resp.headers.items()},
            "body": body,
        }


def public_image_path(url: object) -> str | None:
    if not isinstance(url, str):
        return None
    value = url.strip()
    parsed = urlparse(value)
    path = parsed.path if parsed.scheme else value
    if not path.startswith(PUBLIC_IMAGE_PATH_PREFIX):
        return None
    if parsed.scheme and parsed.netloc != f"{LEGACY_REF}.supabase.co":
        return None
    if parsed.query or parsed.fragment:
        return None
    if ".." in path:
        return None
    ext = path.rsplit(".", 1)[-1].lower()
    if ext not in {"jpg", "jpeg", "webp", "png", "gif"}:
        return None
    return path


def unique_images(*groups: object) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for group in groups:
        items = group if isinstance(group, list) else [group]
        for item in items:
            path = public_image_path(item)
            if path and path not in seen:
                seen.add(path)
                out.append(path)
    return out


def parse_volume(*values: object) -> float | None:
    for value in values:
        if value is None or value == "":
            continue
        text = str(value).strip().replace(",", ".")
        match = VOLUME_IN_ENGINE.match(text)
        if not match:
            continue
        number = float(match.group(1))
        if 0.5 <= number <= 10:
            return number
    return None


def parse_engine_fuel(*values: object) -> str | None:
    for value in values:
        if value is None or value == "":
            continue
        text = str(value).strip()
        mapped = FUEL_MAP.get(text.lower())
        if mapped:
            return mapped
        found = FUEL_IN_ENGINE.search(text)
        if found:
            mapped = FUEL_MAP.get(re.sub(r"\s+", " ", found.group(1).lower()))
            if mapped:
                return mapped
    return None


def parse_mileage(value: object) -> int | None:
    if value is None or value == "":
        return None
    digits = re.sub(r"[^\d]", "", str(value))
    if not digits:
        return None
    number = int(digits)
    if number < 0 or number > 10_000_000:
        return None
    return number


def parse_year(value: object) -> int | None:
    if value is None or value == "":
        return None
    try:
        year = int(value)
    except (TypeError, ValueError):
        return None
    if 1950 <= year <= 2035:
        return year
    return None


def parse_price(value: object) -> int | None:
    if value is None or value == "":
        return None
    try:
        price = int(value)
    except (TypeError, ValueError):
        return None
    if price < 0 or price > 10_000_000:
        return None
    return price


def clean_text(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    text = value.strip()
    return text or None


def anonymize_row(row: dict) -> dict:
    images = unique_images(row.get("image"), row.get("image_url"), row.get("images"))
    cover = images[0] if images else None
    engine = parse_engine_fuel(
        row.get("fuel"),
        row.get("fuel_type"),
        row.get("fuelType"),
        row.get("engine"),
    )
    volume = parse_volume(row.get("volume"), row.get("engine_size"), row.get("engine"))
    fixture = {
        "id": int(row["id"]),
        "make": clean_text(row.get("make")),
        "model": clean_text(row.get("model")),
        "year": parse_year(row.get("year")),
        "price": parse_price(row.get("price")),
        "engine": engine,
        "volume": volume,
        "gearbox": clean_text(row.get("gearbox")),
        "body_type": clean_text(row.get("body_type")),
        "color": clean_text(row.get("color")),
        "mileage": parse_mileage(row.get("mileage")),
        "tech_inspection": clean_text(row.get("tech_inspection")),
        "steering_wheel": clean_text(row.get("steering_wheel")),
        "interior_color": clean_text(row.get("interior_color")),
        "country": clean_text(row.get("country")),
        "region": clean_text(row.get("region")),
        "city": clean_text(row.get("city")),
        "images": images,
        "image": cover,
        "image_url": cover,
        "created_at": clean_text(row.get("created_at")),
        "views": 0,
    }
    unexpected = set(fixture) - DEST_COLUMNS
    if unexpected:
        raise SystemExit(f"unexpected fixture keys: {sorted(unexpected)}")
    return fixture


EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
VIN_RE = re.compile(r"\b(?=[A-HJ-NPR-Z0-9]*[A-HJ-NPR-Z])[A-HJ-NPR-Z0-9]{17}\b", re.I)
UUID_RE = re.compile(
    r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b",
    re.I,
)
FORBIDDEN_KEYS = {
    "email",
    "phone",
    "vin",
    "user_id",
    "description",
    "location",
    "address",
    "name",
    "title",
}
IMAGE_KEYS = {"images", "image", "image_url"}


def non_image_blob(fixtures: list[dict]) -> str:
    safe_rows = []
    for row in fixtures:
        safe_rows.append({k: v for k, v in row.items() if k not in IMAGE_KEYS})
    return json.dumps(safe_rows, ensure_ascii=False)


def assert_no_pii(fixtures: list[dict]) -> None:
    blob = non_image_blob(fixtures)
    if EMAIL_RE.search(blob):
        raise SystemExit("PII scan failed: email pattern")
    if VIN_RE.search(blob):
        raise SystemExit("PII scan failed: VIN pattern")
    if UUID_RE.search(blob):
        raise SystemExit("PII scan failed: UUID/user id pattern")
    # Phone-like digit runs appear in mileage/price/ids; only flag with separators or +.
    if re.search(r"\+\d{6,}", blob) or re.search(r"\b\d{2,}\s\d{3,}\s\d{3,}\b", blob):
        raise SystemExit("PII scan failed: phone pattern")
    for row in fixtures:
        if set(row) & FORBIDDEN_KEYS:
            raise SystemExit("PII scan failed: forbidden key present")
        for key in DEST_COLUMNS:
            if key not in row:
                raise SystemExit(f"missing dest column {key}")
        for url in row["images"] + [row["image"], row["image_url"]]:
            if url is None:
                continue
            if public_image_path(url) != url:
                raise SystemExit("PII scan failed: non-public image reference")
    full = json.dumps(fixtures, ensure_ascii=False)
    if "https://" in full or LEGACY_REF in full or "supabase.co" in full:
        raise SystemExit("PII scan failed: origin URL leaked into fixtures")


def main() -> int:
    legacy_url = os.environ["LEGACY_SUPABASE_URL"].rstrip("/")
    legacy_key = os.environ["LEGACY_SUPABASE_ANON_KEY"]
    dest_url = os.environ["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
    if "ukzuybqfuvhmygyivcnp" not in legacy_url:
        raise SystemExit("legacy URL ref mismatch")
    if "pwmwckjavolrjyfiobgp" not in dest_url:
        raise SystemExit("destination URL ref mismatch")

    response = req(f"{legacy_url}/rest/v1/cars?select=*&order=id.asc", legacy_key)
    rows = json.loads(response["body"])
    if len(rows) != 137:
        raise SystemExit(f"expected 137 legacy rows, got {len(rows)}")

    fixtures = [anonymize_row(row) for row in rows]
    assert_no_pii(fixtures)

    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "preview-cars.anonymized.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as handle:
        json.dump(fixtures, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    with_images = sum(1 for row in fixtures if row["images"])
    print(f"wrote {len(fixtures)} anonymized fixtures")
    print(f"rows_with_public_images {with_images}")
    print(f"path data/preview-cars.anonymized.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
