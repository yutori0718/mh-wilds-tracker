"""MHDB (mhdb-wilds-data) の merged JSON から、サイト用の軽量データ data/mh-wilds.json を生成する。

使い方:
  git clone --depth 1 https://github.com/LartTyler/mhdb-wilds-data.git
  python3 tools/build-mh-wilds-data.py mhdb-wilds-data/output/merged
"""
import json
import sys
from pathlib import Path

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "mhdb-wilds-data/output/merged")
OUT = Path(__file__).resolve().parent.parent / "data" / "mh-wilds.json"

# ハンターノート（大型モンスター）の並び順。ここに無いモンスターは末尾に並ぶ。
HUNTER_NOTES_ORDER = [
    "チャタカブラ", "ケマトリス", "ラバラ・バリナ", "ババコンガ", "バーラハーラ", "ドシャグマ",
    "ウズ・トゥナ", "ププロポル", "レ・ダウ", "ネルスキュラ", "ヒラバミ", "アジャラカン",
    "ヌ・エグドラ", "護竜ドシャグマ", "護竜リオレウス", "ジン・ダハド", "シーウー", "護竜オドガロン亜種",
    "ゾ・シア", "リオレイア", "リオレウス", "イャンクック", "ゲリョス", "ゴア・マガラ",
    "護竜アンジャナフ亜種", "グラビモス", "ドドブランゴ", "アルシュベルド", "護竜アルシュベルド",
    "タマミツネ", "ラギアクルス", "セルレギオス", "オメガ・プラネテス", "ゴグマジオス",
]

# 素材の分類（ゲーム内アイコンの種類 → 分類名）。モンスター固有の素材は各モンスターに分類する。
MATERIAL_CATEGORIES = [
    ("ore", "鉱石・結晶", {"ore", "crystal"}),
    ("bone", "骨", {"bone"}),
    ("sac", "袋・体液", {"powder", "extract"}),
    ("small", "小型モンスター・環境生物の素材", {"hide", "scale", "shell", "skull", "claw", "medulla", "gem", "wing", "tail", "plate"}),
    ("bug", "虫・ハチミツ", {"bug", "honey"}),
    ("food", "食材・植物・卵", {"plant", "mushroom", "seed", "fish", "egg", "cooking-cheese", "cooking-egg",
                              "cooking-garlic", "cooking-mushroom", "cooking-shellfish"}),
    ("sphere", "鎧玉", {"armor-sphere"}),
    ("ticket", "チケット・コイン・証", {"certificate", "voucher", "coin"}),
    ("other", "その他", set()),
]
# 素材名の接頭辞だけでは判別できないモンスター（護竜は通常種と素材の出どころが重なる）
ALIAS_OVERRIDES = {"護鎖刃竜": "護竜アルシュベルド"}
# モンスター固有とみなさない（汎用素材の）アイコン
GENERIC_ICONS = {"ore", "crystal", "powder", "bone", "armor-sphere", "bug", "egg", "plant", "mushroom", "seed", "fish"}

WEAPON_FILES = [
    ("GreatSword", "great-sword", "大剣"),
    ("LongSword", "long-sword", "太刀"),
    ("SwordShield", "sword-shield", "片手剣"),
    ("DualBlades", "dual-blades", "双剣"),
    ("Hammer", "hammer", "ハンマー"),
    ("HuntingHorn", "hunting-horn", "狩猟笛"),
    ("Lance", "lance", "ランス"),
    ("Gunlance", "gunlance", "ガンランス"),
    ("SwitchAxe", "switch-axe", "スラッシュアックス"),
    ("ChargeBlade", "charge-blade", "チャージアックス"),
    ("InsectGlaive", "insect-glaive", "操虫棍"),
    ("LightBowgun", "light-bowgun", "ライトボウガン"),
    ("HeavyBowgun", "heavy-bowgun", "ヘビィボウガン"),
    ("Bow", "bow", "弓"),
]


def load(name):
    return json.loads((SRC / name).read_text(encoding="utf-8"))


def ja(names):
    return (names or {}).get("ja") or (names or {}).get("en") or ""


def inputs(d):
    return {str(k): v for k, v in (d or {}).items()}


def skills(d):
    return {str(k): v for k, v in (d or {}).items()}


