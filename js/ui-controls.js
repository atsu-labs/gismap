// UI制御モジュール

/**
 * コントロールパネルとトグルボタンの初期化
 */
export function initializeUIControls() {
    const toggleButton = document.getElementById('toggleButton');
    const controlPanel = document.getElementById('controlPanel');

    // トグルボタンのクリックイベント
    toggleButton.addEventListener('click', () => {
        controlPanel.classList.toggle('hidden');

        // ボタンのテキストを変更
        if (controlPanel.classList.contains('hidden')) {
            toggleButton.textContent = '地図詳細';
        } else {
            toggleButton.textContent = '✕ 閉じる';
        }
    });

    // 画面サイズに応じてコントロールパネルと折り畳みの初期状態を設定
    window.addEventListener('resize', checkScreenSize);
    
    // DOMContentLoaded で折り畳みの初期化とチェックを実行
    document.addEventListener('DOMContentLoaded', () => {
        initializeCollapsibles();
        checkScreenSize();
    });
}

/**
 * 折り畳み可能セクションの初期化
 */
function initializeCollapsibles() {
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const parent = header.parentNode;
            const open = !parent.classList.contains('open');
            const key = parent.id.replace('coll-', '');
            setCollapsibleState(key, open);
        });

        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.click();
            }
        });
    });
}

/**
 * 折り畳みの状態を設定するユーティリティ
 * @param {string} key - セクションのキー
 * @param {boolean} open - 展開するかどうか
 */
function setCollapsibleState(key, open) {
    const coll = document.getElementById('coll-' + key);
    if (!coll) return;
    const header = coll.querySelector('.collapsible-header');
    const chevron = header.querySelector('.chev');
    if (open) {
        coll.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
        if (chevron) chevron.textContent = '▾';
    } else {
        coll.classList.remove('open');
        header.setAttribute('aria-expanded', 'false');
        if (chevron) chevron.textContent = '▸';
    }
}

/**
 * 画面サイズに応じてUIの状態を調整
 */
function checkScreenSize() {
    const controlPanel = document.getElementById('controlPanel');
    const toggleButton = document.getElementById('toggleButton');
    
    if (window.innerWidth > 768) {
        controlPanel.classList.remove('hidden');
        toggleButton.textContent = '地図詳細';
        // デスクトップでは両方展開
        setCollapsibleState('mapSettings', true);
        setCollapsibleState('kmlSettings', true);
    } else {
        // モバイルではコントロールは隠し、両方を折り畳む
        controlPanel.classList.add('hidden');
        toggleButton.textContent = '地図詳細';
        setCollapsibleState('mapSettings', false);
        setCollapsibleState('kmlSettings', false);
    }
}
