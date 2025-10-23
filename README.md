# gismap

Leafletを使用した地図表示サイト

## 機能

- **ベースマップの切り替え**
  - OpenStreetMap (OSM)
  - 国土地理院地図

- **津波ハザードマップオーバーレイ**
  - 表示/非表示の切り替え
  - 透過率（opacity）の調整（0-100%）

## 使用方法

1. ブラウザで `index.html` を開く
2. 右上のコントロールパネルから以下の操作が可能：
   - ベースマップの選択（OSMまたは国土地理院）
   - 津波ハザードマップの表示/非表示
   - オーバーレイの透過率調整

## データソース

- OpenStreetMap: https://www.openstreetmap.org/
- 国土地理院地図: https://maps.gsi.go.jp/
- 津波ハザードマップ: https://disaportaldata.gsi.go.jp/

## 技術スタック

- Leaflet 1.9.4
- HTML5/CSS3/JavaScript