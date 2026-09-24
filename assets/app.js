// Monster Hunter Wilds 素材トラッカー
// データ: data/mh-wilds.json（tools/build-mh-wilds-data.py で MHDB から生成）
// 人ごとの設定はこのブラウザの localStorage に保存する（サーバー不要・費用0円）。
// 別の端末や友達との受け渡しは「共有URL / 共有コード」で行う。

// 更新時に古いファイルがブラウザに残らないよう、公開ごとに index.html と合わせて変える
const VERSION = "202609240559";
const DATA_URL = `./data/mh-wilds.json?v=${VERSION}`;
const ARTIAN_URL = `./data/gogma-artian-skills.json?v=${VERSION}`;
const LIMIT_BREAK_URL = `./data/armor-limit-break.json?v=${VERSION}`;
const WEAKNESS_URL = `./data/monster-weakness.json?v=${VERSION}`;
const GATHERING_URL = `./data/gathering.json?v=${VERSION}`;
const STORAGE_KEY = "mh-wilds-tracker-v1";
const PAGE_SIZE = 60;

const TABS = [
  { id: "list", label: "欲しいもの" },
  { id: "sim", label: "装備シミュ" },
  { id: "weapons", label: "武器" },
  { id: "armor", label: "防具" },
  { id: "charms", label: "護石" },
  { id: "decos", label: "装飾品" },
  { id: "items", label: "素材" },
  { id: "gather", label: "採取ガイド" },
  { id: "monsters", label: "モンスター別ドロップ" },
  { id: "artian", label: "巨戟アーティア" },
  { id: "party", label: "みんな" },
];

const PIECE_LABELS = { head: "頭", chest: "胴", arms: "腕", waist: "腰", legs: "脚" };
const PIECE_ORDER = ["head", "chest", "arms", "waist", "legs"];
const ELEMENT_LABELS = {
  fire: "火", water: "水", thunder: "雷", ice: "氷", dragon: "龍",
  poison: "毒", paralysis: "麻痺", sleep: "睡眠", blastblight: "爆破",
};
const RANK_LABELS = { low: "下位", high: "上位" };
const SOURCE_ORDER = [
  "carve", "carve-severed", "target-reward", "broken-part", "broken-fragment", "wound-destroyed",
  "tempered-wound-destroyed", "carve-rotten", "carve-rotten-severed", "carve-crystallized",
];
const WEAKNESS_LABELS = {
  ...{ fire: "火", water: "水", thunder: "雷", ice: "氷", dragon: "龍" },
  poison: "毒", paralysis: "麻痺", sleep: "睡眠", blastblight: "爆破", stun: "気絶", exhaust: "減気",
  flash: "閃光", noise: "音爆弾", "sonic-bomb": "音爆弾", "pitfall-trap": "落とし穴", "shock-trap": "シビレ罠", meat: "肉",
};
const SOURCE_LABELS = {
  "target-reward": "報酬",
  carve: "剥ぎ取り",
  "broken-part": "部位破壊",
  "carve-rotten": "剥ぎ取り(腐敗)",
  "wound-destroyed": "傷破壊",
  "tempered-wound-destroyed": "傷破壊(歴戦)",
  "carve-severed": "切断剥ぎ取り",
  "carve-rotten-severed": "切断剥ぎ取り(腐敗)",
  "carve-crystallized": "剥ぎ取り(結晶化)",
  "broken-fragment": "部位破壊(欠片)",
};
const ITEM_COLORS = {
  white: "#e9e4dc", gray: "#9a9a9a", yellow: "#f2d43d", blue: "#4f86f7", pink: "#f58bc4",
  red: "#e64545", purple: "#a868e8", brown: "#a9714b", green: "#4cc36c", sky: "#63c7f2",
  vermilion: "#f0643c", ivory: "#f4ecd0", orange: "#f59a2f", "blue-purple": "#7a73f0",
  ultramarine: "#3553d8", rose: "#e8567a", "dark-purple": "#6e3aa3", "sage-green": "#98b089",
  "moss-green": "#6d7d3b", lemon: "#f5f07a", emerald: "#1fbf8f",
};
const ELEMENT_ORDER = ["fire", "water", "thunder", "ice", "dragon", "poison", "paralysis", "sleep", "blastblight", "none"];
const SPECIES_ICONS = {
  "飛竜種": `<path d="M22 31 L5 9 L14 13 L17 5 L24 15 L30 27 Z M34 29 L39 5 L45 13 L55 9 L49 30 Z"/><ellipse cx="30" cy="37" rx="14" ry="8"/><path d="M40 33 Q47 25 54 24 L61 27 L55 30 Q49 33 45 39 Z"/><path d="M18 37 Q8 42 2 52 Q12 47 21 43 Z"/><path d="M24 42 L22 54 L27 54 L29 43 Z M34 42 L36 54 L41 54 L39 42 Z"/>`,
  "牙獣種": `<ellipse cx="28" cy="34" rx="18" ry="12"/><circle cx="48" cy="27" r="9"/><path d="M42 20 L44 12 L48 19 Z M50 19 L55 12 L55 21 Z"/><path d="M53 29 L61 31 L54 34 Z"/><path d="M13 40 L11 54 L18 54 L19 42 Z M22 43 L22 54 L29 54 L29 44 Z M34 43 L35 54 L42 54 L40 42 Z M42 38 L46 54 L53 54 L48 36 Z"/><path d="M11 30 Q4 26 3 18 Q9 25 14 27 Z"/>`,
  "鳥竜種": `<ellipse cx="28" cy="36" rx="13" ry="9" transform="rotate(-15 28 36)"/><path d="M36 30 Q40 18 46 14 L50 17 Q44 22 42 33 Z"/><path d="M44 12 L60 16 L47 19 Z"/><path d="M45 13 L40 3 L50 10 Z"/><path d="M26 44 L24 56 L20 58 L28 58 L28 45 Z M32 43 L34 56 L31 58 L38 58 L35 43 Z"/><path d="M16 38 Q6 40 2 34 Q8 34 16 33 Z"/><path d="M22 29 L10 20 L16 30 Z"/>`,
  "海竜種": `<path d="M4 44 Q12 30 22 38 Q30 46 38 34 Q44 24 52 24 L60 27 L54 31 Q48 31 44 38 Q34 54 22 46 Q14 40 8 48 Z"/><path d="M24 38 L20 28 L30 36 Z M40 30 L38 20 L46 26 Z"/><path d="M50 23 L48 14 L55 22 Z"/><path d="M26 46 L24 54 L30 47 Z"/>`,
  "獣竜種": `<path d="M20 30 Q28 22 40 24 L50 16 L62 18 L60 26 L50 28 Q48 36 42 40 L22 42 Q14 40 12 36 Z"/><path d="M12 34 Q4 36 2 46 Q10 40 16 40 Z"/><path d="M40 32 L46 36 L43 38 Z"/><path d="M24 40 L20 56 L28 56 L30 42 Z M34 40 L36 56 L44 56 L40 40 Z"/><path d="M52 16 L54 10 L57 17 Z"/>`,
  "両生種": `<ellipse cx="32" cy="38" rx="20" ry="12"/><circle cx="24" cy="26" r="6"/><circle cx="40" cy="26" r="6"/><path d="M12 42 L4 54 L16 52 L18 46 Z M52 42 L60 54 L48 52 L46 46 Z"/><path d="M20 48 L16 58 L26 56 Z M44 48 L48 58 L38 56 Z"/><path d="M50 34 Q60 30 62 22 Q58 32 50 38 Z"/>`,
  "鋏角種": `<ellipse cx="22" cy="34" rx="12" ry="10"/><ellipse cx="40" cy="34" rx="8" ry="6"/><circle cx="50" cy="32" r="4"/><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M36 30 L32 16 L24 10"/><path d="M40 30 L42 14 L50 8"/><path d="M36 38 L30 50 L22 56"/><path d="M40 38 L44 50 L50 58"/><path d="M44 30 L52 18 L60 16"/><path d="M44 38 L54 46 L60 52"/><path d="M52 32 L60 34"/></g>`,
  "頭足種": `<path d="M14 30 Q14 10 32 10 Q50 10 50 30 Q50 38 44 40 L20 40 Q14 38 14 30 Z"/><circle cx="26" cy="28" r="3" fill="#000" fill-opacity=".35"/><circle cx="38" cy="28" r="3" fill="#000" fill-opacity=".35"/><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M20 40 Q12 48 6 46"/><path d="M26 40 Q24 52 16 56"/><path d="M32 40 Q32 52 30 60"/><path d="M38 40 Q40 52 48 56"/><path d="M44 40 Q52 48 58 46"/></g>`,
  "造竜種": `<path d="M8 38 L22 24 L36 22 L50 14 L60 20 L56 28 L46 30 L42 40 L30 46 L16 46 Z"/><path d="M50 14 L52 6 L56 16 Z M44 17 L44 8 L49 16 Z"/><path d="M22 24 L24 12 L30 23 Z M30 23 L34 10 L37 22 Z"/><path d="M24 46 L22 58 L28 58 L30 46 Z M36 44 L38 58 L44 58 L41 42 Z"/><path d="M8 38 L2 50 L14 44 Z"/><path d="M32 30 L38 34 L32 38 L26 34 Z" fill="#000" fill-opacity=".3"/>`,
  "亜龍種": `<path d="M32 12 Q40 14 42 22 L58 14 L54 26 L62 30 L50 34 L46 50 L38 42 L32 56 L26 42 L18 50 L14 34 L2 30 L10 26 L6 14 L22 22 Q24 14 32 12 Z"/><path d="M28 14 L24 4 L31 12 Z M36 14 L40 4 L33 12 Z"/>`,
  "古龍種": `<path d="M18 30 L4 10 L14 14 L18 6 L24 16 L30 26 Z M36 26 L42 6 L48 14 L58 12 L50 30 Z"/><ellipse cx="30" cy="38" rx="15" ry="8"/><path d="M42 34 Q48 26 54 26 L62 28 L56 32 Q50 34 46 40 Z"/><path d="M54 26 L52 16 L58 24 Z M50 26 L46 17 L53 24 Z"/><path d="M16 38 Q6 44 2 56 Q12 48 20 44 Z"/><path d="M20 42 L18 54 L23 54 L25 44 Z M28 44 L28 56 L33 56 L33 45 Z M36 43 L38 55 L43 55 L41 42 Z"/>`,
  "その他": `<path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z"/><circle cx="32" cy="32" r="11" fill="#000" fill-opacity=".35"/><circle cx="32" cy="32" r="5"/><path d="M32 4 L32 14 M56 18 L47 23 M56 46 L47 41 M32 60 L32 50 M8 46 L17 41 M8 18 L17 23" stroke="#000" stroke-opacity=".35" stroke-width="2"/>`,
};
const SPECIES_HUES = {
  "飛竜種": 8, "牙獣種": 30, "鳥竜種": 300, "海竜種": 200, "獣竜種": 20, "両生種": 95,
  "鋏角種": 330, "頭足種": 265, "造竜種": 170, "亜龍種": 280, "古龍種": 45, "その他": 210,
};
// 鎧玉1個あたりの強化ポイントと入手目安（大きい順）
const ARMOR_SPHERES = [
  { n: "重鎧玉", pt: 5000, from: "★7クエスト以上" },
  { n: "堅鎧玉", pt: 1000, from: "★6クエスト以上" },
  { n: "尖鎧玉", pt: 200, from: "★4クエスト以上" },
  { n: "上鎧玉", pt: 50, from: "★3クエスト以上" },
  { n: "鎧玉", pt: 10, from: "★2クエスト以上" },
];
// 属性アイコン（オリジナル図案）
const ELEMENT_ICONS = {
  fire: { color: "#ff5a3c", svg: `<path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 2 2 4 1-2 1-5 1-8Z"/>` },
  water: { color: "#3fa4ff", svg: `<path d="M12 2c3 5 7 9 7 13a7 7 0 0 1-14 0c0-4 4-8 7-13Z"/>` },
  thunder: { color: "#ffd21f", svg: `<path d="M14 2 5 14h6l-2 8 10-13h-6l1-7Z"/>` },
  ice: { color: "#8fe3ff", svg: `<path d="M11 2h2v7l5-4 1 2-5 4h8v2h-8l5 4-1 2-5-4v8h-2v-8l-5 4-1-2 5-4H2v-2h8L5 7l1-2 5 4Z"/>` },
  dragon: { color: "#b36bff", svg: `<path d="M12 2 16 9l5 1-4 4 1 8-6-4-6 4 1-8-4-4 5-1Z"/>` },
};
const WEAK_ELEMENTS = ["fire", "water", "thunder", "ice", "dragon"];
const WEAK_ORDER = { "◎": 0, "○": 1, "▲": 2, "×": 3, "無効": 4 };
const WEAK_TITLES = { "◎": "とても有効", "○": "有効", "▲": "やや有効", "×": "効きにくい", "無効": "無効" };
const STAGE_COLORS = { "隔ての砂原": "#e0b060", "緋の森": "#e0706a", "油涌き谷": "#c98a4a", "氷霧の断崖": "#8fd0f0", "竜都の跡形": "#9f8fe0" };
const SLOT_MARKS = ["", "①", "②", "③", "④"];

const app = document.querySelector("#app");

let data = null;
let artian = null;
let limitBreak = null;
let weakness = null;
let gathering = null;
const gatherIndex = new Map(); // 素材名 -> [{ category, entry }]
const idx = {
  items: new Map(),
  monsters: new Map(),
  weapons: new Map(),
  pieces: new Map(),
  charms: new Map(),
  decos: new Map(),
  weaponTypes: new Map(),
  usage: new Map(),
  stages: new Map(),
};

let store = loadStore();
let currentTab = "list";
let pendingImport = null;
const filters = {
  weapons: { type: "great-sword", group: "tree", mon: "", el: "", rarity: "", q: "", wantedOnly: false, limit: PAGE_SIZE },
  armor: { hr: "", rarity: "", q: "", wantedOnly: false, limit: 40 },
  charms: { q: "", wantedOnly: false, limit: PAGE_SIZE },
  decos: { on: "", lv: "", q: "", wantedOnly: false, limit: PAGE_SIZE },
  items: { group: "category", cat: "", hr: "", rarity: "", q: "", neededOnly: false, limit: PAGE_SIZE },
  monsters: { id: "", rank: "high", q: "", view: "drop", map: "" },
  artian: { kind: "", q: "" },
  gather: { map: "", q: "" },
  list: { hideDone: false },
};

init();

async function init() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`${DATA_URL}: ${response.status}`);
    data = await response.json();
    [artian, limitBreak, weakness, gathering] = await Promise.all([ARTIAN_URL, LIMIT_BREAK_URL, WEAKNESS_URL, GATHERING_URL].map((url) =>
      fetch(url).then((res) => (res.ok ? res.json() : null)).catch(() => null)));
  } catch (error) {
    console.error(error);
    app.innerHTML = shell(`<div class="empty">データを読み込めませんでした。</div>`);
    return;
  }
  buildIndex();
  await readImportFromHash();
  const tabFromHash = window.location.hash.replace("#", "");
  if (TABS.some((tab) => tab.id === tabFromHash)) currentTab = tabFromHash;

  app.addEventListener("click", onClick);
  app.addEventListener("input", onInput);
  app.addEventListener("change", onChange);
  renderAll();
}

// ---------------------------------------------------------------------------
// データ索引

function buildIndex() {
  data.items.forEach((item) => idx.items.set(item.id, item));
  data.monsters.forEach((monster) => idx.monsters.set(monster.id, monster));
  (data.stages || []).forEach((stage) => idx.stages.set(stage.id, stage));
  (gathering?.categories || []).forEach((category) => category.entries.forEach((entry) => entry.items.forEach((name) => {
    if (!gatherIndex.has(name)) gatherIndex.set(name, []);
    gatherIndex.get(name).push({ category, entry });
  })));
  data.weaponTypes.forEach((type) => idx.weaponTypes.set(type.id, type.n));
  data.weapons.forEach((weapon) => idx.weapons.set(weapon.id, weapon));
  data.armor.forEach((set) => set.pc.forEach((piece) => idx.pieces.set(piece.id, { ...piece, set })));
  data.charms.forEach((charm) => idx.charms.set(charm.id, charm));
  data.decorations.forEach((deco) => idx.decos.set(deco.id, deco));

  const addUsage = (inputs, key) => {
    Object.entries(inputs || {}).forEach(([itemId, amount]) => {
      if (!idx.usage.has(itemId)) idx.usage.set(itemId, []);
      idx.usage.get(itemId).push({ key, amount });
    });
  };
  data.weapons.forEach((weapon) => addUsage(weapon.in, `w:${weapon.id}`));
  data.armor.forEach((set) => set.pc.forEach((piece) => addUsage(piece.in, `a:${piece.id}`)));
  data.charms.forEach((charm) => addUsage(charm.in, `c:${charm.id}`));
}

// 欲しいものキー（w:武器ID / a:防具部位ID / c:護石ID）から表示情報を取り出す
function resolveWant(key) {
  const [kind, ...rest] = key.split(":");
  const id = rest.join(":");
  if (kind === "w") {
    const weapon = idx.weapons.get(id);
    return weapon && { kind, label: idx.weaponTypes.get(weapon.t), name: weapon.n, rarity: weapon.r, entity: weapon };
  }
  if (kind === "a") {
    const piece = idx.pieces.get(id);
    return piece && { kind, label: `防具・${PIECE_LABELS[piece.p]}`, name: piece.n, rarity: piece.set.r, entity: piece };
  }
  if (kind === "c") {
    const charm = idx.charms.get(id);
    return charm && { kind, label: "護石", name: charm.n, rarity: charm.r, entity: charm };
  }
  return null;
}

// 武器の派生元をたどって [生産, 強化1, 強化2, ...] の順で返す
function weaponChain(weapon) {
  const chain = [];
  const seen = new Set();
  let current = weapon;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    chain.unshift(current);
    current = current.prev ? idx.weapons.get(current.prev) : null;
  }
  return chain;
}

// ---------------------------------------------------------------------------
// 保存データ（人ごとのプロフィール）

function newProfile(name) {
  return { id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name, wants: {}, owned: {}, decos: {}, sim: emptyBuild(), builds: [] };
}

