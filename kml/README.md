# KMLファイルディレクトリ

このディレクトリにはKMLファイルが保存されます。

## ファイル一覧

- `sample.kml`: 函館市の主要スポット（サンプル）
  - 函館駅
  - 五稜郭
  - 函館山
  - 赤レンガ倉庫

## KMLファイルの追加方法

1. このディレクトリに新しいKMLファイルを配置します
2. `../index.html`の`kmlFiles`配列に新しいファイルパスを追加します:
   ```javascript
   const kmlFiles = ['kml/sample.kml', 'kml/your-new-file.kml'];
   ```
3. ブラウザで再読み込みすると、自動的にKMLファイルが読み込まれ、地図上に表示されます

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
