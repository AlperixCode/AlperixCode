// ==UserScript==
// @name                Premium Building Plan for Scav
// @author              Alperix Discord : alper8408
// @include             *://*/*game.php*village=*&screen=main*
// @icon                https://dsus.innogamescdn.com/asset/9639a99d/graphic/unit/unit_spear.png
// @updateURL https://alperixcode.github.io/AlperixCode/Temizlik.user.js 
// @downloadURL https://alperixcode.github.io/AlperixCode/Temizlik.user.js
// ==/UserScript==


//*************************** CONFIGURATION ***************************//
// Choose minimum and maximum waiting time between actions (in milliseconds)
const Min_Wait_Time = 800000;
const Max_Wait_Time = 900000;

// Step 1: Upgrade the bot automatically in Building Series
const Step = "Step_1";

// Choose whether you want the bot to queue buildings in the defined order (= true) or
// as soon as a building is available for the construction queue (= false)
const Building_Construction_Order = false;
//*************************** /CONFIGURATION ***************************//

// Constants (SHOULD NOT BE CHANGED)
const General_View = "OVERVIEW_VIEW";
const Main_Building = "HEADQUARTERS_VIEW";

(function() {
    'use strict';

    console.log("-- Tribal Wars Script Activated --");

    setTimeout(() => {
        if (Step == "Step_1"){
            executeStep1();
        }
        setInterval(function() {
            window.location.reload();
        }, 900000); // 900,000 milliseconds = 15 minutes
    }, 5000); // 5000 milliseconds = 5 seconds

})();



// Step 1: Construction
function executeStep1(){
    let Evolve_Villages = getEvolve_Villages();
    console.log(Evolve_Villages);
    if (Evolve_Villages == Main_Building){
        setInterval(function(){
            // Build any buildable building, if possible
            Next_Building();
        }, 1000);
    }
    else if (Evolve_Villages == General_View){
        // General View PG
        document.getElementById("l_main").children[0].children[0].click();
    }

}
setInterval(function(){
    var text="";
    var tr=$('[id="buildqueue"]').find('tr').eq(1);
    text=tr.find('td').eq(1).find('span').eq(0).text().split(" ").join("").split("\n").join("");
    var timeSplit=text.split(':');

    if(timeSplit[0]*60*60+timeSplit[1]*60+timeSplit[2]*1<3*60){
        console.log("Complete for Free");
        tr.find('td').eq(2).find('a').eq(2).click();
    }
    //mission completed
    $('[class="btn btn-confirm-yes"]').click();

},500);

let delay = Math.floor(Math.random() * (Max_Wait_Time - Min_Wait_Time) + Min_Wait_Time);

// Process Action
let Evolve_Villages = getEvolve_Villages();
console.log(Evolve_Villages);
setTimeout(function(){
    if (Evolve_Villages == Main_Building){
        // Build any buildable building, if possible
        Next_Building();
    }
    else if (Evolve_Villages == General_View){
        // General View Page
        document.getElementById("l_main").children[0].children[0].click();
    }
}, delay);

function getEvolve_Villages(){
    let currentUrl = window.location.href;
    if (currentUrl.endsWith('General View')){
        return General_View;
    }
    else if (currentUrl.endsWith('main')){
        return Main_Building;
    }
}

function Next_Building(){
    let Next_Building_Construct = getNext_Building_Construct();
    if (Next_Building_Construct !== undefined){
        Next_Building_Construct.click();
        console.log("Clicked on " + Next_Building_Construct);
    }
}

function getNext_Building_Construct() {
    let Click_Build_Buildings = document.getElementsByClassName("btn btn-build");
    let Building_Series = getBuilding_Series();
    let establish;
    while(establish === undefined && Building_Series.length > 0){
        var next = Building_Series.shift();
        if (Click_Build_Buildings.hasOwnProperty(next)){
            let next_building = document.getElementById(next);
            var Visible = next_building.offsetWidth > 0 || next_building.offsetHeight > 0;
            if (Visible){
                establish = next_building;
            }
            if (Building_Construction_Order){
                break;
            }
        }
    }
    return establish;
}

