// ==UserScript==
// @name         Altador Cup Score Calculator
// @namespace    http://tampermonkey.net/
// @description  Calculates your total points in Altador Cup
// @author       systematic-meerca
// @match        *://www.neopets.com/altador/colosseum/*
// ==/UserScript==


( ()=> {
    const stats = document.getElementsByClassName('YourStatsDetails');
    if (stats && stats[0]) {
      const getValue = (id) => Number.parseInt(document.getElementById(id).innerHTML.replaceAll(',',''));
        let total = getValue("rankYooyuWins") * 12;
      total += getValue("rankSide0Total") * 6;
      total += getValue("rankSide1Total");
      total += getValue("rankSide2Total");
      const score = document.createElement("b");
      score.innerHTML = `Total Points : ${total.toLocaleString("en-US")}`;
      stats[0].append(score);

      if (total => 8800) {
        const allStarRanks = [
          /**20:**/ 8800, /**21:**/ 9570, /**22:**/ 10340, /**23:**/ 11110, /**24:**/ 11880, /**25:**/ 12780, /**26:**/ 13640, /**27:**/ 14520, 
          /**28:**/ 15400, /**29:**/ 16390, /**30:**/ 17380, /**31:**/ 18370, /**32:**/ 19360, /**33:**/ 20460, /**34:**/ 21560, /**35:**/ 22660, 
          /**36:**/ 23760, /**37:**/ 24970, /**38:**/ 26180, /**39:**/ 27390, /**40:**/ 28600, /**41:**/ 29920, /**42:**/ 31240, /**43:**/ 32560, 
          /**44:**/ 33880, /**45:**/ 35310, /**46:**/ 36740, /**47:**/ 38170, /**48:**/ 39600, /**49:**/	41140
        ];
        rank = 20 + allStarRanks.findIndex((val, i) => {
          return total >= val && (!allStarRanks[i+1] || total < allStarRanks[i+1]) ;
        });
        document.getElementById("rankShieldName").innerHTML = `All-Star Rank ${rank}`;
      }
    }


})(); 
