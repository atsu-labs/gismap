// 一覧ページのメインスクリプト

import { parseKMLText, escapeHtml } from './kml-parser.js';

// 定数定義
const DIRECTORY_FILES = [
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

const EXCLUDED_KEYWORDS = ['地上式', '地下式', '防火水槽'];
const FETCH_TIMEOUT = 10000;

/**
 * 除外キーワードを含まないファイルのリストを構築
 * @returns {string[]} フィルタリングされたファイル名の配列
 */
function buildFileList() {
    return DIRECTORY_FILES.filter(name => 
        !EXCLUDED_KEYWORDS.some(k => name.includes(k))
    );
}

/**
 * ファイルリストをUIに表示
 */
function renderFileList() {
    const fileListEl = document.getElementById('fileList');
    const files = buildFileList();
    
    if (files.length === 0) {
        fileListEl.innerHTML = '<div>対象のKMLファイルが見つかりません。</div>';
        return;
    }

    // ファイルごとにステータスと折り畳み領域を準備
    fileListEl.innerHTML = files.map(f => `
        <div class="file-section" id="file-${cssId(f)}">
            <div class="file-header" id="header-${cssId(f)}">
                <div style="font-weight:600">${escapeHtml(f)}</div>
                <div id="status-${cssId(f)}" style="font-size:0.9em; color:#666">未読み込み</div>
            </div>
            <div class="file-content" id="content-${cssId(f)}"></div>
        </div>
    `).join('');
}

/**
 * タイムアウト付きfetch
 * @param {string} resource - リソースURL
 * @param {Object} options - fetchオプション
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = FETCH_TIMEOUT, ...fetchOptions } = options;
    const controller = new AbortController();
    fetchOptions.signal = controller.signal;
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(resource, fetchOptions).finally(() => clearTimeout(id));
}

/**
 * KMLファイルを読み込んでパース
 * @param {string[]} files - ファイル名の配列
 */
async function loadAndParseFiles(files) {
    showLoading();

    // 初期ステータス表示
    const fileListEl = document.getElementById('fileList');
    fileListEl.innerHTML = files.map(f => `
        <div class="file-section" id="file-${cssId(f)}">
            <div class="file-header" id="header-${cssId(f)}">
                <div style="font-weight:600">${escapeHtml(f)}</div>
                <div id="status-${cssId(f)}" style="font-size:0.9em; color:#666">読み込み中…</div>
            </div>
            <div class="file-content" id="content-${cssId(f)}"></div>
        </div>
    `).join('');

    for (const fileName of files) {
        await loadSingleFile(fileName);
    }

    // 全体の統計を表示
    displayOverallStats();
}

/**
 * 単一のKMLファイルを読み込む
 * @param {string} fileName - ファイル名
 */
async function loadSingleFile(fileName) {
    const url = `./kml/${encodeURIComponent(fileName)}`;
    const statusEl = document.getElementById(`status-${cssId(fileName)}`);
    const contentEl = document.getElementById(`content-${cssId(fileName)}`);
    
    try {
        let res = await fetchWithTimeout(url, { timeout: FETCH_TIMEOUT });

        // 304はキャッシュによる未更新応答なのでエラー扱いにしない
        if (res.status === 304) {
            try {
                const cached = await fetchWithTimeout(url, { timeout: FETCH_TIMEOUT, cache: 'force-cache' });
                if (cached && cached.ok) {
                    res = cached;
                } else {
                    // キャッシュバスターを使って再取得
                    res = await fetchWithTimeout(url + (url.includes('?') ? '&' : '?') + `_=${Date.now()}`, { timeout: FETCH_TIMEOUT });
                }
            } catch (e) {
                // エラー時も処理を継続
            }
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const data = parseKMLText(text, fileName);
        statusEl.innerText = `読み込み成功 (${data.length} 件)`;
        renderFileSection(contentEl, data);
    } catch (err) {
        const msg = err.name === 'AbortError' ? 'タイムアウト' : err.message || String(err);
        if (statusEl) statusEl.innerText = `エラー: ${msg}`;
        if (contentEl) contentEl.innerHTML = `<div class="error" style="margin:6px 0;">${escapeHtml(msg)}</div>`;
    }
}

/**
 * ファイルセクションの内容をレンダリング
 * @param {HTMLElement} containerEl - コンテナ要素
 * @param {Object[]} data - プレイスマークデータの配列
 */
function renderFileSection(containerEl, data) {
    if (!containerEl) return;
    
    if (data.length === 0) {
        containerEl.innerHTML = '<div class="empty-state" style="padding:8px; color:#777">プレイスマークはありません</div>';
        return;
    }

    const html = data.map(pm => `
        <div class="placemark-item" style="margin-bottom:8px;">
            <div class="placemark-name">${escapeHtml(pm.name)}</div>
            ${pm.description ? `<div class="placemark-description">${escapeHtml(pm.description)}</div>` : ''}
            ${pm.coordinates ? `
                <div class="placemark-coords">
                    <span class="coords-label">緯度:</span>${pm.coordinates.latitude.toFixed(6)}
                    <span class="coords-label">経度:</span>${pm.coordinates.longitude.toFixed(6)}
                    ${pm.coordinates.altitude !== null ? `<span class="coords-label">標高:</span>${pm.coordinates.altitude.toFixed(2)}m` : ''}
                </div>
            ` : '<div class="placemark-coords">座標なし</div>'}
        </div>
    `).join('');

    containerEl.innerHTML = html;
}

/**
 * 全体の統計を表示
 */
function displayOverallStats() {
    const results = document.getElementById('results');
    const allPlacemarks = Array.from(document.querySelectorAll('.placemark-item')).length;
    const headerStats = `
        <div class="stats" style="margin-bottom:16px;">
            <div class="stat-card" style="display:inline-block; margin-right:12px; padding:10px 14px; border-radius:8px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff;">
                <div class="stat-number">${allPlacemarks}</div>
                <div class="stat-label">合計プレイスマーク</div>
            </div>
        </div>
    `;
    results.innerHTML = headerStats;
}

/**
 * ローディング表示
 */
function showLoading() {
    const results = document.getElementById('results');
    results.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>読み込み中...</p>
        </div>
    `;
}

/**
 * 安定した短いIDをファイル名から作る（HTML idとして安全）
 * @param {string} name - ファイル名
 * @returns {string} CSS ID
 */
function cssId(name) {
    // djb2ハッシュで一意な数値を作る
    let h = 5381;
    for (let i = 0; i < name.length; i++) {
        h = ((h << 5) + h) + name.charCodeAt(i);
        h = h & 0xFFFFFFFF; // 32-bit
    }
    return 'f_' + (h >>> 0).toString(36);
}

/**
 * 初期化処理
 */
function initialize() {
    const fileListEl = document.getElementById('fileList');
    const refreshButton = document.getElementById('refreshButton');
    const results = document.getElementById('results');

    // 初期表示
    renderFileList();

    // イベントデリゲーション: fileListのクリックで折り畳みを切り替える
    fileListEl.addEventListener('click', (e) => {
        const header = e.target.closest('.file-header');
        if (!header) return;
        
        const headerId = header.id;
        if (!headerId || !headerId.startsWith('header-')) return;
        
        const contentId = 'content-' + headerId.slice('header-'.length);
        const contentEl = document.getElementById(contentId);
        if (!contentEl) return;
        
        const isHidden = contentEl.style.display === 'none' || contentEl.style.display === '';
        contentEl.style.display = isHidden ? 'block' : 'none';
    });

    // 自動読み込み（ページロード時）
    const files = buildFileList();
    if (files.length > 0) {
        loadAndParseFiles(files);
    } else {
        results.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🌐</div><p>読み込むファイルがありません。</p></div>`;
    }

    // リフレッシュボタン
    refreshButton.addEventListener('click', () => {
        renderFileList();
        results.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🌐</div><p>リストを更新しました。自動読み込みを再実行します。</p></div>`;
        const files = buildFileList();
        if (files.length > 0) loadAndParseFiles(files);
    });
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', initialize);