function getBuilding_Series() {
    var Construction_Sequence = [];

    // Initial Buildings as shown in the figure: https://i.imgur.com/jPuHuHN.png

    Construction_Sequence.push("main_buildlink_wood_1");
    Construction_Sequence.push("main_buildlink_stone_1");
    Construction_Sequence.push("main_buildlink_iron_1");
    Construction_Sequence.push("main_buildlink_storage_2");
    Construction_Sequence.push("main_buildlink_wood_2");
    Construction_Sequence.push("main_buildlink_stone_2");
    Construction_Sequence.push("main_buildlink_main_2");
    Construction_Sequence.push("main_buildlink_statue_1");
    Construction_Sequence.push("main_buildlink_main_3");
    Construction_Sequence.push("main_buildlink_storage_3");
    Construction_Sequence.push("main_buildlink_market_1");
    Construction_Sequence.push("main_buildlink_wood_3");
    Construction_Sequence.push("main_buildlink_stone_3");
    Construction_Sequence.push("main_buildlink_iron_2");
    Construction_Sequence.push("main_buildlink_storage_4");

    // Recruit Spearman
    Construction_Sequence.push("main_buildlink_barracks_1");
    Construction_Sequence.push("main_buildlink_hide_2");
    Construction_Sequence.push("main_buildlink_hide_3");
    Construction_Sequence.push("main_buildlink_statue_1");
    Construction_Sequence.push("main_buildlink_barracks_2");
    Construction_Sequence.push("main_buildlink_barracks_3");
    Construction_Sequence.push("main_buildlink_iron_3");
    Construction_Sequence.push("main_buildlink_wall_1");
    Construction_Sequence.push("main_buildlink_wall_2");
    Construction_Sequence.push("main_buildlink_farm_2");
    Construction_Sequence.push("main_buildlink_wood_4");
    Construction_Sequence.push("main_buildlink_stone_4");
    Construction_Sequence.push("main_buildlink_farm_3");
    Construction_Sequence.push("main_buildlink_farm_4");
    Construction_Sequence.push("main_buildlink_storage_5");

    // Recruit Paladin - Choose Flag
    Construction_Sequence.push("main_buildlink_hide_4");
    Construction_Sequence.push("main_buildlink_hide_5");
    Construction_Sequence.push("main_buildlink_wood_5");
    Construction_Sequence.push("main_buildlink_stone_5");
    Construction_Sequence.push("main_buildlink_market_2");
    Construction_Sequence.push("main_buildlink_market_3");
    Construction_Sequence.push("main_buildlink_wall_3");
    Construction_Sequence.push("main_buildlink_wood_6");
    Construction_Sequence.push("main_buildlink_stone_6");
    Construction_Sequence.push("main_buildlink_wood_7");
    Construction_Sequence.push("main_buildlink_stone_7");
    Construction_Sequence.push("main_buildlink_iron_4");
    Construction_Sequence.push("main_buildlink_iron_5");
    Construction_Sequence.push("main_buildlink_iron_6");
    Construction_Sequence.push("main_buildlink_wood_8");
    Construction_Sequence.push("main_buildlink_stone_8");
    Construction_Sequence.push("main_buildlink_wood_9");
    Construction_Sequence.push("main_buildlink_wood_10");
    Construction_Sequence.push("main_buildlink_storage_6");
    Construction_Sequence.push("main_buildlink_storage_7");
    Construction_Sequence.push("main_buildlink_storage_8");
    Construction_Sequence.push("main_buildlink_storage_9");
    Construction_Sequence.push("main_buildlink_wood_11");
    Construction_Sequence.push("main_buildlink_iron_7");
    Construction_Sequence.push("main_buildlink_wood_12");
    Construction_Sequence.push("main_buildlink_farm_5");
    Construction_Sequence.push("main_buildlink_barracks_4");
    Construction_Sequence.push("main_buildlink_barracks_5");
    Construction_Sequence.push("main_buildlink_storage_10");
    Construction_Sequence.push("main_buildlink_main_4");
    Construction_Sequence.push("main_buildlink_main_5");
    Construction_Sequence.push("main_buildlink_smith_1");
    Construction_Sequence.push("main_buildlink_smith_2");
    Construction_Sequence.push("main_buildlink_wood_13");
    Construction_Sequence.push("main_buildlink_stone_9");
    Construction_Sequence.push("main_buildlink_stone_10");
    Construction_Sequence.push("main_buildlink_stone_11");
    Construction_Sequence.push("main_buildlink_wood_14");
    Construction_Sequence.push("main_buildlink_iron_8");
    Construction_Sequence.push("main_buildlink_iron_9");
    Construction_Sequence.push("main_buildlink_farm_6");
    Construction_Sequence.push("main_buildlink_market_4");
    Construction_Sequence.push("main_buildlink_market_5");
    Construction_Sequence.push("main_buildlink_market_6");
    Construction_Sequence.push("main_buildlink_stone_12");
    Construction_Sequence.push("main_buildlink_stone_13");
    Construction_Sequence.push("main_buildlink_stone_14");
    Construction_Sequence.push("main_buildlink_wood_15");
    Construction_Sequence.push("main_buildlink_stone_15");

    // Additional Buildings: https://image.prntscr.com/image/oMwaEPpCR2_1XaHzlMaobg.png
    Construction_Sequence.push("main_buildlink_farm_7");
    Construction_Sequence.push("main_buildlink_iron_10");
    Construction_Sequence.push("main_buildlink_iron_11");
    Construction_Sequence.push("main_buildlink_iron_12");
    Construction_Sequence.push("main_buildlink_wood_16");
    Construction_Sequence.push("main_buildlink_stone_16");
    Construction_Sequence.push("main_buildlink_wood_17");
    Construction_Sequence.push("main_buildlink_stone_17");
    Construction_Sequence.push("main_buildlink_iron_13");
    Construction_Sequence.push("main_buildlink_iron_14");
    Construction_Sequence.push("main_buildlink_iron_15");
    Construction_Sequence.push("main_buildlink_storage_11");
    // Additional Buildings: https://image.prntscr.com/image/V15bxH7KSFa5gu3d02yYIQ.png

    Construction_Sequence.push("main_buildlink_farm_8");
    Construction_Sequence.push("main_buildlink_market_7");
    Construction_Sequence.push("main_buildlink_market_8");
    Construction_Sequence.push("main_buildlink_market_9");
    Construction_Sequence.push("main_buildlink_storage_12");
    Construction_Sequence.push("main_buildlink_storage_13");
    Construction_Sequence.push("main_buildlink_storage_14");
    Construction_Sequence.push("main_buildlink_farm_9");
    Construction_Sequence.push("main_buildlink_market_10");
    Construction_Sequence.push("main_buildlink_market_11");
    Construction_Sequence.push("main_buildlink_market_12");
    Construction_Sequence.push("main_buildlink_market_13");
    Construction_Sequence.push("main_buildlink_farm_10");
    Construction_Sequence.push("main_buildlink_hide_6");
    Construction_Sequence.push("main_buildlink_hide_7");
    Construction_Sequence.push("main_buildlink_wall_4");
    Construction_Sequence.push("main_buildlink_wall_5");
    Construction_Sequence.push("main_buildlink_market_14");
    Construction_Sequence.push("main_buildlink_farm_11");
    Construction_Sequence.push("main_buildlink_storage_15");
    Construction_Sequence.push("main_buildlink_main_6");
    Construction_Sequence.push("main_buildlink_main_7");
    Construction_Sequence.push("main_buildlink_main_8");
    Construction_Sequence.push("main_buildlink_main_9");
    Construction_Sequence.push("main_buildlink_main_10");
    Construction_Sequence.push("main_buildlink_smith_3");
    Construction_Sequence.push("main_buildlink_smith_4");
    Construction_Sequence.push("main_buildlink_smith_5");
    Construction_Sequence.push("main_buildlink_stable_1");
    Construction_Sequence.push("main_buildlink_stable_2");
    Construction_Sequence.push("main_buildlink_stable_3");
    Construction_Sequence.push("main_buildlink_farm_12");
    Construction_Sequence.push("main_buildlink_farm_13");
    return Construction_Sequence;
}
