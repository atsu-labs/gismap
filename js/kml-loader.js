// KMLローダーモジュール

import { MARKER_COLORS, ICON_NAME_MAP, ICON_COLOR_MAP, MAP_CONSTANTS } from './constants.js';
import { kmlGroups } from './kml-config.js';

const ZOOM_THRESHOLD = MAP_CONSTANTS.ZOOM_THRESHOLD;

// KMLレイヤーの管理配列
const kmlLayers = [];

/**
 * カスタムマーカーアイコンを生成する関数
 * @param {string} iconName - Material Icon 名
 * @param {string} color - アイコンの色
 * @returns {L.DivIcon} Leaflet DivIcon
 */
function createColoredIcon(iconName, color) {
    const html = `
        <div style="position: relative; width: 30px; height: 30px;">
            <div style="
                background-color: ${color};
                width: 26px;
                height: 26px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                display:flex; align-items:center; justify-content:center;">
                <span class="material-symbols-outlined material-marker">${iconName}</span>
            </div>
        </div>`;

    return L.divIcon({
        className: 'custom-marker',
        html: html,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });
}

/**
 * KMLファイルを読み込む
 * @param {L.Map} map - Leaflet地図オブジェクト
 */
export function loadKMLFiles(map) {
    const kmlFileList = document.getElementById('kmlFileList');
    kmlFileList.innerHTML = '';

    // グループごとにUIの見出しとON/OFF を作る
    Object.keys(kmlGroups).forEach((groupKey, groupIdx) => {
        const group = kmlGroups[groupKey];

        // グループ見出しとトグルチェックボックス
        const groupLabel = document.createElement('div');
        groupLabel.style.marginBottom = '8px';
        groupLabel.style.fontWeight = 'bold';

        const groupCheckbox = document.createElement('input');
        groupCheckbox.type = 'checkbox';
        groupCheckbox.checked = group.visibleByUser;
        groupCheckbox.id = `kml-group-${groupKey}`;
        groupCheckbox.style.marginRight = '6px';

        groupCheckbox.addEventListener('change', (e) => {
            handleGroupToggle(e, groupKey, map);
        });

        const titleNode = document.createTextNode(group.title);
        groupLabel.appendChild(groupCheckbox);
        groupLabel.appendChild(titleNode);
        kmlFileList.appendChild(groupLabel);

        // 各ファイルを個別に作成
        group.files.forEach((file, idx) => {
            loadSingleKMLFile(file, groupKey, kmlFileList, map);
        });
    });

    // 初期表示ルール適用
    updateAllGroupVisibility(map);

    // 地図のズーム変更時に消防水利グループの表示を切り替える
    map.on('zoomend', () => {
        updateGroupVisibility('shoubou', map);
    });
}

/**
 * 単一のKMLファイルを読み込む
 * @param {string} file - KMLファイルパス
 * @param {string} groupKey - グループキー
 * @param {HTMLElement} kmlFileList - ファイルリスト要素
 * @param {L.Map} map - Leaflet地図オブジェクト
 */
function loadSingleKMLFile(file, groupKey, kmlFileList, map) {
    const group = kmlGroups[groupKey];
    const globalIndex = kmlLayers.length;
    const fileName = file.split('/').pop().replace('.kml', '');
    const markerColor = MARKER_COLORS[globalIndex % MARKER_COLORS.length];

    const assignedIconName = ICON_NAME_MAP[fileName] || 'place';
    const assignedColor = ICON_COLOR_MAP[fileName] || markerColor;

    const kmlLayer = omnivore.kml(file)
        .on('ready', function() {
            console.log(`KMLファイル読み込み完了: ${fileName}`);
            this.eachLayer(function(layer) {
                if (layer.setIcon) {
                    layer.setIcon(createColoredIcon(assignedIconName, assignedColor));
                }
                if (layer.feature && layer.feature.properties) {
                    const props = layer.feature.properties;
                    let popupContent = '';
                    if (props.name) popupContent += `<strong>${props.name}</strong><br>`;
                    if (props.description) popupContent += props.description;
                    if (popupContent) layer.bindPopup(popupContent);
                }
            });
            // 読み込み完了後にファイルリストにアイコン表示（小さなプレビュー）
            const checkboxLabel = document.querySelector(`#kml-${globalIndex}`)?.parentNode;
            if (checkboxLabel) {
                const iconPreview = document.createElement('span');
                iconPreview.className = 'material-symbols-outlined';
                iconPreview.style.marginRight = '6px';
                iconPreview.textContent = assignedIconName;
                iconPreview.style.fontSize = '14px';
                iconPreview.style.verticalAlign = 'middle';
                checkboxLabel.insertBefore(iconPreview, checkboxLabel.firstChild);
            }
            // ready フラグを立てる（存在すれば）
            if (kmlLayers[globalIndex]) kmlLayers[globalIndex].ready = true;
        })
        .on('error', function(e) {
            console.error(`KMLファイル読み込みエラー: ${fileName}`, e);
        });

    // レイヤー情報を保存（ready フラグを追加）
    kmlLayers.push({ layer: kmlLayer, name: fileName, visible: group.visibleByUser, group: groupKey, ready: false });
    group.layerRefs.push(kmlLayer);

    // チェックボックス（個別）を作成
    createKMLCheckbox(globalIndex, fileName, assignedColor, groupKey, map, kmlFileList);
}

