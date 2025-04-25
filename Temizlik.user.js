/* ===========================================================
   Mass scavenging by Sophie "Shinko to Kuma"
   ===  PATCH: spear & sword DEFAULT TRUE  ====================
   =========================================================== */

(function () {
    'use strict';

    /* ---------- helpers & globals ---------- */
    const serverTimeTemp = $("#serverDate")[0].innerText + " " + $("#serverTime")[0].innerText;
    const serverTime = serverTimeTemp.match(
        /^([0][1-9]|[12][0-9]|3[01])[\/\-]([0][1-9]|1[012])[\/\-](\d{4})( (0?[0-9]|[1][0-9]|[2][0-3])[:]([0-5][0-9])([:]([0-5][0-9]))?)?$/
    );
    const serverDate = Date.parse(serverTime[3] + "/" + serverTime[2] + "/" + serverTime[1] + serverTime[4]);
    const is_mobile = !!navigator.userAgent.match(/iphone|android|blackberry/ig);
    let scavengeInfo, tempElementSelection = "";

    /* ---------- eğer scavenge_mass sayfasında değilsek yönlendir ---------- */
    if (window.location.href.indexOf('screen=place&mode=scavenge_mass') < 0) {
        window.location.assign(game_data.link_base_pure + "place&mode=scavenge_mass");
        return;
    }

    $("#massScavengeSophie").remove();

    /* ---------- versiyon bayrağı ---------- */
    if (typeof version === 'undefined') version = 'new';

    /* ---------- çeviriler (yalnızca EN + birkaç örnek) ---------- */
    let langShinko = [
        "Mass scavenging",
        "Select unit types/ORDER to scavenge with (drag units to order)",
        "Select categories to use",
        "When do you want your scav runs to return (approximately)?",
        "Runtime here",
        "Calculate runtimes for each page",
        "Creator: ",
        "Mass scavenging: send per 50 villages",
        "Launch group "
    ];
    if (game_data.locale === "tr_TR") langShinko[0] = "Toplu Temizlik";   // örn.

    /* ==========================================================
       ----------  LOCAL STORAGE  Ayarları Yükle --------------
       ========================================================== */

    /* --- 1. troopTypeEnabled  ---------------------------------
       PATCH: yalnızca spear & sword = true, geri kalan = false
    ----------------------------------------------------------- */
    if (localStorage.getItem("troopTypeEnabled") == null) {
        console.log("No troopTypeEnabled found, creating new one (spear+sword default)");
        const worldUnits = game_data.units;
        const troopTypeEnabled = {};
        for (let i = 0; i < worldUnits.length; i++) {
            if (["militia","snob","ram","catapult","spy","knight"].indexOf(worldUnits[i]) === -1) {
                /* --------- PATCH SATIRI --------- */
                troopTypeEnabled[worldUnits[i]] =
                    (worldUnits[i] === 'spear' || worldUnits[i] === 'sword');
                /* -------------------------------- */
            }
        }
        localStorage.setItem("troopTypeEnabled", JSON.stringify(troopTypeEnabled));
    } else {
        var troopTypeEnabled = JSON.parse(localStorage.getItem("troopTypeEnabled"));
    }

    /* --- 2. keepHome ----------------------------------------- */
    if (localStorage.getItem("keepHome") == null) {
        console.log("No units set to keep home, creating default 0 values");
        const keepHome = {
            "spear": 0,  "sword": 0,  "axe": 0,  "archer": 0,
            "light": 0,  "marcher": 0,"heavy": 0
        };
        localStorage.setItem("keepHome", JSON.stringify(keepHome));
    }
    let keepHome = JSON.parse(localStorage.getItem("keepHome"));

    /* --- 3. categoryEnabled ---------------------------------- */
    if (localStorage.getItem("categoryEnabled") == null) {
        localStorage.setItem("categoryEnabled", JSON.stringify([true,true,true,true]));
    }
    let categoryEnabled = JSON.parse(localStorage.getItem("categoryEnabled"));

    /* --- 4. prioritiseHighCat -------------------------------- */
    if (localStorage.getItem("prioritiseHighCat") == null) {
        localStorage.setItem("prioritiseHighCat", JSON.stringify(false));
    }
    let prioritiseHighCat = JSON.parse(localStorage.getItem("prioritiseHighCat"));

    /* --- 5. timeElement -------------------------------------- */
    if (localStorage.getItem("timeElement") == null) {
        localStorage.setItem("timeElement", "Date");
    }
    tempElementSelection = localStorage.getItem("timeElement");

    /* --- 6. sendOrder ---------------------------------------- */
    if (localStorage.getItem("sendOrder") == null) {
        const worldUnits = game_data.units;
        const sendOrder = [];
        for (let i = 0; i < worldUnits.length; i++) {
            if (["militia","snob","ram","catapult","spy","knight"].indexOf(worldUnits[i]) === -1)
                sendOrder.push(worldUnits[i]);
        }
        localStorage.setItem("sendOrder", JSON.stringify(sendOrder));
    }
    let sendOrder = JSON.parse(localStorage.getItem("sendOrder"));

    /* --- 7. runTimes ----------------------------------------- */
    if (localStorage.getItem("runTimes") == null) {
        localStorage.setItem("runTimes", JSON.stringify({ off:4, def:3 }));
    }
    let runTimes = JSON.parse(localStorage.getItem("runTimes"));

    if (typeof premiumBtnEnabled === 'undefined') var premiumBtnEnabled = false;

    /* ==========================================================
       ----------  DEVAM EDEN KOD (UI, hesaplamalar) ------------
       ========================================================== */

    /* ………  (kod kesintisiz olarak devam ediyor) ……… */
    /* =====================================================
       ---------------  YARDIMCI FONKSİYONLAR ---------------
       ===================================================== */

    /** hh:mm:ss biçiminde süre göstergesi */
    function fancyTimeFormat(seconds) {
        if (seconds < 0) return "Time is in the past!";
        const hrs  = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `Max duration: ${hrs}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    }

    /** 1-2 basamaklı sayıyı 0 ile doldur */
    const zp = v => (v>=10? v : '0'+v);

    function setTimeToField(runtimeHrs) {
        const d = new Date(serverDate + runtimeHrs*3600*1000);
        return `${zp(d.getHours())}:${zp(d.getMinutes())}`;
    }
    function setDayToField(runtimeHrs) {
        const d = new Date(serverDate + runtimeHrs*3600*1000);
        return `${d.getFullYear()}-${zp(d.getMonth()+1)}-${zp(d.getDate())}`;
    }

    /* =====================================================
       -------------  ANA ARAYÜZÜ OLUŞTUR -------------------
       ===================================================== */

    function buildUI() {
        /* mevcut pencere varsa temizle */
        $("#massScavengeSophie").remove();

        /* spear & sword varsayılan olarak işaretlensin */
        const checkAttr = u => (troopTypeEnabled[u] ? 'checked' : '');

        /* ünite kutuları */
        let unitCells = '';
        sendOrder.forEach(u=>{
            unitCells += `
            <td align="center" style="background:${headerColor}">
              <table class="vis" style="width:100%">
                <tr><td style="background:${headerColor};padding:5px">
                    <img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_${u}.png" title="${u}"></td></tr>
                <tr><td style="background:${backgroundColor};padding:5px">
                    <input type="checkbox" id="${u}" ${checkAttr(u)}></td></tr>
                <tr><td style="background:#202225;padding:5px;color:#ffffdf">Backup</td></tr>
                <tr><td style="background:${backgroundColor};padding:5px">
                    <input type="text" id="${u}Backup" value="${keepHome[u]||0}" size="4"></td></tr>
              </table>
            </td>`;
        });

        const html = `
<div id="massScavengeSophie" class="ui-widget-content"
     style="position:fixed;top:60px;left:50%;transform:translateX(-50%);
            width:620px;background:${backgroundColor};color:#fff;z-index:50;">
   <button id="x"  style="position:absolute;top:0;right:0;width:30px;height:30px;
           background:red;color:#fff;border:none;">X</button>

   <table class="vis" style="width:100%;background:${backgroundColor};border:1px solid ${borderColor}">
     <tr><td style="background:${headerColor};text-align:center" colspan="15">
           <h3 style="margin:10px 0"><font color="${titleColor}">${langShinko[0]}</font></h3></td></tr>
     <tr><td style="background:${headerColor};text-align:center" colspan="15">
           <b>${langShinko[1]}</b></td></tr>
     <tr id="imgRow">${unitCells}</tr>
   </table>

   <hr>

   <center>
      <button class="btnSophie" id="calcBtn" style="margin:8px 0;">${langShinko[5]}</button>
   </center>
</div>`;

        $("body").append(html);
        $("#massScavengeSophie").draggable();
        $("#x").click(()=>$("#massScavengeSophie").remove());
        $("#calcBtn").click(readyToSend);
    }

    /* =====================================================
       ----------  KULLANICI GİRİŞLERİNİ OKU ----------------
       ===================================================== */
    function readyToSend() {
        /* spear & sword dışında seçilenleri güncelle */
        sendOrder.forEach(u=>{
            troopTypeEnabled[u] = $("#"+u).is(":checked");
            keepHome[u]        = Number($("#"+u+"Backup").val()||0);
        });
        localStorage.setItem("troopTypeEnabled", JSON.stringify(troopTypeEnabled));
        localStorage.setItem("keepHome", JSON.stringify(keepHome));

        /* devama geç … */
        getData();
    }

    /* =====================================================
       ---------------  VERİ ÇEK ve GÖNDER -----------------
       ===================================================== */

    const URLReq = (game_data.player.sitter>0)
      ? `game.php?t=${game_data.player.id}&screen=place&mode=scavenge_mass`
      : "game.php?&screen=place&mode=scavenge_mass";

    /* ……… getData, calculateHaulCategories, sendGroup vs.
       Orijinal scriptte ne varsa BURADA aynı kalıyor.
       (Bu bölümler Part 3’te devam ediyor.) ……… */

    /* === başlat === */
    buildUI();
})();
/* =====================================================
   -------------  AJAX TOPLU İNDİRİCİ -------------------
   ===================================================== */
/* jQuery eklentisi – orijinaldeki ile aynı */
$.getAll = function (
    urls,           /* dizi      */
    onLoad,         /* (i,html)  */
    onDone,         /* ()        */
    onError         /* (err)     */
){
    let done=0, last=0, wait=250;
    (function nx(){
        if(done===urls.length) return onDone();
        const now = Date.now();
        if(now-last < wait) return setTimeout(nx, wait-(now-last));
        last = now;
        $.get(urls[done]).done(d=>{
            try{ onLoad(done,d); ++done; nx(); }
            catch(e){ onError(e); }
        }).fail(onError);
    })();
};

/* =====================================================
   ---------  SAYFA SAYI + DÜNYA SABİTLERİNİ AL ----------
   ===================================================== */
function getMassPages(cb){
    $.get(URLReq, html=>{
        const last = $(html).find('.paged-nav-item').last().attr('href');
        const pages = last ? (+last.match(/page=(\d+)/)[1]) : 0;
        const urls  = Array.from({length:pages+1}, (_,i)=>URLReq+"&page="+i);

        /* exponent / factor */
        const worldObj = JSON.parse($(html)
            .find('script:contains("ScavengeMassScreen")')
            .html().match(/\{.*\}/)[0]);
        duration_exponent         = worldObj[1].duration_exponent;
        duration_factor           = worldObj[1].duration_factor;
        duration_initial_seconds  = worldObj[1].duration_initial_seconds;

        cb(urls);
    });
}

/* =====================================================
   -------------  ANA “HESAPLA & GÖNDER” ----------------
   ===================================================== */
function getData(){
    squad_requests = []; squad_requests_premium=[];
    getMassPages(urls=>{
        let raw="[";

        $.getAll(urls, (i,html)=>{
            /* her sayfadaki village json’ları */
            const snip = $(html)
              .find('script:contains("ScavengeMassScreen")')
              .html().match(/\{.*?\}/g)[2];
            raw += snip + ",";
        }, ()=>{
            raw = raw.slice(0,-1)+"]";
            scavengeInfo = JSON.parse(raw);

            scavengeInfo.forEach(calcVillage);
            if(!squad_requests.length){
                UI.InfoMessage("Hiç uygun köy yok!",3000); return;
            }
            buildLaunchUI();   /* buton ekranı */
        }, console.error);
    });
}

/* =====================================================
   ----------  VİLLAGE → TROOP HESAPLAMASI --------------
   ===================================================== */
function calcVillage(v){
    if(!v.has_rally_point) return;

    /* kullanılabilir birlikler */
    const allowed={};
    Object.keys(troopTypeEnabled).forEach(u=>{
        if(!troopTypeEnabled[u]) return;
        const avail = v.unit_counts_home[u] - (keepHome[u]||0);
        if(avail>0) allowed[u]=avail;
    });
    if(!Object.keys(allowed).length) return;

    /* off / def ayrımı */
    const type = {spear:'def',sword:'def',axe:'off',archer:'def',
                  light:'off',marcher:'off',heavy:'def'};
    const counts = {off:0,def:0};
    Object.keys(allowed).forEach(u=> counts[type[u]]+=allowed[u]);

    /* hedef süreye göre “haul” büyüklüğü */
    const hrs = (counts.off>counts.def)?time.off:time.def;
    const haul = Math.sqrt(Math.pow(
        ((hrs*3600)/duration_factor - duration_initial_seconds),
        1/duration_exponent) / 100);

    /* kategori & loot dağılımı – orijinal ile aynı mantık */
    const mult  = [0,0.1,0.25,0.50,0.75];
    const rate  = {};
    for(let i=1;i<=4;i++){
        if(v.options[i].is_locked || v.options[i].scavenging_squad) rate[i]=0;
        else rate[i] = haul / mult[i];
    }

    /* kullanıcının kapattığı kategorileri sıfırla */
    enabledCategories.forEach((b,i)=>{ if(!b) rate[i+1]=0; });

    const totalHaul = rate[1]+rate[2]+rate[3]+rate[4];
    if(!totalHaul) return;

    /* birim başı taşıma */
    const cap = {spear:25,sword:15,axe:10,archer:10,light:80,
                 marcher:50,heavy:50,knight:100};

    /* === gönderilecek birlik paketleri === */
    const squadsPerCat = [ {},{},{},{} ];   /* 0..3 */
    let left = {...allowed};

    /* yüksek kategori önceliği */
    for(let c=3;c>=0;c--){
        let need = rate[c+1];
        sendOrder.forEach(u=>{
            if(!left[u]||need<=0) return;
            const needUnits = Math.min(left[u], Math.floor(need/cap[u]));
            if(needUnits){
              squadsPerCat[c][u]=needUnits;
              left[u]-=needUnits; need-=needUnits*cap[u];
            }
        });
    }

    /* request objelerini topla */
    squadsPerCat.forEach((uObj,idx)=>{
        if(!Object.keys(uObj).length) return;
        const req = {village_id:v.village_id,
                     candidate_squad:{unit_counts:uObj,carry_max:9999999},
                     option_id:idx+1};
        squad_requests.push({...req,use_premium:false});
        squad_requests_premium.push({...req,use_premium:true});
    });
}

/* =====================================================
   --------------  GRUP GÖNDERME EKRANI -----------------
   ===================================================== */
function buildLaunchUI(){
    $("#massScavengeFinal").remove();

    /* 200’lük gruplara böl */
    const packs = [];
    for(let i=0;i<squad_requests.length;i+=200)
        packs.push(squad_requests.slice(i,i+200));

    let rows = '';
    packs.forEach((_,i)=>{
        rows += `<tr id="row${i}" style="text-align:center;background:${backgroundColor}">
                   <td><button class="btnSophie" onclick="sendGroup(${i},false)">
                       ${langShinko[8]}${i+1}</button></td>
                   <td><button class="btnSophie" style="display:${premiumBtnEnabled?'':'none'}"
                       onclick="sendGroup(${i},true)">${langShinko[8]}${i+1} PP</button></td>
                 </tr>`;
    });

    const box = `
<div id="massScavengeFinal" class="ui-widget-content"
     style="position:fixed;top:80px;left:50%;transform:translateX(-50%);
            background:${backgroundColor};padding:6px;z-index:60">
  <button id="clsFin" style="position:absolute;top:0;right:0;width:26px;
          background:red;color:#fff;border:none">X</button>
  <table class="vis" style="width:100%;background:${backgroundColor};border:1px solid ${borderColor}">
     <tr><td style="background:${headerColor};text-align:center">
         <b><font color="${titleColor}">${langShinko[7]}</font></b></td></tr>
     ${rows}
  </table>
</div>`;
    $("body").append(box);
    $("#clsFin").click(()=>$("#massScavengeFinal").remove());
    $("#massScavengeFinal").draggable();
}

/* =====================================================
   --------------  GÖNDERME FONKSİYONU ------------------
   ===================================================== */
window.sendGroup = function(idx,withPP){
    const arr = withPP ? squad_requests_premium : squad_requests;
    const pack = arr.slice(idx*200, idx*200+200);
    $('button',`#row${idx}`).prop('disabled',true);

    TribalWars.post('scavenge_api',
        {ajaxaction:'send_squads'},
        {squad_requests:pack},
        ()=>UI.SuccessMessage("Gönderildi"), true
    );
};

/* === hazır! UI zaten buildUI içinde çağrılmıştı === */
/* =====================================================
   ---------------  ANA UI (Özet Pencere) ---------------
   ===================================================== */
function buildMainUI(){
    $("#massScavengeSophie").remove();

    const box = `
<div id="massScavengeSophie" class="ui-widget-content"
     style="position:fixed;top:120px;left:50%;transform:translateX(-50%);
            background:${backgroundColor};padding:6px;z-index:55">
  <button id="clsMain" style="position:absolute;top:0;right:0;width:26px;
          background:red;color:#fff;border:none">X</button>
  <table class="vis" style="width:100%;background:${backgroundColor};border:1px solid ${borderColor}">
     <tr><td style="background:${headerColor};text-align:center">
        <b><font color="${titleColor}">${langShinko[5]}</font></b></td></tr>
     <tr><td style="text-align:center;padding:6px">
        <button id="goCalc" class="btnSophie">${langShinko[5]}</button>
     </td></tr>
  </table>
</div>`;
    $("body").append(box);
    $("#clsMain").click(()=>$("#massScavengeSophie").remove());
    $("#goCalc").click(()=>{ $("#massScavengeSophie").remove(); getData(); });
    $("#massScavengeSophie").draggable();
}

/* =====================================================
   -------------  DEFAULT SPEAR + SWORD ON --------------
   ===================================================== */
function forceSpearSword(){
    Object.keys(troopTypeEnabled).forEach(u=>{
        troopTypeEnabled[u] = (u==="spear" || u==="sword");
    });
    localStorage.setItem("troopTypeEnabled", JSON.stringify(troopTypeEnabled));
}

/* =====================================================
   ------------------  BAŞLANGIÇ ------------------------
   ===================================================== */
(function init(){
    /* yanlış sayfadaysa yönlendir */
    if(location.href.indexOf("screen=place&mode=scavenge_mass")===-1){
        location.assign(game_data.link_base_pure+"place&mode=scavenge_mass");
        return;
    }
    /* spear+sword varsayılan yap */
    forceSpearSword();

    /* ilk küçük pencere */
    buildMainUI();
})();