def main():
    used_items = set()
    used_skills = set()

    # スキル
    skill_list = load("Skill.json")
    skill_map = {
        str(s["game_id"]): {
            "n": ja(s["names"]),
            "k": s["kind"],
            "max": max((r["level"] for r in s["ranks"]), default=1),
            # レベルごとの [レベル, 名前（シリーズ/グループスキルのみ）, 効果]
            "rk": [[r["level"], ja(r.get("names")) or None, ja(r.get("descriptions")).replace("\r\n", "")]
                   for r in sorted(s["ranks"], key=lambda r: r["level"])],
        }
        for s in skill_list
    }

    series_names = {str(s["game_id"]): ja(s["names"]) for s in load("WeaponSeries.json")}

    # 武器
    weapons = []
    for file, kind, _ in WEAPON_FILES:
        for w in load(f"weapons/{file}.json"):
            c = w.get("crafting") or {}
            entry = {
                "id": f"{kind}:{w['game_id']}",
                "t": kind,
                "n": ja(w["names"]),
                "r": w["rarity"],
                "atk": w.get("attack_raw"),
                "aff": w.get("affinity") or 0,
                "sl": w.get("slots") or [],
                "sk": skills(w.get("skills")),
                "z": c.get("zenny_cost") or 0,
                "in": inputs(c.get("inputs")),
                # アーティア等のツリー外の武器（素材なし・初期武器以外）は末尾へ
                "_sort": (not c.get("inputs") and w["game_id"] != 1, c.get("row") or 0, c.get("column") or 0, w["game_id"]),
            }
            series_name = series_names.get(str(w.get("series_id")))
            if series_name:
                entry["sr"] = series_name
            if not c.get("inputs") and not series_name and w["game_id"] != 1:
                entry["art"] = True  # アーティア等（スキル・装飾品をカスタムする武器）
            if c.get("previous_id") is not None:
                entry["prev"] = f"{kind}:{c['previous_id']}"
            el = [s for s in (w.get("specials") or []) if s.get("kind") in ("element", "status")]
            if el:
                entry["el"] = [el[0].get("element") or el[0].get("status"), el[0].get("raw"), bool(el[0].get("hidden"))]
            used_items.update(entry["in"])
            used_skills.update(entry["sk"])
            weapons.append(entry)

    # 武器は工房の派生ツリーと同じ順（武器種ごとに 行 → 列）
    type_order = {kind: i for i, (_, kind, _) in enumerate(WEAPON_FILES)}
    weapons.sort(key=lambda w: (type_order[w["t"]], w.pop("_sort")))

    # 防具
    armor = []
    for s in load("Armor.json"):
        pieces = []
        for p in s["pieces"]:
            c = p.get("crafting") or {}
            piece = {
                "id": f"{s['game_id']}:{p['kind']}",
                "p": p["kind"],
                "n": ja(p["names"]),
                "def": (p.get("defense") or {}).get("base"),
                "dmax": (p.get("defense") or {}).get("max"),
                "res": [(p.get("resistances") or {}).get(e, 0) for e in ("fire", "water", "thunder", "ice", "dragon")],
                "sl": p.get("slots") or [],
                "sk": skills(p.get("skills")),
                "z": c.get("price") or 0,
                "in": inputs(c.get("inputs")),
            }
            used_items.update(piece["in"])
            used_skills.update(piece["sk"])
            pieces.append(piece)
        for key, bonus_key in (("set_bonus", "sb"), ("group_bonus", "gb")):
            bonus = s.get(key)
            if bonus:
                used_skills.add(str(bonus["skill_id"]))
        armor.append({"id": str(s["game_id"]), "n": ja(s["names"]), "r": s["rarity"], "pc": pieces,
                      **{bonus_key: [str(s[key]["skill_id"]), [[r["pieces"], r["skill_level"]] for r in s[key]["ranks"]]]
                         for key, bonus_key in (("set_bonus", "sb"), ("group_bonus", "gb")) if s.get(key)},
                      "_sort": (s.get("model_id") or 0, s["rarity"], ja(s["names"]))})
    # 防具はゲーム内のシリーズ（モデル）番号順 → 下位/上位（レア度）順
    armor.sort(key=lambda s: s.pop("_sort"))

    # 護石
    charms = []
    for a in load("Amulet.json"):
        for i, r in enumerate(a["ranks"]):
            rec = inputs((r.get("recipe") or {}).get("inputs"))
            entry = {
                "id": f"{a['game_id']}:{i}",
                "n": ja(r["names"]),
                "r": r.get("rarity"),
                "lv": r.get("level"),
                "sk": skills(r.get("skills")),
                "z": r.get("price") or 0,
                "in": rec,
            }
            if a.get("is_random"):
                entry["rand"] = True
            used_items.update(rec)
            used_skills.update(entry["sk"])
            charms.append(entry)

    # 装飾品（珠）
    decorations = []
    for d in load("Accessory.json"):
        entry = {
            "id": str(d["game_id"]),
            "n": ja(d["names"]),
            "r": d["rarity"],
            "lv": d["level"],
            "on": d["allowed_on"],
            "sk": skills(d.get("skills")),
        }
        used_skills.update(entry["sk"])
        decorations.append(entry)

    # モンスター & 入手先
    species = {s["kind"]: ja(s["names"]) for s in load("Species.json") if "?" not in ja(s["names"])}
    monsters = []
    sources = {}
    for m in load("LargeMonsters.json"):
        mid = str(m["game_id"])
        weak = []
        for w in m.get("weaknesses") or []:
            if w.get("condition"):
                continue
            name = w.get("element") or w.get("status") or w.get("effect")
            if name:
                weak.append([w["kind"], name, w.get("level") or 1])
        monsters.append({
            "id": mid,
            "n": ja(m["names"]),
            "sp": species.get(m.get("species"), "その他"),
            "tmp": any(v.get("kind") == "tempered" for v in m.get("variants") or []),
            "wk": weak,
            "rw": [[str(rw["item_id"]), rw["rank"], rw["kind"], rw.get("amount") or 1, rw.get("chance") or 0]
                   for rw in m.get("rewards") or []],
        })
        for rw in m.get("rewards") or []:
            key = (mid, rw["rank"])
            item_sources = sources.setdefault(str(rw["item_id"]), {})
            src = item_sources.setdefault(key, {"k": set(), "c": 0})
            src["k"].add(rw["kind"])
            src["c"] = max(src["c"], rw.get("chance") or 0)

    # 素材（アイテム）
    items = []
    for it in load("Item.json"):
        iid = str(it["game_id"])
        if it["kind"] != "material" and iid not in used_items and iid not in sources:
            continue
        entry = {"id": iid, "n": ja(it["names"]), "r": it["rarity"], "k": it["kind"], "c": it.get("icon_color")}
        desc = ja(it.get("descriptions"))
        if desc:
            entry["d"] = desc.replace("\r\n", "")
        entry["_icon"] = it.get("icon") or ""
        src = sources.get(iid)
        if src:
            entry["src"] = [
                [mid, rank, sorted(v["k"]), v["c"]]
                for (mid, rank), v in sorted(src.items(), key=lambda kv: (kv[0][1] != "high", -kv[1]["c"]))
            ]
        items.append(entry)

    classify_materials(items, monsters, weapons)

    # 素材はゲーム内のアイテムID順（アイテムボックスの並び）
    items.sort(key=lambda i: int(i["id"]))
    notes = {name: i for i, name in enumerate(HUNTER_NOTES_ORDER)}
    monsters.sort(key=lambda m: notes.get(m["n"], len(notes)))

    missing = used_items - {i["id"] for i in items}
    if missing:
        print("warning: unknown item ids", sorted(missing))

    data = {
        "materialCategories": [{"id": key, "n": name} for key, name, _ in MATERIAL_CATEGORIES],
        "source": "MHDB (https://github.com/LartTyler/mhdb-wilds-data)",
        "weaponTypes": [{"id": kind, "n": name} for _, kind, name in WEAPON_FILES],
        "skills": skill_map,
        "items": items,
        "monsters": monsters,
        "weapons": weapons,
        "armor": armor,
        "charms": charms,
        "decorations": decorations,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)",
          {k: len(v) for k, v in data.items() if isinstance(v, (list, dict))})


