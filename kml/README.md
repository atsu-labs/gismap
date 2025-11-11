# KML ファイルディレクトリ

このディレクトリには災害受援拠点地図で使用する KML ファイルが保存されます。

## 現在の KML ファイル一覧

### 消防水利（ズーム 16 以上で表示）

- `防火水槽.kml`: 防火水槽（616 件）
- `地上式.kml`: 地上式消火栓（2448 件）
- `地下式.kml`: 地下式消火栓（39 件）

### 受援情報（常時表示）

- `拠点【航空部隊】.kml`: 航空部隊用拠点
- `拠点【地上部隊】.kml`: 地上部隊用拠点
- `宿営可能地.kml`: 宿営可能地
- `前進拠点.kml`: 前進拠点
- `ヘリ離発着.kml`: ヘリコプター離発着地点
- `医療機関.kml`: 医療機関
- `給油【航空部隊】.kml`: 航空部隊用給油地点
- `給油【地上部隊】.kml`: 地上部隊用給油地点

## KML ファイル追加方法

1. 新規 KML ファイルを本ディレクトリに配置
2. `../js/kml-loader.js` の `kmlGroups` オブジェクトに以下を追加:
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
3. 必要に応じて `iconNameMap` と `iconColorMap` を編集
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

### プレイスマークが表示されない

- `<Point>` タグ内の `<coordinates>` が正しい形式か確認（経度,緯度）
- 座標値が有効な範囲内か確認（緯度: -90〜90, 経度: -180〜180）
- プレイスマーク内に `<name>` または `<description>` が含まれているか確認

## 参考リンク

- [KML リファレンス](https://developers.google.com/kml/documentation/kmlreference)
- [Google Earth で KML ファイルを作成](https://www.google.com/earth/)
- [QGIS での KML エクスポート](https://qgis.org/)
