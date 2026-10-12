// 収集元と関連キーワードの定義

const gnews = (q, lang) =>
  lang === "ja"
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:1d")}&hl=ja&gl=JP&ceid=JP:ja`
    : `https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:1d")}&hl=en-US&gl=US&ceid=US:en`;

// focused: true のフィードはキーワード一致がなくても採用する（検索結果そのものが対象テーマのため）
export const FEEDS = [
  { name: "Google News: フィジカルAI", url: gnews("フィジカルAI", "ja"), focused: true },
  { name: "Google News: ヒューマノイド", url: gnews("ヒューマノイド ロボット", "ja"), focused: true },
  { name: "Google News: ロボット AI", url: gnews("ロボット 生成AI", "ja"), focused: true },
  { name: "Google News: physical AI", url: gnews('"physical AI"', "en"), focused: true },
  { name: "Google News: humanoid robot", url: gnews('"humanoid robot"', "en"), focused: true },
  { name: "Google News: robot foundation model", url: gnews('robot "foundation model" OR VLA', "en"), focused: true },
  { name: "The Robot Report", url: "https://www.therobotreport.com/feed/" },
  { name: "IEEE Spectrum Robotics", url: "https://spectrum.ieee.org/feeds/topic/robotics.rss" },
  { name: "NVIDIA Blog", url: "https://blogs.nvidia.com/feed/" },
  { name: "arXiv cs.RO", url: "https://rss.arxiv.org/rss/cs.RO", maxItems: 8 },
];

// 関連度スコアに使うキーワード（小文字で比較）
export const KEYWORDS = [
  "physical ai", "フィジカルai", "embodied", "身体性",
  "humanoid", "ヒューマノイド", "人型ロボット",
  "robot", "robotics", "ロボット",
  "vision-language-action", "vla", "world model", "ワールドモデル", "foundation model", "基盤モデル",
  "gr00t", "groot", "cosmos", "isaac", "omniverse",
  "optimus", "figure ai", "helix", "physical intelligence", "π0", "pi0", "skild",
  "gemini robotics", "boston dynamics", "atlas", "unitree", "ubtech", "agility", "digit", "apptronik",
  "fanuc", "ファナック", "安川", "yaskawa", "kawasaki", "川崎重工",
  "sim-to-real", "teleoperation", "遠隔操作", "manipulation", "マニピュレーション",
  "autonomous", "自律", "自動運転", "drone", "ドローン", "amr",
];
