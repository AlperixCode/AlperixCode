(() => {
    'use strict';

    /** Kaç saniyede bir “kilitli slot” kontrol edilecek (ms) */
    const CHECK_EVERY = 4000;

    /** Açma butonuna tıkla */
    function tryUnlock() {
        const btn = document.querySelector('a.unlock-button:not(.btn-disabled)');
        if (btn) btn.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    }

    /** Onay penceresini gözle; görür görmez “Unlock” de */
    const popupObserver = new MutationObserver(() => {
        const dlg = document.querySelector('.scavenge-option-unlock-dialog');
        if (dlg) {
            const okBtn =
                dlg.querySelector('a.btn-confirm, a.btn.btn-default:not(.btn-cancel)');
            if (okBtn) okBtn.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        }
    });
    popupObserver.observe(document.body, {childList: true, subtree: true});

    // İlk kontrol + döngü
    tryUnlock();
    setInterval(tryUnlock, CHECK_EVERY);
})();