def name_prefix(name):
    return name.split("の", 1)[0] if "の" in name else None


def classify_materials(items, monsters, weapons):
    """素材を「モンスター固有（mon）」か分類（cat）に振り分け、武器にも元になったモンスター（mon）を付ける。"""
    # モンスターの別名（例: リオレイア → 雌火竜）を、そのモンスターだけが落とす素材名の接頭辞から推定する
    prefix_counts = {}
    for item in items:
        monster_ids = {src[0] for src in item.get("src", [])}
        prefix = name_prefix(item["n"])
        if len(monster_ids) == 1 and prefix:
            counts = prefix_counts.setdefault(next(iter(monster_ids)), {})
            counts[prefix] = counts.get(prefix, 0) + 1
    alias = {mid: max(counts, key=counts.get) for mid, counts in prefix_counts.items()}
    alias_to_monster = {name: mid for mid, name in alias.items()}
    monster_by_name = {m["n"]: m["id"] for m in monsters}
    for name, monster_name in ALIAS_OVERRIDES.items():
        if monster_name in monster_by_name:
            alias_to_monster[name] = monster_by_name[monster_name]

    for item in items:
        icon = item.pop("_icon")
        monster_ids = {src[0] for src in item.get("src", [])}
        prefix = name_prefix(item["n"])
        if prefix in alias_to_monster:
            item["mon"] = alias_to_monster[prefix]
        elif len(monster_ids) == 1 and icon not in GENERIC_ICONS:
            item["mon"] = next(iter(monster_ids))
        elif len(monster_ids) > 1 and icon not in GENERIC_ICONS:
            item["cat"] = "shared"
        else:
            item["cat"] = next((key for key, _, icons in MATERIAL_CATEGORIES if icon in icons), "other")

    # 武器: 派生名（例: 雌火竜派生）→ モンスター。
    # 鉱石・骨素材などモンスター以外の派生はそのまま派生名で分類し、派生名の無い武器だけ素材から推定する
    item_monster = {item["id"]: item.get("mon") for item in items}
    for weapon in weapons:
        series_alias = (weapon.get("sr") or "").removesuffix("派生")
        if series_alias in alias_to_monster:
            weapon["mon"] = alias_to_monster[series_alias]
            continue
        if weapon.get("sr"):
            continue
        score = {}
        for item_id, amount in weapon["in"].items():
            mid = item_monster.get(item_id)
            if mid:
                score[mid] = score.get(mid, 0) + amount
        if score:
            weapon["mon"] = max(score, key=score.get)


if __name__ == "__main__":
    main()