function loadStore() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    saved = null;
  }
  if (!saved || !Array.isArray(saved.profiles) || !saved.profiles.length) {
    const first = newProfile("自分");
    return { current: first.id, profiles: [first] };
  }
  saved.profiles.forEach((profile) => {
    profile.wants ||= {};
    profile.owned ||= {};
    profile.decos ||= {};
    profile.sim ||= emptyBuild();
    profile.builds ||= [];
  });
  if (!saved.profiles.some((profile) => profile.id === saved.current)) saved.current = saved.profiles[0].id;
  return saved;
}

function saveStore() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.warn("保存できませんでした", error);
  }
}

function profile() {
  return store.profiles.find((entry) => entry.id === store.current) || store.profiles[0];
}

// プロフィールの欲しい装備から必要素材を集計する
function computeNeeds(target) {
  const needed = new Map();
  let zenny = 0;
  let upgradePoints = 0;
  let limitBreaks = 0;
  Object.entries(target.wants).forEach(([key, want]) => {
    const info = resolveWant(key);
    if (!info) return;
    const count = want.n || 1;
    const steps = info.kind === "w" && want.chain ? weaponChain(info.entity) : [info.entity];
    steps.forEach((step) => {
      zenny += (step.z || 0) * count;
      Object.entries(step.in || {}).forEach(([itemId, amount]) => {
        needed.set(itemId, (needed.get(itemId) || 0) + amount * count);
      });
    });
    if (info.kind === "a" && (want.upg || want.lb)) {
      const upgrade = upgradeInfo(info.entity.set.r);
      zenny += upgrade.zenny * count;
      upgradePoints += upgrade.points * count;
      if (want.lb && upgrade.lb) {
        zenny += (upgrade.lb.zenny + (upgrade.lb.zennyBreak || 0)) * count;
        upgradePoints += upgrade.lb.points * count;
        limitBreaks += count;
      }
    }
  });
  // 強化ポイントは大きい鎧玉から順に割り当てて、必要素材に加える
  sphereMix(upgradePoints).forEach((entry) => {
    if (entry.item) needed.set(entry.item.id, (needed.get(entry.item.id) || 0) + entry.count);
  });
  const rows = [...needed.entries()].map(([itemId, need]) => {
    const owned = target.owned[itemId] || 0;
    return { itemId, item: idx.items.get(itemId), need, owned, remain: Math.max(0, need - owned) };
  });
  rows.sort((a, b) => (a.remain === 0) - (b.remain === 0) || (b.item?.r || 0) - (a.item?.r || 0) || (a.item?.n || "").localeCompare(b.item?.n || "", "ja"));
  return { rows, zenny, upgradePoints, limitBreaks };
}

// ---------------------------------------------------------------------------
// 共有（URL / コード）

async function encodeProfile(target) {
  const payload = JSON.stringify({ v: 1, name: target.name, wants: target.wants, owned: target.owned, decos: target.decos, builds: target.builds });
  let bytes = new TextEncoder().encode(payload);
  let prefix = "j";
  if (typeof CompressionStream === "function") {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
      bytes = new Uint8Array(await new Response(stream).arrayBuffer());
      prefix = "z";
    } catch {
      prefix = "j";
    }
  }
  return `${prefix}.${toBase64Url(bytes)}`;
}

async function decodeProfile(code) {
  const text = code.trim().replace(/^.*#import=/, "");
  const [prefix, body] = text.includes(".") ? text.split(".", 2) : ["j", text];
  let bytes = fromBase64Url(body);
  if (prefix === "z") {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  }
  const parsed = JSON.parse(new TextDecoder().decode(bytes));
  if (!parsed || typeof parsed.wants !== "object") throw new Error("invalid code");
  return {
    name: String(parsed.name || "ゲスト").slice(0, 30),
    wants: sanitizeWants(parsed.wants),
    owned: sanitizeCounts(parsed.owned),
    decos: sanitizeDecos(parsed.decos),
    builds: sanitizeBuilds(parsed.builds),
  };
}

function sanitizeCounts(source) {
  const result = {};
  Object.entries(source || {}).forEach(([key, value]) => {
    const number = Math.floor(Number(value));
    if (number > 0) result[key] = Math.min(number, 9999);
  });
  return result;
}

function sanitizeWants(source) {
  const result = {};
  Object.entries(source || {}).forEach(([key, value]) => {
    if (!resolveWant(key)) return;
    result[key] = { n: Math.max(1, Math.min(99, Math.floor(Number(value?.n) || 1))), ...(value?.chain ? { chain: true } : {}), ...(value?.upg ? { upg: true } : {}), ...(value?.lb ? { lb: true } : {}) };
  });
  return result;
}

function sanitizeDecos(source) {
  const result = {};
  Object.entries(source || {}).forEach(([key, value]) => {
    if (!idx.decos.has(key)) return;
    result[key] = { want: Math.max(0, Math.min(99, Math.floor(Number(value?.want) || 0))), have: Math.max(0, Math.min(999, Math.floor(Number(value?.have) || 0))) };
  });
  return result;
}

function sanitizeBuilds(source) {
  if (!Array.isArray(source)) return [];
  return source.slice(0, 30)
    .filter((entry) => entry && typeof entry.b === "object")
    .map((entry) => ({ id: String(entry.id || Math.random().toString(36).slice(2)), name: String(entry.name || "セット").slice(0, 40), b: normalizeBuild(entry.b) }));
}

function toBase64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text) {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "===".slice((base64.length + 3) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function readImportFromHash() {
  const match = window.location.hash.match(/^#import=(.+)$/);
  if (!match) return;
  try {
    pendingImport = await decodeProfile(match[1]);
  } catch (error) {
    console.warn(error);
    pendingImport = { error: true };
  }
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

function applyImport(imported, mode) {
  if (mode === "replace") {
    const existing = store.profiles.find((entry) => entry.name === imported.name);
    if (existing) {
      Object.assign(existing, { wants: imported.wants, owned: imported.owned, decos: imported.decos, builds: imported.builds });
      store.current = existing.id;
      saveStore();
      return;
    }
  }
  const created = { ...newProfile(uniqueName(imported.name)), wants: imported.wants, owned: imported.owned, decos: imported.decos, builds: imported.builds };
  store.profiles.push(created);
  store.current = created.id;
  saveStore();
}

function uniqueName(name) {
  let candidate = name;
  let n = 2;
  while (store.profiles.some((entry) => entry.name === candidate)) candidate = `${name}(${n++})`;
  return candidate;
}

// ---------------------------------------------------------------------------
// イベント

async function onClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action } = button.dataset;
  const target = profile();

  if (action === "tab") {
    currentTab = button.dataset.tab;
    history.replaceState(null, "", `#${currentTab}`);
    renderAll();
    return;
  }
  if (action === "toggle-want") {
    const key = button.dataset.key;
    if (target.wants[key]) delete target.wants[key];
    else target.wants[key] = { n: 1, ...(key.startsWith("w:") ? { chain: false } : {}) };
    saveStore();
    button.replaceWith(htmlToElement(wantButton(key)));
    refreshTabCounts();
    return;
  }
  if (action === "want-set") {
    button.dataset.keys.split(",").forEach((key) => {
      if (!target.wants[key]) target.wants[key] = { n: 1 };
    });
    saveStore();
    renderPanel();
    return;
  }
  if (action === "want-step") {
    const want = target.wants[button.dataset.key];
    if (!want) return;
    want.n = Math.max(1, Math.min(99, (want.n || 1) + Number(button.dataset.step)));
    saveStore();
    renderPanel();
    return;
  }
  if (action === "want-remove") {
    delete target.wants[button.dataset.key];
    saveStore();
    renderPanel();
    return;
  }
  if (action === "deco-step") {
    const { id, field } = button.dataset;
    const deco = (target.decos[id] ||= { want: 0, have: 0 });
    deco[field] = Math.max(0, Math.min(field === "want" ? 99 : 999, (deco[field] || 0) + Number(button.dataset.step)));
    if (!deco.want && !deco.have) delete target.decos[id];
    saveStore();
    const row = button.closest("[data-deco-row]");
    if (row && currentTab === "decos") row.replaceWith(htmlToElement(decoRow(idx.decos.get(id))));
    else renderPanel();
    refreshTabCounts();
    return;
  }
  if (action === "monster") {
    filters.monsters.id = button.dataset.id;
    renderPanel();
    app.querySelector("[data-role='monster-detail']")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action === "monster-open") {
    filters.monsters.view = "drop";
    filters.monsters.id = button.dataset.id;
    renderPanel();
    app.querySelector("[data-role='monster-detail']")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action === "monster-view") {
    filters.monsters.view = button.dataset.view;
    renderPanel();
    return;
  }
  if (action === "monster-rank") {
    filters.monsters.rank = button.dataset.rank;
    renderPanel();
    return;
  }
  if (action === "more") {
    filters[currentTab].limit += filters[currentTab].limit;
    renderResults();
    return;
  }
  if (action === "profile-add") {
    const name = prompt("追加する人の名前を入力してください");
    if (!name || !name.trim()) return;
    const created = newProfile(uniqueName(name.trim().slice(0, 30)));
    store.profiles.push(created);
    store.current = created.id;
    saveStore();
    renderAll();
    return;
  }
  if (action === "profile-rename") {
    const name = prompt("新しい名前", target.name);
    if (!name || !name.trim()) return;
    target.name = name.trim().slice(0, 30);
    saveStore();
    renderAll();
    return;
  }
  if (action === "profile-delete") {
    if (!confirm(`「${target.name}」のリストを削除しますか？（元に戻せません）`)) return;
    store.profiles = store.profiles.filter((entry) => entry.id !== target.id);
    if (!store.profiles.length) store.profiles.push(newProfile("自分"));
    store.current = store.profiles[0].id;
    saveStore();
    renderAll();
    return;
  }
  if (action === "share-url" || action === "share-code") {
    const code = await encodeProfile(target);
    const text = action === "share-url" ? `${window.location.origin}${window.location.pathname}#import=${code}` : code;
    const output = app.querySelector("[data-role='share-output']");
    output.value = text;
    output.hidden = false;
    output.select();
    const copied = await copyText(text);
    setMessage("share-message", copied ? "コピーしました。LINEやDiscordに貼り付けて共有できます。" : "下の欄の文字をコピーして共有してください。");
    return;
  }
  if (action === "import-code") {
    const input = app.querySelector("[data-role='import-input']");
    try {
      const imported = await decodeProfile(input.value);
      applyImport(imported, "new");
      renderAll();
    } catch {
      setMessage("import-message", "共有コードを読み取れませんでした。");
    }
    return;
  }
  if (action === "import-accept") {
    applyImport(pendingImport, button.dataset.mode);
    pendingImport = null;
    currentTab = "list";
    renderAll();
    return;
  }
  if (action === "import-dismiss") {
    pendingImport = null;
    renderAll();
    return;
  }
  if (action === "armor-detail") {
    openArmorDetail(button.dataset.id);
    return;
  }
  if (action === "detail-close") {
    button.closest("dialog")?.close();
    return;
  }
  if (action.startsWith("sim-")) {
    onSimClick(action, button);
    return;
  }
  if (action === "owned-clear") {
    if (!confirm("所持数をすべて0に戻しますか？")) return;
    target.owned = {};
    saveStore();
    renderPanel();
  }
}

function onInput(event) {
  const field = event.target;
  if (field.dataset.filter) {
    const tabFilters = filters[currentTab];
    tabFilters[field.dataset.filter] = field.type === "checkbox" ? field.checked : field.value;
    tabFilters.limit = currentTab === "armor" ? 40 : PAGE_SIZE;
    renderResults();
    return;
  }
  if ("simSearch" in field.dataset || field.dataset.simPickType !== undefined) {
    renderSimPickList();
    return;
  }
  if ("monsterMap" in field.dataset) {
    filters.monsters.map = field.value;
    const list = app.querySelector("[data-role='monster-chips']");
    if (list) list.innerHTML = monsterChips();
    return;
  }
  if ("monsterFilter" in field.dataset) {
    filters.monsters.q = field.value;
    const list = app.querySelector("[data-role='monster-chips']");
    if (list) list.innerHTML = monsterChips();
    return;
  }
  if (field.dataset.owned) {
    const target = profile();
    const value = Math.max(0, Math.min(9999, Math.floor(Number(field.value) || 0)));
    if (value) target.owned[field.dataset.owned] = value;
    else delete target.owned[field.dataset.owned];
    saveStore();
    updateNeedRow(field.closest("tr"), field.dataset.owned);
  }
}

function onChange(event) {
  const field = event.target;
  const target = profile();
  if (field.dataset.role === "profile-select") {
    store.current = field.value;
    saveStore();
    renderAll();
    return;
  }
  if (field.dataset.lb) {
    const want = target.wants[field.dataset.lb];
    if (want) want.lb = field.checked;
    saveStore();
    renderPanel();
    return;
  }
  if (field.dataset.upg) {
    const want = target.wants[field.dataset.upg];
    if (want) want.upg = field.checked;
    saveStore();
    renderPanel();
    return;
  }
  if (field.dataset.chain) {
    const want = target.wants[field.dataset.chain];
    if (want) want.chain = field.checked;
    saveStore();
    renderPanel();
    return;
  }
  if (field.dataset.sim) {
    onSimChange(field);
    return;
  }
  if (field.dataset.listFilter) {
    filters.list[field.dataset.listFilter] = field.checked;
    renderPanel();
  }
}

function updateNeedRow(row, itemId) {
  if (!row) return;
  const target = profile();
  const { rows } = computeNeeds(target);
  const entry = rows.find((candidate) => candidate.itemId === itemId);
  if (!entry) return;
  row.querySelector("[data-role='remain']").innerHTML = remainBadge(entry.remain);
  row.classList.toggle("is-done", entry.remain === 0);
  const summary = app.querySelector("[data-role='need-summary']");
  if (summary) summary.innerHTML = needSummary(rows);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    }
  }
}

function setMessage(role, text) {
  const element = app.querySelector(`[data-role='${role}']`);
  if (element) element.textContent = text;
}

// ---------------------------------------------------------------------------
// 描画（全体）

function shell(content) {
  return `
    <div class="site-shell">
      <header class="site-header">
        <div class="header-inner">
          <a class="brand" href="./" aria-label="MH Wilds 素材トラッカー">
            <img class="brand-mark" src="./assets/logo.svg" alt="" />
            <span class="brand-text">
              <span class="brand-title">MH Wilds 素材トラッカー</span>
              <span class="brand-sub">Monster Hunter Wilds Tracker</span>
            </span>
          </a>
        </div>
      </header>
      <section class="hero page-hero mh-hero">
        <div class="section-inner">
          <div class="eyebrow">MONSTER HUNTER WILDS</div>
          <h1>素材・護石・装飾品トラッカー</h1>
          <p class="hero-copy">欲しい武器・防具・護石を選ぶと必要な素材を自動で合計。モンスターごとのドロップ率も確認できます。人ごとにリストを作れて、共有URLで友達とも見せ合えます。</p>
        </div>
      </section>
      <section class="section mh-section">
        <div class="section-inner">${content}</div>
      </section>
      <footer class="site-footer">
        <div class="footer-inner">
          <div>データ出典: <a class="mh-link" href="https://github.com/LartTyler/mhdb-wilds-data" target="_blank" rel="noopener">MHDB (mhdb-wilds-data)</a>。非公式ファンツールです。</div>
        </div>
      </footer>
    </div>
  `;
}

function renderAll() {
  app.innerHTML = shell(`
    ${importBanner()}
    ${profileBar()}
    <nav class="mh-tabs" aria-label="表示切り替え">
      ${TABS.map((tab) => `<button type="button" class="mh-tab" data-action="tab" data-tab="${tab.id}" ${tab.id === currentTab ? 'aria-current="page"' : ""}>${tab.label}<span class="mh-tab-count" data-count="${tab.id}"></span></button>`).join("")}
    </nav>
    <div class="mh-panel" data-role="panel"></div>
  `);
  renderPanel();
}

function refreshTabCounts() {
  const target = profile();
  const counts = {
    list: Object.keys(target.wants).length,
    decos: Object.values(target.decos).filter((deco) => deco.want > 0).length,
  };
  app.querySelectorAll("[data-count]").forEach((element) => {
    const count = counts[element.dataset.count];
    element.textContent = count ? String(count) : "";
  });
}

function importBanner() {
  if (!pendingImport) return "";
  if (pendingImport.error) {
    return `<div class="mh-banner">共有URLを読み取れませんでした。<button type="button" class="mh-btn" data-action="import-dismiss">閉じる</button></div>`;
  }
  const exists = store.profiles.some((entry) => entry.name === pendingImport.name);
  return `
    <div class="mh-banner">
      <div><strong>「${escapeHtml(pendingImport.name)}」</strong>さんの欲しいものリスト（装備${Object.keys(pendingImport.wants).length}件）が共有されました。取り込みますか？</div>
      <div class="mh-row">
        ${exists ? `<button type="button" class="mh-btn primary" data-action="import-accept" data-mode="replace">同じ名前のリストを上書き</button>` : ""}
        <button type="button" class="mh-btn ${exists ? "" : "primary"}" data-action="import-accept" data-mode="new">新しい人として追加</button>
        <button type="button" class="mh-btn" data-action="import-dismiss">取り込まない</button>
      </div>
    </div>
  `;
}

function profileBar() {
  const current = profile();
  return `
    <div class="mh-profile">
      <label class="mh-profile-label">
        <span>だれのリスト？</span>
        <select data-role="profile-select">
          ${store.profiles.map((entry) => `<option value="${entry.id}" ${entry.id === current.id ? "selected" : ""}>${escapeHtml(entry.name)}</option>`).join("")}
        </select>
      </label>
      <div class="mh-row">
        <button type="button" class="mh-btn" data-action="profile-add">＋ 人を追加</button>
        <button type="button" class="mh-btn" data-action="profile-rename">名前変更</button>
        <button type="button" class="mh-btn danger" data-action="profile-delete">削除</button>
      </div>
    </div>
  `;
}

function renderPanel() {
  const panel = app.querySelector("[data-role='panel']");
  if (!panel) return;
  const renderers = {
    list: renderListPanel,
    sim: renderSimPanel,
    weapons: () => filterPanel(weaponControls()),
    armor: () => filterPanel(armorControls()),
    charms: () => filterPanel(charmControls()),
    decos: () => filterPanel(decoControls()),
    items: () => filterPanel(itemControls()),
    monsters: renderMonsterPanel,
    artian: () => filterPanel(artianControls()),
    gather: () => filterPanel(gatherControls()),
    party: renderPartyPanel,
  };
  panel.innerHTML = renderers[currentTab]();
  if (panel.querySelector("[data-role='results']")) renderResults();
  refreshTabCounts();
}

