(function() {
    'use strict';

    console.log('🚀 TW SmartFarm Brain AI v5.3 Başlatıldı!');

    const SETTINGS_KEY = 'sf_settings';
    const STATUS_KEY = 'sf_status';
    const ATTACK_LOG_KEY = 'sf_attack_log';
    const STATS_KEY = 'sf_stats';
    const C_BLOCK_KEY = 'sf_c_block';
    const PANEL_MINIMIZED_KEY = 'sf_panel_minimized';

    const DEFAULT_SETTINGS = {
        maxDistance: 5,
        minAttackInterval: 30
    };

    let settings = loadSettings();
    let attackLog = loadAttackLog();
    let farmingActive = loadFarmingStatus();
    let stats = loadStats();
    let cBlockEnabled = loadCBlock();
    let distanceColumnIndex = -1;

    function loadSettings() {
        const saved = localStorage.getItem(SETTINGS_KEY);
        return saved ? JSON.parse(saved) : { ...DEFAULT_SETTINGS };
    }

    function saveSettings() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }

    function loadFarmingStatus() {
        const status = localStorage.getItem(STATUS_KEY);
        return status === 'active';
    }

    function saveFarmingStatus() {
        localStorage.setItem(STATUS_KEY, farmingActive ? 'active' : 'paused');
    }

    function loadAttackLog() {
        const saved = localStorage.getItem(ATTACK_LOG_KEY);
        return saved ? JSON.parse(saved) : {};
    }

    function saveAttackLog() {
        localStorage.setItem(ATTACK_LOG_KEY, JSON.stringify(attackLog));
    }

    function loadStats() {
        const saved = localStorage.getItem(STATS_KEY);
        return saved ? JSON.parse(saved) : { total: 0, aSent: 0, bSent: 0, cSent: 0 };
    }

    function saveStats() {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }

    function loadCBlock() {
        const saved = localStorage.getItem(C_BLOCK_KEY);
        return saved === 'true';
    }

    function saveCBlock() {
        localStorage.setItem(C_BLOCK_KEY, cBlockEnabled ? 'true' : 'false');
    }

    function loadPanelMinimized() {
        return localStorage.getItem(PANEL_MINIMIZED_KEY) === 'true';
    }

    function savePanelMinimized(minimized) {
        localStorage.setItem(PANEL_MINIMIZED_KEY, minimized ? 'true' : 'false');
    }

    function resetStats() {
        stats = { total: 0, aSent: 0, bSent: 0, cSent: 0 };
        saveStats();
        updateDashboard();
    }

    function createSettingsPanel() {
        const minimized = loadPanelMinimized(); // Sayfa açılınca minimize durumu oku

        const panel = document.createElement('div');
        panel.id = 'sf-settings-panel';
        panel.style.position = 'fixed';
        panel.style.top = '100px';
        panel.style.right = '20px';
        panel.style.width = '280px';
        panel.style.padding = '15px';
        panel.style.background = 'rgba(0, 0, 0, 0.8)';
        panel.style.color = 'white';
        panel.style.zIndex = '9999';
        panel.style.borderRadius = '8px';
        panel.style.fontFamily = 'Arial, sans-serif';
        panel.style.fontSize = '14px';
        panel.style.boxShadow = '0 0 10px #000';
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">⚙️ SmartFarm</h3>
                <button id="sf-toggle-panel" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">${minimized ? '+' : '−'}</button>
            </div>
            <div id="sf-panel-body" style="display: ${minimized ? 'none' : 'block'};">
                <label>Maksimum Mesafe:</label>
                <input id="sf-max-distance" type="number" style="width: 100%; margin-bottom: 10px;" value="${settings.maxDistance}">
                <label>Minimum Saldırı Aralığı (dk):</label>
                <input id="sf-min-interval" type="number" style="width: 100%; margin-bottom: 10px;" value="${settings.minAttackInterval}">
                <div style="margin-bottom:10px;">
                    <input type="checkbox" id="sf-c-block" ${cBlockEnabled ? 'checked' : ''}>
                    <label for="sf-c-block">C saldırılarını engelle</label>
                </div>
                <button id="sf-save-settings" style="width: 100%; margin-bottom: 10px;">Kaydet</button>
                <button id="sf-reset-stats" style="width: 100%; margin-bottom: 10px;">İstatistikleri Sıfırla</button>
                <button id="sf-toggle-farming" style="width: 100%;">${farmingActive ? 'Farmı Durdur' : 'Farmı Başlat'}</button>
                <div id="sf-stats" style="margin-top: 10px; font-size: 12px;"></div>
                <div style="text-align: center; font-size: 11px; margin-top: 10px; opacity: 0.8;">
                    <b>Discord:</b> <a href="https://discord.gg/UxEUF2qmQK" target="_blank" style="color:#00bfff;">Join Us 🚀</a>
                </div>
                <div style="text-align: center; font-size: 10px; margin-top: 5px; opacity: 0.5;">by Alperix</div>
            </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('sf-toggle-panel').onclick = function() {
            const body = document.getElementById('sf-panel-body');
            if (body.style.display === 'none') {
                body.style.display = 'block';
                this.innerText = '−';
                savePanelMinimized(false);
            } else {
                body.style.display = 'none';
                this.innerText = '+';
                savePanelMinimized(true);
            }
        };

        document.getElementById('sf-save-settings').onclick = function() {
            settings.maxDistance = parseFloat(document.getElementById('sf-max-distance').value);
            settings.minAttackInterval = parseFloat(document.getElementById('sf-min-interval').value);
            cBlockEnabled = document.getElementById('sf-c-block').checked;
            saveSettings();
            saveCBlock();
            alert('Ayarlar kaydedildi!');
        };

        document.getElementById('sf-reset-stats').onclick = function() {
            if (confirm("İstatistikleri sıfırlamak istediğine emin misin?")) {
                resetStats();
            }
        };

        document.getElementById('sf-toggle-farming').onclick = function() {
            farmingActive = !farmingActive;
            saveFarmingStatus();
            document.getElementById('sf-toggle-farming').innerText = farmingActive ? 'Farmı Durdur' : 'Farmı Başlat';
            if (farmingActive) {
                startFarming();
            }
        };

        updateDashboard();
    }

    function updateDashboard() {
        const statsDiv = document.getElementById('sf-stats');
        if (statsDiv) {
            statsDiv.innerHTML = `
                <b>İstatistikler:</b><br>
                Toplam Saldırı: ${stats.total}<br>
                A Saldırısı: ${stats.aSent}<br>
                B Saldırısı: ${stats.bSent}<br>
                C Saldırısı: ${stats.cSent}<br>
            `;
        }
    }

    function findDistanceColumnIndex() {
        const headers = document.querySelectorAll('#plunder_list th');
        for (let i = 0; i < headers.length; i++) {
            const img = headers[i].querySelector('img[data-title="Distance"]');
            if (img) {
                return i;
            }
        }
        return -1;
    }

    function getDistanceFromRow(row) {
        if (distanceColumnIndex === -1) return null;
        const cells = row.querySelectorAll('td');
        if (cells.length > distanceColumnIndex) {
            const rawText = cells[distanceColumnIndex].innerText.trim().replace(',', '.');
            const value = parseFloat(parseFloat(rawText).toFixed(2));
            return isNaN(value) ? null : value;
        }
        return null;
    }

    function hasFullLoot(row) {
        const img = row.querySelector('img[src*="max_loot/1.webp"]');
        return !!img;
    }

    async function startFarming() {
        if (!farmingActive) return;

        distanceColumnIndex = findDistanceColumnIndex();
        if (distanceColumnIndex === -1) {
            console.error("Distance kolonu bulunamadı!");
            return;
        }

        const rows = document.querySelectorAll('#plunder_list tr[id^="village_"]');

        for (let row of rows) {
            if (!farmingActive) return;

            const villageID = row?.id?.replace('village_', '');
            if (!villageID) continue;

            const now = Date.now();
            const lastAttackTime = attackLog[villageID];
            const intervalInMs = settings.minAttackInterval * 60 * 1000;

            const distance = getDistanceFromRow(row);
            if (distance === null || distance > settings.maxDistance) continue;

            if (!lastAttackTime || (now - lastAttackTime) >= intervalInMs) {
                const cButton = row.querySelector('a.farm_icon_c');
                const bButton = row.querySelector('a.farm_icon_b');
                const aButton = row.querySelector('a.farm_icon_a');

                if (cButton && cButton.offsetParent !== null && !cBlockEnabled) {
                    cButton.click();
                    stats.cSent++;
                } else {
                    if (hasFullLoot(row) && bButton && bButton.offsetParent !== null) {
                        bButton.click();
                        stats.bSent++;
                    } else if (aButton && aButton.offsetParent !== null) {
                        aButton.click();
                        stats.aSent++;
                    }
                }

                stats.total++;
                attackLog[villageID] = Date.now();
                saveAttackLog();
                saveStats();
                updateDashboard();

                console.log(`🛡️ Saldırı yapıldı köy: ${villageID}`);

                const randomDelay = 300 + Math.random() * 150;
                await new Promise(resolve => setTimeout(resolve, randomDelay));
            }
        }

        setTimeout(startFarming, 5000);
    }

    createSettingsPanel();
    if (farmingActive) {
        startFarming();
    }

})();
