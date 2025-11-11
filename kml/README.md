# KML ファイルディレクトリ

このディレクトリには災害受援拠点地図で使用する KML ファイルが保存されます。

## 現在の KML ファイル一覧

### 消防水利（ズーム 16 以上で表示）

- `防火水槽.kml`: 防火水槽
  - アイコン: `crop_square` | 色: `#498aeb` (青)
- `地上式.kml`: 地上式消火栓
  - アイコン: `fire_hydrant` | 色: `#ebcb3d` (黄)
- `地下式.kml`: 地下式消火栓
  - アイコン: `poker_chip` | 色: `#f58552` (オレンジ)

### 受援情報（常時表示）

- `拠点【航空部隊】.kml`: 航空部隊用拠点
  - アイコン: `flight` | 色: `#59b65e` (緑)
- `拠点【地上部隊】.kml`: 地上部隊用拠点
  - アイコン: `fire_truck` | 色: `#6669f7` (紫)
- `宿営可能地.kml`: 宿営可能地
  - アイコン: `hotel` | 色: `#f39c12` (オレンジ)
- `前進拠点.kml`: 前進拠点
  - アイコン: `flag` | 色: `#e67e22` (ダークオレンジ)
- `ヘリ離発着.kml`: ヘリコプター離発着地点
  - アイコン: `helicopter` | 色: `#7f8892` (グレー)
- `医療機関.kml`: 医療機関
  - アイコン: `local_hospital` | 色: `#f56454` (赤)
- `給油【航空部隊】.kml`: 航空部隊用給油地点
  - アイコン: `local_gas_station` | 色: `#16a085` (ティール)
- `給油【地上部隊】.kml`: 地上部隊用給油地点
  - アイコン: `local_gas_station` | 色: `#2980b9` (濃青)

## KML ファイル追加方法

1. 新規 KML ファイルを本ディレクトリに配置
2. `../js/kml-config.js` の `kmlGroups` オブジェクトに以下を追加:
   ```javascript
   const kmlGroups = {
     shoubou: {
       /* ... 既存 ... */
     },
     support: {
       title: "受援情報",
       files: [
         // 既存のファイル...
         "kml/your-new-file.kml", // ← ここに追加
       ],
       // ...
     },
   };
   ```
3. `../js/constants.js` の `ICON_NAME_MAP` と `ICON_COLOR_MAP` を編集:

   ```javascript
   export const ICON_NAME_MAP = {
     // ... 既存のマッピング ...
     "your-new-file": "place", // ← ここに追加（Material Icon名）
   };

   export const ICON_COLOR_MAP = {
     // ... 既存のマッピング ...
     "your-new-file": "#e74c3c", // ← ここに追加（色コード）
   };
   ```

4. ブラウザで再読み込み

## KML ファイル形式

KML ファイルは以下の構造に従う必要があります:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>ファイル名</name>
    <description>説明</description>

    <Placemark>
      <name>場所の名前</name>
      <description>場所の説明</description>
      <Point>
        <coordinates>経度,緯度,高度</coordinates>
      </Point>
    </Placemark>

    <!-- 他のPlacemarkを追加可能 -->
  </Document>
</kml>
```

### 重要な注意事項

- **座標形式**: `経度,緯度,高度` の順序（高度は省略可能）
- **エンコーディング**: UTF-8 で保存
- **文字エンコーディング**: 日本語も含めて正しく処理されることを確認
- **座標系**: WGS84（EPSG:4326）を使用

## トラブルシューティング

### KML がブラウザで読み込めない

- XML の文法チェック：[オンライン XML バリデータ](https://www.w3schools.com/xml/xml_validator.asp)を使用
- ファイルが UTF-8 で保存されているか確認
- コンソールでエラーメッセージを確認
- `kml-loader.js` でファイルが正しくロードされているか確認

### プレイスマークが表示されない

- `<Point>` タグ内の `<coordinates>` が正しい形式か確認（経度,緯度）
- 座標値が有効な範囲内か確認（緯度: -90〜90, 経度: -180〜180）
- プレイスマーク内に `<name>` または `<description>` が含まれているか確認
- `kml-config.js` でグループが正しく定義されているか確認

### アイコンや色が表示されない

- `constants.js` の `ICON_NAME_MAP` や `ICON_COLOR_MAP` にファイル名が登録されているか確認
- Material Icon 名が正しいか[Material Symbols](https://fonts.google.com/icons)で確認
- ブラウザコンソール（F12）でエラーメッセージを確認

## モジュール構成（リファクタリング後）

KML ファイルのマッピングとアイコン設定は以下のモジュールで管理されます：

- **`../js/kml-config.js`**: KML グループ定義の集中管理
- **`../js/constants.js`**: アイコン名・色マッピングデータ（`ICON_NAME_MAP`, `ICON_COLOR_MAP`）
- **`../js/kml-loader.js`**: これらの定義を読み込んでマーカーを生成

新しい KML ファイルを追加する際は、これら 3 つのファイルを確認・編集してください。

## 参考リンク

- [KML リファレンス](https://developers.google.com/kml/documentation/kmlreference)
- [Google Earth で KML ファイルを作成](https://www.google.com/earth/)
- [QGIS での KML エクスポート](https://qgis.org/)
- [Material Symbols（アイコン一覧）](https://fonts.google.com/icons)