function filterPanel(controls) {
  return `<div class="mh-controls">${controls}</div><div data-role="results"></div>`;
}

function renderResults() {
  const results = app.querySelector("[data-role='results']");
  if (!results) return;
  const renderers = {
    weapons: weaponResults,
    armor: armorResults,
    charms: charmResults,
    decos: decoResults,
    items: itemResults,
    artian: artianResults,
    gather: gatherResults,
  };
  results.innerHTML = renderers[currentTab]();
}

function paged(list, render, wrapClass = "mh-cards") {
  const { limit } = filters[currentTab];
  if (!list.length) return `<div class="empty">該当するものがありません。</div>`;
  return `
    <div class="mh-result-count">${list.length}件</div>
    <div class="${wrapClass}">${list.slice(0, limit).map(render).join("")}</div>
    ${list.length > limit ? `<button type="button" class="mh-btn mh-more" data-action="more">さらに表示（残り${list.length - limit}件）</button>` : ""}
  `;
}

// 見出し付きで表示する（list は groupOf の順に並んでいること）
function pagedGrouped(list, render, groupOf, wrapClass = "mh-cards") {
  const { limit } = filters[currentTab];
  if (!list.length) return `<div class="empty">該当するものがありません。</div>`;
  const totals = new Map();
  list.forEach((entry) => {
    const { key } = groupOf(entry);
    totals.set(key, (totals.get(key) || 0) + 1);
  });
  const sections = [];
  list.slice(0, limit).forEach((entry) => {
    const group = groupOf(entry);
    if (!sections.length || sections[sections.length - 1].key !== group.key) sections.push({ ...group, entries: [] });
    sections[sections.length - 1].entries.push(entry);
  });
  return `
    <div class="mh-result-count">${list.length}件・${totals.size}グループ</div>
    ${sections.map((section) => `
      <h3 class="mh-group-head">${section.icon || ""}<span>${escapeHtml(section.label)}</span><small>${totals.get(section.key)}件</small></h3>
      <div class="${wrapClass}">${section.entries.map(render).join("")}</div>`).join("")}
    ${list.length > limit ? `<button type="button" class="mh-btn mh-more" data-action="more">さらに表示（残り${list.length - limit}件）</button>` : ""}
  `;
}

// 並べ替え用の順位（元の並びを保つ安定ソート）
function sortByGroup(list, rankOf) {
  return list.map((entry, index) => ({ entry, index, rank: rankOf(entry) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ entry }) => entry);
}

// 下位/上位: 防具はレア度1〜4が下位。素材は落とすモンスターのランク、無ければレア度（4以下が下位）で判定
function armorRankOf(set) {
  return set.r <= 4 ? "low" : "high";
}

// 防具の強化（レア度ごと）。通常の上限までと、限界突破で増える分に分けて集計する
function upgradeInfo(rarity) {
  const upgrade = data.armorUpgrades?.[String(rarity)] || { steps: [], lb: null };
  const sum = (steps) => ({
    maxLv: steps.length ? steps[steps.length - 1][0] : 1,
    def: steps.reduce((total, step) => total + step[1], 0),
    points: steps.reduce((total, step) => total + step[2], 0),
    zenny: steps.reduce((total, step) => total + step[3], 0),
  });
  const normal = sum(upgrade.steps.filter((step) => !upgrade.lb || step[0] <= upgrade.lb));
  const extra = upgrade.lb ? upgrade.steps.filter((step) => step[0] > upgrade.lb) : [];
  const lbInfo = limitBreak?.byRarity?.[String(rarity)];
  const lb = extra.length ? { ...sum(extra), fromLv: upgrade.lb, zennyBreak: lbInfo?.zenny ?? null, info: lbInfo } : null;
  return { ...normal, lb };
}

// 限界突破後のスロット（レア5: 3枠すべて+1、レア6: 左2枠+1、上限Lv3）
function limitBreakSlots(slots, rarity) {
  const count = rarity === 5 ? 3 : rarity === 6 ? 2 : 0;
  if (!count) return slots;
  const padded = [...slots, 0, 0, 0].slice(0, 3);
  return padded.map((lv, i) => (i < count ? Math.min(3, lv + 1) : lv)).filter((lv) => lv > 0);
}

// 必要ポイントを大きい鎧玉から順に割り当てた個数
function sphereMix(points) {
  let rest = points;
  return ARMOR_SPHERES.map((sphere) => {
    const count = sphere.pt === 10 ? Math.ceil(rest / sphere.pt) : Math.floor(rest / sphere.pt);
    rest -= count * sphere.pt;
    return { ...sphere, item: data.items.find((item) => item.n === sphere.n), count: Math.max(0, count) };
  }).filter((entry) => entry.count > 0);
}

function sphereText(points) {
  if (!points) return "";
  return sphereMix(points).map((entry) => `${escapeHtml(entry.n)}×${entry.count}`).join(" + ");
}

function upgradeLine(rarity, baseDef, count = 1, slots) {
  const info = upgradeInfo(rarity);
  if (!info.points) return "";
  const lb = info.lb;
  const newSlots = slots && limitBreakSlots(slots, rarity);
  return `
    <div class="mh-upgrade">
      <div><b>最大強化 Lv${info.maxLv}</b>${baseDef !== undefined ? `（防御 ${baseDef} → ${baseDef + info.def}）` : ""}</div>
      <div>強化ポイント <b>${(info.points * count).toLocaleString()}pt</b> ／ 費用 <b>${(info.zenny * count).toLocaleString()}z</b></div>
      <div class="mh-muted">鎧玉の例: ${sphereText(info.points * count)}</div>
    </div>
    ${lb ? `
    <div class="mh-upgrade mh-lb">
      <div><b>限界突破</b> Lv${lb.fromLv} → <b>Lv${lb.maxLv}</b>${baseDef !== undefined ? `（防御 → ${baseDef + info.def + lb.def}）` : `（防御 +${lb.def}）`}</div>
      <div>追加の強化 <b>${(lb.points * count).toLocaleString()}pt</b> ／ <b>${(lb.zenny * count).toLocaleString()}z</b>${lb.zennyBreak ? ` ＋ 突破 ${(lb.zennyBreak * count).toLocaleString()}z` : ""}</div>
      ${newSlots && newSlots.join() !== slots.join() ? `<div>スロット ${slotText(slots)} → <b>${slotText(newSlots)}</b></div>` : ""}
      <div class="mh-muted">鎧玉の例: ${sphereText(lb.points * count)}</div>
    </div>` : ""}
  `;
}

function sphereGuide() {
  return `
    <details class="mh-details mh-sphere-guide">
      <summary>鎧玉のポイントと入手目安</summary>
      <ul>${ARMOR_SPHERES.map((sphere) => `<li><b>${sphere.n}</b> ${sphere.pt.toLocaleString()}pt（${sphere.from}）</li>`).join("")}</ul>
      <p class="mh-note">「鎧玉の例」は大きい鎧玉から順に使った場合の個数です。持っていない鎧玉は小さい鎧玉で置き換えてください（例: 堅鎧玉1個 = 尖鎧玉5個）。</p>
    </details>
  `;
}

function itemRanks(item) {
  const ranks = new Set((item.src || []).map((source) => source[1]));
  // 採取できる素材は採取情報の（上）（下）も反映する
  (gatherIndex.get(item.n) || []).filter(({ category }) => category.id !== "monster").forEach(({ entry }) => {
    if (entry.rank) ranks.add(entry.rank);
    else if (!entry.maps.length || entry.maps.some((where) => !where.rank)) { ranks.add("low"); ranks.add("high"); }
    else entry.maps.forEach((where) => ranks.add(where.rank));
  });
  if (!ranks.size) ranks.add(item.r <= 4 ? "low" : "high");
  return ["low", "high"].filter((rank) => ranks.has(rank));
}

function rankBadges(ranks) {
  return ranks.map((rank) => `<span class="mh-rank ${rank}">${RANK_LABELS[rank]}</span>`).join("");
}

function rankFilter(value) {
  return `
    <label class="mh-field"><span>ランク</span>
      <select data-filter="hr">
        <option value="">すべて</option>
        <option value="low" ${value === "low" ? "selected" : ""}>下位</option>
        <option value="high" ${value === "high" ? "selected" : ""}>上位</option>
      </select>
    </label>
  `;
}

function monsterRank(monsterId) {
  const index = data.monsters.findIndex((monster) => monster.id === monsterId);
  return index < 0 ? 999 : index;
}

// ---------------------------------------------------------------------------
// 欲しいものタブ

function renderListPanel() {
  const target = profile();
  const wants = Object.entries(target.wants)
    .map(([key, want]) => ({ key, want, info: resolveWant(key) }))
    .filter((entry) => entry.info);
  const { rows, zenny, upgradePoints, limitBreaks } = computeNeeds(target);
  const visibleRows = filters.list.hideDone ? rows.filter((row) => row.remain > 0) : rows;
  const wantedDecos = Object.entries(target.decos).filter(([, deco]) => deco.want > 0);

  return `
    <div class="mh-grid-2">
      <div class="panel">
        <h2>欲しい装備 <small>${wants.length}件</small></h2>
        ${wants.length ? `<ul class="mh-want-list">${wants.map(wantRow).join("")}</ul>` : `<div class="empty">まだありません。「武器」「防具」「護石」タブで <b>＋欲しい</b> を押すと追加されます。</div>`}
      </div>
      <div class="panel">
        <h2>欲しい装飾品 <small>${wantedDecos.length}件</small></h2>
        ${wantedDecos.length ? `<ul class="mh-want-list">${wantedDecos.map(([id]) => decoRow(idx.decos.get(id))).join("")}</ul>` : `<div class="empty">「装飾品」タブで欲しい数を設定できます。</div>`}
      </div>
    </div>

    <div class="panel">
      <div class="mh-panel-head">
        <h2>必要な素材</h2>
        <div class="mh-row">
          <label class="mh-check"><input type="checkbox" data-list-filter="hideDone" ${filters.list.hideDone ? "checked" : ""} /> 集め終わった素材を隠す</label>
          <button type="button" class="mh-btn" data-action="owned-clear">所持数リセット</button>
        </div>
      </div>
      <p class="mh-note">「所持」に持っている数を入れると、残りの必要数が減ります。必要なお金: <b>${zenny.toLocaleString()}z</b>${upgradePoints ? `（防具強化を含む）／ 防具強化ポイント: <b>${upgradePoints.toLocaleString()}pt</b>（鎧玉は大きい順に計算）` : ""}</p>
      ${limitBreaks ? `<p class="mh-note mh-lb-note">限界突破 ${limitBreaks}件: 突破の素材（歴戦狩猟の証・狩猟証・玉系など）は防具ごとに違うため、この表には含まれていません。ゲーム内で確認してください。</p>` : ""}
      <div data-role="need-summary">${needSummary(rows)}</div>
      ${visibleRows.length ? `
        <div class="table-wrap">
          <table class="mh-table">
            <thead><tr><th>素材</th><th>必要</th><th>所持</th><th>残り</th><th>主な入手先</th></tr></thead>
            <tbody>${visibleRows.map(needRow).join("")}</tbody>
          </table>
        </div>` : `<div class="empty">${rows.length ? "すべて集め終わりました！" : "欲しい装備を追加すると、ここに必要素材が表示されます。"}</div>`}
    </div>

    ${sharePanel()}
  `;
}

function wantRow({ key, want, info }) {
  const isWeapon = info.kind === "w";
  const chainLength = isWeapon ? weaponChain(info.entity).length : 1;
  return `
    <li class="mh-want">
      <div class="mh-want-main">
        <span class="pill">${escapeHtml(info.label)}</span>
        ${rarityPill(info.rarity)}
        <b>${escapeHtml(info.name)}</b>
      </div>
      <div class="mh-row">
        ${info.kind === "a" && upgradeInfo(info.entity.set.r).lb ? `<label class="mh-check" title="限界突破の費用と、上がった上限まで強化する鎧玉も加えます"><input type="checkbox" data-lb="${key}" ${want.lb ? "checked" : ""} /> 限界突破して最大（Lv${upgradeInfo(info.entity.set.r).lb.maxLv}）</label>` : ""}
        ${info.kind === "a" && upgradeInfo(info.entity.set.r).points ? `<label class="mh-check" title="最大まで強化する金額と鎧玉を必要素材に加えます"><input type="checkbox" data-upg="${key}" ${want.upg ? "checked" : ""} /> 最大まで強化（Lv${upgradeInfo(info.entity.set.r).maxLv}）</label>` : ""}
        ${isWeapon && chainLength > 1 ? `<label class="mh-check" title="生産から強化までに使う素材をすべて合計します"><input type="checkbox" data-chain="${key}" ${want.chain ? "checked" : ""} /> 生産から全部（${chainLength}段階）</label>` : ""}
        <span class="mh-stepper">
          <button type="button" class="mh-btn small" data-action="want-step" data-key="${key}" data-step="-1" aria-label="減らす">−</button>
          <span>×${want.n || 1}</span>
          <button type="button" class="mh-btn small" data-action="want-step" data-key="${key}" data-step="1" aria-label="増やす">＋</button>
        </span>
        <button type="button" class="mh-btn small danger" data-action="want-remove" data-key="${key}">外す</button>
      </div>
    </li>
  `;
}

function needSummary(rows) {
  if (!rows.length) return "";
  const done = rows.filter((row) => row.remain === 0).length;
  const percent = Math.round((done / rows.length) * 100);
  return `
    <div class="mh-progress" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
      <div class="mh-progress-bar" style="width:${percent}%"></div>
      <span>${done} / ${rows.length} 種類 集め終わり（${percent}%）</span>
    </div>
  `;
}

function needRow(row) {
  const item = row.item || { n: `不明な素材(${row.itemId})`, r: 0 };
  return `
    <tr class="${row.remain === 0 ? "is-done" : ""}">
      <td>${itemLabel(item)}</td>
      <td class="num">${row.need}</td>
      <td><input class="mh-num" type="number" min="0" max="9999" inputmode="numeric" value="${row.owned || ""}" placeholder="0" data-owned="${row.itemId}" aria-label="${escapeHtml(item.n)}の所持数" /></td>
      <td class="num" data-role="remain">${remainBadge(row.remain)}</td>
      <td class="mh-src-cell">${sourceList(item, 3)}</td>
    </tr>
  `;
}

function remainBadge(remain) {
  return remain === 0 ? `<span class="mh-done">✓ OK</span>` : `<b>${remain}</b>`;
}

