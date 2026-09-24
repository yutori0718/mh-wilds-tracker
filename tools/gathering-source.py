"""ユーザー提供の採取情報（GameWith の記載を元に整理したもの）から data/gathering.json を作る。

表記: 素材名の（上）/（下）は上位だけ/下位だけ。マップ名の（上）/（下）はそのマップでは上位だけ/下位だけ。
"""
import json
from pathlib import Path

ALL = ["隔ての砂原", "緋の森", "油涌き谷", "氷霧の断崖", "竜都の跡形"]
SHORT = {"砂原": "隔ての砂原", "緋": "緋の森", "緋の森": "緋の森", "油": "油涌き谷", "油涌き谷": "油涌き谷",
         "氷霧": "氷霧の断崖", "竜都": "竜都の跡形", "隔ての砂原": "隔ての砂原", "氷霧の断崖": "氷霧の断崖", "竜都の跡形": "竜都の跡形"}


def maps(text):
    """「緋の森 49%、竜都（上）」のような文字列を [{map, rank, note}] にする"""
    result = []
    for part in text.replace("・", "、").split("、"):
        part = part.strip()
        if not part:
            continue
        if part.startswith("全マップ"):
            note = part[len("全マップ"):].strip("（）() ")
            result += [{"map": m} for m in ALL]
            if note:
                result[-1]["allNote"] = note
            continue
        rank = None
        if part.endswith("（上）"):
            rank, part = "high", part[:-3]
        elif part.endswith("（下）"):
            rank, part = "low", part[:-3]
        name, _, note = part.partition(" ")
        name = name.removesuffix("だけ")
        entry = {"map": SHORT.get(name, name)}
        if rank:
            entry["rank"] = rank
        if note:
            entry["note"] = note
        result.append(entry)
    return result


def item(name, where, **extra):
    rank = None
    if name.endswith("（上）"):
        rank, name = "high", name[:-3]
    elif name.endswith("（下）"):
        rank, name = "low", name[:-3]
    elif name.endswith("（上・低確率）"):
        rank, name, extra["note"] = "high", name[:-7], "低確率"
    entry = {"items": [n.strip() for n in name.split("、")], "maps": maps(where) if isinstance(where, str) else where}
    if rank:
        entry["rank"] = rank
    entry.update(extra)
    return entry


mining = [
    item("鉄鉱石", "隔ての砂原、緋の森"),
    item("マカライト鉱石", "緋の森、油涌き谷、竜都の跡形、隔ての砂原（下）、氷霧の断崖（下）"),
    item("大地の結晶", "隔ての砂原、緋の森、竜都の跡形（上）"),
    item("ドラグライト鉱石", "油涌き谷、氷霧の断崖、竜都の跡形（下）"),
    item("紅蓮石", "油涌き谷"),
    item("アイシスメタル", "氷霧の断崖"),
    item("ライトクリスタル", "竜都の跡形（下）", note="上位は全マップ"),
    item("カブレライト鉱石（上）", "緋の森 49%、竜都 45%、砂原 34%、氷霧 30%、油涌き谷 11%"),
    item("ノヴァクリスタル（上）", "緋の森、油涌き谷、隔ての砂原、竜都の跡形"),
    item("グラシスメタル（上）", "氷霧の断崖だけ"),
    item("獄炎石（上）", "油涌き谷だけ"),
    item("ユニオン鉱石（上）", "竜都の跡形だけ"),
]
# ライトクリスタル: 上位は全マップ
mining[6]["maps"] = [{"map": "竜都の跡形", "rank": "low"}] + [{"map": m, "rank": "high"} for m in ALL]

bones = [
    item("なぞの骨（下）", "全マップ"),
    item("頑丈な骨", "全マップ"),
    item("上質な堅骨（上）", "全マップ"),
    item("いにしえの龍骨（上・低確率）", "全マップ"),
    item("黒ずんだ油骨", "油涌き谷だけ"),
    item("凍てついた氷骨", "氷霧の断崖だけ"),
    item("たくましい護骨", "竜都の跡形だけ"),
    item("いにしえの化石骨", "隔ての砂原", source="黒ずんだ骨の化石"),
]

bugs = [
    item("にが虫の苦汁", "全マップ", source="にが虫", areaNote="砂原は全エリア"),
    item("光蟲の発光素", "全マップ", source="光蟲", areaNote="砂原はエリア6・7・11・15"),
    item("不死虫のエキス", "全マップ", source="不死虫", areaNote="砂原はエリア2・4・5・7・9・14・16・17"),
    item("雷光虫の蓄電素", "隔ての砂原、竜都の跡形", source="雷光虫"),
]

