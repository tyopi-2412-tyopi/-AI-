# フィジカルAI 調査レポート

調査日: 2026年10月12日

> 注意: 報道・ブログ・調査会社の発表をもとにまとめています。数値や日付には出典によって食い違いがあるものもあり、一次資料（企業の公式発表・政府資料）で確認できていない項目には「未確認」と書いています。

---

## 1. フィジカルAIとは

フィジカルAI（Physical AI）は、生成AIや基盤モデルの技術を**現実の物理世界**に持ち込み、ロボットや機械が「見て・考えて・動く」ことを可能にするAIの総称です。

- **従来のロボット**: 決められた動作をプログラムで繰り返す（ティーチング型）。
- **フィジカルAI**: カメラ映像や言語の指示を受け取り、状況に応じて自分で動作を生成する。

中核となる技術は次の3つです。

| 技術 | 役割 | 代表例 |
|---|---|---|
| VLA（Vision-Language-Action）モデル | 画像＋言語指示を入力し、モーター指令を出力する | NVIDIA Isaac GR00T N、Physical Intelligence π0、Figure Helix、Gemini Robotics |
| ワールドモデル | 物理世界の動きを予測・生成し、学習用データやシミュレーションに使う | NVIDIA Cosmos |
| シミュレーション／デジタルツイン | 実機の代わりに仮想空間で大量に学習・検証する | NVIDIA Isaac Sim / Omniverse |

## 2. 主要プレイヤーと最新動向

### NVIDIA（プラットフォーム）
- **CES 2026（1月）**: 物理世界向けの推論VLM「Cosmos Reason 2」（2B／8B）を公開。ジェンスン・フアン氏は「ロボティクスのChatGPTモーメント」と表現。
- **GTC 2026（3月）**: 新しいCosmosワールドモデル、Isaacシミュレーションフレームワーク、Isaac GR00T Nモデル群を発表。ABB、FANUC、Figure、KUKA、Skild AIなどがパートナー。
- **GTC Taipei（6月）**: オープンなマルチモーダル基盤モデル「Cosmos 3」と、人型ロボット開発プラットフォーム「Isaac GR00T」の新展開を発表（学習データ量やライセンスなどの詳細は未確認）。
- オープンなVLAモデル「Isaac GR00T N1.7」が有力モデルの一つとして挙げられている。

### Google DeepMind
- **Gemini Robotics 1.5 / Gemini Robotics-ER 1.5**（2025年9月発表）。
  - ER 1.5 が計画を立てる「頭脳」、1.5 がそれを動作に変換する VLA という2段構成。
  - 「動く前に考える」推論過程を持ち、ロボット間でスキルを転移できる（ALOHA2 → Franka、Apptronik Apollo）。
  - ER 1.5 は Gemini API で利用可能、1.5 は一部パートナー限定。

### スタートアップ
- **Physical Intelligence**: 汎用ロボット基盤モデル π0 を開発し、重みをオープンソース化。評価額56億ドルの資金調達に続き、2026年3月には評価額110億ドル超で約10億ドルの調達を協議中と報道（成立は未確認）。
- **Figure AI**: VLA「Helix」を開発。2026年1月に統合制御システム「Helix 02」を発表。Series C で評価額390億ドル（時期は資料により2025年9月／2026年で食い違い）。
- **Skild AI**: ロボット用基盤モデル開発のために14億ドルを調達したと報じられている。

### ヒューマノイド量産の動き
- **Tesla Optimus**: フリーモントで初期生産に入ったとの報道。長期目標は年100万台。2025年半ばの生産数は数百台と、当初目標を下回っていたとの指摘もある。Gen 3 が2026年に公開予定。
- **Boston Dynamics Atlas**: 量産版が Hyundai の工場で商用稼働を開始。
- **UBTECH（中国）**: 2026年に産業用途で5,000台超の納入を見込む。
- **中国の存在感**: 世界のヒューマノイド出荷の約9割を中国が占め、米国企業は5%未満とする分析（ITIF）がある。一方、VLAモデルなど高付加価値層は米国のラボが先行しているとされる。

## 3. 日本の動向

- **政府方針**: フィジカルAIの開発と社会実装に、**2040年度までに官民で総額10兆5,000億円**を投じ、**2030年度までに1兆5,000億円規模**の予算措置を講じる方針と報道（方針段階）。
- **市場目標**: 経済産業省は、ヒューマノイドを含むAIロボティクス市場が**2040年に世界で約60兆円**に成長すると試算。日本は**世界シェア3割超・約20兆円**の獲得を目指す。
- **導入目標**: 製造など**18分野**に導入目標を設ける方針。
- **強み**: 産業用ロボットで日本メーカーは世界市場の約7割（2022年）を占めるとされる。FANUC などは NVIDIA と連携。
- **背景**: 人口減少による人手不足。三菱総合研究所は、AIとロボットの社会実装で2040年にかけて労働力不足が緩和されると分析。
- **業界イベント**: 2026年は「フィジカルAI元年」とされ、ものづくりワールド東京で「フィジカルAI展」、「フィジカルAI Summit」が初開催。

## 4. 市場規模

