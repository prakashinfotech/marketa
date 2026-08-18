"""
Download realistic product images for seed data.
Each ad gets its own subfolder under uploads/ads/ with properly named images.

Usage: cd backend && python download_seed_images.py
"""

import os
import httpx
import time

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads", "ads")

# Map: folder_name -> list of (filename, url) tuples
# Using high-quality, freely-available product images from Unsplash
IMAGES = {
    # ── MOBILES ──────────────────────────────────────────────────────
    "iphone_15_pro_max": [
        ("main.jpg", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80"),
    ],
    "samsung_galaxy_s24_ultra": [
        ("main.jpg", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80"),
    ],
    "oneplus_12": [
        ("main.jpg", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80"),
    ],
    "iphone_14": [
        ("main.jpg", "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80"),
    ],
    "google_pixel_8_pro": [
        ("main.jpg", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"),
    ],
    "samsung_galaxy_a54": [
        ("main.jpg", "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80"),
    ],
    "xiaomi_14": [
        ("main.jpg", "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80"),
    ],
    "ipad_air_m2": [
        ("main.jpg", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80"),
    ],
    "samsung_galaxy_tab_s9": [
        ("main.jpg", "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80"),
    ],

    # ── CARS ─────────────────────────────────────────────────────────
    "hyundai_creta_2022": [
        ("main.jpg", "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80"),
    ],
    "maruti_swift_2021": [
        ("main.jpg", "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"),
    ],
    "honda_city_2023": [
        ("main.jpg", "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80"),
    ],
    "tata_nexon_ev_2023": [
        ("main.jpg", "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80"),
    ],
    "toyota_fortuner_2021": [
        ("main.jpg", "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80"),
    ],
    "mahindra_thar_2022": [
        ("main.jpg", "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80"),
    ],
    "kia_seltos_2023": [
        ("main.jpg", "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80"),
    ],

    # ── BIKES ────────────────────────────────────────────────────────
    "royal_enfield_classic_350": [
        ("main.jpg", "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80"),
    ],
    "ktm_duke_390": [
        ("main.jpg", "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80"),
    ],
    "honda_activa_6g": [
        ("main.jpg", "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&q=80"),
    ],
    "yamaha_r15_v4": [
        ("main.jpg", "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80"),
    ],
    "bajaj_pulsar_ns200": [
        ("main.jpg", "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80"),
    ],

    # ── ELECTRONICS (LAPTOPS) ────────────────────────────────────────
    "macbook_air_m2": [
        ("main.jpg", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"),
    ],
    "dell_xps_15": [
        ("main.jpg", "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80"),
    ],
    "hp_pavilion_gaming": [
        ("main.jpg", "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80"),
    ],

    # ── ELECTRONICS (TVs) ────────────────────────────────────────────
    "samsung_crystal_4k_55": [
        ("main.jpg", "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80"),
    ],
    "lg_oled_c3_65": [
        ("main.jpg", "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=800&q=80"),
    ],
    "sony_bravia_55": [
        ("main.jpg", "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80"),
    ],

    # ── ELECTRONICS (OTHER) ──────────────────────────────────────────
    "ps5_console": [
        ("main.jpg", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80"),
    ],
    "sony_wh1000xm5": [
        ("main.jpg", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"),
    ],
    "canon_eos_r50": [
        ("main.jpg", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80"),
    ],

    # ── REAL ESTATE ──────────────────────────────────────────────────
    "apartment_2bhk_andheri": [
        ("main.jpg", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"),
    ],
    "apartment_3bhk_koramangala": [
        ("main.jpg", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"),
    ],
    "villa_4bhk_whitefield": [
        ("main.jpg", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"),
    ],
    "office_space_bkc": [
        ("main.jpg", "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"),
    ],
    "pg_accommodation_hsr": [
        ("main.jpg", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"),
    ],
    "apartment_1bhk_pune": [
        ("main.jpg", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80"),
    ],
}


def download_images():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    total = sum(len(v) for v in IMAGES.values())
    done = 0
    failed = 0

    for folder, files in IMAGES.items():
        folder_path = os.path.join(UPLOAD_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)

        for filename, url in files:
            filepath = os.path.join(folder_path, filename)
            if os.path.exists(filepath):
                print(f"  ✓ Already exists: {folder}/{filename}")
                done += 1
                continue

            try:
                print(f"  ⬇ Downloading: {folder}/{filename} ...", end=" ", flush=True)
                resp = httpx.get(url, timeout=30, follow_redirects=True, headers={
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
                })
                resp.raise_for_status()
                with open(filepath, "wb") as f:
                    f.write(resp.content)
                size_kb = len(resp.content) / 1024
                print(f"OK ({size_kb:.0f} KB)")
                done += 1
                time.sleep(0.3)  # Be polite to servers
            except Exception as e:
                print(f"FAILED: {e}")
                failed += 1

    print(f"\n{'='*50}")
    print(f"✅ Downloaded: {done}/{total} | Failed: {failed}")
    print(f"{'='*50}")


if __name__ == "__main__":
    print("🖼️  Downloading seed images for ads...")
    download_images()
