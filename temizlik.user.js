console.log("🚀 Yeni server scripti yüklendi!");

(function () {
    'use strict';

    // ========== CONFIG & STATE ==========
    let inputMs = 0;
    let input = "";
    let delay = 0;
    let delayTime = parseInt(localStorage.delayTime);
    if (isNaN(delayTime)) {
        delayTime = 250;
        localStorage.delayTime = JSON.stringify(delayTime);
    }

    let arrInterval, attInterval;

    // ========== HTML ADDITIONS ==========
    const offsetHtml = `
        <tr>
            <td>
                Offset
                <span class="tooltip">
                    <img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/>
                    <span class="tooltiptext">
                        Adjust milliseconds. If arrival is late by 50ms, set "-50".<br>Play with this for precise timing.
                    </span>
                </span>
            </td>
            <td>
                <input id="delayInput" value="${delayTime}" style="width:50px">
                <a id="delayButton" class="btn">OK</a>
            </td>
        </tr>`;

    const setArrivalHtml = `
        <tr><td>Set arrival:</td><td id="showArrTime"></td></tr>`;

    const sendAttackHtml = `
        <tr><td>Send at:</td><td id="showSendTime"></td></tr>`;

    const buttons = `
        <a id="arrTime" class="btn" style="cursor:pointer;">🎯 Set Arrival Time</a>
        <a id="sendTime" class="btn" style="cursor:pointer;">🕒 Set Send Time</a>`;

    // ========== INSERT TO PAGE ==========
    const parentTable = document.getElementById("date_arrival").closest("table");
    parentTable.insertAdjacentHTML("beforeend", offsetHtml + setArrivalHtml + sendAttackHtml);

    const submitButton = document.querySelector("#troop_confirm_submit");
    submitButton.insertAdjacentHTML("afterend", buttons);

    // ========== ARRIVAL MODE ==========
    function setArrivalTime() {
        arrInterval = setInterval(() => {
            const arrivalTime = document.querySelector(".relative_time")?.textContent;
            if (!arrivalTime) return;

            const currentArr = arrivalTime.slice(-8);
            if (currentArr >= input) {
                setTimeout(triggerClick, delay);
                clearInterval(arrInterval);
                console.log("⏱️ Sent at correct arrival match:", currentArr);
            }
        }, 5);
    }

    // ========== SERVER CLOCK MODE ==========
    function setSendTime() {
        attInterval = setInterval(() => {
            const serverTime = document.querySelector("#serverTime")?.textContent;
            if (!serverTime) return;

            if (serverTime >= input) {
                setTimeout(triggerClick, delay);
                clearInterval(attInterval);
                console.log("⏱️ Sent at correct server time:", serverTime);
            }
        }, 5);
    }

    // ========== CLICK TRIGGER (multi-method) ==========
    function triggerClick() {
        const btn = document.querySelector("#troop_confirm_submit");
        if (!btn) return alert("⚠️ Send button not found!");

        btn.disabled = false;

        try {
            btn.click();
            console.log("✅ .click() used");
        } catch (e) {
            console.warn("❌ .click() failed", e);
        }

        try {
            const evt = new MouseEvent("click", { bubbles: true, cancelable: true, view: window });
            btn.dispatchEvent(evt);
            console.log("✅ MouseEvent dispatched");
        } catch (e) {
            console.warn("❌ MouseEvent dispatch failed", e);
        }

        try {
            const form = btn.closest("form");
            if (form) {
                form.submit();
                console.log("✅ form.submit() used");
            }
        } catch (e) {
            console.warn("❌ form.submit() failed", e);
        }
    }

    // ========== BUTTON EVENTS ==========
    document.getElementById("arrTime").onclick = () => {
        clearInterval(attInterval);

        const current = document.querySelector(".relative_time")?.textContent.slice(-8);
        input = prompt("⏰ Enter desired ARRIVAL time (HH:MM:SS):", current);
        inputMs = parseInt(prompt("➕ Enter ms offset (e.g. 000):", "000")) || 0;

        delay = delayTime + inputMs;
        document.getElementById("showArrTime").textContent = `${input}:${String(inputMs).padStart(3, "0")}`;
        document.getElementById("showSendTime").textContent = "";
        setArrivalTime();
    };

    document.getElementById("sendTime").onclick = () => {
        clearInterval(arrInterval);

        const current = document.getElementById("serverTime").textContent;
        input = prompt("⏰ Enter desired SEND time (HH:MM:SS):", current);
        inputMs = parseInt(prompt("➕ Enter ms offset (e.g. 000):", "000")) || 0;

        delay = delayTime + inputMs;
        document.getElementById("showSendTime").textContent = `${input}:${String(inputMs).padStart(3, "0")}`;
        document.getElementById("showArrTime").textContent = "";
        setSendTime();
    };

    document.getElementById("delayButton").onclick = () => {
        delayTime = parseInt(document.getElementById("delayInput").value);
        localStorage.delayTime = JSON.stringify(delayTime);
        delay = delayTime + inputMs;
        if (delay < 0) delay = 0;
    };

    // ========== STYLES ==========
    const style = document.createElement("style");
    style.textContent = `
        .tooltip { position: relative; display: inline-block; }
        .tooltip .tooltiptext {
            visibility: hidden;
            width: 200px;
            background: linear-gradient(to bottom, #e3c485 0%, #ecd09a 100%);
            color: black;
            text-align: center;
            padding: 5px;
            border-radius: 6px;
            border: 1px solid #804000;
            position: absolute;
            z-index: 1;
        }
        .tooltip:hover .tooltiptext {
            visibility: visible;
        }`;
    document.head.appendChild(style);
})();