/**
 * KMLチェックボックスを作成
 * @param {number} globalIndex - グローバルインデックス
 * @param {string} fileName - ファイル名
 * @param {string} assignedColor - 割り当てられた色
 * @param {string} groupKey - グループキー
 * @param {L.Map} map - Leaflet地図オブジェクト
 * @param {HTMLElement} kmlFileList - ファイルリスト要素
 */
function createKMLCheckbox(globalIndex, fileName, assignedColor, groupKey, map, kmlFileList) {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.marginLeft = '18px';
    label.style.marginBottom = '4px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `kml-${globalIndex}`;
    checkbox.style.marginRight = '6px';
    checkbox.checked = kmlLayers[globalIndex].visible;

    // 色インジケーター
    const colorIndicator = document.createElement('span');
    colorIndicator.style.display = 'inline-block';
    colorIndicator.style.width = '12px';
    colorIndicator.style.height = '12px';
    colorIndicator.style.backgroundColor = assignedColor;
    colorIndicator.style.borderRadius = '50%';
    colorIndicator.style.marginRight = '6px';
    colorIndicator.style.border = '1px solid #ccc';
    colorIndicator.style.verticalAlign = 'middle';

    checkbox.addEventListener('change', (e) => {
        handleFileToggle(e, globalIndex, groupKey, map);
    });

    label.appendChild(checkbox);
    label.appendChild(colorIndicator);
    label.appendChild(document.createTextNode(fileName));
    kmlFileList.appendChild(label);
}

/**
 * グループトグルのハンドラ
 * @param {Event} e - イベントオブジェクト
 * @param {string} groupKey - グループキー
 * @param {L.Map} map - Leaflet地図オブジェクト
 */
function handleGroupToggle(e, groupKey, map) {
    const checked = e.target.checked;
    const group = kmlGroups[groupKey];
    group.visibleByUser = checked;

    if (checked) {
        // 親をONにしたときは子を一括でONにする
        kmlLayers.forEach((entry, entryIdx) => {
            if (entry.group === groupKey) {
                const childCheckbox = document.getElementById(`kml-${entryIdx}`);
                if (childCheckbox) childCheckbox.checked = true;
                entry.visible = true;
            }
        });
        updateGroupVisibility(groupKey, map);
    } else {
        // 親をOFFにしたときは全ての子をOFFにする
        kmlLayers.forEach((entry, entryIdx) => {
            if (entry.group === groupKey) {
                const childCheckbox = document.getElementById(`kml-${entryIdx}`);
                if (childCheckbox) childCheckbox.checked = false;
                entry.visible = false;
                if (map.hasLayer(entry.layer)) map.removeLayer(entry.layer);
            }
        });
    }
}

/**
 * ファイルトグルのハンドラ
 * @param {Event} e - イベントオブジェクト
 * @param {number} idx - インデックス
 * @param {string} groupKey - グループキー
 * @param {L.Map} map - Leaflet地図オブジェクト
 */
function handleFileToggle(e, idx, groupKey, map) {
    if (e.target.checked) {
        kmlLayers[idx].visible = true;
        updateGroupVisibility(groupKey, map);
    } else {
        kmlLayers[idx].visible = false;
        map.removeLayer(kmlLayers[idx].layer);
    }
}

/**
 * 指定グループの表示更新（ズーム条件とユーザ操作に基づく）
 * @param {string} groupKey - グループキー
 * @param {L.Map} map - Leaflet地図オブジェクト
 */
