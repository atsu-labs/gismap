/**
 * HTTP通信ユーティリティモジュール
 * タイムアウト処理やエラーハンドリングを統一管理
 */

/**
 * タイムアウト付きfetch
 * @param {string} resource - リソースURL
 * @param {Object} options - fetchオプション
 * @param {number} [options.timeout=10000] - タイムアウト時間（ミリ秒）
 * @returns {Promise<Response>}
 * @throws {Error} ネットワークエラーまたはタイムアウト時に発生
 */
export async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 10000, ...fetchOptions } = options;
    const controller = new AbortController();
    fetchOptions.signal = controller.signal;
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        return await fetch(resource, fetchOptions);
    } finally {
        clearTimeout(id);
    }
}

/**
 * HTTPレスポンスの成功判定
 * 304（キャッシュ）を考慮したカスタム判定
 * @param {Response} response - fetchレスポンス
 * @returns {boolean} 成功状態かどうか
 */
export function isSuccessResponse(response) {
    return response.ok || response.status === 304;
}

/**
 * HTTPレスポンスからテキストを取得
 * キャッシュ対応を含む
 * @param {Response} response - fetchレスポンス
 * @param {string} url - リクエストURL（キャッシュバスター用）
 * @param {number} [timeout=10000] - タイムアウト時間
 * @returns {Promise<string>} レスポンステキスト
 */
export async function getResponseText(response, url, timeout = 10000) {
    // 304の場合はキャッシュから取得を試みる
    if (response.status === 304) {
        try {
            const cached = await fetchWithTimeout(url, { 
                timeout, 
                cache: 'force-cache' 
            });
            if (cached && cached.ok) {
                return await cached.text();
            }
        } catch (e) {
            console.warn('キャッシュからの取得に失敗、キャッシュバスターで再取得:', e);
        }
        
        // キャッシュが無い場合はキャッシュバスターで再取得
        const bustedUrl = url + (url.includes('?') ? '&' : '?') + `_=${Date.now()}`;
        const retryRes = await fetchWithTimeout(bustedUrl, { timeout });
        if (!retryRes.ok) {
            throw new Error(`HTTP ${retryRes.status}`);
        }
        return await retryRes.text();
    }
    
    return await response.text();
}

/**
 * エラーメッセージを統一的にフォーマット
 * @param {Error} error - エラーオブジェクト
 * @returns {string} 表示用エラーメッセージ
 */
export function formatErrorMessage(error) {
    if (error.name === 'AbortError') {
        return 'タイムアウト';
    }
    if (error instanceof TypeError) {
        return 'ネットワークエラー';
    }
    return error.message || String(error);
}
