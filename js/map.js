// メインの地図初期化モジュール

import { initializeUIControls } from './ui-controls.js';
import { loadKMLFiles, waitForKmlReady, openPopupNear, findAndOpenByFileAndName } from './kml-loader.js';

// 定数定義
const HAKODATE_CENTER = [41.7688, 140.7288];
const DEFAULT_ZOOM = 12;
const DEFAULT_OPACITY = 0.7;

// オーバーレイレイヤーの参照配列
let overlayLayers = [];
let mapInstance = null;

/**
 * 地図を初期化
 */
async function initializeMap() {
    // UI制御の初期化（地図の初期化より先に実行して、エラーが起きても動作するようにする）
    initializeUIControls();
    
    try {
        // 地図の初期化（函館市）
        mapInstance = L.map('map').setView(HAKODATE_CENTER, DEFAULT_ZOOM);
        
    // ベースマップレイヤーの作成
    const { osmLayer, gsiLayer, gsiPhotoLayer } = createBaseLayers();
    osmLayer.addTo(mapInstance);
        
        // オーバーレイレイヤーの作成
        const { tsunamiLayer, dosekiLayer, kyukeishaLayer, jisuberiLayer } = createOverlayLayers();
        tsunamiLayer.addTo(mapInstance);
        
        // オーバーレイレイヤーの参照配列を設定
        overlayLayers = [
            { layer: tsunamiLayer, toggle: null },
            { layer: dosekiLayer, toggle: null },
            { layer: kyukeishaLayer, toggle: null },
            { layer: jisuberiLayer, toggle: null }
        ];
        
        // イベントリスナーの設定
            setupBasemapControls(mapInstance, osmLayer, gsiLayer, gsiPhotoLayer);
        setupOverlayControls(mapInstance, tsunamiLayer, dosekiLayer, kyukeishaLayer, jisuberiLayer);
        setupOpacityControl(tsunamiLayer, dosekiLayer, kyukeishaLayer, jisuberiLayer);
        
        // URLパラメータで座標が渡されていればまず中心を移動（KML読み込み後に popup を開く）
        let queryLat = null;
        let queryLon = null;
        let queryZoom = null;
        try {
            const params = new URLSearchParams(window.location.search);
            const lat = parseFloat(params.get('lat'));
            const lon = parseFloat(params.get('lon'));
            const zoomParam = params.get('zoom');
            const zoom = zoomParam ? parseInt(zoomParam, 10) : null;
            if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
                queryLat = lat;
                queryLon = lon;
                queryZoom = Number.isInteger(zoom) ? zoom : 16;
                mapInstance.setView([queryLat, queryLon], queryZoom);
            }
        } catch (err) {
            console.warn('URLパラメータの解析に失敗しました:', err);
        }

        // KMLファイルの読み込み
        loadKMLFiles(mapInstance);

        // KML の読み込み完了を待ち、もしクエリ座標があれば最寄りのマーカー popup を開く
        try {
            await waitForKmlReady(5000);
            if (queryLat !== null && queryLon !== null) {
                const params = new URLSearchParams(window.location.search);
                const fileParam = params.get('file');
                const placemarkParam = params.get('placemark');
                let opened = false;
                if (fileParam && placemarkParam) {
                    // まずファイル名＋placemark名で厳密一致を試す
                    opened = findAndOpenByFileAndName(mapInstance, decodeURIComponent(fileParam), decodeURIComponent(placemarkParam));
                }
                if (!opened) {
                    // 厳密マッチが見つからなければ座標近傍検索で代替
                    const neighborOpened = openPopupNear(mapInstance, queryLat, queryLon, 2000);
                    if (!neighborOpened) console.info('近傍のマーカーが見つかりませんでした（または非表示）');
                }
            }
        } catch (e) {
            console.warn('KMLロード待機中にエラーが発生しました:', e);
        }
    } catch (error) {
        console.error('地図の初期化に失敗しました:', error);
    }
}

/**
 * ベースマップレイヤーを作成
 * @returns {Object} osmLayerとgsiLayerを含むオブジェクト
 */
function createBaseLayers() {
    // OpenStreetMapタイルレイヤー
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    });
    
    // 国土地理院タイルレイヤー
    const gsiLayer = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
        maxZoom: 18
    });

    // 国土地理院 航空写真（シームレスフォト）タイルレイヤー
    const gsiPhotoLayer = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg', {
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院（航空写真）</a>',
        maxZoom: 18
    });
    
    return { osmLayer, gsiLayer, gsiPhotoLayer };
}

/**
 * オーバーレイレイヤーを作成
 * @returns {Object} 各オーバーレイレイヤーを含むオブジェクト
 */
function createOverlayLayers() {
    // 津波ハザードマップオーバーレイ
    const tsunamiLayer = L.tileLayer('https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_pref_data/01/{z}/{x}/{y}.png', {
        attribution: '<a href="https://disaportaldata.gsi.go.jp/">ハザードマップポータルサイト</a>',
        opacity: DEFAULT_OPACITY,
        maxZoom: 18
    });
    
    // 土石流警戒区域オーバーレイ
    const dosekiLayer = L.tileLayer('https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki_data/01/{z}/{x}/{y}.png', {
        attribution: '<a href="https://disaportaldata.gsi.go.jp/">ハザードマップポータルサイト</a>',
        opacity: DEFAULT_OPACITY,
        maxZoom: 18
    });
    
    // 急傾斜地警戒区域オーバーレイ
    const kyukeishaLayer = L.tileLayer('https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki_data/01/{z}/{x}/{y}.png', {
        attribution: '<a href="https://disaportaldata.gsi.go.jp/">ハザードマップポータルサイト</a>',
        opacity: DEFAULT_OPACITY,
        maxZoom: 18
    });
    
    // 地すべり警戒区域オーバーレイ
    const jisuberiLayer = L.tileLayer('https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki_data/01/{z}/{x}/{y}.png', {
        attribution: '<a href="https://disaportaldata.gsi.go.jp/">ハザードマップポータルサイト</a>',
        opacity: DEFAULT_OPACITY,
        maxZoom: 18
    });
    
    return { tsunamiLayer, dosekiLayer, kyukeishaLayer, jisuberiLayer };
}

