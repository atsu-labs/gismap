# KMLファイルディレクトリ

このディレクトリにはKMLファイルが保存されます。

## ファイル一覧

現在のKMLファイル:
- `baseAir.kml`: 航空基地
- `baseGround.kml`: 地上基地
- `camp.kml`: キャンプ地
- `forwardBaseGround.kml`: 前方地上基地
- `helicopterLanding.kml`: ヘリコプター着陸地点
- `medical.kml`: 医療施設
- `refuelingAir.kml`: 航空給油地点
- `refuelingGround.kml`: 地上給油地点
- `防火水槽.kml`: 防火水槽（01防火水槽ディレクトリから統合、616プレースマーク）
- `地上式.kml`: 地上式消火栓（02地上式ディレクトリから統合、2448プレースマーク）
- `地下式.kml`: 地下式消火栓（03地下式ディレクトリから統合、39プレースマーク）

## KMLファイルの追加方法

1. このディレクトリに新しいKMLファイルを配置します
2. `../index.html`の`kmlFiles`配列に新しいファイルパスを追加します:
   ```javascript
   const kmlFiles = [
       'kml/baseAir.kml',
       // ...既存のファイル
       'kml/your-new-file.kml'
   ];
   ```
3. ブラウザで再読み込みすると、自動的にKMLファイルが読み込まれ、個別のチェックボックスで制御できます

## KMLファイルの形式

KMLファイルは以下の構造に従う必要があります:

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

## 参考リンク

- [KML リファレンス](https://developers.google.com/kml/documentation/kmlreference)
- [Google Earth でKMLファイルを作成](https://www.google.com/earth/)
