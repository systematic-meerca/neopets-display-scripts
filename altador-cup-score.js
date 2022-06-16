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
        let total = getValue("rankYooyuWins") * 12 
      total += getValue("rankSide0Total") * 6;
      total += getValue("rankSide1Total");
      total += getValue("rankSide2Total");
      const score = document.createElement("b");
      score.innerHTML = `Total Points : ${total.toLocaleString("en-US")}`;
      stats[0].append(score);
    }
})(); 