function updateGroupVisibility(groupKey, map) {
    const group = kmlGroups[groupKey];
    const currentZoom = map.getZoom();

    const shouldShowByZoom = (groupKey === 'shoubou') ? (currentZoom >= ZOOM_THRESHOLD) : true;

    group.layerRefs.forEach((layerRef, i) => {
        const entry = kmlLayers.find(k => k.layer === layerRef);
        if (!entry) return;

        if (entry.visible && shouldShowByZoom) {
            if (!map.hasLayer(layerRef)) map.addLayer(layerRef);
        } else {
            if (map.hasLayer(layerRef)) map.removeLayer(layerRef);
        }
    });
}

/**
 * 全グループの表示を更新
 * @param {L.Map} map - Leaflet地図オブジェクト
 */
function updateAllGroupVisibility(map) {
    Object.keys(kmlGroups).forEach(key => updateGroupVisibility(key, map));
}

/**
 * すべてのKMLレイヤが読み込み完了になるのを待つ（タイムアウトあり）
 * @param {number} timeout - 待機タイムアウト（ms）
 * @returns {Promise<void>}
 */
export function waitForKmlReady(timeout = 5000) {
    const start = Date.now();
    return new Promise((resolve) => {
        (function check() {
            const allReady = kmlLayers.length > 0 && kmlLayers.every(e => e.ready === true);
            if (allReady || Date.now() - start > timeout) {
                resolve();
            } else {
                setTimeout(check, 200);
            }
        })();
    });
}

/**
 * 指定座標に最も近いマーカーの popup を開く
 * @param {L.Map} map
 * @param {number} lat
 * @param {number} lon
 * @param {number} maxMeters
 * @returns {boolean} popup を開いたら true
 */
export function openPopupNear(map, lat, lon, maxMeters = 2000) {
    if (!map || !kmlLayers || kmlLayers.length === 0) return false;
    let best = null;
    kmlLayers.forEach((entry) => {
        if (!entry.layer) return;
        // 表示中のレイヤのみ対象
        if (!map.hasLayer(entry.layer)) return;
        try {
            entry.layer.eachLayer((layer) => {
                if (layer.getLatLng) {
                    const ll = layer.getLatLng();
                    const d = map.distance([lat, lon], [ll.lat, ll.lng]);
                    if (!best || d < best.dist) best = { layer, ll, dist: d };
                }
            });
        } catch (e) {
            // ignore
        }
    });

    if (best && best.dist <= maxMeters) {
        // 適切なズームに合わせてセンタリング
        const targetZoom = map.getZoom() < 16 ? 16 : map.getZoom();
        map.setView([best.ll.lat, best.ll.lng], targetZoom);
        if (best.layer.openPopup) {
            best.layer.openPopup();
        } else if (best.layer.fire) {
            // 一部のレイヤは click を発火させると popup が開く
            best.layer.fire('click');
        }
        return true;
    }
    return false;
}

/**
 * ファイル名（拡張子なし）とプレイスマーク名で正確に popup を開く
 * @param {L.Map} map
 * @param {string} fileBase - KMLファイルのベース名（拡張子なし、例: 拠点【地上部隊】）
 * @param {string} placemarkName - プレイスマークの name
 * @returns {boolean} 開いたら true
 */
export function findAndOpenByFileAndName(map, fileBase, placemarkName) {
    if (!map || !fileBase || !placemarkName) return false;
    // 見つけた最初の一致を開く
    for (const entry of kmlLayers) {
        if (!entry || !entry.layer) continue;
        if (entry.name !== fileBase) continue;
        // 対象レイヤが地図に追加されているか確認
        if (!map.hasLayer(entry.layer)) continue;
        try {
            let opened = false;
            entry.layer.eachLayer((layer) => {
                if (opened) return;
                if (layer.feature && layer.feature.properties && layer.feature.properties.name === placemarkName) {
                    // 座標が取れるなら中心へ移動
                    if (layer.getLatLng) {
                        const ll = layer.getLatLng();
                        const targetZoom = map.getZoom() < 16 ? 16 : map.getZoom();
                        map.setView([ll.lat, ll.lng], targetZoom);
                    }
                    if (layer.openPopup) {
                        layer.openPopup();
                    } else if (layer.fire) {
                        layer.fire('click');
                    }
                    opened = true;
                }
            });
            if (opened) return true;
        } catch (e) {
            // ignore and continue
        }
    }
    return false;
}
