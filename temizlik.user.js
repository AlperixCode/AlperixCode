(function () {
  'use strict';
 
  /***** Ayarlar *****/
  const BASE_DELAY = 800;              // ms – biraz düşürüldü
  const RAND_FACTOR = 0.3;              // daha düşük varyasyon
  const QUEST_CLICK_MIN = 5_000;        // 5‑8 sn arası “yeni görev” tıklaması
  const QUEST_CLICK_RANGE = 3_000;

  /***** Yardımcı Fonksiyonlar *****/
  const sleep = ms => new Promise(res => setTimeout(res, ms));
  const randDelay = (base = BASE_DELAY) =>
    base + Math.random() * base * RAND_FACTOR;

  async function waitFor(selector, timeout = 8_000) { // timeout biraz düşürüldü
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await sleep(150);                // daha sık kontrol
    }
    return null;
  }

  /***** Ana Akış *****/
  let collecting = false;

  async function collectRoutine() {
    if (collecting) return;
    const popup = document.querySelector('#popup_box_quest.show');
    if (!popup) return;
    collecting = true;
    console.log('[ÖDÜL] Hızlı rutine başlıyorum');

    /* 1) Görevleri bitir */
    const quests = [...document.querySelectorAll('.quest-complete-btn')];
    for (const btn of quests) {
      btn.click();
      await sleep(randDelay() / 2);     // daha kısa bekleme
    }
    console.log(`[ÖDÜL] ${quests.length} görev tamamlandı`);

    /* 2) Ödül sekmesine geç */
    await sleep(randDelay() / 2);
    const rewardTab = await waitFor("a.tab-link[data-tab='reward-tab']");
    if (rewardTab) rewardTab.click();

    /* 3) 'Claim All' butonlarını tıkla */
    await sleep(randDelay() / 2);
    const claimAllBtns = [
      ...document.querySelectorAll('.reward-system-claim-all-button'),
    ];
    for (const btn of claimAllBtns) {
      btn.click();
      await sleep(randDelay() / 2);
    }
    console.log(`[ÖDÜL] ${claimAllBtns.length}× Claim All tıklandı`);

    /* 4) Tek tek ödül butonları */
    await sleep(randDelay() / 2);
    const singleBtns = [
      ...document.querySelectorAll('.reward-system-claim-button'),
    ];
    for (const btn of singleBtns) {
      btn.click();
      await sleep(randDelay() / 2);
    }
    console.log(`[ÖDÜL] ${singleBtns.length} tekil ödül alındı`);

    /* 5) Temizlik */
    await sleep(randDelay() / 2);
    const close = document.querySelector('.tooltip-delayed');
    if (close) close.click();

    collecting = false;
    console.log('[ÖDÜL] Hızlı döngü bitti');
  }

  /***** Belirli aralıkla yeni görev butonuna tıkla *****/
  async function clickQuestLoop() {
    while (true) {
      await sleep(
        QUEST_CLICK_MIN + Math.random() * QUEST_CLICK_RANGE,
      );
      const btn = document.getElementById('new_quest');
      if (btn) btn.click();
    }
  }

  /***** Interval yerine “yumuşak” döngü *****/
  (async function main() {
    clickQuestLoop();
    while (true) {
      await sleep(randDelay() / 2);      // çok daha hızlı
      try {
        await collectRoutine();
      } catch (e) {
        console.error('[ÖDÜL] Hata:', e);
        collecting = false;
      }
    }
  })();
})();
