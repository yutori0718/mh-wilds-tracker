# MH Wilds 素材トラッカー

モンスターハンターワイルズの素材・護石・珠（装飾品）・武器・防具の一覧と、モンスター別ドロップ率、人ごとの「欲しいものリスト」から必要素材を自動計算する非公式ファンツールです。

GitHub Pages の静的ページだけで動くので費用は0円です（サーバー・DB・有料APIなし）。

## 機能

- **欲しいもの**: 武器・防具・護石タブで「＋欲しい」を押すと、必要な素材とお金を自動で合計。所持数を入れると残り数を計算。武器は「生産から全部」で派生元の強化素材もまとめて計算。
- **武器 / 防具 / 護石 / 珠 / 素材**: 名前・スキル・素材名・モンスター名で検索。素材には入手先と使い道を表示。
- **モンスター別ドロップ**: モンスターごとに、下位/上位・入手方法（剥ぎ取り・報酬・部位破壊・傷破壊など）別の素材と確率、弱点を表示。自分に足りない素材はハイライト。
- **人ごとのリスト**: 「だれのリスト？」で人を追加・切り替え。各自のブラウザ（localStorage）に保存。
- **共有**: 「共有URLをコピー」で送ったURLを開くと、そのリストを取り込めます（スマホ⇔PCの引っ越しにも）。
- **みんな**: 登録した全員の足りない素材をモンスター別にまとめて表示。

## 公開方法（GitHub Pages）

Settings → Pages → Build and deployment で「Deploy from a branch」、Branch を `main` / `/(root)` にして Save。

## データの更新

データは [MHDB (mhdb-wilds-data)](https://github.com/LartTyler/mhdb-wilds-data) から生成した `data/mh-wilds.json` です。ゲームのアップデート後は次で更新できます。

```sh
git clone --depth 1 https://github.com/LartTyler/mhdb-wilds-data.git
python3 tools/build-mh-wilds-data.py mhdb-wilds-data/output/merged
```

MHDB に含まれない情報（採取・交易での入手、アーティア武器の生産ボーナス等）は表示されません。
