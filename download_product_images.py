from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlsplit, parse_qsl, urlencode, urlunsplit
import json
import shutil
import time

PRODUCTS = [
  {
    "name": "اسپرسو",
    "slug": "espresso",
    "category": "coffee",
    "url": "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=900&auto=format&fit=crop"
  },
  {
    "name": "دبل اسپرسو",
    "slug": "double-espresso",
    "category": "coffee",
    "url": "https://images.unsplash.com/photo-1522992319-0365e5f11656?w=900&auto=format&fit=crop"
  },
  {
    "name": "آمریکانو",
    "slug": "americano",
    "category": "coffee",
    "url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&auto=format&fit=crop"
  },
  {
    "name": "لاته",
    "slug": "latte",
    "category": "coffee",
    "url": "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=900&auto=format&fit=crop"
  },
  {
    "name": "کاپوچینو",
    "slug": "cappuccino",
    "category": "coffee",
    "url": "https://images.unsplash.com/photo-1534778101976-62847782c213?w=900&auto=format&fit=crop"
  },
  {
    "name": "موکا",
    "slug": "mocha",
    "category": "coffee",
    "url": "https://images.unsplash.com/photo-1579888071069-c107a6f79d82?w=900&auto=format&fit=crop"
  },
  {
    "name": "قهوه ترک",
    "slug": "turkish-coffee",
    "category": "coffee",
    "url": "https://images.unsplash.com/photo-1564894809611-1742fc40ed80?w=900&auto=format&fit=crop"
  },
  {
    "name": "قهوه دمی V60",
    "slug": "v60-brew",
    "category": "coffee",
    "url": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&auto=format&fit=crop"
  },
  {
    "name": "آیس آمریکانو",
    "slug": "iced-americano",
    "category": "coffee",
    "url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=900&auto=format&fit=crop"
  },
  {
    "name": "آیس لاته",
    "slug": "iced-latte",
    "category": "coffee",
    "url": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&auto=format&fit=crop"
  },
  {
    "name": "هات چاکلت",
    "slug": "hot-chocolate",
    "category": "hot-drinks",
    "url": "https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=900&auto=format&fit=crop"
  },
  {
    "name": "چای ماسالا",
    "slug": "masala-chai",
    "category": "hot-drinks",
    "url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=900&auto=format&fit=crop"
  },
  {
    "name": "چای سبز",
    "slug": "green-tea",
    "category": "hot-drinks",
    "url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&auto=format&fit=crop"
  },
  {
    "name": "ماچا لاته",
    "slug": "matcha-latte",
    "category": "hot-drinks",
    "url": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=900&auto=format&fit=crop"
  },
  {
    "name": "دمنوش گیاهی",
    "slug": "herbal-tea",
    "category": "hot-drinks",
    "url": "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=900&auto=format&fit=crop"
  },
  {
    "name": "لیموناد",
    "slug": "lemonade",
    "category": "cold-drinks",
    "url": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=900&auto=format&fit=crop"
  },
  {
    "name": "اسموتی توت‌فرنگی",
    "slug": "strawberry-smoothie",
    "category": "cold-drinks",
    "url": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=900&auto=format&fit=crop"
  },
  {
    "name": "اسموتی انبه",
    "slug": "mango-smoothie",
    "category": "cold-drinks",
    "url": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=900&auto=format&fit=crop"
  },
  {
    "name": "میلک‌شیک وانیل",
    "slug": "vanilla-milkshake",
    "category": "cold-drinks",
    "url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=900&auto=format&fit=crop"
  },
  {
    "name": "میلک‌شیک شکلات",
    "slug": "chocolate-milkshake",
    "category": "cold-drinks",
    "url": "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=900&auto=format&fit=crop"
  },
  {
    "name": "آیس ماچا",
    "slug": "iced-matcha",
    "category": "cold-drinks",
    "url": "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=900&auto=format&fit=crop"
  },
  {
    "name": "چیزکیک",
    "slug": "cheesecake",
    "category": "desserts",
    "url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=900&auto=format&fit=crop"
  },
  {
    "name": "کیک شکلاتی",
    "slug": "chocolate-cake",
    "category": "desserts",
    "url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&auto=format&fit=crop"
  },
  {
    "name": "تیرامیسو",
    "slug": "tiramisu",
    "category": "desserts",
    "url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&auto=format&fit=crop"
  },
  {
    "name": "براونی",
    "slug": "brownie",
    "category": "desserts",
    "url": "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=900&auto=format&fit=crop"
  },
  {
    "name": "کروسان",
    "slug": "croissant",
    "category": "desserts",
    "url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&auto=format&fit=crop"
  },
  {
    "name": "باکس کوکی",
    "slug": "cookie-box",
    "category": "desserts",
    "url": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=900&auto=format&fit=crop"
  },
  {
    "name": "مافین شکلاتی",
    "slug": "chocolate-muffin",
    "category": "desserts",
    "url": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=900&auto=format&fit=crop"
  },
  {
    "name": "فرنچ پرس",
    "slug": "french-press",
    "category": "equipment",
    "url": "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=900&auto=format&fit=crop"
  },
  {
    "name": "موکاپات",
    "slug": "moka-pot",
    "category": "equipment",
    "url": "https://images.unsplash.com/photo-1525088553748-01d6e210e00b?w=900&auto=format&fit=crop"
  },
  {
    "name": "دریپر V60",
    "slug": "v60-dripper",
    "category": "equipment",
    "url": "https://images.unsplash.com/photo-1502462041640-b3d7e50d0662?w=900&auto=format&fit=crop"
  },
  {
    "name": "فیلتر کاغذی V60",
    "slug": "paper-filters",
    "category": "equipment",
    "url": "https://images.unsplash.com/photo-1459755486867-b55449bb39ff?w=900&auto=format&fit=crop"
  },
  {
    "name": "آسیاب دستی قهوه",
    "slug": "coffee-grinder",
    "category": "equipment",
    "url": "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=900&auto=format&fit=crop"
  },
  {
    "name": "پیچر شیر",
    "slug": "milk-pitcher",
    "category": "equipment",
    "url": "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=900&auto=format&fit=crop"
  },
  {
    "name": "پکیج صبحانه",
    "slug": "breakfast-combo",
    "category": "special-offers",
    "url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&auto=format&fit=crop"
  },
  {
    "name": "ست دونفره دسر",
    "slug": "date-night-dessert-set",
    "category": "special-offers",
    "url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=900&auto=format&fit=crop"
  },
  {
    "name": "پک قهوه سرد",
    "slug": "cold-brew-pack",
    "category": "special-offers",
    "url": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&auto=format&fit=crop"
  }
]

