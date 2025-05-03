(function () {
  'use strict';

  /***** Ayarlar *****/
  const BASE_DELAY = 300;               // Daha düşük gecikme
  const RAND_FACTOR = 0.15;             // Daha düşük varyasyon
  const QUEST_CLICK_MIN = 4_000;        // 4‑6 sn arası
  const QUEST_CLICK_RANGE = 2_000;

  /***** Yardımcı Fonksiyonlar *****/
  const sleep = ms => new Promise(res => setTimeout(res, ms));
  const randDelay = (base = BASE_DELAY) =>
    base + Math.random() * base * RAND_FACTOR;

  async function waitFor(selector, timeout = 6_000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await sleep(100);
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
    console.log('[ÖDÜL] Ultra-hızlı rutine başlıyorum');

    const quests = [...document.querySelectorAll('.quest-complete-btn')];
    for (const btn of quests) {
      btn.click();
      await sleep(randDelay() / 2);
    }
    console.log(`[ÖDÜL] ${quests.length} görev tamamlandı`);

    await sleep(randDelay() / 3);
    const rewardTab = await waitFor("a.tab-link[data-tab='reward-tab']");
    if (rewardTab) rewardTab.click();

    await sleep(randDelay() / 3);
    const claimAllBtns = [...document.querySelectorAll('.reward-system-claim-all-button')];
    for (const btn of claimAllBtns) {
      btn.click();
      await sleep(randDelay() / 3);
    }
    console.log(`[ÖDÜL] ${claimAllBtns.length}× Claim All tıklandı`);

    await sleep(randDelay() / 3);
    const singleBtns = [...document.querySelectorAll('.reward-system-claim-button')];
    for (const btn of singleBtns) {
      btn.click();
      await sleep(randDelay() / 3);
    }
    console.log(`[ÖDÜL] ${singleBtns.length} tekil ödül alındı`);

    await sleep(randDelay() / 3);
    const close = document.querySelector('.tooltip-delayed');
    if (close) close.click();

    collecting = false;
    console.log('[ÖDÜL] Ultra-hızlı döngü bitti');
  }

  /***** Görev üretme döngüsü *****/
  async function clickQuestLoop() {
    while (true) {
      await sleep(QUEST_CLICK_MIN + Math.random() * QUEST_CLICK_RANGE);
      const btn = document.getElementById('new_quest');
      if (btn) btn.click();
    }
  }

  /***** Başlatıcı *****/
  (async function main() {
    clickQuestLoop();
    while (true) {
      await sleep(randDelay() / 3);
      try {
        await collectRoutine();
      } catch (e) {
        console.error('[ÖDÜL] Hata:', e);
        collecting = false;
      }
    }
  })();
})();