plants = [
    item("薬草、げどく草、毒テングダケ、ニトロダケ", "全マップ"),
    item("マヒダケ、流水草", "砂原・緋の森・油涌き谷・竜都"),
    item("マンドラゴラ、龍殺しの実", "砂原・緋の森・氷霧・竜都"),
    item("霜ふり草、リュウゲキの実", "砂原・緋の森・油涌き谷・氷霧"),
    item("火薬草、バクレツの実", "砂原・緋の森・油涌き谷"),
    item("アオキノコ、ツタの葉", "砂原・緋の森・竜都"),
    item("ネムリ草", "砂原・緋の森・氷霧"),
    item("ザンレツの実", "砂原・氷霧・竜都"),
    item("ケムリの実", "緋の森・油涌き谷・竜都"),
    item("ドキドキノコ", "緋の森・氷霧・竜都"),
    item("落陽草の花", "緋の森・竜都"),
    item("鬼ニトロダケ、怪力の種", "油涌き谷・竜都"),
    item("カクサンの実、ヒンヤリダケ", "油涌き谷"),
    item("トウガラシ", "氷霧の断崖"),
    item("トゲ草の実", "隔ての砂原", areaNote="エリア2・8・16"),
    item("沙胡椒の実", "隔ての砂原", note="豊穣期"),
]

specials = [
    item("ヘダテアロエ", "隔ての砂原"),
    item("上質なヘダテアロエ", "隔ての砂原", note="低確率"),
    item("上質な沙胡椒の実", "隔ての砂原", source="沙胡椒の実"),
    item("蒼雷晶のかけら、上質な蒼雷晶", "隔ての砂原", source="蒼雷晶の結晶"),
    item("ドスヘダテアロエ", "隔ての砂原", note="豊穣期のイベント中"),
    item("轟天蒼雷晶", "隔ての砂原", note="「轟天蒼雷晶出現」イベント中"),
    item("緋琥珀のかけら、上質な緋琥珀", "緋の森", source="虫入りの琥珀"),
    item("悠久の大緋琥珀", "緋の森", note="巨大な琥珀イベント中"),
    item("キラキラのオタカラ、ツヤツヤのオタカラ", "緋の森", source="古びたオタカラ"),
    item("デカデカのオタカラ", "緋の森", note="大きなオタカライベント中"),
    item("グラスウィード", "緋の森", source="グラス状の藻類"),
    item("グラングラスウィード", "緋の森", note="豊穣期だけ"),
    item("ナガレツボボヤ、ロイヤルツボボヤ", "緋の森", source="きれいな水棲生物"),
    item("女王華の蠱惑粉", "緋の森", source="クイーンラフレシア"),
    item("黄金オイル", "油涌き谷"),
    item("アンティマ石、上質なアンティマ石", "油涌き谷", source="骸晶化した鉱物", note="上質なアンティマ石はまれ"),
    item("アンティマター", "油涌き谷", note="骸晶化した巨大な鉱物イベント中"),
    item("竜鱗の飾りツボ、逆鱗の飾りツボ", "氷霧の断崖", source="古代の遺物"),
    item("金色竜鱗重飾大壺", "氷霧の断崖", note="壮麗な古代の遺物イベント中"),
    item("風鋏竜の抜け殻", "氷霧の断崖"),
    item("リュウトホオズキ、超熟リュウトホオズキ", "竜都の跡形", source="不思議な果物"),
    item("源流のリュウヌ玉", "竜都の跡形", source="輝白色の玉石"),
    item("乳白の繭糸", "竜都の跡形", source="繭の繊維"),
    item("リュウヌ玉石、リュウヌ小石", "砂原・油涌き谷・竜都", source="乳白色の玉石"),
    item("暦年の大リュウヌ玉", "隔ての砂原", source="乳白色の晶出塊", note="砂原など"),
    item("化石のオパール、化石の美色オパール", "砂原・油涌き谷", source="きれいな化石"),
    item("ジェネシスオパール", "砂原・油涌き谷", note="「壮麗な化石」イベント中（砂原・油涌き谷など）"),
    item("一夜花の月華粉", [], note="満月の夜だけ"),
    item("冬竜夏草", [], note="小型モンスターの死体から生えるキノコ（まれ）"),
    item("古びた竜彫貨", [], note="フィールドで拾う、プーギーからもらう"),
]

