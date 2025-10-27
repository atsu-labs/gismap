// KMLパーサーユーティリティモジュール

/**
 * KMLテキストをパース
 * @param {string} kmlText - KMLファイルの内容
 * @param {string} sourceFile - ソースファイル名
 * @returns {Object[]} プレイスマークデータの配列
 */
export function parseKMLText(kmlText, sourceFile) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) throw new Error('KMLの解析エラー');

    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    const data = [];

    for (let i = 0; i < placemarks.length; i++) {
        const pm = placemarks[i];
        const name = getElementText(pm, 'name') || `プレイスマーク ${i + 1}`;
        const description = getElementText(pm, 'description') || '';
        const coordinates = getCoordinates(pm);
        data.push({ name, description, coordinates, source: sourceFile });
    }

    return data;
}

/**
 * 要素のテキストを取得
 * @param {Element} parent - 親要素
 * @param {string} tagName - タグ名
 * @returns {string} テキスト内容
 */
function getElementText(parent, tagName) {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent.trim() : '';
}

/**
 * プレイスマークの座標を取得
 * @param {Element} placemark - プレイスマーク要素
 * @returns {Object|null} 座標オブジェクト
 */
function getCoordinates(placemark) {
    const coordsElement = placemark.getElementsByTagName('coordinates')[0];
    if (!coordsElement) return null;
    const coordsText = coordsElement.textContent.trim();
    // coordinates は複数座標を持つ場合があるが、ここでは先頭の座標を使用
    const first = coordsText.trim().split(/\s+/)[0];
    const parts = first.split(',');
    if (parts.length >= 2) {
        return {
            longitude: parseFloat(parts[0]),
            latitude: parseFloat(parts[1]),
            altitude: parts[2] ? parseFloat(parts[2]) : null
        };
    }
    return null;
}

/**
 * HTMLエスケープ処理
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープされたテキスト
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