function sharePanel() {
  return `
    <div class="panel">
      <h2>共有・引っ越し</h2>
      <p class="mh-note">リストはこのブラウザに保存されています（お金も登録も不要）。友達に見せたいときや、スマホ⇔PCで移したいときは共有URLを送ってください。開いた人のブラウザに取り込まれます。</p>
      <div class="mh-row">
        <button type="button" class="mh-btn primary" data-action="share-url">共有URLをコピー</button>
        <button type="button" class="mh-btn" data-action="share-code">共有コードをコピー</button>
      </div>
      <p class="mh-note" data-role="share-message"></p>
      <textarea class="mh-textarea" data-role="share-output" rows="3" readonly hidden></textarea>
      <div class="mh-import">
        <input class="mh-input" type="text" data-role="import-input" placeholder="共有コード / 共有URLを貼り付け" />
        <button type="button" class="mh-btn" data-action="import-code">取り込む</button>
      </div>
      <p class="mh-note" data-role="import-message"></p>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// みんなタブ（このブラウザにいる全員の必要素材を、モンスター別にまとめる）

function renderPartyPanel() {
  const byMonster = new Map();
  const others = [];
  const summaries = store.profiles.map((entry) => {
    const { rows } = computeNeeds(entry);
    const remaining = rows.filter((row) => row.remain > 0);
    remaining.forEach((row) => {
      const sources = row.item?.src || [];
      if (!sources.length) {
        others.push({ profile: entry, row });
        return;
      }
      const monsterIds = [...new Set(sources.map((source) => source[0]))];
      monsterIds.forEach((monsterId) => {
        if (!byMonster.has(monsterId)) byMonster.set(monsterId, []);
        byMonster.get(monsterId).push({ profile: entry, row });
      });
    });
    const wantedDecos = Object.entries(entry.decos).filter(([, deco]) => deco.want > (deco.have || 0));
    return { entry, wants: Object.keys(entry.wants).length, remaining: remaining.length, decos: wantedDecos };
  });

  const monsters = [...byMonster.entries()]
    .map(([monsterId, needs]) => ({ monster: idx.monsters.get(monsterId), needs, people: new Set(needs.map((need) => need.profile.id)).size }))
    .sort((a, b) => b.people - a.people || b.needs.length - a.needs.length);

  return `
    <div class="panel">
      <h2>メンバー</h2>
      <p class="mh-note">このブラウザに登録されている人の一覧です。友達の共有URLを開くとここに追加されます。</p>
      <div class="table-wrap">
        <table class="mh-table">
          <thead><tr><th>名前</th><th>欲しい装備</th><th>残り素材</th><th>欲しい装飾品（未所持）</th></tr></thead>
          <tbody>
            ${summaries.map((summary) => `
              <tr>
                <td><b>${escapeHtml(summary.entry.name)}</b></td>
                <td class="num">${summary.wants}</td>
                <td class="num">${summary.remaining}種類</td>
                <td>${summary.decos.map(([id, deco]) => `${escapeHtml(idx.decos.get(id)?.n || id)}×${deco.want - (deco.have || 0)}`).join("、") || "-"}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
    <div class="panel">
      <h2>どのモンスターを狩る？</h2>
      <p class="mh-note">まだ足りない素材を、落とすモンスターごとにまとめました。欲しい人が多い順に並んでいます。</p>
      ${monsters.length ? `<div class="mh-cards">${monsters.map(monsterCard).join("")}</div>` : `<div class="empty">足りない素材はありません。</div>`}
      ${others.length ? `
        <h3 class="mh-subhead">モンスター以外（採取・交易・調査報酬など）</h3>
        <ul class="mh-need-people">${others.map(({ profile: entry, row }) => `<li><b>${escapeHtml(entry.name)}</b>：${itemLabel(row.item)} ×${row.remain}</li>`).join("")}</ul>` : ""}
    </div>
  `;
}

function monsterCard({ monster, needs, people }) {
  return `
    <article class="card mh-card">
      <div class="card-body">
        <div class="mh-card-head"><h3>${escapeHtml(monster?.n || "不明")}</h3><span class="pill purple">${people}人</span></div>
        ${monster?.loc?.length ? `<div class="mh-stage-row">${stagePills(monster.loc, true)}</div>` : ""}
        <ul class="mh-need-people">
          ${needs.map(({ profile: entry, row }) => `<li><b>${escapeHtml(entry.name)}</b>：${itemLabel(row.item)} ×${row.remain}</li>`).join("")}
        </ul>
      </div>
    </article>
  `;
}

// ---------------------------------------------------------------------------
// 武器タブ

function weaponControls() {
  const f = filters.weapons;
  return `
    <label class="mh-field"><span>武器種</span>
      <select data-filter="type">
        <option value="">すべて</option>
        ${data.weaponTypes.map((type) => `<option value="${type.id}" ${f.type === type.id ? "selected" : ""}>${type.n}</option>`).join("")}
      </select>
    </label>
    <label class="mh-field"><span>分類</span>
      <select data-filter="group">
        ${[["tree", "派生ツリー順"], ["monster", "モンスター別"], ["element", "属性別"]].map(([value, label]) => `<option value="${value}" ${f.group === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
    </label>
    <label class="mh-field"><span>モンスター</span>
      <select data-filter="mon">
        <option value="">すべて</option>
        ${data.monsters.filter((monster) => data.weapons.some((weapon) => weapon.mon === monster.id)).map((monster) => `<option value="${monster.id}" ${f.mon === monster.id ? "selected" : ""}>${escapeHtml(monster.n)}</option>`).join("")}
        <option value="other" ${f.mon === "other" ? "selected" : ""}>モンスター以外（鉱石・骨など）</option>
      </select>
    </label>
    <label class="mh-field"><span>属性</span>
      <select data-filter="el">
        <option value="">すべて</option>
        ${ELEMENT_ORDER.map((el) => `<option value="${el}" ${f.el === el ? "selected" : ""}>${el === "none" ? "無属性" : ELEMENT_LABELS[el]}</option>`).join("")}
      </select>
    </label>
    ${rarityFilter(f.rarity)}
    ${searchField(f.q, "武器名・スキル・素材名・モンスター名で検索")}
    ${wantedOnlyField(f.wantedOnly)}
  `;
}

function weaponResults() {
  const f = filters.weapons;
  const target = profile();
  const list = data.weapons.filter((weapon) =>
    (!f.type || weapon.t === f.type)
    && (!f.mon || (f.mon === "other" ? !weapon.mon : weapon.mon === f.mon))
    && (!f.el || weaponElement(weapon) === f.el)
    && (!f.rarity || String(weapon.r) === f.rarity)
    && (!f.wantedOnly || target.wants[`w:${weapon.id}`])
    && matches(f.q, [weapon.n, weapon.sr, idx.monsters.get(weapon.mon)?.n, skillText(weapon.sk), materialText(weapon.in)]));
  if (f.group === "monster") {
    const otherOrder = [];
    const groupOf = (weapon) => {
      if (weapon.mon) {
        const monster = idx.monsters.get(weapon.mon);
        return { key: weapon.mon, label: monster.n, icon: monsterEmblem(monster) };
      }
      const label = weapon.sr ? `${weapon.sr}（モンスター以外）` : "アーティア・特殊な武器";
      return { key: `sr:${label}`, label };
    };
    const sorted = sortByGroup(list, (weapon) => {
      if (weapon.mon) return monsterRank(weapon.mon);
      const { key } = groupOf(weapon);
      if (!otherOrder.includes(key)) otherOrder.push(key);
      return 1000 + otherOrder.indexOf(key);
    });
    return pagedGrouped(sorted, weaponCard, groupOf);
  }
  if (f.group === "element") {
    const sorted = sortByGroup(list, (weapon) => ELEMENT_ORDER.indexOf(weaponElement(weapon)));
    return pagedGrouped(sorted, weaponCard, (weapon) => {
      const el = weaponElement(weapon);
      return { key: el, label: el === "none" ? "無属性" : `${ELEMENT_LABELS[el]}属性`, icon: `<i class="mh-el-dot el-${el}"></i>` };
    });
  }
  return paged(list, weaponCard);
}

function weaponElement(weapon) {
  return weapon.el ? weapon.el[0] : "none";
}

function weaponCard(weapon) {
  const prev = weapon.prev ? idx.weapons.get(weapon.prev) : null;
  const element = weapon.el ? `${weapon.el[2] ? "(" : ""}${ELEMENT_LABELS[weapon.el[0]] || weapon.el[0]}${weapon.el[1]}${weapon.el[2] ? ")" : ""}` : "";
  return `
    <article class="card mh-card">
      <div class="card-body">
        <div class="mh-card-head">
          <div>
            <div class="meta-row"><span class="pill">${idx.weaponTypes.get(weapon.t)}</span>${rarityPill(weapon.r)}</div>
            <h3>${escapeHtml(weapon.n)}</h3>
          </div>
          ${wantButton(`w:${weapon.id}`)}
        </div>
        <dl class="mh-stats">
          <div><dt>攻撃</dt><dd>${weapon.atk ?? "-"}</dd></div>
          ${weapon.aff ? `<div><dt>会心</dt><dd>${weapon.aff}%</dd></div>` : ""}
          ${element ? `<div><dt>属性</dt><dd>${element}</dd></div>` : ""}
          <div><dt>スロット</dt><dd>${slotText(weapon.sl)}</dd></div>
        </dl>
        ${skillList(weapon.sk)}
        ${weapon.sr || weapon.mon ? `<div class="mh-note">${weapon.sr ? escapeHtml(weapon.sr) : ""}${weapon.mon ? `（${escapeHtml(idx.monsters.get(weapon.mon)?.n || "")}）` : ""}</div>` : ""}
        ${prev ? `<div class="mh-note">派生元: ${escapeHtml(prev.n)}（強化）</div>` : ""}
        ${materialList(weapon.in, weapon.z)}
      </div>
    </article>
  `;
}

// ---------------------------------------------------------------------------
// 防具タブ

function armorControls() {
  const f = filters.armor;
  return `
    ${rankFilter(f.hr)}
    ${rarityFilter(f.rarity)}
    ${searchField(f.q, "防具名・スキル・素材名で検索")}
    <div class="mh-wide">${sphereGuide()}</div>
    ${wantedOnlyField(f.wantedOnly)}
  `;
}

function armorResults() {
  const f = filters.armor;
  const target = profile();
  const list = data.armor.filter((set) =>
    (!f.hr || armorRankOf(set) === f.hr)
    && (!f.rarity || String(set.r) === f.rarity)
    && (!f.wantedOnly || set.pc.some((piece) => target.wants[`a:${piece.id}`]))
    && matches(f.q, [set.n, ...set.pc.map((piece) => `${piece.n} ${skillText(piece.sk)} ${materialText(piece.in)}`)]));
  const sorted = sortByGroup(list, (set) => (armorRankOf(set) === "low" ? 0 : 1));
  return pagedGrouped(sorted, armorCard, (set) => {
    const rank = armorRankOf(set);
    return { key: rank, label: `${RANK_LABELS[rank]}の防具（レア度${rank === "low" ? "1〜4" : "5〜8"}）` };
  }, "mh-cards wide");
}

function armorCard(set) {
  const pieces = [...set.pc].sort((a, b) => PIECE_ORDER.indexOf(a.p) - PIECE_ORDER.indexOf(b.p));
  return `
    <article class="card mh-card">
      <div class="card-body">
        <div class="mh-card-head">
          <div>
            <div class="meta-row">${rankBadges([armorRankOf(set)])}${rarityPill(set.r)}</div>
            <h3>${escapeHtml(set.n)}</h3>
          </div>
          <div class="mh-row">
            ${upgradeInfo(set.r).points ? `<span class="mh-set-upgrade">${pieces.length}部位を最大強化: <b>${(upgradeInfo(set.r).points * pieces.length).toLocaleString()}pt</b> ／ <b>${(upgradeInfo(set.r).zenny * pieces.length).toLocaleString()}z</b>${upgradeInfo(set.r).lb ? `<br />限界突破後の最大まで: <b>${((upgradeInfo(set.r).points + upgradeInfo(set.r).lb.points) * pieces.length).toLocaleString()}pt</b>` : ""}</span>` : ""}
            <button type="button" class="mh-btn small" data-action="want-set" data-keys="${pieces.map((piece) => `a:${piece.id}`).join(",")}">全部位を欲しい</button>
          </div>
        </div>
        <div class="mh-pieces">
          ${pieces.map((piece) => `
            <div class="mh-piece">
              <div class="mh-card-head">
                <button type="button" class="mh-piece-name" data-action="armor-detail" data-id="${piece.id}" title="詳細（強化・限界突破）を見る"><span class="pill">${PIECE_LABELS[piece.p]}</span> <b>${escapeHtml(piece.n)}</b> <span class="mh-detail-link">詳細 ›</span></button>
                ${wantButton(`a:${piece.id}`)}
              </div>
              <div class="mh-note">防御 ${piece.def ?? "-"} ／ スロット ${slotText(piece.sl)}</div>
              ${skillList(piece.sk)}
              ${materialList(piece.in, piece.z)}
              ${upgradeLine(set.r, piece.def, 1, piece.sl)}
            </div>`).join("")}
        </div>
      </div>
    </article>
  `;
}

// 防具の詳細（性能・スキル・生産・強化の段階・限界突破）
function openArmorDetail(pieceId) {
  const piece = idx.pieces.get(pieceId);
  if (!piece) return;
  let dialog = document.querySelector("[data-role='armor-detail']");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.className = "mh-dialog mh-detail";
    dialog.dataset.role = "armor-detail";
    app.appendChild(dialog);
  }
  dialog.innerHTML = armorDetailHtml(piece);
  dialog.showModal();
  dialog.scrollTop = 0;
}

function armorDetailHtml(piece) {
  const set = piece.set;
  const rank = armorRankOf(set);
  const upgrade = data.armorUpgrades?.[String(set.r)] || { steps: [], lb: null };
  const steps = upgrade.steps;
  const info = upgradeInfo(set.r);
  let def = piece.def;
  let points = 0;
  let zenny = 0;
  const upgradeRows = steps.map(([level, extra, pt, z]) => {
    def += extra;
    points += pt;
    zenny += z;
    const isLb = upgrade.lb && level > upgrade.lb;
    return `${isLb && level === upgrade.lb + 1 ? `<tr class="mh-lb-row"><td colspan="6">▼ ここから限界突破後（Lv${upgrade.lb} → Lv${info.lb.maxLv}）</td></tr>` : ""}<tr class="${isLb ? "is-lb" : ""}"><td class="num">Lv${level}</td><td class="num">${def}</td><td class="num">${pt.toLocaleString()}</td><td class="num">${z.toLocaleString()}</td><td class="num">${points.toLocaleString()}</td><td class="num">${zenny.toLocaleString()}</td></tr>`;
  }).join("");
  const bonuses = [set.sb, set.gb].filter(Boolean).map(([id, ranks]) => {
    const skill = data.skills[id];
    return `<li><b>${escapeHtml(skill?.n || "?")}</b>（${skill?.k === "group" ? "グループ" : "シリーズ"}）${ranks.map(([pieces, level]) => {
      const rk = skill?.rk?.find(([lv]) => lv === level);
      return `<div class="mh-sim-desc"><span class="mh-piece-count">${pieces}部位</span>${escapeHtml(rk?.[1] || "")} ${escapeHtml(rk?.[2] || "")}</div>`;
    }).join("")}</li>`;
  }).join("");
  return `
    <div class="mh-dialog-head">
      <div><div class="meta-row">${rankBadges([rank])}${rarityPill(set.r)}<span class="pill">${PIECE_LABELS[piece.p]}</span><span class="pill">${escapeHtml(set.n)}</span></div><h2 class="mh-detail-title">${escapeHtml(piece.n)}</h2></div>
      <button type="button" class="mh-btn small" data-action="detail-close">閉じる</button>
    </div>
    <div class="mh-detail-body">
      <dl class="mh-sim-stats">
        <div><dt>防御力</dt><dd>${piece.def}<small>最大強化 ${piece.def + info.def}${info.lb ? `／限界突破後 ${piece.def + info.def + info.lb.def}` : ""}</small></dd></div>
        <div><dt>スロット</dt><dd>${slotText(piece.sl)}${info.lb && limitBreakSlots(piece.sl, set.r).join() !== piece.sl.join() ? `<small>限界突破後 ${slotText(limitBreakSlots(piece.sl, set.r))}</small>` : ""}</dd></div>
        ${RESIST_LABELS.map((label, i) => `<div><dt>${label}耐性</dt><dd class="${(piece.res?.[i] || 0) < 0 ? "mh-minus" : ""}">${piece.res?.[i] ?? 0}</dd></div>`).join("")}
      </dl>

      <h3 class="mh-subhead">スキル</h3>
      <ul class="mh-detail-list">
        ${Object.entries(piece.sk).filter(([id]) => !["set", "group"].includes(data.skills[id]?.k)).map(([id, lv]) => {
          const skill = data.skills[id];
          const rk = skill?.rk?.find(([level]) => level === lv);
          return `<li><b>${escapeHtml(skill?.n || "?")} Lv${lv}</b><div class="mh-sim-desc">${escapeHtml(rk?.[2] || "")}</div></li>`;
        }).join("") || `<li class="mh-muted">なし</li>`}
        ${bonuses}
      </ul>

      <h3 class="mh-subhead">生産素材</h3>
      ${materialList(piece.in, piece.z)}

      <h3 class="mh-subhead">強化（Lv1 → Lv${info.lb ? `${info.maxLv}、限界突破後 Lv${info.lb.maxLv}` : info.maxLv}）</h3>
      ${steps.length ? `
        <div class="table-wrap">
          <table class="mh-table mh-upgrade-table">
            <thead><tr><th>強化後</th><th>防御力</th><th>ポイント</th><th>費用</th><th>累計pt</th><th>累計費用</th></tr></thead>
            <tbody>${upgradeRows}</tbody>
          </table>
        </div>
        <p class="mh-note">通常の最大（Lv${info.maxLv}）まで: <b>${info.points.toLocaleString()}pt</b> ／ <b>${info.zenny.toLocaleString()}z</b>　鎧玉の例: ${sphereText(info.points)}</p>
        ${info.lb ? `<p class="mh-note">限界突破後の最大（Lv${info.lb.maxLv}）まで追加で: <b>${info.lb.points.toLocaleString()}pt</b> ／ <b>${info.lb.zenny.toLocaleString()}z</b>　鎧玉の例: ${sphereText(info.lb.points)}</p>` : ""}` : `<div class="empty">強化データがありません。</div>`}

      <h3 class="mh-subhead">限界突破</h3>
      ${limitBreakHtml(piece)}
    </div>
  `;
}

// 限界突破（data/armor-limit-break.json）。1つの防具につき1回、上位防具（レア5〜8）のみ
function limitBreakHtml(piece) {
  const info = upgradeInfo(piece.set.r);
  if (!info.lb) return `<div class="empty">下位の防具（レア1〜4）は限界突破できません。</div>`;
  const lb = info.lb;
  const detail = lb.info || {};
  const newSlots = limitBreakSlots(piece.sl, piece.set.r);
  return `
    <div class="mh-upgrade mh-lb">
      <div><b>強化レベルの上限</b> Lv${lb.fromLv} → <b>Lv${lb.maxLv}</b>（1回だけ）</div>
      <div><b>上がる防御力</b> +${lb.def}（上がった上限まで鎧玉で強化したとき：${piece.def + info.def} → ${piece.def + info.def + lb.def}）</div>
      <div><b>スロット</b> ${newSlots.join() !== piece.sl.join() ? `${slotText(piece.sl)} → <b>${slotText(newSlots)}</b>` : "変化なし"}${detail.slots ? `<span class="mh-muted">（${escapeHtml(detail.slots)}）</span>` : ""}</div>
      <div><b>突破の費用</b> ${detail.zenny ? `${Number(detail.zenny).toLocaleString()}z` : "未確認"}${detail.zennyNote ? `（${escapeHtml(detail.zennyNote)}）` : ""}</div>
      <div><b>突破の素材</b> ${escapeHtml(detail.materials || "未確認")}</div>
      ${detail.example ? `<div class="mh-muted">例：${escapeHtml(detail.example)}</div>` : ""}
      <div><b>突破後の追加強化</b> ${lb.points.toLocaleString()}pt ／ ${lb.zenny.toLocaleString()}z（鎧玉の例: ${sphereText(lb.points)}）</div>
    </div>
    <ul class="mh-lb-tips">
      ${limitBreak?.unlock ? `<li>解放条件：${escapeHtml(limitBreak.unlock)}</li>` : ""}
      ${limitBreak?.materialsNote ? `<li>${escapeHtml(limitBreak.materialsNote)}</li>` : ""}
      ${(limitBreak?.tips || []).map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}
    </ul>
  `;
}

// ---------------------------------------------------------------------------
// 護石タブ

function charmControls() {
  const f = filters.charms;
  return `${searchField(f.q, "護石名・スキル・素材名で検索")}${wantedOnlyField(f.wantedOnly)}`;
}

function charmResults() {
  const f = filters.charms;
  const target = profile();
  const list = data.charms.filter((charm) =>
    (!f.wantedOnly || target.wants[`c:${charm.id}`])
    && matches(f.q, [charm.n, skillText(charm.sk), materialText(charm.in)]));
  return paged(list, charmCard);
}

function charmCard(charm) {
  return `
    <article class="card mh-card">
      <div class="card-body">
        <div class="mh-card-head">
          <div>
            <div class="meta-row">${rarityPill(charm.r)}${charm.rand ? `<span class="pill purple">鑑定（ランダム）</span>` : ""}</div>
            <h3>${escapeHtml(charm.n)}</h3>
          </div>
          ${charm.in && Object.keys(charm.in).length ? wantButton(`c:${charm.id}`) : ""}
        </div>
        ${skillList(charm.sk)}
        ${charm.rand ? `<div class="mh-note">スキルはランダムです（入手後に鑑定）。</div>` : materialList(charm.in, charm.z)}
      </div>
    </article>
  `;
}

// ---------------------------------------------------------------------------
// 装飾品タブ

function decoControls() {
  const f = filters.decos;
  return `
    <label class="mh-field"><span>種類</span>
      <select data-filter="on">
        <option value="">すべて</option>
        <option value="weapon" ${f.on === "weapon" ? "selected" : ""}>武器用</option>
        <option value="armor" ${f.on === "armor" ? "selected" : ""}>防具用</option>
      </select>
    </label>
    <label class="mh-field"><span>スロット</span>
      <select data-filter="lv">
        <option value="">すべて</option>
        ${[1, 2, 3, 4].map((lv) => `<option value="${lv}" ${f.lv === String(lv) ? "selected" : ""}>Lv${lv}</option>`).join("")}
      </select>
    </label>
    ${searchField(f.q, "装飾品の名前・スキルで検索")}
    ${wantedOnlyField(f.wantedOnly, "欲しい・所持のみ")}
  `;
}

function decoResults() {
  const f = filters.decos;
  const target = profile();
  const list = data.decorations.filter((deco) =>
    (!f.on || deco.on === f.on)
    && (!f.lv || String(deco.lv) === f.lv)
    && (!f.wantedOnly || target.decos[deco.id])
    && matches(f.q, [deco.n, skillText(deco.sk)]));
  return paged(list, decoRow, "mh-want-list");
}

function decoRow(deco) {
  if (!deco) return "";
  const state = profile().decos[deco.id] || { want: 0, have: 0 };
  const done = state.want > 0 && state.have >= state.want;
  return `
    <li class="mh-want mh-deco ${done ? "is-done" : ""}" data-deco-row>
      <div class="mh-want-main">
        <span class="pill">${deco.on === "weapon" ? "武器" : "防具"}</span>
        ${rarityPill(deco.r)}
        <b>${escapeHtml(deco.n)}</b>
        <span class="mh-skill-inline">${skillText(deco.sk, true)}</span>
      </div>
      <div class="mh-row">
        ${decoStepper(deco.id, "want", "欲しい", state.want)}
        ${decoStepper(deco.id, "have", "所持", state.have)}
        ${done ? `<span class="mh-done">✓ OK</span>` : ""}
      </div>
    </li>
  `;
}

function decoStepper(id, field, label, value) {
  return `
    <span class="mh-stepper">
      <span class="mh-stepper-label">${label}</span>
      <button type="button" class="mh-btn small" data-action="deco-step" data-id="${id}" data-field="${field}" data-step="-1" aria-label="${label}を減らす">−</button>
      <span>${value || 0}</span>
      <button type="button" class="mh-btn small" data-action="deco-step" data-id="${id}" data-field="${field}" data-step="1" aria-label="${label}を増やす">＋</button>
    </span>
  `;
}

// ---------------------------------------------------------------------------
// 素材タブ

function itemControls() {
  const f = filters.items;
  return `
    <label class="mh-field"><span>表示</span>
      <select data-filter="group">
        <option value="category" ${f.group === "category" ? "selected" : ""}>分類ごと</option>
        <option value="id" ${f.group === "id" ? "selected" : ""}>アイテム番号順</option>
      </select>
    </label>
    <label class="mh-field"><span>分類</span>
      <select data-filter="cat">
        <option value="">すべて</option>
        <optgroup label="モンスター素材">
          <option value="mon" ${f.cat === "mon" ? "selected" : ""}>大型モンスターの素材（すべて）</option>
          ${data.monsters.filter((monster) => data.items.some((item) => item.mon === monster.id)).map((monster) => `<option value="m:${monster.id}" ${f.cat === `m:${monster.id}` ? "selected" : ""}>${escapeHtml(monster.n)}</option>`).join("")}
          <option value="shared" ${f.cat === "shared" ? "selected" : ""}>複数モンスター共通</option>
        </optgroup>
        <optgroup label="その他の素材">
          ${data.materialCategories.map((cat) => `<option value="${cat.id}" ${f.cat === cat.id ? "selected" : ""}>${cat.n}</option>`).join("")}
        </optgroup>
      </select>
    </label>
    ${rankFilter(f.hr)}
    ${rarityFilter(f.rarity)}
    ${searchField(f.q, "素材名・モンスター名で検索")}
    <label class="mh-check"><input type="checkbox" data-filter="neededOnly" ${f.neededOnly ? "checked" : ""} /> 自分に必要な素材のみ</label>
  `;
}

function itemResults() {
  const f = filters.items;
  const needs = new Map(computeNeeds(profile()).rows.map((row) => [row.itemId, row]));
  const list = data.items.filter((item) =>
    matchesItemCategory(item, f.cat)
    && (!f.hr || itemRanks(item).includes(f.hr))
    && (!f.rarity || String(item.r) === f.rarity)
    && (!f.neededOnly || needs.has(item.id))
    && matches(f.q, [item.n, itemGroup(item).label, (item.src || []).map((source) => idx.monsters.get(source[0])?.n).join(" ")]));
  const render = (item) => itemCard(item, needs.get(item.id));
  if (f.group === "id") return paged(list, render);
  // 分類の中は 下位 → 下位・上位 → 上位 の順
  const rankOrder = (item) => { const ranks = itemRanks(item); return ranks.length > 1 ? 1 : ranks[0] === "low" ? 0 : 2; };
  return pagedGrouped(sortByGroup(list, (item) => itemGroup(item).rank * 10 + rankOrder(item)), render, itemGroup);
}

function matchesItemCategory(item, cat) {
  if (!cat) return true;
  if (cat === "mon") return Boolean(item.mon);
  if (cat.startsWith("m:")) return item.mon === cat.slice(2);
  return item.cat === cat;
}

// 素材の分類: 大型モンスターごと（ハンターノート順）→ 複数モンスター共通 → 鉱石・骨など
function itemGroup(item) {
  if (item.mon) {
    const monster = idx.monsters.get(item.mon);
    return { key: `m:${item.mon}`, label: `${monster?.n || "?"}の素材`, rank: monsterRank(item.mon), icon: monster ? monsterEmblem(monster) : "" };
  }
  if (item.cat === "shared") return { key: "shared", label: "複数モンスター共通の素材", rank: 900 };
  const index = data.materialCategories.findIndex((cat) => cat.id === item.cat);
  return { key: item.cat, label: data.materialCategories[index]?.n || "その他", rank: 1000 + index };
}

function itemCard(item, need) {
  const usage = idx.usage.get(item.id) || [];
  return `
    <article class="card mh-card">
      <div class="card-body">
        <div class="mh-card-head">
          <h3>${itemLabel(item)}</h3>
          <div class="meta-row">${rankBadges(itemRanks(item))}${rarityPill(item.r)}</div>
        </div>
        ${need ? `<div class="mh-need-chip ${need.remain === 0 ? "is-done" : ""}">必要 ${need.need} ／ 所持 ${need.owned} ／ 残り ${need.remain}</div>` : ""}
        ${item.d ? `<p class="mh-desc">${escapeHtml(item.d)}</p>` : ""}
        ${itemStageIds(item).length ? `<div class="mh-src-block"><div class="mh-label">行くマップ（採取場所・落とすモンスターの出現マップ）</div><div class="mh-stage-row">${stagePills(itemStageIds(item))}</div></div>` : ""}
        <div class="mh-src-block"><div class="mh-label">入手先</div>${sourceList(item, 8)}</div>
        ${usage.length ? `
          <details class="mh-details">
            <summary>使い道（${usage.length}件）</summary>
            <ul>${usage.map(({ key, amount }) => {
              const info = resolveWant(key);
              return info ? `<li><span class="mh-muted">${escapeHtml(info.label)}</span> ${escapeHtml(info.name)} ×${amount}</li>` : "";
            }).join("")}</ul>
          </details>` : ""}
      </div>
    </article>
  `;
}

// ---------------------------------------------------------------------------
// モンスター別ドロップタブ

function renderMonsterPanel() {
  const f = filters.monsters;
  if (!idx.monsters.has(f.id)) f.id = data.monsters[0]?.id || "";
  if (f.view === "weak") {
    return `
      <div class="mh-rank-tabs mh-view-tabs">
        <button type="button" class="mh-btn small" data-action="monster-view" data-view="drop">モンスター別ドロップ</button>
        <button type="button" class="mh-btn small primary" data-action="monster-view" data-view="weak">弱点早見表</button>
      </div>
      ${weaknessTable()}
    `;
  }
  return `
    <div class="mh-rank-tabs mh-view-tabs">
      <button type="button" class="mh-btn small primary" data-action="monster-view" data-view="drop">モンスター別ドロップ</button>
      <button type="button" class="mh-btn small" data-action="monster-view" data-view="weak">弱点早見表</button>
    </div>
    <div class="mh-controls">
      <label class="mh-field"><span>マップ</span>
        <select data-monster-map>
          <option value="">すべて</option>
          ${(data.stages || []).map((stage) => `<option value="${stage.id}" ${f.map === stage.id ? "selected" : ""}>${escapeHtml(stage.n)}</option>`).join("")}
        </select>
      </label>
      <label class="mh-field grow"><span>モンスター検索</span><input class="mh-input" type="search" data-monster-filter value="${escapeHtml(f.q)}" placeholder="モンスター名・種族・素材名で検索" /></label>
    </div>
    <div class="mh-monster-chips" data-role="monster-chips">${monsterChips()}</div>
    <div data-role="monster-detail">${monsterDetail(idx.monsters.get(f.id))}</div>
  `;
}

function monsterChips() {
  const f = filters.monsters;
  const list = data.monsters
    .filter((monster) => (!f.map || (monster.loc || []).includes(f.map))
      && matches(f.q, [monster.n, monster.sp, (monster.loc || []).map((id) => idx.stages.get(id)?.n).join(" "), monster.rw.map((reward) => idx.items.get(reward[0])?.n).join(" ")]))
    ;
  if (!list.length) return `<div class="empty">該当するモンスターがいません。</div>`;
  return list.map((monster) => `
    <button type="button" class="mh-monster-chip" data-action="monster" data-id="${monster.id}" ${monster.id === f.id ? 'aria-current="true"' : ""}>
      ${monsterEmblem(monster)}
      <span><b>${escapeHtml(monster.n)}</b><small>No.${data.monsters.indexOf(monster) + 1}・${escapeHtml(monster.sp)}</small></span>
      <span class="mh-chip-weak">${bestElements(monster).map((el) => elementIcon(el)).join("")}</span>
    </button>`).join("");
}

// 種族ごとのシルエット（オリジナル図案）と色でモンスターを表す
function monsterEmblem(monster) {
  const hue = SPECIES_HUES[monster.sp] ?? [...monster.sp].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  const icon = SPECIES_ICONS[monster.sp] || SPECIES_ICONS["その他"];
  return `<i class="mh-emblem" style="--hue:${hue}" title="${escapeHtml(monster.sp)}" aria-hidden="true"><svg viewBox="0 0 64 64" fill="currentColor">${icon}</svg></i>`;
}

function monsterDetail(monster) {
  if (!monster) return "";
  const f = filters.monsters;
  const needs = new Map(computeNeeds(profile()).rows.map((row) => [row.itemId, row]));
  const ranks = ["high", "low"].filter((rank) => monster.rw.some((reward) => reward[1] === rank));
  const rank = ranks.includes(f.rank) ? f.rank : ranks[0];

  // 入手方法 → 素材 → 確率（同じ素材でも報酬枠が複数あるので幅で表示）
  const groups = new Map();
  monster.rw.filter((reward) => reward[1] === rank).forEach(([itemId, , kind, amount, chance]) => {
    if (!groups.has(kind)) groups.set(kind, new Map());
    const byItem = groups.get(kind);
    if (!byItem.has(itemId)) byItem.set(itemId, { chances: [], amounts: new Set() });
    byItem.get(itemId).chances.push(chance);
    byItem.get(itemId).amounts.add(amount);
  });
  const kinds = [...groups.keys()].sort((a, b) => sourceOrder(a) - sourceOrder(b));

  return `
    <div class="panel mh-monster">
      <div class="mh-monster-head">
        ${monsterEmblem(monster)}
        <div>
          <h2>${escapeHtml(monster.n)}</h2>
          <div class="meta-row"><span class="pill">${escapeHtml(monster.sp)}</span>${monster.tmp ? `<span class="pill purple">歴戦の個体あり</span>` : ""}</div>
          ${monster.loc?.length ? `<div class="mh-stage-row mh-monster-stages"><span class="mh-label">出現マップ</span>${stagePills(monster.loc)}</div>` : ""}
        </div>
      </div>
      ${weaknessChart(monster)}
      ${weaknessBlock(monster.wk, Boolean(weaknessOf(monster)))}
      <div class="mh-rank-tabs">
        ${ranks.map((value) => `<button type="button" class="mh-btn small ${value === rank ? "primary" : ""}" data-action="monster-rank" data-rank="${value}">${RANK_LABELS[value]}</button>`).join("")}
      </div>
      ${kinds.length ? kinds.map((kind) => `
        <h3 class="mh-subhead">${SOURCE_LABELS[kind] || kind}</h3>
        <div class="table-wrap">
          <table class="mh-table mh-drop-table">
            <thead><tr><th>素材</th><th>個数</th><th>確率</th><th>自分の残り</th></tr></thead>
            <tbody>
              ${[...groups.get(kind).entries()]
                .sort((a, b) => Math.max(...b[1].chances) - Math.max(...a[1].chances))
                .map(([itemId, info]) => {
                  const need = needs.get(itemId);
                  return `
                    <tr class="${need && need.remain > 0 ? "is-needed" : ""}">
                      <td>${itemLabel(idx.items.get(itemId) || { n: itemId })}</td>
                      <td class="num">×${[...info.amounts].join("/")}</td>
                      <td class="num">${chanceBar(info.chances)}</td>
                      <td class="num">${need ? (need.remain > 0 ? `<b>あと${need.remain}</b>` : `<span class="mh-done">✓ OK</span>`) : "-"}</td>
                    </tr>`;
                }).join("")}
            </tbody>
          </table>
        </div>`).join("") : `<div class="empty">ドロップ情報がありません。</div>`}
      <p class="mh-note">確率は1回の抽選あたりの値です。報酬枠が複数ある素材は「最小〜最大」で表示しています。</p>
    </div>
  `;
}

function sourceOrder(kind) {
  const index = SOURCE_ORDER.indexOf(kind);
  return index < 0 ? 99 : index;
}

function chanceBar(chances) {
  const min = Math.min(...chances);
  const max = Math.max(...chances);
  return `<span class="mh-chance"><span class="mh-chance-bar" style="width:${max}%"></span><span>${min === max ? `${max}%` : `${min}〜${max}%`}</span></span>`;
}

function weaknessOf(monster) {
  return weakness?.monsters?.[monster.n] || null;
}

function elementIcon(el, label = true) {
  const icon = ELEMENT_ICONS[el];
  return `<i class="mh-el-icon" style="--el:${icon.color}" title="${ELEMENT_LABELS[el]}属性"><svg viewBox="0 0 24 24" fill="currentColor">${icon.svg}</svg>${label ? "" : ""}</i>`;
}

// ◎（無ければ○）の属性
function bestElements(monster) {
  const chart = weaknessOf(monster);
  if (!chart) return [];
  const best = WEAK_ELEMENTS.filter((el) => chart[el] === "◎");
  return best.length ? best : WEAK_ELEMENTS.filter((el) => chart[el] === "○");
}

function weakMark(mark) {
  const cls = { "◎": "w0", "○": "w1", "▲": "w2", "×": "w3", "無効": "w4" }[mark] || "";
  return `<span class="mh-weak-mark ${cls}" title="${WEAK_TITLES[mark] || ""}">${escapeHtml(mark || "-")}</span>`;
}

function weaknessChart(monster) {
  const chart = weaknessOf(monster);
  if (!chart) return "";
  const note = weakness?.notes?.[monster.n];
  return `
    <div class="mh-weak-chart">
      <div class="mh-weak-chart-title">属性の効きやすさ</div>
      <div class="mh-weak-cells">
        ${WEAK_ELEMENTS.map((el) => `<div class="mh-weak-cell ${WEAK_ORDER[chart[el]] === 0 ? "best" : ""}">${elementIcon(el)}<small>${ELEMENT_LABELS[el]}</small>${weakMark(chart[el])}</div>`).join("")}
      </div>
      ${note ? `<div class="mh-weak-note">※${escapeHtml(note)}</div>` : ""}
      <div class="mh-muted mh-weak-legend">◎とても有効　○有効　▲やや有効　×効きにくい　無効</div>
    </div>
  `;
}

function weaknessTable() {
  return `
    <div class="panel">
      <h2>弱点早見表</h2>
      <p class="mh-note">モンスター名を押すと、そのモンスターのドロップ一覧を開きます。◎とても有効　○有効　▲やや有効　×効きにくい</p>
      <div class="table-wrap">
        <table class="mh-table mh-weak-table">
          <thead><tr><th>モンスター</th>${WEAK_ELEMENTS.map((el) => `<th>${elementIcon(el)}</th>`).join("")}<th class="mh-weak-map">出現マップ</th></tr></thead>
          <tbody>
            ${data.monsters.map((monster) => {
              const chart = weaknessOf(monster);
              const note = weakness?.notes?.[monster.n];
              return `<tr>
                <td><button type="button" class="mh-weak-name" data-action="monster-open" data-id="${monster.id}">${monsterEmblem(monster)}<span>${escapeHtml(monster.n)}${note ? `<small>※${escapeHtml(note)}</small>` : ""}</span></button></td>
                ${WEAK_ELEMENTS.map((el) => `<td class="mh-weak-td">${chart ? weakMark(chart[el]) : `<span class="mh-muted">-</span>`}</td>`).join("")}
                <td class="mh-weak-map"><div class="mh-stage-row">${stagePills(monster.loc || [], true)}</div></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function weaknessBlock(weaknesses, hasChart = false) {
  if (!weaknesses?.length) return "";
  const groups = [
    ...(hasChart ? [] : [["element", "弱点属性"]]),
    ["status", "状態異常"],
    ["effect", "アイテム・その他"],
  ];
  return `
    <dl class="mh-weak">
      ${groups.map(([kind, label]) => {
        const list = weaknesses.filter((weak) => weak[0] === kind).sort((a, b) => b[2] - a[2]);
        if (!list.length) return "";
        return `<div><dt>${label}</dt><dd>${list.map(([, name, level]) => `<span class="mh-weak-item">${WEAKNESS_LABELS[name] || name}<span class="mh-stars">${"★".repeat(level)}</span></span>`).join("")}</dd></div>`;
      }).join("")}
    </dl>
  `;
}

// ---------------------------------------------------------------------------
// 採取ガイドタブ（data/gathering.json）

function gatherControls() {
  const f = filters.gather;
  return `
    <p class="mh-note mh-wide">${escapeHtml(gathering?.legend || "")} エリア番号は元の情報に文字で書かれているものだけです。</p>
    <label class="mh-field"><span>マップ</span>
      <select data-filter="map">
        <option value="">すべて</option>
        ${(data.stages || []).map((stage) => `<option value="${escapeHtml(stage.n)}" ${f.map === stage.n ? "selected" : ""}>${escapeHtml(stage.n)}</option>`).join("")}
      </select>
    </label>
    ${searchField(f.q, "素材名・採取ポイント名で検索")}
  `;
}

function gatherResults() {
  if (!gathering) return `<div class="empty">採取データを読み込めませんでした。</div>`;
  const f = filters.gather;
  const needs = new Map(computeNeeds(profile()).rows.map((row) => [row.item?.n, row]));
  const sections = gathering.categories.map((category) => {
    const entries = category.entries.filter((entry) =>
      (!f.map || entry.maps.some((where) => where.map === f.map))
      && matches(f.q, [...entry.items, entry.source, entry.note, entry.areaNote, category.name]));
    const areas = Object.entries(category.areas || {}).filter(([map]) => !f.map || map === f.map);
    if (!entries.length) return "";
    return `
      <section class="panel mh-gather">
        <h2>${category.icon} ${escapeHtml(category.name)} <small>${entries.length}件</small></h2>
        <div class="table-wrap">
          <table class="mh-table mh-gather-table">
            <thead><tr><th>素材</th><th>マップ</th><th>メモ</th></tr></thead>
            <tbody>
              ${entries.map((entry) => `
                <tr>
                  <td>${entry.items.map((name) => {
                    const item = data.items.find((candidate) => candidate.n === name);
                    const need = needs.get(name);
                    return `<div class="mh-gather-item">${item ? itemLabel(item) : escapeHtml(name)}${need && need.remain > 0 ? ` <span class="mh-need-chip">あと${need.remain}</span>` : ""}</div>`;
                  }).join("")}${entry.rank ? `<span class="mh-rank ${entry.rank}">${RANK_LABELS[entry.rank]}だけ</span>` : ""}</td>
                  <td><div class="mh-stage-row">${entry.maps.length ? gatherMapPills(entry.maps) : `<span class="mh-muted">-</span>`}</div></td>
                  <td class="mh-gather-note">${gatherEntryNote(entry) || ""}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${areas.length ? `
          <h3 class="mh-subhead">${category.id === "mining" ? "鉱脈" : "骨塚"}があるエリア</h3>
          <dl class="mh-gather-areas">${areas.map(([map, text]) => `<div><dt><span class="mh-stage" style="--stage:${STAGE_COLORS[map] || "#9aa39c"}">${escapeHtml(map)}</span></dt><dd>${escapeHtml(text)}</dd></div>`).join("")}</dl>` : ""}
      </section>
    `;
  }).join("");
  return `
    ${sections || `<div class="empty">該当する素材がありません。</div>`}
    ${(gathering.tips || []).length ? `<div class="panel"><h2>採取のコツ</h2><ul class="mh-lb-tips">${gathering.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul></div>` : ""}
  `;
}

// ---------------------------------------------------------------------------
// 巨戟アーティアタブ（武器に付くシリーズスキル・グループスキル）

function artianControls() {
  const f = filters.artian;
  return `
    <p class="mh-note mh-wide">巨戟アーティア武器に付くシリーズスキル・グループスキルの一覧です。<b>説明文は要約です。</b>「この防具でも発動」は同じスキルを持つ防具シリーズです。</p>
    <label class="mh-field"><span>種類</span>
      <select data-filter="kind">
        <option value="">すべて</option>
        <option value="series" ${f.kind === "series" ? "selected" : ""}>シリーズスキル（2部位／4部位）</option>
        <option value="group" ${f.kind === "group" ? "selected" : ""}>グループスキル（3部位）</option>
      </select>
    </label>
    ${searchField(f.q, "スキル名・効果で検索")}
  `;
}

function artianResults() {
  if (!artian) return `<div class="empty">巨戟アーティアのデータを読み込めませんでした。</div>`;
  const f = filters.artian;
  const series = f.kind === "group" ? [] : artian.series.filter((entry) =>
    matches(f.q, [entry.name, entry.tag, ...entry.tiers.map((tier) => `${tier.name} ${tier.desc}`)]));
  const groups = f.kind === "series" ? [] : artian.groups.filter((entry) =>
    matches(f.q, [entry.name, entry.tag, entry.effect, entry.desc]));
  if (!series.length && !groups.length) return `<div class="empty">該当するスキルがありません。</div>`;
  return `
    ${series.length ? `
      <h2 class="mh-subhead">シリーズスキル <small class="mh-muted">2部位／4部位で発動・${series.length}件</small></h2>
      <div class="mh-cards">${series.map(artianSeriesCard).join("")}</div>` : ""}
    ${groups.length ? `
      <h2 class="mh-subhead">グループスキル <small class="mh-muted">3部位で発動・レベルは1段階のみ・${groups.length}件</small></h2>
      <div class="mh-cards">${groups.map(artianGroupCard).join("")}</div>` : ""}
  `;
}

function artianSeriesCard(entry) {
  return `
    <article class="card mh-card">
      <div class="card-body">
        <div class="mh-card-head"><h3>${escapeHtml(entry.name)}</h3>${entry.tag ? `<span class="pill purple">${escapeHtml(entry.tag)}</span>` : ""}</div>
        <dl class="mh-tiers">
          ${entry.tiers.map((tier) => `
            <div>
              <dt><span class="mh-piece-count">${tier.pieces}部位</span>${escapeHtml(tier.name)}</dt>
              <dd><span class="mh-summary-tag">要約</span>${escapeHtml(tier.desc)}</dd>
            </div>`).join("")}
        </dl>
        ${armorWithSkills(entry.members || [entry.name])}
      </div>
    </article>
  `;
}

function artianGroupCard(entry) {
  return `
    <article class="card mh-card">
      <div class="card-body">
        <div class="mh-card-head"><h3>${escapeHtml(entry.name)}</h3>${entry.tag ? `<span class="pill purple">${escapeHtml(entry.tag)}</span>` : ""}</div>
        <dl class="mh-tiers">
          <div>
            <dt><span class="mh-piece-count">3部位</span>${escapeHtml(entry.effect)}</dt>
            <dd><span class="mh-summary-tag">要約</span>${escapeHtml(entry.desc)}</dd>
          </div>
        </dl>
        ${armorWithSkills([entry.name])}
      </div>
    </article>
  `;
}

function armorWithSkills(skillNames) {
  const ids = Object.entries(data.skills)
    .filter(([, skill]) => (skill.k === "set" || skill.k === "group") && skillNames.includes(skill.n))
    .map(([id]) => id);
  const sets = data.armor.filter((set) => set.pc.some((piece) => ids.some((id) => piece.sk[id])));
  if (!sets.length) return "";
  return `
    <details class="mh-details">
      <summary>この防具でも発動（${sets.length}シリーズ）</summary>
      <ul>${sets.map((set) => `<li>${rarityPill(set.r)} ${escapeHtml(set.n)}</li>`).join("")}</ul>
    </details>
  `;
}

// ---------------------------------------------------------------------------
// 装備シミュレーター
//
// 武器・防具5部位・護石と装飾品を組み合わせて、発動スキル・シリーズ/グループスキル・防御力・耐性・必要素材を計算する。
// アーティア武器はスキルを手動で追加、巨戟アーティアはシリーズスキル/グループスキルを選択（武器を1部位分として数える）。
// 護石は固定の護石か、スキルとスロットを自由に決める「鑑定護石（カスタム）」を選べる。

const SIM_PARTS = ["head", "chest", "arms", "waist", "legs"];
const RESIST_LABELS = ["火", "水", "雷", "氷", "龍"];
const CUSTOM_CHARM = "custom";
let simPick = null; // ピッカーで選択中の枠（"weapon" / 部位 / "charm"）
const simPickFilters = { type: "", q: "" };

function emptyBuild() {
  return {
    lb: {},
    w: null, wMode: "", wSkills: [], wAtk: "", wAff: "", wEl: "", wElv: "", wSlots: [], gogma: { series: "", group: "" }, wDecos: [],
    defIn: "",
    a: {}, aDecos: {},
    c: null, cSkills: [], cSlots: [], cDecos: [],
  };
}

function normalizeBuild(source) {
  const build = { ...emptyBuild(), ...(source || {}) };
  build.wSkills = Array.isArray(build.wSkills) ? build.wSkills.slice(0, 6) : [];
  build.wDecos = Array.isArray(build.wDecos) ? build.wDecos.slice(0, 3) : [];
  // 手入力したスロットは常に3枠分（0 = なし）で持つ
  build.wSlots = Array.isArray(build.wSlots) && build.wSlots.length === 3 ? build.wSlots.map((lv) => Math.max(0, Math.min(3, Number(lv) || 0))) : [];
  build.gogma = { series: "", group: "", ...(build.gogma || {}) };
  build.a = typeof build.a === "object" && build.a ? build.a : {};
  build.aDecos = typeof build.aDecos === "object" && build.aDecos ? build.aDecos : {};
  build.lb = typeof build.lb === "object" && build.lb ? build.lb : {};
  build.cSkills = Array.isArray(build.cSkills) ? build.cSkills.slice(0, 3) : [];
  build.cSlots = Array.isArray(build.cSlots) ? build.cSlots.slice(0, 3) : [];
  build.cDecos = Array.isArray(build.cDecos) ? build.cDecos.slice(0, 3) : [];
  return build;
}

function simBuild() {
  const target = profile();
  target.sim = normalizeBuild(target.sim);
  return target.sim;
}

// 武器の種別: 通常 / アーティア（スキル手動） / 巨戟アーティア（シリーズ・グループスキル選択）
function weaponMode(build, weapon) {
  if (!weapon?.art) return "fixed";
  if (build.wMode === "artian" || build.wMode === "gogma") return build.wMode;
  // 同名が3種類ある武器（忘却の〜 等）は巨戟アーティアとみなす（切り替え可能）
  const sameName = data.weapons.filter((entry) => entry.t === weapon.t && entry.n === weapon.n).length;
  return sameName >= 3 ? "gogma" : "artian";
}

function weaponSlots(build, weapon) {
  if (weapon?.art && build.wSlots.length === 3) return build.wSlots.filter((lv) => lv > 0);
  return weapon?.sl || [];
}

// 武器の表示値（アーティアは画面に合わせて手入力した値を優先）
function weaponStats(build, weapon) {
  if (!weapon) return null;
  const custom = weapon.art;
  const pick = (input, fallback) => (custom && input !== "" && input !== undefined ? Number(input) : fallback);
  let element = weapon.el ? { type: weapon.el[0], value: weapon.el[1], hidden: weapon.el[2] } : null;
  if (custom && build.wEl) {
    element = build.wEl === "none" ? null : { type: build.wEl, value: pick(build.wElv, weapon.el?.[0] === build.wEl ? weapon.el[1] : 0), hidden: false };
  }
  return { atk: pick(build.wAtk, weapon.atk), aff: pick(build.wAff, weapon.aff), element, slots: weaponSlots(build, weapon) };
}

function slotAt(build, weapon, index) {
  if (build.wSlots.length === 3) return build.wSlots[index];
  return weapon.sl[index] || 0;
}

function elementText(element) {
  if (!element) return "無属性";
  const text = `${ELEMENT_LABELS[element.type] || element.type} ${element.value ?? ""}`;
  return element.hidden ? `(${text})` : text;
}

function charmSlots(build) {
  if (build.c === CUSTOM_CHARM) return build.cSlots.map(([type, lv]) => ({ on: type === "w" ? "weapon" : "armor", lv: Number(lv) || 1 }));
  return [];
}

// シリーズ/グループスキルの発動条件（部位数 → レベル）
function bonusThresholds() {
  if (bonusThresholds.cache) return bonusThresholds.cache;
  const map = new Map();
  data.armor.forEach((set) => {
    [set.sb, set.gb].forEach((bonus) => {
      if (bonus && !map.has(bonus[0])) map.set(bonus[0], bonus[1]);
    });
  });
  bonusThresholds.cache = map;
  return map;
}

function artianSkillOptions() {
  const byName = new Map(Object.entries(data.skills).map(([id, skill]) => [`${skill.k}:${skill.n}`, id]));
  const series = [];
  (artian?.series || []).forEach((entry) => {
    (entry.members || [entry.name]).forEach((name) => {
      const id = byName.get(`set:${name}`);
      if (id) series.push({ id, name, tag: entry.tag });
    });
  });
  const groups = (artian?.groups || [])
    .map((entry) => ({ id: byName.get(`group:${entry.name}`), name: `${entry.name}（${entry.effect}）`, tag: entry.tag }))
    .filter((entry) => entry.id);
  return { series, groups };
}

function computeBuild(build) {
  const weapon = build.w ? idx.weapons.get(build.w) : null;
  const mode = weaponMode(build, weapon);
  const skills = new Map(); // id -> { lv, sources: [] }
  const bonusCounts = new Map(); // シリーズ/グループスキル id -> { count, sources: [] }
  const addSkill = (id, lv, source) => {
    const skill = data.skills[id];
    if (!skill || !lv) return;
    if (skill.k === "set" || skill.k === "group") return;
    const entry = skills.get(id) || { lv: 0, sources: [] };
    entry.lv += Number(lv);
    entry.sources.push(`${source}${lv > 1 ? ` Lv${lv}` : ""}`);
    skills.set(id, entry);
  };
  const addBonus = (id, source) => {
    if (!id) return;
    const entry = bonusCounts.get(id) || { count: 0, sources: [] };
    entry.count += 1;
    entry.sources.push(source);
    bonusCounts.set(id, entry);
  };
  const addDecos = (decoIds, slotLevels) => decoIds.forEach((decoId, i) => {
    const deco = decoId && idx.decos.get(decoId);
    if (deco && i < slotLevels.length && deco.lv <= slotLevels[i]) Object.entries(deco.sk).forEach(([id, lv]) => addSkill(id, lv, deco.n));
  });

  // 武器
  if (weapon) {
    if (mode === "fixed") Object.entries(weapon.sk).forEach(([id, lv]) => addSkill(id, lv, weapon.n));
    if (mode === "artian") build.wSkills.forEach(([id, lv]) => addSkill(id, lv, `${weapon.n}（追加）`));
    if (mode === "gogma") {
      addBonus(build.gogma.series, `${weapon.n}（巨戟）`);
      addBonus(build.gogma.group, `${weapon.n}（巨戟）`);
    }
    addDecos(build.wDecos, weaponSlots(build, weapon));
  }

  // 防具
  let defense = 0;
  let defenseMax = 0;
  const resist = [0, 0, 0, 0, 0];
  SIM_PARTS.forEach((part) => {
    const piece = build.a[part] && idx.pieces.get(build.a[part]);
    if (!piece) return;
    const upgrade = upgradeInfo(piece.set.r);
    defense += piece.def || 0;
    defenseMax += (piece.def || 0) + upgrade.def + (build.lb?.[part] && upgrade.lb ? upgrade.lb.def : 0);
    (piece.res || []).forEach((value, i) => { resist[i] += value; });
    Object.entries(piece.sk).forEach(([id, lv]) => addSkill(id, lv, piece.n));
    if (piece.set.sb) addBonus(piece.set.sb[0], piece.n);
    if (piece.set.gb) addBonus(piece.set.gb[0], piece.n);
    addDecos(build.aDecos[part] || [], simPieceSlots(build, part, piece));
  });

  // 護石
  if (build.c === CUSTOM_CHARM) {
    build.cSkills.forEach(([id, lv]) => addSkill(id, lv, "鑑定護石"));
    addDecos(build.cDecos, charmSlots(build).map((slot) => slot.lv));
  } else if (build.c) {
    const charm = idx.charms.get(build.c);
    if (charm) Object.entries(charm.sk).forEach(([id, lv]) => addSkill(id, lv, charm.n));
  }

  const skillRows = [...skills.entries()].map(([id, entry]) => {
    const skill = data.skills[id];
    return { id, skill, total: entry.lv, lv: Math.min(entry.lv, skill.max), over: Math.max(0, entry.lv - skill.max), sources: entry.sources };
  }).sort((a, b) => b.lv - a.lv || a.skill.n.localeCompare(b.skill.n, "ja"));

  const thresholds = bonusThresholds();
  const bonusRows = [...bonusCounts.entries()].map(([id, entry]) => {
    const skill = data.skills[id];
    const ranks = thresholds.get(id) || (skill?.k === "group" ? [[3, 1]] : [[2, 1], [4, 2]]);
    const active = ranks.filter(([pieces]) => entry.count >= pieces).map(([, level]) => level);
    return { id, skill, count: entry.count, ranks, lv: active.length ? Math.max(...active) : 0, sources: entry.sources };
  }).sort((a, b) => b.lv - a.lv || b.count - a.count);

  // 必要素材（この組み合わせを作るのに必要な分。武器は表示中の段階のみ）
  const needed = new Map();
  let zenny = 0;
  const addCost = (entity) => {
    if (!entity) return;
    zenny += entity.z || 0;
    Object.entries(entity.in || {}).forEach(([itemId, amount]) => needed.set(itemId, (needed.get(itemId) || 0) + amount));
  };
  addCost(weapon);
  SIM_PARTS.forEach((part) => addCost(build.a[part] && idx.pieces.get(build.a[part])));
  if (build.c && build.c !== CUSTOM_CHARM) addCost(idx.charms.get(build.c));

  return { weapon, mode, skillRows, bonusRows, defense, defenseMax, resist, needed, zenny };
}

// --- 描画 -------------------------------------------------------------------

function renderSimPanel() {
  const build = simBuild();
  const result = computeBuild(build);
  const target = profile();
  return `
    <div class="mh-sim">
      <div class="mh-sim-equip">
        <div class="panel">
          <div class="mh-panel-head">
            <h2>装備</h2>
            <div class="mh-row">
              <button type="button" class="mh-btn small" data-action="sim-save">保存</button>
              <button type="button" class="mh-btn small danger" data-action="sim-reset">全部外す</button>
            </div>
          </div>
          ${simWeaponRow(build, result)}
          ${SIM_PARTS.map((part) => simArmorRow(build, part)).join("")}
          ${simCharmRow(build)}
        </div>
        ${target.builds.length ? `
          <div class="panel">
            <h2>保存したセット</h2>
            <ul class="mh-want-list">
              ${target.builds.map((entry) => `
                <li class="mh-want">
                  <div class="mh-want-main"><b>${escapeHtml(entry.name)}</b><span class="mh-muted">${escapeHtml(buildSummary(entry.b))}</span></div>
                  <div class="mh-row">
                    <button type="button" class="mh-btn small primary" data-action="sim-load" data-id="${escapeHtml(entry.id)}">呼び出す</button>
                    <button type="button" class="mh-btn small danger" data-action="sim-delete" data-id="${escapeHtml(entry.id)}">削除</button>
                  </div>
                </li>`).join("")}
            </ul>
            <p class="mh-note">保存したセットは共有URLにも含まれます。</p>
          </div>` : ""}
      </div>
      <div class="mh-sim-result">${simResult(result)}</div>
    </div>
    <dialog class="mh-dialog" data-role="sim-dialog">
      <div class="mh-dialog-head">
        <b data-role="sim-dialog-title"></b>
        <button type="button" class="mh-btn small" data-action="sim-close">閉じる</button>
      </div>
      <div class="mh-dialog-controls" data-role="sim-dialog-controls"></div>
      <div class="mh-dialog-list" data-role="sim-dialog-list"></div>
    </dialog>
  `;
}

function buildSummary(build) {
  const weapon = build.w && idx.weapons.get(build.w);
  const count = SIM_PARTS.filter((part) => build.a?.[part]).length;
  return `${weapon ? weapon.n : "武器なし"}・防具${count}部位`;
}

function simSlotHead(label, name, extra = "", slot) {
  return `
    <div class="mh-sim-head">
      <span class="mh-sim-label">${label}</span>
      <button type="button" class="mh-sim-pick" data-action="sim-pick" data-slot="${slot}">${name ? `<b>${escapeHtml(name)}</b>` : `<span class="mh-muted">選択してください</span>`}</button>
      ${name ? `<button type="button" class="mh-btn small" data-action="sim-clear" data-slot="${slot}" aria-label="外す">×</button>` : ""}
    </div>
    ${extra}
  `;
}

function simWeaponRow(build, result) {
  const weapon = result.weapon;
  let extra = "";
  if (weapon) {
    const stats = weaponStats(build, weapon);
    extra += `<div class="mh-sim-meta">${idx.weaponTypes.get(weapon.t)} ${rarityPill(weapon.r)} 攻撃 <b>${stats.atk}</b> 会心 <b>${stats.aff}%</b> ${elementText(stats.element)} ${slotText(stats.slots)}</div>`;
    if (weapon.art) {
      const elementType = build.wEl || (weapon.el ? weapon.el[0] : "none");
      extra += `
        <div class="mh-sim-sub">
          <label class="mh-field"><span>種別</span>
            <select data-sim="wmode">
              <option value="artian" ${result.mode === "artian" ? "selected" : ""}>アーティア（スキルを追加）</option>
              <option value="gogma" ${result.mode === "gogma" ? "selected" : ""}>巨戟アーティア（シリーズ/グループスキル）</option>
            </select>
          </label>
        </div>
        <div class="mh-sim-custom">
          <div class="mh-sim-custom-head">ゲーム画面の値を入力 <small>空欄はデータの初期値（${weapon.atk} / ${weapon.aff}% / ${escapeHtml(elementText(weapon.el ? { type: weapon.el[0], value: weapon.el[1] } : null))} / ${slotText(weapon.sl)}）</small></div>
          <div class="mh-sim-sub">
            <label class="mh-field"><span>攻撃力</span><input class="mh-num" type="number" inputmode="numeric" data-sim="watk" value="${escapeHtml(build.wAtk)}" placeholder="${weapon.atk}" /></label>
            <label class="mh-field"><span>会心率%</span><input class="mh-num" type="number" inputmode="numeric" data-sim="waff" value="${escapeHtml(build.wAff)}" placeholder="${weapon.aff}" /></label>
            <label class="mh-field"><span>属性</span>
              <select data-sim="wel">
                <option value="none" ${elementType === "none" ? "selected" : ""}>無属性</option>
                ${ELEMENT_ORDER.filter((el) => el !== "none").map((el) => `<option value="${el}" ${elementType === el ? "selected" : ""}>${ELEMENT_LABELS[el]}</option>`).join("")}
              </select>
            </label>
            ${elementType !== "none" ? `<label class="mh-field"><span>属性値</span><input class="mh-num" type="number" inputmode="numeric" data-sim="welv" value="${escapeHtml(build.wElv)}" placeholder="${weapon.el?.[0] === elementType ? weapon.el[1] : 0}" /></label>` : ""}
            ${[0, 1, 2].map((i) => `
              <label class="mh-field"><span>スロット${i + 1}</span>
                <select data-sim="wslot" data-index="${i}">
                  ${[0, 1, 2, 3].map((lv) => `<option value="${lv}" ${slotAt(build, weapon, i) === lv ? "selected" : ""}>${lv ? `Lv${lv}` : "なし"}</option>`).join("")}
                </select>
              </label>`).join("")}
          </div>
        </div>`;
      if (result.mode === "gogma") {
        const options = artianSkillOptions();
        extra += `
          <div class="mh-sim-sub">
            <label class="mh-field grow"><span>シリーズスキル（1部位分）</span>
              <select data-sim="gseries"><option value="">なし</option>${options.series.map((entry) => `<option value="${entry.id}" ${build.gogma.series === entry.id ? "selected" : ""}>${escapeHtml(entry.name)}${entry.tag ? `（${entry.tag}）` : ""}</option>`).join("")}</select>
            </label>
            <label class="mh-field grow"><span>グループスキル（1部位分）</span>
              <select data-sim="ggroup"><option value="">なし</option>${options.groups.map((entry) => `<option value="${entry.id}" ${build.gogma.group === entry.id ? "selected" : ""}>${escapeHtml(entry.name)}</option>`).join("")}</select>
            </label>
          </div>`;
      } else {
        extra += `<div class="mh-sim-sub">${skillPickers(build.wSkills, "wskill", ["weapon"])}
          ${build.wSkills.length < 6 ? `<button type="button" class="mh-btn small" data-action="sim-add-wskill">＋ スキルを追加</button>` : ""}</div>`;
      }
    } else {
      const skills = Object.entries(weapon.sk);
      if (skills.length) extra += `<div class="mh-sim-sub">${skillList(weapon.sk)}</div>`;
    }
    extra += decoSelectors(weaponStats(build, weapon).slots.map((lv) => ({ on: "weapon", lv })), build.wDecos, "wdeco");
  }
  return `<div class="mh-sim-row">${simSlotHead("武器", weapon?.n, extra, "weapon")}</div>`;
}

function simArmorRow(build, part) {
  const piece = build.a[part] && idx.pieces.get(build.a[part]);
  let extra = "";
  if (piece) {
    extra += `<div class="mh-sim-meta">${rankBadges([armorRankOf(piece.set)])} ${rarityPill(piece.set.r)} 防御 <b>${piece.def}</b>（最大${piece.def + upgradeInfo(piece.set.r).def + (build.lb?.[part] && upgradeInfo(piece.set.r).lb ? upgradeInfo(piece.set.r).lb.def : 0)}） ${slotText(simPieceSlots(build, part, piece))} ${skillList(piece.sk)}</div>`;
    if (upgradeInfo(piece.set.r).lb) extra += `<div class="mh-sim-sub"><label class="mh-check"><input type="checkbox" data-sim="alb:${part}" ${build.lb?.[part] ? "checked" : ""} /> 限界突破済み（スロット・防御の上限が上がる）</label></div>`;
    extra += decoSelectors(simPieceSlots(build, part, piece).map((lv) => ({ on: "armor", lv })), build.aDecos[part] || [], `adeco:${part}`);
  }
  return `<div class="mh-sim-row">${simSlotHead(PIECE_LABELS[part], piece?.n, extra, part)}</div>`;
}

function simCharmRow(build) {
  let name = null;
  let extra = "";
  if (build.c === CUSTOM_CHARM) {
    name = "鑑定護石（カスタム）";
    extra += `<div class="mh-sim-sub">${skillPickers(build.cSkills, "cskill", ["armor", "weapon"])}
      ${build.cSkills.length < 3 ? `<button type="button" class="mh-btn small" data-action="sim-add-cskill">＋ スキルを追加</button>` : ""}</div>`;
    extra += `<div class="mh-sim-sub">
      ${build.cSlots.map(([type, lv], i) => `
        <span class="mh-slot-edit">
          <select data-sim="cslot-type" data-index="${i}"><option value="a" ${type === "a" ? "selected" : ""}>防具スロット</option><option value="w" ${type === "w" ? "selected" : ""}>武器スロット</option></select>
          <select data-sim="cslot-lv" data-index="${i}">${[1, 2, 3].map((value) => `<option value="${value}" ${Number(lv) === value ? "selected" : ""}>Lv${value}</option>`).join("")}</select>
          <button type="button" class="mh-btn small" data-action="sim-remove-cslot" data-index="${i}" aria-label="スロットを削除">×</button>
        </span>`).join("")}
      ${build.cSlots.length < 3 ? `<button type="button" class="mh-btn small" data-action="sim-add-cslot">＋ スロットを追加</button>` : ""}
    </div>`;
    extra += decoSelectors(charmSlots(build), build.cDecos, "cdeco");
  } else if (build.c) {
    const charm = idx.charms.get(build.c);
    name = charm?.n;
    if (charm) extra += `<div class="mh-sim-meta">${rarityPill(charm.r)} ${skillList(charm.sk)}</div>`;
  }
  return `<div class="mh-sim-row">${simSlotHead("護石", name, extra, "charm")}</div>`;
}

function skillPickers(list, key, kinds) {
  return list.map(([id, lv], i) => {
    const skill = data.skills[id];
    return `
      <span class="mh-skill-edit">
        <select data-sim="${key}" data-index="${i}">
          <option value="">スキルを選択</option>
          ${skillOptions(kinds, id)}
        </select>
        <select data-sim="${key}-lv" data-index="${i}">
          ${Array.from({ length: skill?.max || 1 }, (_, n) => n + 1).map((value) => `<option value="${value}" ${Number(lv) === value ? "selected" : ""}>Lv${value}</option>`).join("")}
        </select>
        <button type="button" class="mh-btn small" data-action="sim-remove-${key}" data-index="${i}" aria-label="スキルを削除">×</button>
      </span>`;
  }).join("");
}

function skillOptions(kinds, selected) {
  const labels = { weapon: "武器スキル", armor: "防具スキル" };
  return kinds.map((kind) => {
    const entries = Object.entries(data.skills).filter(([, skill]) => skill.k === kind)
      .sort((a, b) => a[1].n.localeCompare(b[1].n, "ja"));
    return `<optgroup label="${labels[kind]}">${entries.map(([id, skill]) => `<option value="${id}" ${id === selected ? "selected" : ""}>${escapeHtml(skill.n)}</option>`).join("")}</optgroup>`;
  }).join("");
}

// スロットごとの装飾品選択（スロットLv以下・武器用/防具用のみ）
function decoSelectors(slots, selected, key) {
  if (!slots.length) return `<div class="mh-sim-sub mh-muted">スロットなし</div>`;
  return `<div class="mh-sim-decos">${slots.map((slot, i) => `
    <label class="mh-deco-select">
      <span class="mh-slot-mark">${SLOT_MARKS[slot.lv] || slot.lv}</span>
      <select data-sim="${key}" data-index="${i}">
        <option value="">（空き）</option>
        ${decoOptions(slot.on, slot.lv, selected[i])}
      </select>
    </label>`).join("")}</div>`;
}

function decoOptions(on, maxLevel, selected) {
  const list = data.decorations.filter((deco) => deco.on === on && deco.lv <= maxLevel)
    .sort((a, b) => b.lv - a.lv || a.n.localeCompare(b.n, "ja"));
  const groups = [];
  list.forEach((deco) => {
    if (!groups.length || groups[groups.length - 1].lv !== deco.lv) groups.push({ lv: deco.lv, list: [] });
    groups[groups.length - 1].list.push(deco);
  });
  return groups.map((group) => `<optgroup label="Lv${group.lv}">${group.list.map((deco) => `<option value="${deco.id}" ${deco.id === selected ? "selected" : ""}>${escapeHtml(deco.n)}（${escapeHtml(skillText(deco.sk, true))}）</option>`).join("")}</optgroup>`).join("");
}

function simResult(result) {
  const build = simBuild();
  const weapon = result.weapon;
  const stats = weaponStats(build, weapon);
  const atk = stats?.atk;
  const aff = stats?.aff;
  const owned = profile().owned;
  const materials = [...result.needed.entries()].map(([itemId, need]) => ({ itemId, item: idx.items.get(itemId), need, owned: owned[itemId] || 0 }));
  return `
    <div class="panel">
      <h2>ステータス</h2>
      <dl class="mh-sim-stats">
        <div><dt>攻撃力</dt><dd>${atk ?? "-"}</dd></div>
        <div><dt>会心率</dt><dd>${aff ?? 0}%</dd></div>
        <div><dt>属性</dt><dd>${weapon ? escapeHtml(elementText(stats.element)) : "-"}</dd></div>
        <div><dt>防御力${build.defIn !== "" ? "（入力）" : ""}</dt><dd>${build.defIn !== "" ? Number(build.defIn) : result.defense}<small>初期 ${result.defense}／強化最大 ${result.defenseMax}${Object.values(build.lb).some(Boolean) ? "（限界突破込み）" : ""}</small></dd></div>
        ${RESIST_LABELS.map((label, i) => `<div><dt>${label}耐性</dt><dd class="${result.resist[i] < 0 ? "mh-minus" : ""}">${result.resist[i]}</dd></div>`).join("")}
      </dl>
      <label class="mh-field mh-def-input"><span>防御力（強化後の値をゲーム画面から入力・空欄で初期値）</span><input class="mh-num" type="number" inputmode="numeric" data-sim="defin" value="${escapeHtml(build.defIn)}" placeholder="${result.defense}" /></label>
      <p class="mh-note">攻撃力・会心率・属性は武器の値です（スキルの効果は含みません）。アーティアは武器欄でゲーム画面の値を入力できます。</p>
    </div>
    <div class="panel">
      <h2>発動スキル <small>${result.skillRows.length}件</small></h2>
      ${result.skillRows.length ? `<div class="mh-sim-skills">${result.skillRows.map(simSkillRow).join("")}</div>` : `<div class="empty">装備を選ぶと、ここに発動スキルが表示されます。</div>`}
    </div>
    <div class="panel">
      <h2>シリーズスキル・グループスキル</h2>
      ${result.bonusRows.length ? `<div class="mh-sim-skills">${result.bonusRows.map(simBonusRow).join("")}</div>` : `<div class="empty">該当なし</div>`}
      <p class="mh-note">シリーズスキルは2部位／4部位、グループスキルは3部位で発動します。巨戟アーティアで選んだスキルは1部位分として数えています。</p>
    </div>
    <div class="panel">
      <div class="mh-panel-head">
        <h2>この装備に必要な素材</h2>
        ${materials.length ? `<button type="button" class="mh-btn small primary" data-action="sim-want-all">欲しいものに全部追加</button>` : ""}
      </div>
      ${simUpgradeSummary(build)}
      ${materials.length ? `
        <p class="mh-note">武器は表示中の段階を作る素材です（派生元からの合計は「欲しいもの」タブで確認できます）。費用: <b>${result.zenny.toLocaleString()}z</b></p>
        <ul class="mh-materials">${materials.map(({ item, need, owned: have }) => `<li class="${have >= need ? "is-done" : ""}">${itemLabel(item || { n: "?" })}<span>×${need}（所持${have}）</span></li>`).join("")}</ul>` : `<div class="empty">素材が必要な装備はありません。</div>`}
    </div>
  `;
}

function simPieceSlots(build, part, piece) {
  return build.lb?.[part] && upgradeInfo(piece.set.r).lb ? limitBreakSlots(piece.sl, piece.set.r) : piece.sl;
}

function simUpgradeSummary(build) {
  const pieces = SIM_PARTS.map((part) => build.a[part] && idx.pieces.get(build.a[part])).filter(Boolean);
  if (!pieces.length) return "";
  const total = SIM_PARTS.reduce((sum, part) => {
    const piece = build.a[part] && idx.pieces.get(build.a[part]);
    if (!piece) return sum;
    const info = upgradeInfo(piece.set.r);
    const lb = build.lb?.[part] && info.lb ? info.lb : null;
    return {
      points: sum.points + info.points + (lb ? lb.points : 0),
      zenny: sum.zenny + info.zenny + (lb ? lb.zenny + (lb.zennyBreak || 0) : 0),
      def: sum.def + info.def + (lb ? lb.def : 0),
      lbCount: sum.lbCount + (lb ? 1 : 0),
    };
  }, { points: 0, zenny: 0, def: 0, lbCount: 0 });
  if (!total.points) return "";
  return `
    <div class="mh-upgrade">
      <div><b>防具${pieces.length}部位を最大まで強化</b>（防御 +${total.def}${total.lbCount ? `、限界突破${total.lbCount}部位を含む` : ""}）</div>
      <div>強化ポイント <b>${total.points.toLocaleString()}pt</b> ／ 費用 <b>${total.zenny.toLocaleString()}z</b></div>
      <div class="mh-muted">鎧玉の例: ${sphereText(total.points)}</div>
    </div>
  `;
}

function simSkillRow(row) {
  const rank = row.skill.rk?.find(([level]) => level === row.lv);
  return `
    <div class="mh-sim-skill">
      <div class="mh-sim-skill-head">
        <b>${escapeHtml(row.skill.n)}</b>
        <span class="mh-level">Lv${row.lv}<small>/${row.skill.max}</small></span>
        <span class="mh-level-bar">${Array.from({ length: row.skill.max }, (_, i) => `<i class="${i < row.lv ? "on" : ""}"></i>`).join("")}</span>
        ${row.over ? `<span class="mh-over">+${row.over} 超過</span>` : ""}
      </div>
      ${rank ? `<div class="mh-sim-desc">${escapeHtml(rank[2])}</div>` : ""}
      <div class="mh-sim-src">${row.sources.map(escapeHtml).join("、")}</div>
    </div>
  `;
}

function simBonusRow(row) {
  return `
    <div class="mh-sim-skill ${row.lv ? "" : "is-off"}">
      <div class="mh-sim-skill-head">
        <b>${escapeHtml(row.skill?.n || "?")}</b>
        <span class="pill ${row.skill?.k === "group" ? "purple" : ""}">${row.skill?.k === "group" ? "グループ" : "シリーズ"}</span>
        <span class="mh-level">${row.count}部位</span>
        ${row.lv ? `<span class="mh-done">発動中</span>` : `<span class="mh-muted">未発動</span>`}
      </div>
      <ul class="mh-sim-tiers">
        ${row.ranks.map(([pieces, level]) => {
          const rank = row.skill?.rk?.find(([lv]) => lv === level);
          const on = row.count >= pieces;
          return `<li class="${on ? "on" : ""}"><span class="mh-piece-count">${pieces}部位</span>${escapeHtml(rank?.[1] || "")} ${on ? "✓" : `（あと${pieces - row.count}部位）`}<div class="mh-sim-desc">${escapeHtml(rank?.[2] || "")}</div></li>`;
        }).join("")}
      </ul>
      <div class="mh-sim-src">${row.sources.map(escapeHtml).join("、")}</div>
    </div>
  `;
}

// --- ピッカー（装備を選ぶダイアログ） --------------------------------------

function openSimPicker(slot) {
  simPick = slot;
  const dialog = app.querySelector("[data-role='sim-dialog']");
  const build = simBuild();
  const current = build.w && idx.weapons.get(build.w);
  if (slot === "weapon") simPickFilters.type = simPickFilters.type || current?.t || "great-sword";
  const titles = { weapon: "武器を選ぶ", charm: "護石を選ぶ" };
  dialog.querySelector("[data-role='sim-dialog-title']").textContent = titles[slot] || `${PIECE_LABELS[slot]}防具を選ぶ`;
  dialog.querySelector("[data-role='sim-dialog-controls']").innerHTML = `
    ${slot === "weapon" ? `<select data-sim-pick-type>${data.weaponTypes.map((type) => `<option value="${type.id}" ${simPickFilters.type === type.id ? "selected" : ""}>${type.n}</option>`).join("")}</select>` : ""}
    <input class="mh-input" type="search" data-sim-search placeholder="名前・スキル・モンスター名で検索" value="${escapeHtml(simPickFilters.q)}" />
  `;
  renderSimPickList();
  dialog.showModal();
  dialog.querySelector("[data-sim-search]").focus();
}

function renderSimPickList() {
  const dialog = app.querySelector("[data-role='sim-dialog']");
  if (!dialog || !simPick) return;
  const typeSelect = dialog.querySelector("[data-sim-pick-type]");
  if (typeSelect) simPickFilters.type = typeSelect.value;
  simPickFilters.q = dialog.querySelector("[data-sim-search]")?.value || "";
  const q = simPickFilters.q;
  let rows = [];
  if (simPick === "weapon") {
    rows = data.weapons.filter((weapon) => weapon.t === simPickFilters.type
      && matches(q, [weapon.n, weapon.sr, idx.monsters.get(weapon.mon)?.n, skillText(weapon.sk)]))
      .map((weapon) => ({
        id: weapon.id,
        html: `${rarityPill(weapon.r)} <b>${escapeHtml(weapon.n)}</b>${weapon.art ? ` <span class="pill purple">カスタム</span>` : ""}
          <span class="mh-muted">攻撃${weapon.atk} 会心${weapon.aff}% ${weapon.el ? `${ELEMENT_LABELS[weapon.el[0]]}${weapon.el[1]}` : ""} ${slotText(weapon.sl)} ${escapeHtml(skillText(weapon.sk, true))}</span>`,
      }));
  } else if (simPick === "charm") {
    rows = [{ id: CUSTOM_CHARM, html: `<b>鑑定護石（カスタム）</b> <span class="mh-muted">スキルとスロットを自由に設定</span>` }]
      .concat(data.charms.filter((charm) => !charm.rand && matches(q, [charm.n, skillText(charm.sk)]))
        .map((charm) => ({ id: charm.id, html: `${rarityPill(charm.r)} <b>${escapeHtml(charm.n)}</b> <span class="mh-muted">${escapeHtml(skillText(charm.sk, true))}</span>` })));
  } else {
    rows = data.armor.flatMap((set) => set.pc.filter((piece) => piece.p === simPick).map((piece) => ({ set, piece })))
      .filter(({ set, piece }) => matches(q, [piece.n, set.n, skillText(piece.sk)]))
      .map(({ set, piece }) => ({
        id: piece.id,
        html: `${rankBadges([armorRankOf(set)])} ${rarityPill(set.r)} <b>${escapeHtml(piece.n)}</b> <span class="mh-muted">防御${piece.def} ${slotText(piece.sl)} ${escapeHtml(skillText(piece.sk, true))}</span>`,
      }));
  }
  const list = dialog.querySelector("[data-role='sim-dialog-list']");
  list.innerHTML = rows.length
    ? rows.slice(0, 150).map((row) => `<button type="button" class="mh-pick-row" data-action="sim-set" data-id="${row.id}">${row.html}</button>`).join("")
      + (rows.length > 150 ? `<p class="mh-note">ほか${rows.length - 150}件（検索で絞り込んでください）</p>` : "")
    : `<div class="empty">該当なし</div>`;
}

// --- イベント -----------------------------------------------------------------

function onSimClick(action, button) {
  const build = simBuild();
  const target = profile();
  const index = Number(button.dataset.index);
  const slot = button.dataset.slot;
  if (action === "sim-pick") {
    openSimPicker(slot);
    return;
  }
  if (action === "sim-close") {
    app.querySelector("[data-role='sim-dialog']")?.close();
    return;
  }
  if (action === "sim-set") {
    const id = button.dataset.id;
    if (simPick === "weapon") {
      build.w = id;
      Object.assign(build, { wMode: "", wDecos: [], wAtk: "", wAff: "", wEl: "", wElv: "", wSlots: [] });
    } else if (simPick === "charm") {
      build.c = id;
      if (id === CUSTOM_CHARM && !build.cSlots.length) build.cSlots = [["a", 1]];
    } else {
      build.a[simPick] = id;
      build.aDecos[simPick] = [];
      delete build.lb[simPick];
    }
    app.querySelector("[data-role='sim-dialog']")?.close();
    simPick = null;
  } else if (action === "sim-clear") {
    if (slot === "weapon") Object.assign(build, { w: null, wDecos: [], wSkills: [], wMode: "", gogma: { series: "", group: "" } });
    else if (slot === "charm") Object.assign(build, { c: null, cSkills: [], cSlots: [], cDecos: [] });
    else {
      delete build.a[slot];
      delete build.aDecos[slot];
      delete build.lb[slot];
    }
  } else if (action === "sim-reset") {
    if (!confirm("装備をすべて外しますか？")) return;
    target.sim = emptyBuild();
  } else if (action === "sim-add-wskill") build.wSkills.push(["", 1]);
  else if (action === "sim-remove-wskill") build.wSkills.splice(index, 1);
  else if (action === "sim-add-cskill") build.cSkills.push(["", 1]);
  else if (action === "sim-remove-cskill") build.cSkills.splice(index, 1);
  else if (action === "sim-add-cslot") build.cSlots.push(["a", 1]);
  else if (action === "sim-remove-cslot") {
    build.cSlots.splice(index, 1);
    build.cDecos.splice(index, 1);
  } else if (action === "sim-save") {
    const name = prompt("セット名を入力してください", buildSummary(build));
    if (!name || !name.trim()) return;
    target.builds.push({ id: Date.now().toString(36), name: name.trim().slice(0, 40), b: JSON.parse(JSON.stringify(build)) });
  } else if (action === "sim-load") {
    const entry = target.builds.find((candidate) => candidate.id === button.dataset.id);
    if (entry) target.sim = normalizeBuild(JSON.parse(JSON.stringify(entry.b)));
  } else if (action === "sim-delete") {
    const entry = target.builds.find((candidate) => candidate.id === button.dataset.id);
    if (!entry || !confirm(`「${entry.name}」を削除しますか？`)) return;
    target.builds = target.builds.filter((candidate) => candidate !== entry);
  } else if (action === "sim-want-all") {
    const keys = [];
    if (build.w) keys.push(`w:${build.w}`);
    SIM_PARTS.forEach((part) => { if (build.a[part]) keys.push(`a:${build.a[part]}`); });
    if (build.c && build.c !== CUSTOM_CHARM) keys.push(`c:${build.c}`);
    keys.filter((key) => resolveWant(key) && Object.keys(resolveWant(key).entity.in || {}).length)
      .forEach((key) => { if (!target.wants[key]) target.wants[key] = { n: 1 }; });
    saveStore();
    refreshTabCounts();
    alert("欲しいものリストに追加しました。");
    return;
  }
  saveStore();
  renderPanel();
}

function onSimChange(field) {
  const build = simBuild();
  const key = field.dataset.sim;
  const index = Number(field.dataset.index);
  const value = field.value;
  if (key === "wmode") build.wMode = value;
  else if (key === "watk") build.wAtk = value;
  else if (key === "waff") build.wAff = value;
  else if (key === "wel") {
    build.wEl = value;
    build.wElv = "";
  } else if (key === "welv") build.wElv = value;
  else if (key === "defin") build.defIn = value;
  else if (key === "wslot") {
    const weapon = build.w && idx.weapons.get(build.w);
    const slots = build.wSlots.length === 3 ? [...build.wSlots] : [...weaponSlots(build, weapon)];
    while (slots.length < 3) slots.push(0);
    slots[index] = Number(value);
    build.wSlots = slots.slice(0, 3);
    build.wDecos = [];
  }
  else if (key === "gseries") build.gogma.series = value;
  else if (key === "ggroup") build.gogma.group = value;
  else if (key === "wdeco") build.wDecos[index] = value || null;
  else if (key.startsWith("adeco:")) {
    const part = key.slice(6);
    build.aDecos[part] ||= [];
    build.aDecos[part][index] = value || null;
  } else if (key === "cdeco") build.cDecos[index] = value || null;
  else if (key.startsWith("alb:")) {
    const part = key.slice(4);
    build.lb[part] = field.checked;
    build.aDecos[part] = [];
  }
  else if (key === "wskill" || key === "cskill") {
    const list = key === "wskill" ? build.wSkills : build.cSkills;
    list[index] = [value, 1];
  } else if (key === "wskill-lv" || key === "cskill-lv") {
    const list = key === "wskill-lv" ? build.wSkills : build.cSkills;
    if (list[index]) list[index][1] = Number(value);
  } else if (key === "cslot-type") {
    build.cSlots[index][0] = value;
    build.cDecos[index] = null;
  } else if (key === "cslot-lv") {
    build.cSlots[index][1] = Number(value);
    build.cDecos[index] = null;
  }
  saveStore();
  renderPanel();
}

// ---------------------------------------------------------------------------
// 共通パーツ

function wantButton(key) {
  const wanted = Boolean(profile().wants[key]);
  return `<button type="button" class="mh-btn small ${wanted ? "active" : "primary"}" data-action="toggle-want" data-key="${key}" aria-pressed="${wanted}">${wanted ? "✓ 欲しい" : "＋ 欲しい"}</button>`;
}

function rarityFilter(value) {
  return `
    <label class="mh-field"><span>レア度</span>
      <select data-filter="rarity">
        <option value="">すべて</option>
        ${[1, 2, 3, 4, 5, 6, 7, 8].map((r) => `<option value="${r}" ${value === String(r) ? "selected" : ""}>RARE ${r}</option>`).join("")}
      </select>
    </label>
  `;
}

function searchField(value, placeholder) {
  return `<label class="mh-field grow"><span>検索</span><input class="mh-input" type="search" data-filter="q" value="${escapeHtml(value)}" placeholder="${placeholder}" /></label>`;
}

function wantedOnlyField(checked, label = "欲しいもののみ") {
  return `<label class="mh-check"><input type="checkbox" data-filter="wantedOnly" ${checked ? "checked" : ""} /> ${label}</label>`;
}

function rarityPill(rarity) {
  if (!rarity) return "";
  return `<span class="mh-rarity r${rarity}">RARE ${rarity}</span>`;
}

function slotText(slots) {
  return slots && slots.length ? slots.map((lv) => SLOT_MARKS[lv] || `[${lv}]`).join("") : "なし";
}

function skillText(skills, withLevel = false) {
  return Object.entries(skills || {})
    .map(([id, level]) => {
      const name = data.skills[id]?.n || "";
      return withLevel ? `${name} Lv${level}` : name;
    })
    .join(" ");
}

function skillList(skills) {
  const entries = Object.entries(skills || {});
  if (!entries.length) return "";
  return `<div class="mh-skills">${entries.map(([id, level]) => {
    const skill = data.skills[id];
    const bonus = skill && (skill.k === "set" || skill.k === "group");
    return `<span class="mh-skill ${bonus ? "bonus" : ""}">${escapeHtml(skill?.n || "?")}${bonus ? "" : ` Lv${level}`}</span>`;
  }).join("")}</div>`;
}

function materialText(inputs) {
  return Object.keys(inputs || {}).map((id) => idx.items.get(id)?.n || "").join(" ");
}

function materialList(inputs, zenny) {
  const entries = Object.entries(inputs || {});
  if (!entries.length) return `<div class="mh-note">素材データなし（初期装備・特殊入手など）</div>`;
  const owned = profile().owned;
  return `
    <ul class="mh-materials">
      ${entries.map(([id, amount]) => {
        const item = idx.items.get(id);
        const enough = (owned[id] || 0) >= amount;
        return `<li class="${enough ? "is-done" : ""}">${itemLabel(item || { n: id })}<span>×${amount}</span></li>`;
      }).join("")}
      ${zenny ? `<li class="mh-zenny">費用<span>${zenny.toLocaleString()}z</span></li>` : ""}
    </ul>
  `;
}

function itemLabel(item) {
  if (!item) return "";
  const color = ITEM_COLORS[item.c] || "#bbb";
  return `<span class="mh-item" title="${escapeHtml(item.d || "")}"><i class="mh-dot" style="--dot:${color}"></i>${escapeHtml(item.n)}</span>`;
}

// マップの小さなラベル
function stagePills(stageIds, small = false) {
  const stages = (data.stages || []).filter((stage) => stageIds.includes(stage.id));
  return stages.map((stage) => `<span class="mh-stage ${small ? "small" : ""}" style="--stage:${STAGE_COLORS[stage.n] || "#9aa39c"}">${escapeHtml(stage.n)}</span>`).join("");
}

// 素材を落とすモンスターの出現マップ（重複なし）
function itemStageIds(item) {
  const ids = new Set(gatherStageIds(item?.n));
  (item?.src || []).forEach(([monsterId]) => (idx.monsters.get(monsterId)?.loc || []).forEach((id) => ids.add(id)));
  return [...ids];
}

function stageIdByName(name) {
  return (data.stages || []).find((stage) => stage.n === name)?.id;
}

function gatherStageIds(name) {
  const ids = new Set();
  (gatherIndex.get(name) || []).forEach(({ entry }) => entry.maps.forEach((where) => {
    const id = stageIdByName(where.map);
    if (id) ids.add(id);
  }));
  return [...ids];
}

// 採取場所のマップ（（上）（下）やメモ付き）
function gatherMapPills(maps) {
  const all = ["隔ての砂原", "緋の森", "油涌き谷", "氷霧の断崖", "竜都の跡形"];
  if (maps.length === 5 && all.every((name) => maps.some((where) => where.map === name && !where.rank && !where.note))) {
    return `<span class="mh-stage" style="--stage:#8fd3b6">全マップ</span>`;
  }
  return maps.map((where) => `<span class="mh-stage" style="--stage:${STAGE_COLORS[where.map] || "#9aa39c"}">${escapeHtml(where.map)}${where.rank ? `（${RANK_LABELS[where.rank].slice(0, 1)}）` : ""}${where.note ? ` ${escapeHtml(where.note)}` : ""}</span>`).join("");
}

function gatherEntryNote(entry) {
  return [entry.source ? `${entry.source}から` : "", entry.areaNote, entry.note].filter(Boolean).map(escapeHtml).join("／");
}

function gatherList(name) {
  const list = gatherIndex.get(name) || [];
  if (!list.length) return "";
  return `<ul class="mh-sources">${list.map(({ category, entry }) => `
    <li><b>${category.icon} ${escapeHtml(category.name)}</b>${entry.rank ? ` <span class="mh-rank ${entry.rank}">${RANK_LABELS[entry.rank]}だけ</span>` : ""}
      <span class="mh-stage-row">${gatherMapPills(entry.maps)}</span>
      ${gatherEntryNote(entry) ? `<span class="mh-muted">${gatherEntryNote(entry)}</span>` : ""}</li>`).join("")}</ul>`;
}

function sourceList(item, max) {
  const sources = item?.src || [];
  const gather = gatherList(item?.n);
  if (!sources.length) return gather || `<span class="mh-muted">採取・交易・調査報酬など</span>`;
  const shown = sources.slice(0, max);
  return `
    <ul class="mh-sources">
      ${shown.map(([monsterId, rank, kinds, chance]) => `
        <li><b>${escapeHtml(idx.monsters.get(monsterId)?.n || "?")}</b> <span class="mh-rank ${rank}">${RANK_LABELS[rank] || rank}</span>
        <span class="mh-muted">${kinds.map((kind) => SOURCE_LABELS[kind] || kind).join("・")} 最大${chance}%</span>
        <span class="mh-stage-row">${stagePills(idx.monsters.get(monsterId)?.loc || [], true)}</span></li>`).join("")}
      ${sources.length > shown.length ? `<li class="mh-muted">ほか${sources.length - shown.length}件</li>` : ""}
    </ul>
    ${gather}
  `;
}

function matches(query, fields) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = normalize(fields.join(" "));
  return words.every((word) => haystack.includes(word));
}

// 全角英数・カタカナ/ひらがなの違いを吸収して検索しやすくする
function normalize(text) {
  return String(text || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
}

function htmlToElement(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