| 出典 | 対象 | 規模 |
|---|---|---|
| 経済産業省（試算） | AIロボティクス市場（世界） | 2040年に約60兆円 |
| Mordor Intelligence | フィジカルAI市場（世界） | 2025年 50.6億ドル → 2026年 71.1億ドル → 2031年 348.9億ドル |

※ 定義や前提が異なるため、単純比較はできません。

## 5. 課題

1. **データ不足**: テキストと違い、ロボットの動作データはネット上に少ない。シミュレーションやワールドモデルによる合成データで補う動きが中心。
2. **シミュレーションと現実のギャップ（Sim-to-Real）**: 仮想空間で学んだ動作が実機でそのまま通用しない。
3. **安全性と信頼性**: 人と同じ空間で動くため、誤動作が物理的な事故につながる。
4. **コストと費用対効果**: ヒューマノイドは、AMR（自律移動ロボット）やコンベアなど既存の自動化手段と直接競合する。
5. **過熱感**: 2030年まではヒューマノイドは過渡期にとどまり、当面は物流・製造でのパイロット導入が中心という慎重な見方もある。

## 6. まとめと今後の注目点

- 2026年は、フィジカルAIが**デモから初期の商用展開へ移る年**になっている。
- 技術の焦点は **VLAモデル＋ワールドモデル＋シミュレーション** の組み合わせ。NVIDIA がプラットフォームを押さえ、Google DeepMind・スタートアップがモデルで競う構図。
- 量産台数では中国が先行し、モデル層では米国が先行。日本は**産業用ロボットの強みと国家戦略**で巻き返しを狙う。
- 今後の注目点:
  - Tesla Optimus・Figure・UBTECH などの実際の出荷台数
  - オープンモデル（GR00T、π0、Cosmos）の普及度
  - 日本政府の予算措置の具体化と18分野の導入目標

---

## 出典

- [What Is Physical AI? How AI Is Powering Robots and the Real World (fast.io)](https://fast.io/resources/physical-ai-guide-2026/)
- [Physical AI Was Everywhere at CES ’26. But What Happens Next? (EMSNow)](https://www.emsnow.com/?p=52674)
- [Humanoids & Robotics in 2026: Early Reality of the “Physical AI” Era (EE Times Asia)](https://www.eetasia.com/?p=72580)
- [Physical AI: investing in humanoids, drones and the automation of the real economy (WisdomTree)](https://www.wisdomtree.com/gb/insights/blog/physical-ai-investing-in-humanoids-drones-and-the-automation-of-the-real-economy)
- [Humanoid robots & physical AI 2026 (entagl)](https://www.entagl.com/blog/humanoid-robots-physical-ai-2026)
- [NVIDIA and Global Robotics Leaders Take Physical AI to the Real World (NVIDIA IR)](https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-and-Global-Robotics-Leaders-Take-Physical-AI-to-the-Real-World)
- [NVIDIA GTC 2026 (Robotics 24/7)](https://www.robotics247.com/article/nvidia-gtc-2026-nvidia-global-robotics-leaders-look-to-take-physical-ai-to-the-real-world)
- [NVIDIA Cosmos Announcements at CES 2026 (NVIDIA Developer Forums)](https://forums.developer.nvidia.com/t/nvidia-cosmos-announcements-at-ces-2026/356629)
- [TVBS News: GTC Taipei 2026](https://news.tvbs.com.tw/tech/3218834)
- [NVIDIA Cosmos 3 / Isaac GR00T (buildfastwithai)](https://www.buildfastwithai.com/blogs/nvidia-cosmos-3-isaac-groot-physical-ai-2026)
- [AI Robotics Lab in Talks to Nab $1 Billion at $11 Billion Value (Bloomberg Law)](https://news.bloomberglaw.com/artificial-intelligence/ai-robotics-lab-in-talks-to-nab-1-billion-at-11-billion-value)
- [Physical Intelligence: Company Profile (robotics.press)](https://www.robotics.press/news/physical-intelligence-company-profile/)
- [Figure AI vs Physical Intelligence (metavert)](https://metavert.io/compare/figure-ai-vs-physical-intelligence)
- [Industrial AI | January 2026 (Substack)](https://fabiobottacci.substack.com/p/industrial-ai)
- [Gemini Robotics 1.5 enables agentic experiences (The Robot Report)](https://www.therobotreport.com/gemini-robotics-1-5-enables-agentic-experiences-explains-google-deepmind/)
- [Google DeepMind brings agentic AI capabilities into robots (The Decoder)](https://the-decoder.com/google-deepmind-brings-agentic-ai-capabilities-into-robots-with-two-new-gemini-models/)
- [【2026年はフィジカルAI元年】フィジカルAI展 初開催 (PR TIMES)](https://prtimes.jp/main/html/rd/p/000002089.000026157.html)
- [フィジカルAI Summit初開催 (公募ガイド)](https://koubo.jp/article/116562)
- [ニュースイッチ（フィジカルAI関連記事）](https://newswitch.jp/p/49529)
- [東洋経済オンライン](https://toyokeizai.net/articles/-/926251)
- [フィジカルAI市場 成長予測 2026-2031年 (レスポンス／DreamNews)](https://response.jp/release/dreamnews/20260727/298680.html)
