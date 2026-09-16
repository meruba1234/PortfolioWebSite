# SkillShowcase — 業務改善ポートフォリオ

社内SEとして担当した業務改善・システム開発の記録を公開しているポートフォリオサイトです。

**公開先**: https://meruba1234.github.io/PortfolioWebSite/

---

## 掲載している内容

| ページ | 内容 |
|--------|------|
| [ホーム](https://meruba1234.github.io/PortfolioWebSite/portfolio.html) | 仕事の進め方と主な実績 |
| [職務経歴](https://meruba1234.github.io/PortfolioWebSite/career.html) | 職務要約、担当業務、技術スキルの一覧 |
| [業務改善実績](https://meruba1234.github.io/PortfolioWebSite/business-cases.html) | ケーススタディ 15件。背景・課題、実装、投入工数、得られた学び |
| [実績データ](https://meruba1234.github.io/PortfolioWebSite/achievements.html) | コミット記録、案件ごとの投入工数、Git 導入前の開発記録 |
| [経歴](https://meruba1234.github.io/PortfolioWebSite/timeline.html) | 職業訓練から社内SEの実務まで |
| [ITスキル](https://meruba1234.github.io/PortfolioWebSite/itskills.html) | 扱った技術と、スキル記載の基準 |
| [技術ノート](https://meruba1234.github.io/PortfolioWebSite/tech-notes.html) | 業務で調べた内容を分野別に整理した学習ノート 59本 |
| [アプリ紹介](https://meruba1234.github.io/PortfolioWebSite/android-app.html) | 学習時に制作した Android アプリ QuizVoyage |
| [お問い合わせ](https://meruba1234.github.io/PortfolioWebSite/contact.html) | 連絡先 |

---

## 掲載方針

**社内固有の情報は載せていません。** 取引先名、社内システム名、サーバー名、IPアドレス、
共有フォルダのパスなどは、一般的な名称に置き換えたうえで掲載しています
（例: 「取引先A」「社内チャット」「自動化基盤サーバー」）。

**数値は自己集計です。** コミット数・投入工数・処理件数は本人の記録に基づくもので、
第三者が検証した数値ではありません。その旨は各ページにも明記しています。
作業時間や費用の削減額は、計測条件と算定根拠を確認できるものだけを扱う方針としています。

**在職中の取組です。** 業務事例は 2025年9月〜2026年8月 の在職期間中のものです。
現在の稼働状況や、全工程の完了を示すものではありません。

---

## 技術構成

ビルド不要の静的サイトです。GitHub Pages でそのまま配信しています。

- HTML / CSS / JavaScript（フレームワーク・依存パッケージなし）
- ライト / ダークテーマ対応（設定は `localStorage` に保存）
- レスポンシブ対応（1000px 以下はハンバーガーメニュー）
- Content-Security-Policy を各ページに設定、外部リソースの読み込みなし

```
portfolio.html        トップ
career.html           職務経歴
business-cases.html   ケーススタディ一覧
  business-cases/     各ケース (case-01 〜 case-15)
tech-notes.html       技術ノート一覧
  tech-notes/         各ノート (note-*.html)
style.css / main.js   全ページ共通
og-image.png          リンク共有時のプレビュー画像
sitemap.xml / robots.txt
```

技術ノートの HTML は、別の非公開リポジトリで管理している Markdown のノートから
生成しています。生成時に社内固有名の置換と、置換漏れの検査を行っています。

---

## 配布ファイルについて

学習時に制作した Android アプリの APK を同梱しています。
ダウンロード後は [`SHA256SUMS.txt`](SHA256SUMS.txt) と照合して、
ファイルが改ざんされていないことを確認してください。

```bash
# macOS / Linux
shasum -a 256 QuizVoyage.apk

# Windows (PowerShell)
Get-FileHash .\QuizVoyage.apk -Algorithm SHA256
```

---

## お問い合わせ

採用選考・お仕事のご相談は、[お問い合わせページ](https://meruba1234.github.io/PortfolioWebSite/contact.html)
に記載の連絡先までお願いします。ケーススタディや技術ノートの内容についてのご質問も歓迎します。
