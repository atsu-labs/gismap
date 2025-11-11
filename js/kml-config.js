/**
 * KMLグループ設定モジュール
 * kmlGroups定義を集中管理し、保守性を向上
 */

/**
 * KMLファイルのグループ定義
 * グループごとにファイル、表示状態を管理
 * @type {Object}
 */
export const kmlGroups = {
    shoubou: {
        title: '消防水利（ズーム時のみ表示）',
        files: [
            'kml/防火水槽.kml',
            'kml/地上式.kml',
            'kml/地下式.kml'
        ],
        layerRefs: [], // 読み込んだレイヤ参照を格納
        visibleByUser: false // ユーザがグループを有効化しているか
    },
    support: {
        title: '受援情報',
        files: [
            'kml/拠点【航空部隊】.kml',
            'kml/拠点【地上部隊】.kml',
            'kml/宿営可能地.kml',
            'kml/前進拠点.kml',
            'kml/ヘリ離発着.kml',
            'kml/医療機関.kml',
            'kml/給油【航空部隊】.kml',
            'kml/給油【地上部隊】.kml'
        ],
        layerRefs: [],
        // 初期表示で受援情報は表示しておく
        visibleByUser: true
    }
};

/**
 * 全KMLファイルのリストを取得
 * @returns {string[]} 全ファイルパスの配列
 */
export function getAllKmlFiles() {
    return Object.values(kmlGroups).flatMap(group => group.files);
}

/**
 * グループキーからグループ定義を取得
 * @param {string} groupKey - グループキー
 * @returns {Object|null} グループ定義、存在しない場合はnull
 */
export function getKmlGroup(groupKey) {
    return kmlGroups[groupKey] || null;
}

/**
 * ファイルパスからグループキーを取得
 * @param {string} filePath - KMLファイルパス
 * @returns {string|null} グループキー、見つからない場合はnull
 */
export function findGroupKeyByFile(filePath) {
    for (const [key, group] of Object.entries(kmlGroups)) {
        if (group.files.includes(filePath)) {
            return key;
        }
    }
    return null;
}
