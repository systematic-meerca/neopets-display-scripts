// ==UserScript==
// @name        Neopets Random Events Logger
// @version     1.0.2
// @updateURL   https://raw.githubusercontent.com/systematic-meerca/neopets-display-scripts/main/random-event-logger.user.js
// @author      systematic-meerca
// @match       *://www.neopets.com/*
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

(async () => {
  /** Change NUMBER_RECENT_EVENTS if you'd like to see MORE past events. **/
  const NUMBER_RECENT_EVENTS = 5;
  const SETTINGS_STORAGE = 'showContent';
  const STORAGE = "randomevents";
  
  const tmp = await GM.getValue(SETTINGS_STORAGE, 'true');
  const PROPS = {
    showSettings: false,
    showContent: tmp == 'true',
    clearAllWarning: false
  };

  const STYLE = `
<style>
.randomEventTracker {
	background-color: white;
}
.recentContainer {
	text-align: left;
	border: 2px solid #E4E4E4;
}
.recentContainerHeader {
	font-size:8pt;
	font-weight: 600;
	border: 2px solid #E4E4E4;
	background-color:background-color: #EFEFEF;
}
.recentEventItem {
	border:1px solid grey;
	font-size:7pt;
}
.recentEventItem.notLast {
	border-bottom: 0px;
}
.recentEventItem.alt {
	background-color:#EFEFEF
}
.reEventPremium {
	border-color:gold;
}
.confirmClearBox {
	display: flex;
	justify-content: space-evenly;
}
.pointer {
	cursor: pointer
}
#randomEventTrackerSettings td {
	border-bottom: 1px solid black;
}
.reLoggerJustifyBetween {
  display:flex;
  justify-content:space-between;
	font-size:8pt;
}

.reArrowIcon {
  background: lightgray;
  border-radius: 5px;
  width: 9px;
}
.randomEventLogHiddenItem {
	display:none;
}
.randomEventLogItemDate {
	font-style: italic;
}
</style>
`;
  const MAX_EVENT_CHARACTERS = 60;
  
  const clipEventText = (text) => {
    if (text.length > MAX_EVENT_CHARACTERS) {
	     return text.slice(0,MAX_EVENT_CHARACTERS) + '...';
    } 
    return text;    
  }

  const getEvents = async () => {
    const storage = await GM.getValue(STORAGE, "[]");
    return JSON.parse(storage);
  }
  
  const clearAllEvents = () => {
       GM.setValue(STORAGE, "[]");
  }
  
  const exportEventLogsToCsv = async () => {
    const eventData = await getEvents();
    const filename = "neopets-random-event-log.csv";
    const headers = ["Random Event", "Timestamp", "Premium Event"];
    const csvData = [headers.join(',')];    
    eventData.forEach(event => csvData.push([
      event.event.replaceAll(",", "-"),
      new Date(event.timestamp).toLocaleString().replaceAll(",", ""),
      event.premium
    ].join(',')));

    const blob = new Blob([csvData.join("\n")], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
  
  const checkForEvent = async () => {
    // Regular Events: 
    const re = document.getElementsByClassName("randomEvent");
    if(re && re[0]) {
      const copy = re[0].getElementsByClassName("copy");
      if (copy && copy[0]){
        const event = {
          event: copy[0].innerText,
          premium: false,
          timestamp: new Date().getTime()
        }
        
        const events = await getEvents();        
        events.unshift(event);
        GM.setValue(STORAGE, JSON.stringify(events));
        
      }
    }
    // Premium Events: 
    const pe = document.getElementById("shh_prem_bg");
    if (pe) {
        const event = {
          event: pe.innerText,
          premium: true,
          timestamp: new Date().getTime()
        }
        const events = await getEvents();        
        events.unshift(event);
        GM.setValue(STORAGE, JSON.stringify(events));
        
      }
    }
  

  
  const displayEventTracker = async () => {
    const sidebar = document.getElementsByClassName("sidebar");
    
    if ( sidebar && sidebar.length ) {
      
     	const events = await getEvents();      
      const now = new Date().getTime();
      
      const moduleHtml = `
${STYLE}
<div id="randomEventTrackerModule" class="sidebarModule" style="margin-bottom: 7px;">
	<table class="sidebarTable" width="158" cellspacing="0" cellpadding="2" border="0">
		<tbody><tr>
			<td class="sidebarHeader medText" valign="middle">
					Random Events
					<div style="float:right;">
            <img id="randomEventTrackerSettingsModule" src="//images.neopets.com/help/question_mark.png" alt="" width="13" height="13" border="0" align="absbottom">
            <img id="randomEventTrackerExpandIcon" class="reArrowIcon" src="//www.neopets.com/icons/${PROPS.showContent ? 'up':'down'}.gif">
          </div>
			</td>
		</tr>
		${ PROPS.showSettings ? `
    <tr id="randomEventTrackerSettings">
  		<td class="randomEventTracker" align="center" style="text-align:left;">
					<button id="downloadLogSpreadSheet">Download Logs</button> 
					<a id="downloadLogsInfoBtn" class="clearLink pointer">?</a>
					${PROPS.showCsvHelp ? `
						<div style="font-size:7pt;">
              This will generate a CSV file and offer you to download it. 
              <br>
              CSV files are spreadsheets which can be opened using Microsoft Excel, OpenOffice Calc, or the Numbers app on Mac. It will be comma-separated.
              <br> 
              <a href="https://www.wikihow.com/Open-CSV-Files"> WikiHow on opening a CSV file </a>
					</div>
` : ''}


 					<button id="clearAllREsBtn">Clear Events </button>
          ${ PROPS.clearAllWarning ? `
					<div>
            Are you sure you want to clear all events?
            <div class="confirmClearBox">
              <a id="finalizeClear" class="clearLink pointer"> Yes </a> 
              <a id="cancelClear"  class="clearLink pointer"> No </a>
            </div>
          </div>` : ""}
        </td>
		</tr>
		` : ''}
		${ PROPS.showContent ? `
		<tr id="randomEventTrackerContent">
			<td class="randomEventTracker" align="center">
				${ events.length ? `
        <div class="recentContainer">
					<div class="recentContainerHeader"> Recent Events: </div>
					${events.slice(0, NUMBER_RECENT_EVENTS).map((e, i, array) => `
          	<div class="recentEventItem 
							${i%2!=0 ? 'alt' : ''} 
							${i+1!= array.length  ? 'notLast' : ''}
							${e.premium ? 'reEventPremium' : ''}
						"> 
							<div id="recentEventLogClipped-${i}" class="pointer">
								${clipEventText(e.event)} 
							</div>
							<div id="recentEventLogFull-${i}" class="pointer randomEventLogHiddenItem">
								<div class="randomEventLogItemDate"> ${new Date(e.timestamp).toLocaleString()} </div>
								<div> ${e.event} </div>
							</div>
						</div>
					`).join(' ')}
					</div>
        </div>`
            : ""}
				<div class="reLoggerJustifyBetween"> 
					<div><b>Count today </b></div>
        	<div> ${events.filter(e => e.timestamp > (now - 1000 * 60 * 60 * 24)).length} </div>
        </div>
        <div class="reLoggerJustifyBetween"> 
					<div><b>Total logged</b></div>
					<div> ${events.length} </div> 
				</div>
			</td>
		</tr>
		` : ''}
	</tbody></table>
</div>
`;
  
      const module = document.createElement('div');
      module.innerHTML = moduleHtml;
      sidebar[0].append(module);
      
      events.slice(0, NUMBER_RECENT_EVENTS).forEach((e, i) => {
          const clippedMsg = document.getElementById(`recentEventLogClipped-${i}`);
          clippedMsg && clippedMsg.addEventListener('click', ()=>{ 
           	clippedMsg.classList.add("randomEventLogHiddenItem");
            document.getElementById(`recentEventLogFull-${i}`).classList.remove("randomEventLogHiddenItem");
          });
      })
      
      const toggleModule = document.getElementById("randomEventTrackerExpandIcon");
     	toggleModule && toggleModule.addEventListener('click', ()=>{ 
    		PROPS.showContent = !PROPS.showContent;
        PROPS.showSettings = !PROPS.showContent ? false : PROPS.showSettings; 
        GM.setValue(SETTINGS_STORAGE, PROPS.showContent.toString());
        reloadModule().then();
      });
     
      const toggleSettings = document.getElementById("randomEventTrackerSettingsModule");
     	toggleSettings && toggleSettings.addEventListener('click', ()=>{ 
    		PROPS.showSettings = !PROPS.showSettings;
        reloadModule().then();
      });
      
      const toggleCsvHelp = document.getElementById("downloadLogsInfoBtn");
     	toggleCsvHelp && toggleCsvHelp.addEventListener('click', ()=>{ 
    		PROPS.showCsvHelp = !PROPS.showCsvHelp;
        reloadModule().then();
      });

      const clear = document.getElementById("clearAllREsBtn");
     	clear && clear.addEventListener('click', ()=>{ 
    		PROPS.clearAllWarning = true;
        reloadModule().then();
      });
      
      const confirmClear = document.getElementById("finalizeClear");
     	confirmClear && confirmClear.addEventListener('click', ()=>{ 
    		PROPS.clearAllWarning = false;
        clearAllEvents();
        reloadModule().then();
      });
      
      const cancelClear = document.getElementById("cancelClear");
     	cancelClear && cancelClear.addEventListener('click', ()=>{ 
    		PROPS.clearAllWarning = false;
        reloadModule().then();
      });
      
      const getEventsCsv = document.getElementById("downloadLogSpreadSheet");
     	getEventsCsv && getEventsCsv.addEventListener('click', ()=>{ 
    		exportEventLogsToCsv().then();
      });

    }
  }
  
  const reloadModule = async () => {
    const node = document.getElementById("randomEventTrackerModule");
    node.parentNode.removeChild(node);
    await displayEventTracker();
  }

  
  await checkForEvent();
  await displayEventTracker();


})().then();