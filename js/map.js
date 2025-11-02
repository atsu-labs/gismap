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
let currentLocationMarker = null; // 現在地マーカーの参照

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

        // 現在地取得ボタンのイベントリスナーを設定
        setupLocationControl(mapInstance);
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

/**
 * 現在地取得コントロールを設定
 * @param {L.Map} map - Leaflet地図オブジェクト
 */
function setupLocationControl(map) {
    const locateButton = document.getElementById('locateButton');
    
    if (!locateButton) {
        console.warn('現在地ボタンが見つかりませんでした');
        return;
    }
    
    locateButton.addEventListener('click', () => {
        // ボタンに「取得中」のスタイルを適用
        locateButton.classList.add('locating');
        
        // Geolocation APIで現在地を取得
        if (!navigator.geolocation) {
            alert('お使いのブラウザは位置情報取得に対応していません。');
            locateButton.classList.remove('locating');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                // 地図の中心を現在地に移動
                map.setView([lat, lon], 16);
                
                // 既存のマーカーがあれば削除
                if (currentLocationMarker) {
                    map.removeLayer(currentLocationMarker);
                }
                
                // カスタムアイコンを作成
                const locationIcon = L.divIcon({
                    className: 'current-location-icon',
                    html: '<div style="background: #0078d4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0, 120, 212, 0.5);"></div>',
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
                });
                
                // 現在地マーカーを作成
                currentLocationMarker = L.marker([lat, lon], { icon: locationIcon })
                    .addTo(map)
                    .bindPopup(`現在地<br>精度: 約${Math.round(accuracy)}m`)
                    .openPopup();
                
                // 精度円を追加（オプション）
                L.circle([lat, lon], {
                    radius: accuracy,
                    color: '#0078d4',
                    fillColor: '#0078d4',
                    fillOpacity: 0.1,
                    weight: 1
                }).addTo(map);
                
                locateButton.classList.remove('locating');
            },
            (error) => {
                locateButton.classList.remove('locating');
                let errorMessage = '位置情報の取得に失敗しました。';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '位置情報の使用が許可されていません。ブラウザの設定を確認してください。';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '位置情報が利用できません。';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '位置情報の取得がタイムアウトしました。';
                        break;
                }
                
                alert(errorMessage);
                console.error('位置情報取得エラー:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// ページ読み込み時に地図を初期化
document.addEventListener('DOMContentLoaded', initializeMap);