OUTPUT = Path("product-images")
OUTPUT.mkdir(exist_ok=True)

def force_jpg(url):
    parts = urlsplit(url)
    params = dict(parse_qsl(parts.query, keep_blank_values=True))
    params.pop("auto", None)
    params["fm"] = "jpg"
    params.setdefault("q", "85")
    new_query = urlencode(params)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, new_query, parts.fragment))

manifest = {}

for index, item in enumerate(PRODUCTS, start=1):
    category_dir = OUTPUT / item["category"]
    category_dir.mkdir(parents=True, exist_ok=True)

    target = category_dir / f'{item["slug"]}.jpg'
    url = force_jpg(item["url"])

    print(f'[{index}/{len(PRODUCTS)}] {item["name"]}')

    try:
        req = Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept": "image/jpeg,image/*;q=0.8,*/*;q=0.5",
            },
        )

        with urlopen(req, timeout=30) as response, open(target, "wb") as file:
            shutil.copyfileobj(response, file)

        manifest[item["slug"]] = {
            "name": item["name"],
            "category": item["category"],
            "path": f'/product-images/{item["category"]}/{item["slug"]}.jpg',
        }

        print(f'  OK -> {target}')
    except Exception as exc:
        print(f'  ERROR: {exc}')

    time.sleep(0.15)

Path("productImages.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2),
    encoding="utf-8",
)

js_lines = [
    "// Auto-generated local image paths",
    "const productImages = {",
]
for slug, info in manifest.items():
    js_lines.append(f'  "{slug}": "{info["path"]}",')
js_lines.extend([
    "};",
    "",
    "export default productImages;",
])
Path("productImages.js").write_text("\n".join(js_lines), encoding="utf-8")

print()
print(f"Done. Downloaded {len(manifest)} of {len(PRODUCTS)} images.")
print(f"Images folder: {OUTPUT.resolve()}")
