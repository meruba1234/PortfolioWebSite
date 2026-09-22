# AGENTS.md — このリポジトリで作業するときの前提

ビルド不要の静的サイト。GitHub Pages が `main` ブランチをそのまま配信している。

公開URL: https://meruba1234.github.io/PortfolioWebSite/

---

## 最重要: 直接編集してはいけないファイルがある

**一部のページは、別の非公開リポジトリ `meruba1234/life-os` のスクリプトで
生成している。** 生成されたページを直接編集しても、次の生成で上書きされて消える。

| ファイル | 編集してよいか | 生成元 |
|---|---|---|
| `career.html` | **不可** | life-os `scripts/portfolio/gen_career.py` |
| `tech-notes.html` | **不可** | life-os `scripts/portfolio/gen_notes.py` |
| `tech-notes/note-*.html`（59本） | **不可** | 同上 |
| `business-cases/case-12.html` 〜 `case-15.html` | **不可** | life-os `scripts/portfolio/gen_cases.py` |
| 上記以外の `*.html` | 可 | 手書き |
| `style.css` `main.js` | 可 | 手書き |

**`style.css` や共通のメタタグ・ナビゲーションを変えた場合**、生成スクリプト3本
すべてに同じ変更を入れないと、次の生成で巻き戻る。過去に2回この事故が起きている。

life-os にアクセスできない場合は、生成対象ファイルには触らず、その旨を報告すること。

---

## 構成

```
portfolio.html        トップ（手書き）
index.html            portfolio.html へのリダイレクト（手書き）
career.html           職務経歴（生成物）
business-cases.html   ケーススタディ一覧（手書き）
  business-cases/     case-01〜15（case-12〜15 は生成物）
achievements.html     実績データ（手書き）
timeline.html         経歴（手書き）
itskills.html         ITスキル（手書き）
tech-notes.html       技術ノート一覧（生成物）
  tech-notes/         note-*.html 59本（生成物）
contact.html          お問い合わせ（手書き）
android-app.html      学習成果物アプリの紹介（手書き）
style.css / main.js   全ページ共通
og-image.png / sitemap.xml / robots.txt
```

全85ページ。

---

## 動作確認のしかた

ビルドは不要。ブラウザで HTML を開けば確認できる。

life-os にアクセスできるなら、検査スクリプトを使う。

```bash
PORTFOLIO_DIR=/path/to/PortfolioWebSite python3 /path/to/life-os/scripts/portfolio/check_site.py
# → 「検査対象: 85 ページ / 問題なし」になること
```

検査項目: 社内固有名の残存、リンク切れ、タグの対応、canonical/OGP/テーマ初期化の
有無、ナビの一致、タイトル重複、sitemap との整合。

### 公開されたかの確認

`main` に push すると GitHub Pages が再ビルドする（1〜2分）。

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://meruba1234.github.io/PortfolioWebSite/career.html
# 200 なら反映済み
```

---

## 変更するときに守ること

| ルール | 理由 |
|---|---|
| **ファイルを削除しない** | 所有者の明示的な指示 |
| 社内固有名を書かない | 取引先名・社内システム名・サーバー名・IPアドレス・共有フォルダのパスは一般名に置き換える方針。対応表は life-os 側にある |
| 数値は「本人の自己集計」と明記する | 第三者が検証した数値ではないため |
| 在職期間は 2025年9月〜2026年8月 | 退職済み。現在形で書かない |
| 削減時間・削減額を断定しない | 計測条件と算定根拠を確認できるものだけ扱う方針 |

### 表示品質について（過去に不具合があった箇所）

以下は修正済みだが、同種の変更をするときは注意する。

- **印刷時に背景は出ない。** 背景ありきの白文字を置くと紙の上で消える。
  `@media print` で文字色を戻すこと（`style.css` の末尾に既存の設定あり）
- **コントラストは WCAG AA（4.5:1）を満たすこと。** ライト・ダーク両方
- **長いURLやコマンドは折り返すこと。** インライン `code` に
  `overflow-wrap: anywhere` を指定済み
- **フェードイン（`.reveal`）は長いページで解除されないことがある。**
  `main.js` に3秒のフォールバックを入れてある

---

## 現在の状態

サイトは最新の内容が公開済み（2026-09-22 時点）。
ケーススタディ15件、技術ノート59本、職務経歴ページあり。

## 残っている作業

`TASKS.md` を参照。
