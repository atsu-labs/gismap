/**
 * 定数とマッピングデータを集中管理するモジュール
 * DRY原則に従い、複数のモジュールで使用される定数を統一管理
 */

// マーカーの色パレット（複数のマーカーに循環して適用）
export const MARKER_COLORS = [
    '#e74c3c', // 赤
    '#3498db', // 青
    '#2ecc71', // 緑
    '#f39c12', // オレンジ
    '#9b59b6', // 紫
    '#1abc9c', // ティール
    '#e67e22', // ダークオレンジ
    '#95a5a6'  // グレー
];

// KMLごとのアイコン名マッピング
export const ICON_NAME_MAP = {
    '防火水槽': 'crop_square',
    '地上式': 'fire_hydrant',
    '地下式': 'poker_chip',
    '拠点【航空部隊】': 'flight',
    '拠点【地上部隊】': 'fire_truck',
    '宿営可能地': 'hotel',
    '前進拠点': 'flag',
    'ヘリ離発着': 'helicopter',
    '医療機関': 'local_hospital',
    '給油【航空部隊】': 'local_gas_station',
    '給油【地上部隊】': 'local_gas_station'
};

// KMLごとの色マッピング
export const ICON_COLOR_MAP = {
    '防火水槽': '#498aeb',
    '地上式': '#ebcb3d',
    '地下式': '#f58552',
    '拠点【航空部隊】': '#59b65e',
    '拠点【地上部隊】': '#6669f7',
    '宿営可能地': '#f39c12',
    '前進拠点': '#e67e22',
    'ヘリ離発着': '#7f8892',
    '医療機関': '#f56454',
    '給油【航空部隊】': '#16a085',
    '給油【地上部隊】': '#2980b9'
};

// 地図関連の定数
export const MAP_CONSTANTS = {
    HAKODATE_CENTER: [41.7688, 140.7288],
    DEFAULT_ZOOM: 12,
    DEFAULT_OPACITY: 0.7,
    ZOOM_THRESHOLD: 16  // 消防水利グループの表示閾値
};

// HTTP通信関連の定数
export const HTTP_CONSTANTS = {
    FETCH_TIMEOUT: 10000  // タイムアウト時間（ミリ秒）
};

// KMLファイル一覧（list.jsで使用）
export const DIRECTORY_FILES = [
    'ヘリ離発着.kml',
    '前進拠点.kml',
    '医療機関.kml',
    '地上式.kml',
    '地下式.kml',
    '宿営可能地.kml',
    '拠点【地上部隊】.kml',
    '拠点【航空部隊】.kml',
    '給油【地上部隊】.kml',
    '給油【航空部隊】.kml',
    '防火水槽.kml'
];

// 除外キーワード（消防水利系ファイルは一覧では非表示）
export const EXCLUDED_KEYWORDS = ['地上式', '地下式', '防火水槽'];
