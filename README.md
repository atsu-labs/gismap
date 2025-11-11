# 函館市 災害受援用サイト

函館市 災害受援用サイトです。leaflet を使用した拠点地図と拠点の一覧を確認することができます。
同じ拠点情報を使用した[地理院地図](https://hakodate-keibou.github.io/gsimaps/)も利用できます。

## 機能

- **ベースマップの切り替え**

  - OpenStreetMap (OSM)
  - 国土地理院地図

- **ハザードマップオーバーレイ**

  - 津波ハザードマップ
  - 土石流警戒区域
  - 急傾斜地警戒区域
  - 地すべり警戒区域
  - 各レイヤーの表示/非表示の切り替え
  - 透過率（opacity）の調整（0-100%）

- **KML レイヤー表示**

  - `kml/`ディレクトリ内の KML ファイルを読み込んで地図上に表示
  - 各 KML ファイルを個別に表示/非表示の切り替えが可能
  - KML マーカーにポップアップ表示（名前・説明）
  - **各 KML レイヤーごとに異なる色のマーカーアイコンを自動適用**
    - 8 色のカラーパレット（赤、青、緑、オレンジ、紫、ティール、ダークオレンジ、グレー）
    - レイヤー一覧に色インジケーターを表示し、どの色が割り当てられているか一目で確認可能

- **現在地取得機能**（モバイル端末のみ）

  - ブラウザの Geolocation API を使用して現在地を取得
  - 地図左下の現在地ボタンをタップすると、GPS 等で現在地を表示
  - 現在地を地図の中心に移動し、青色のマーカーで表示
  - 位置情報の精度を示す円も表示
  - モバイル画面（768px 以下）でのみボタンが表示される

- **初期表示位置**: 函館市

## 使用方法

1. ブラウザで `index.html` を開く
2. 右上のコントロールパネルから以下の操作が可能：
   - ベースマップの選択（OSM または国土地理院）
   - 各種ハザードマップの表示/非表示
     - 津波ハザードマップ
     - 土石流警戒区域
     - 急傾斜地警戒区域
     - 地すべり警戒区域
   - KML レイヤーの個別表示/非表示
   - オーバーレイの透過率調整
3. モバイル端末では、左下の現在地ボタンをタップして現在地を表示可能
   - 初回タップ時に位置情報の使用許可を求められる場合があります
   - 位置情報がオフの場合は、端末の設定で有効にしてください

### KML ファイルの追加方法

1. `kml/`ディレクトリに KML ファイルを配置
2. `js/kml-loader.js`の`kmlGroups`オブジェクトに新しいファイルパスを追加:
   ```javascript
   const kmlGroups = {
     support: {
       title: "受援情報",
       files: [
         "kml/拠点【航空部隊】.kml",
         "kml/拠点【地上部隊】.kml",
         // ...既存のファイル
         "kml/your-file.kml", // 新しいファイルを追加
       ],
       // ...
     },
   };
   ```
3. アイコンと色をカスタマイズする場合は、同じファイル内の`iconNameMap`と`iconColorMap`を編集
4. ブラウザで再読み込みすると自動的に読み込まれ、個別のチェックボックスで制御できます

## データソース

- OpenStreetMap: https://www.openstreetmap.org/
- 国土地理院地図: https://maps.gsi.go.jp/
- 津波ハザードマップ: https://disaportaldata.gsi.go.jp/

## 技術スタック

- Leaflet 1.9.4
- Leaflet-omnivore 0.3.4 (KML/GPX/CSV/GeoJSON パーサー)
- HTML5/CSS3/JavaScript (ES6 Modules)
- Material Symbols Outlined（アイコン）

## プロジェクト構造

```
ReliefBaseMap/
├── index.html              # トップページ
├── map.html                # 地図表示ページ
├── list.html               # 拠点一覧ページ
├── README.md               # このファイル
├── AGENTS.md               # AI開発ガイドライン
├── .gitignore
├── css/
│   ├── common.css          # 共通スタイル
│   ├── map.css             # 地図ページ用スタイル
│   └── list.css            # 一覧ページ用スタイル
├── js/
│   ├── map.js              # 地図初期化とメイン処理
│   ├── ui-controls.js      # UI制御（トグルボタン、折り畳み等）
│   ├── kml-loader.js       # KMLファイル読み込み処理
│   ├── kml-parser.js       # KMLパース共通ユーティリティ
│   ├── list.js             # 一覧ページのメイン処理
│   ├── constants.js        # 共通定数・マッピング（DRY原則）
│   ├── http-client.js      # HTTP通信ユーティリティ
│   └── kml-config.js       # KMLグループ設定管理
└── kml/
    ├── README.md           # KMLファイル管理ドキュメント
    ├── 拠点【航空部隊】.kml
    ├── 拠点【地上部隊】.kml
    ├── 宿営可能地.kml
    ├── 前進拠点.kml
    ├── ヘリ離発着.kml
    ├── 医療機関.kml
    ├── 給油【航空部隊】.kml
    ├── 給油【地上部隊】.kml
    ├── 防火水槽.kml
    ├── 地上式.kml
    └── 地下式.kml
```

## コードの特徴

- **モジュール化**: 機能ごとに JavaScript ファイルを分離し、ES6 モジュールシステムを採用
- **DRY 原則**: 共通定数・マッピングを `constants.js` に一元化
- **関心の分離**: HTTP 処理、KML 設定、定数定義が明確に分離
- **保守性**: 関数を単一責任原則に従って分割し、コメントを日本語で記述
- **可読性**: 定数を明示的に定義し、マジックナンバーを排除
- **再利用性**: 共通ユーティリティ（http-client.js 等）が独立したモジュール

## 動作確認 (ローカル)

単にファイルをダブルクリックで開くと一部ブラウザでローカルファイルの読み込み制限により KML が読み込めない場合があります。以下のように簡易 HTTP サーバを使ってください。

### Python 3 が使える場合（推奨）

```bash
# カレントディレクトリを /home/atsu/ReliefBaseMap に移動してから実行
python3 -m http.server 8000
```

ブラウザで http://localhost:8000 を開く

### Node.js がある場合

```bash
npx http-server -c-1
```

同様にブラウザで提示されたローカルホストアドレスを開く

### 動作確認手順

1. 簡易 HTTP サーバを起動
2. ブラウザで http://localhost:8000 にアクセス
3. 「拠点地図」ボタンをクリック
4. 右上のコントロールパネルの「KML レイヤー」項目に各ファイルが表示され、チェックボックスをオンにすると地図上にマーカーが表示されます
5. 各 KML ファイルに割り当てられた Material Icon と色は、ファイル読み込み時に自動で適用されます。アイコンが表示されない場合は、ブラウザのコンソールを開いてエラーを確認してください
6. 変更を加えた場合はブラウザのキャッシュをクリアして再読み込みしてください（Shift+Reload が便利です）

## 開発ガイドライン

### コードスタイル

- コメントは日本語で記述
- 関数には JSDoc コメントを付ける
- 定数は大文字のスネークケースで定義（例：`HAKODATE_CENTER`）
- インデントは 4 スペース

### モジュール構成

#### メインモジュール

- [`map.js`](js/map.js): 地図の初期化、ベースマップ・オーバーレイレイヤーの管理
- [`ui-controls.js`](js/ui-controls.js): UI 制御（トグルボタン、折り畳みセクション等）
- [`kml-loader.js`](js/kml-loader.js): KML ファイルの読み込みとマーカー生成
- [`kml-parser.js`](js/kml-parser.js): KML 解析の共通ユーティリティ
- [`list.js`](js/list.js): 一覧ページのメイン処理と KML データ表示

#### 共通ユーティリティモジュール（リファクタリング後）

- [`constants.js`](js/constants.js): 共通定数・マッピングデータの集中管理

  - `MARKER_COLORS`: マーカー色パレット
  - `ICON_NAME_MAP`, `ICON_COLOR_MAP`: KML 別アイコン・色マッピング
  - `MAP_CONSTANTS`: 地図関連定数
  - `DIRECTORY_FILES`, `EXCLUDED_KEYWORDS`: ファイル管理定数

- [`http-client.js`](js/http-client.js): HTTP 通信ユーティリティ

  - `fetchWithTimeout()`: タイムアウト付き fetch
  - `getResponseText()`: キャッシュ対応レスポンス取得
  - `formatErrorMessage()`: エラーメッセージ統一フォーマット

- [`kml-config.js`](js/kml-config.js): KML グループ設定管理
  - `kmlGroups`: グループ定義（消防水利、受援情報）
  - `getAllKmlFiles()`, `getKmlGroup()` 等のヘルパー関数

### リファクタリングの特徴

**DRY 原則の適用**

- マッピングデータ（アイコン、色）と定数を `constants.js` に一元化
- 複数モジュール間での重複定義を排除し、保守性向上

**関心の分離**

- HTTP 処理を `http-client.js` に集約
- KML 設定を `kml-config.js` に管理
- 定数定義を `constants.js` に集中管理

**再利用性・テスト性**

- 共通ユーティリティが独立したモジュール
- 各機能が単体テスト可能な粒度に分割

### ユーティリティモジュールの使用例

#### constants.js の使用

```javascript
import { ICON_NAME_MAP, ICON_COLOR_MAP, MAP_CONSTANTS } from "./constants.js";

// マッピングデータの参照
const iconName = ICON_NAME_MAP["医療機関"]; // 'local_hospital'
const color = ICON_COLOR_MAP["医療機関"]; // '#f56454'

// 地図定数の使用
const [lat, lon] = MAP_CONSTANTS.HAKODATE_CENTER;
const zoom = MAP_CONSTANTS.DEFAULT_ZOOM; // 12
```

#### http-client.js の使用

```javascript
import { fetchWithTimeout, getResponseText, formatErrorMessage } from './http-client.js';

// タイムアウト付きfetch
const response = await fetchWithTimeout(url, { timeout: 10000 });

// キャッシュ対応テキスト取得
const text = await getResponseText(response, url);

// 統一されたエラーメッセージ
catch (error) {
    const message = formatErrorMessage(error);
    console.error(`エラー: ${message}`);
}
```

#### kml-config.js の使用

```javascript
import { kmlGroups, getAllKmlFiles, getKmlGroup } from "./kml-config.js";

// 全KMLファイルを取得
const allFiles = getAllKmlFiles(); // すべてのファイルパス

// グループ定義を取得
const supportGroup = getKmlGroup("support"); // 受援情報グループ

// グループのタイトルとファイル一覧
console.log(supportGroup.title); // '受援情報'
console.log(supportGroup.files); // ファイルパスの配列
```

### データフロー

**地図ページ（map.html）**:

```
constants.js (定数・マッピング定義)
    ↓
map.js (初期化)
    ↓
ui-controls.js (UI制御初期化)
    ↓
kml-config.js (グループ設定)
    ↓
kml-loader.js (KMLファイル読み込み)
    ↓ (http-client.jsがバックグラウンドで通信)
kml-parser.js (KML解析) ← omnivore.kml で自動解析
    ↓
Leaflet マーカー表示
```

**一覧ページ（list.html）**:

```
constants.js (定数・ファイル一覧)
    ↓
list.js (初期化)
    ↓
http-client.js (HTTP通信・キャッシュ管理)
    ↓
buildFileList() (表示対象ファイル決定)
    ↓
loadAndParseFiles() (複数ファイル読み込み)
    ↓
kml-parser.js (各ファイルの KML 解析)
    ↓
renderFileSection() (プレイスマーク表示)
```

### トラブルシューティング

#### KML ファイルが読み込まれない

1. ブラウザのコンソール（F12）でエラーメッセージを確認
2. ファイルパスが正しいか確認（`kml/`ディレクトリ内に存在するか）
3. ファイル名に日本語を含む場合は、URL エンコーディングが正しく行われているか確認
4. KML ファイルの XML 形式が正しいか確認（DTD バリデータで検証）
5. CORS エラーの場合は簡易 HTTP サーバを使用してください

#### アイコンが表示されない

1. Material Symbols Outlined の CDN 読み込みが成功しているか確認（ネットワークタブで確認）
2. [`ICON_NAME_MAP`](js/constants.js)に対応するアイコン名が設定されているか確認
3. アイコン名が[Material Symbols](https://fonts.google.com/icons)に存在するか確認
4. `kml-loader.js` で正しくマッピングが参照されているか確認

#### 現在地が表示されない（モバイル）

1. HTTPS またはローカルホスト（localhost）でのみ Geolocation API が動作します
2. ブラウザの位置情報の使用許可が有効か確認
3. 端末の位置情報サービスが有効か確認

#### パフォーマンスが低い

1. 大量のプレイスマーク（1000 件以上）がある場合は、ズーム段階ごとに表示を制限することを検討
2. オーバーレイレイヤーの透過率を高すぎないように設定（レンダリング負荷軽減）
3. ブラウザのデベロッパーツールでパフォーマンスプロファイルを分析

## 開発時の注意事項

- [AGENTS.md](AGENTS.md)に定められた開発ガイドラインを必ず確認
- PR 作成時は変更内容とテスト方法を記載
- 新機能追加時はこの README も併せて更新

## ライセンス

プロジェクト固有のライセンス情報はここに記載してください
