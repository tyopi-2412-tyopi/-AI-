# フィジカルAI デイリー

フィジカルAIのニュースを**毎日自動で集め、AIで記事（ノート）にし、サイトとnoteで公開して収益化する**ための仕組みです。

## 全体の流れ

毎朝 6:47（日本時間）に GitHub Actions が次の処理を実行します。

1. **収集**（`pipeline/collect.js`）: Google ニュース、The Robot Report、IEEE Spectrum、NVIDIA Blog、arXiv などのRSSから、フィジカルAIに関係するニュースを集めます。キーワードで関連度を判定し、前日までに扱った記事は除きます。結果は `data/raw/<日付>.json` に保存します。
2. **記事化**（`pipeline/write.js`）: 集めたニュースを Claude に渡し、次の2つに分けた記事を書かせます。
   - **無料部分**: 今日の3行まとめ、注目ニュース（出典リンク付き）
   - **有料部分**: 深掘り分析、ビジネス・投資への示唆、日本企業への影響、今後のウォッチポイント
3. **公開**（`pipeline/build.js`）: 公開サイトを生成し、GitHub Pages にデプロイします。
   - トップページ（最新号とバックナンバー）、各日の記事ページ、RSSフィード
   - ノートアプリ（`/app/`）。「日次ノートを取り込む」で毎日の記事をノートとして保存できます
4. **note用原稿**: 有料部分を含む完全版の原稿を、Actions の成果物 `note-drafts` として30日間保存します。

## 収益化の仕組み

| 収益源 | 仕組み | 設定項目（`config/monetization.json`） |
|---|---|---|
| note の有料記事 | 完全版の原稿を note に投稿し、有料ラインより下を販売。サイトの各記事に「続きを読む」ボタンを表示 | `noteProfileUrl`, `paidPriceYen` |
| note メンバーシップ | 毎日の深掘り分析を月額で読める導線を表示 | `noteMembershipUrl` |
| ニュースレター | 無料登録への導線（読者リストを育てる） | `newsletterUrl` |
| 広告 | Google AdSense の広告枠を記事下に表示 | `adsenseClientId` |
| アフィリエイト | 関連書籍・講座などのリンク枠 | `affiliateLinks`（`{"label","url","note"}` の配列） |
| スポンサー | フッターに広告掲載の問い合わせ先を表示 | `sponsorContactUrl` |

空欄の項目は表示されません。各記事のフロントマターに `noteUrl: "https://note.com/..."` を追記すると、その日の「続きを読む」ボタンはその記事に直接リンクします（未設定ならプロフィールへリンク）。

> **有料部分の扱い**: 既定（`"commitPaidContent": false`）では、有料部分はリポジトリにもサイトにも載せず、Actions の成果物だけに保存します。リポジトリが公開状態だと有料部分も誰でも読めてしまうためです。リポジトリを非公開にしていて、サイトでも全文を見せたい場合だけ `true` にしてください。

## セットアップ

1. このブランチを `main` にマージします（スケジュール実行はデフォルトブランチでのみ動きます）。
2. **Claude API キー**: リポジトリの Settings → Secrets and variables → Actions で、`ANTHROPIC_API_KEY` を登録します。キーがない場合は、見出しとリンクだけの簡易版になります（有料部分は作られません）。
3. **GitHub Pages**: Settings → Pages の Source を「GitHub Actions」にします。
4. **収益化の設定**: `config/monetization.json` に、note のURLなどを記入します。公開URLが決まったら `siteUrl` も入れてください（RSS と canonical に使います）。
5. Actions タブの「フィジカルAI 日次ノート」で **Run workflow** を押すと、すぐに1回実行できます。

## 毎日の運用（note への投稿）

1. Actions の最新の実行結果を開き、成果物 `note-drafts` をダウンロードします。
2. `<日付>.md` の1行目をタイトルに、残りを note の本文に貼り付けます。
3. 「▼ ここから有料」の位置に有料エリアの線を引き、価格を設定して公開します。
4. （任意）`content/daily/<日付>.md` のフロントマターに `noteUrl` を追記すると、サイトから直接その記事に誘導できます。

note には記事を自動投稿できる公式APIがないため、投稿だけは手作業です。

## ローカルで動かす

```sh
npm install
npm test                                     # パーサーなどのテスト
ANTHROPIC_API_KEY=sk-... npm run daily       # 収集 → 記事化 → サイト生成
npx serve site                               # 生成されたサイトを確認
```

- 使うモデルは環境変数 `CLAUDE_MODEL` で変えられます（既定は `claude-opus-5-5`）。
- `DATE=2026-10-12` のように指定すると、その日付で再実行できます。
- 収集元やキーワードは `pipeline/sources.js` で変更できます。

## コスト

1日1回、Claude に数十件のニュース（数千〜1万トークン程度）を渡し、記事を1本書かせます。費用の目安は1日数十円程度です。GitHub Actions と GitHub Pages は、公開リポジトリなら無料枠の範囲で動きます。

## そのほかのファイル

- `report/physical-ai-report.md` — フィジカルAIの調査レポート（2026年10月時点）
- `app/` — ノートアプリ。`app/index.html` をブラウザで直接開いても使えます。ノートはブラウザの中に保存されます。レポートを更新したら `npm run seed` で、アプリに埋め込むデータを作り直してください。