fishing = [
    ("サシミウオ", "砂原", "いつでも", "サシミウロコ、大サシミウロコ", False),
    ("キレアジ", "砂原", "いつでも", "キレアジのヒレ、キレアジの上ヒレ", False),
    ("黄金魚", "砂原・緋・油", "いつでも", "黄金のウロコ", False),
    ("白金魚", "砂原・緋", "いつでも", "白金のウロコ", False),
    ("小金魚", "緋・氷霧・竜都", "いつでも", "金色のウロコ", False),
    ("ハレツアロワナ", "緋・油", "いつでも", "ハレツウロコ", False),
    ("バクレツアロワナ", "緋・油", "いつでも", "バクレツウロコ", False),
    ("バクヤクデメキン", "緋・氷霧・竜都", "いつでも", "バクヤクウロコ", False),
    ("コモチアミア", "全マップ", "いつでも", "ジュエルカラスミ", True),
    ("ガライーバ", "緋の森", "豊穣期・異常気象", "咬魚の皮", False),
    ("ダイオウカジキ", "緋の森", "荒廃期・異常気象", "ダイオウカジキのヒレ", True),
    ("大食いマグロ", "緋の森", "豊穣期・異常気象", "古びた竜彫貨、上質な緋琥珀、トリュフ・ド・コンガなど", False),
]
fish_entries = [{
    "items": [m.strip() for m in mats.replace("など", "").split("、")],
    "maps": maps(where), "source": fish + ("（レア）" if rare else ""), "note": when + ("・ほか" if "など" in mats else ""),
} for fish, where, when, mats, rare in fishing]

monster_only = [
    item("赫炎結晶", [], rank="low", source="アジャラカン"),
    item("狂竜結晶", [], rank="high", source="ゴア・マガラ、ゲリョス、ネルスキュラ など"),
    item("堅牢な骨", [], rank="high", source="チャタカブラ、ババコンガ"),
    item("堅牢な巨骨", [], rank="high", source="ドシャグマ、ドドブランゴ"),
    item("尖竜骨", [], rank="high", source="バーラハーラ、護竜オドガロン亜種"),
    item("堅竜骨", [], rank="high", source="レ・ダウ、アルシュベルド"),
]

data = {
    "note": "採取場所。GameWith に文字で書かれている情報を元に整理（エリア番号は文字で書かれているものだけ）。植物や一部の特産品はマップ名まで。",
    "legend": "（上）＝上位だけ、（下）＝下位だけ。何もついていないものは上位でも下位でもとれる。",
    "categories": [
        {"id": "mining", "icon": "⛏", "name": "採掘（鉱脈）", "entries": mining, "areas": {
            "隔ての砂原": "上層「鉱石洞窟」キャンプ → エリア2 → エリア6「谷の隠れ家」の順に回る。エリア5からエリア3へは飛び降りる。",
            "緋の森": "エリア8キャンプ → エリア13、エリア18（上層）。ノヴァクリスタルはエリア8「洞窟湖」のまわり。",
            "油涌き谷": "エリア4・12・13が優先。豊穣期は上層の鉱脈が4か所増える。",
            "氷霧の断崖": "エリア6・7・18・20のキャンプまわり。エリア13・16は遠いので飛ばしてOK。",
            "竜都の跡形": "ベースキャンプから下へ進む。エリア1・6・8の近くにもある。エリア15は遠い。",
        }},
        {"id": "bone", "icon": "🦴", "name": "骨塚", "entries": bones, "areas": {
            "隔ての砂原": "エリア1・4・5・9・10・16（エリア4のキャンプ近くに4つまとまっている）",
            "緋の森": "エリア4・6・10・15・16（荒廃期だと全部出る）",
            "油涌き谷": "エリア4・6・10・15・16（ベースキャンプの上層に5つ、エリア8キャンプの近くに2つ）※エリア番号が緋の森と同じで、元の記載の誤りの可能性あり",
            "氷霧の断崖": "エリア4・6・9・14（荒廃期だけ出る骨塚あり）",
            "竜都の跡形": "エリア1・6・8・11・12",
        }},
        {"id": "bug", "icon": "🐛", "name": "虫（捕まえる）", "entries": bugs},
        {"id": "plant", "icon": "🌿", "name": "採取（植物・キノコ）", "entries": plants},
        {"id": "special", "icon": "💎", "name": "特産品（特別な採取ポイント）", "entries": specials},
        {"id": "fish", "icon": "🎣", "name": "釣り", "entries": fish_entries},
        {"id": "monster", "icon": "🐉", "name": "モンスターからしかとれないもの", "entries": monster_only},
    ],
    "tips": [
        "鉱脈・骨塚・採取ポイントは15分で復活する。クエストを受け直すと、すぐ復活する。",
        "チェーン装備3部位の「地質学Lv3」で、1回にとれる数が1個増える。",
    ],
}
out = Path(__file__).resolve().parent.parent / "data" / "gathering.json"
out.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
print("wrote", out, sum(len(c["entries"]) for c in data["categories"]))