/**
 * ベースマップ切り替えコントロールを設定
 * @param {L.Map} map - Leaflet地図オブジェクト
 * @param {L.TileLayer} osmLayer - OpenStreetMapレイヤー
 * @param {L.TileLayer} gsiLayer - 国土地理院レイヤー
 * @param {L.TileLayer} gsiPhotoLayer - 国土地理院航空写真（シームレスフォト）レイヤー
 */
function setupBasemapControls(map, osmLayer, gsiLayer, gsiPhotoLayer) {
    const basemapRadios = document.querySelectorAll('input[name="basemap"]');
    basemapRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            // 現在表示されているオーバーレイレイヤーを特定
            const activeOverlays = overlayLayers.filter(ol => map.hasLayer(ol.layer));

            // 表示中のオーバーレイレイヤーを一時的に削除
            activeOverlays.forEach(ol => map.removeLayer(ol.layer));

            // ベースマップを切り替え（3択対応）
            const value = e.target.value;
            // まず既存のベースを全て取り除く（安全のため）
            [osmLayer, gsiLayer, gsiPhotoLayer].forEach(bl => {
                try { map.removeLayer(bl); } catch (err) { /* ignore */ }
            });

            if (value === 'osm') {
                map.addLayer(osmLayer);
            } else if (value === 'gsi') {
                map.addLayer(gsiLayer);
            } else if (value === 'gsiPhoto') {
                map.addLayer(gsiPhotoLayer);
            }

            // オーバーレイレイヤーを再追加（ベースマップの上に表示）
            activeOverlays.forEach(ol => map.addLayer(ol.layer));
        });
    });
}

/**
 * オーバーレイレイヤーのコントロールを設定
 * @param {L.Map} map - Leaflet地図オブジェクト
 * @param {L.TileLayer} tsunamiLayer - 津波レイヤー
 * @param {L.TileLayer} dosekiLayer - 土石流レイヤー
 * @param {L.TileLayer} kyukeishaLayer - 急傾斜地レイヤー
 * @param {L.TileLayer} jisuberiLayer - 地すべりレイヤー
 */
function setupOverlayControls(map, tsunamiLayer, dosekiLayer, kyukeishaLayer, jisuberiLayer) {
    // 津波レイヤーの表示/非表示切り替え
    const tsunamiToggle = document.getElementById('tsunamiToggle');
    tsunamiToggle.addEventListener('change', (e) => {
        toggleLayer(map, tsunamiLayer, e.target.checked);
    });
    
    // 土石流レイヤーの表示/非表示切り替え
    const dosekiToggle = document.getElementById('dosekiToggle');
    dosekiToggle.addEventListener('change', (e) => {
        toggleLayer(map, dosekiLayer, e.target.checked);
    });
    
    // 急傾斜地レイヤーの表示/非表示切り替え
    const kyukeishaToggle = document.getElementById('kyukeishaToggle');
    kyukeishaToggle.addEventListener('change', (e) => {
        toggleLayer(map, kyukeishaLayer, e.target.checked);
    });
    
    // 地すべりレイヤーの表示/非表示切り替え
    const jisuberiToggle = document.getElementById('jisuberiToggle');
    jisuberiToggle.addEventListener('change', (e) => {
        toggleLayer(map, jisuberiLayer, e.target.checked);
    });
}

/**
 * レイヤーの表示/非表示を切り替え
 * @param {L.Map} map - Leaflet地図オブジェクト
 * @param {L.TileLayer} layer - 切り替えるレイヤー
 * @param {boolean} checked - 表示するかどうか
 */
function toggleLayer(map, layer, checked) {
    if (checked) {
        map.addLayer(layer);
    } else {
        map.removeLayer(layer);
    }
}

/**
 * 透過率調整コントロールを設定
 * @param {L.TileLayer} tsunamiLayer - 津波レイヤー
 * @param {L.TileLayer} dosekiLayer - 土石流レイヤー
 * @param {L.TileLayer} kyukeishaLayer - 急傾斜地レイヤー
 * @param {L.TileLayer} jisuberiLayer - 地すべりレイヤー
 */
function setupOpacityControl(tsunamiLayer, dosekiLayer, kyukeishaLayer, jisuberiLayer) {
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    
    opacitySlider.addEventListener('input', (e) => {
        const opacity = e.target.value / 100;
        tsunamiLayer.setOpacity(opacity);
        dosekiLayer.setOpacity(opacity);
        kyukeishaLayer.setOpacity(opacity);
        jisuberiLayer.setOpacity(opacity);
        opacityValue.textContent = e.target.value + '%';
    });
}

// ページ読み込み時に地図を初期化
document.addEventListener('DOMContentLoaded', initializeMap);
