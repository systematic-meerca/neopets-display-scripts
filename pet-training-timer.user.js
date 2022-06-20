// ==UserScript==
// @name        Neopets Training Timer
// @version     1.0-beta
// @updateURL   https://raw.githubusercontent.com/systematic-meerca/neopets-display-scripts/main/pet-training-timer.user.js
// @author      systematic-meerca
// @match       *://www.neopets.com/*
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

(async () => {
    const TYPES = { PIRATE: 'pirate', MYSTERY: 'mystery', NINJA: 'ninja' };
    /** ======== v CUSTOMIZATION OPTIONS BELOW v ============**/
    //  If you only want some school to appear in your report, remove the undesired ones from below:  
    const SHOW_SCHOOLS = [
        TYPES.PIRATE, // Swashbuckling Academy
        TYPES.MYSTERY, // Mystery Island Training School
        TYPES.NINJA // Secret Ninja Academy
    ];

    // If you want links to automatically open in a new tab
    const OPEN_LINKS_IN_NEW_TAB = true;

    // Replace the URLs below with your favorite item or images if you'd like.
    //  NONE_TRAINING_ICON - will appear when no pets are in training
    const NONE_TRAINING_ICON = "//images.neopets.com/items/slu_greentea.gif";
    //  TRAINING_IN_PROGRESS_ICON - will appear at least 1 pet is in training
    const TRAINING_IN_PROGRESS_ICON = "//images.neopets.com/items/bd_krawk_sword.gif";
    // TRAINING_COMPLETE_ICON - Appears if 1 or more pet is done training. If this value is "",
    //                          then icon will represent one of the training schools where a pet is waiting.
    const TRAINING_COMPLETE_ICON = "";
    /** ======== ^ CUSTOMIZATION OPTIONS ABOVE ^ ============ **/


    const SCHOOL_DATA = {
        [TYPES.PIRATE]: {
            name: 'Swashbuckling Academy',
            link: '//www.neopets.com/pirates/academy.phtml?type=status',
            completeIcon: '//images.neopets.com/items/dubloon5.gif'
        },
        [TYPES.MYSTERY]: {
            name: 'Mystery Island Training School',
            link: '//www.neopets.com/island/training.phtml?type=status',
            completeIcon: "//images.neopets.com/items/codestone5.gif"
        },
        [TYPES.NINJA]: {
            name: 'Secret Ninja Training School',
            link: '//www.neopets.com/island/fight_training.phtml?type=status',
            completeIcon: '//images.neopets.com/items/codestone15.gif'
        }
    }

    const STORAGE = 'training-storage';
    const NOW = new Date().getTime();
    const PROPS = {
        timersOpen: false,
        trainingComplete: false,
        completeTrainingLocation: [],
        petsInTraining: false
    };
    const petData = JSON.parse(await GM.getValue(STORAGE, '{}'));

    const updateTrainingData = (school) => {
        const timeCells = [];
        const xpr = document.evaluate(`//td[contains(text(), 'Time till course finishes : ')]`, document, null, 7, null);
        for (let i = 0; item = xpr.snapshotItem(i); i++) {
            timeCells.push(item);
        }
        petData[school] = timeCells.map(cell => {
            const petname = cell.parentElement.firstChild.innerHTML.match(/neopets.com\/cpn\/(.+)\/1\/2.png/g)[0].split('/')[2];
            const time = cell.innerText.match(/(\d+)/g);
            const totalTime = (
                Number.parseInt(time[0]) * 60 * 60 * 1000 //hours
                + Number.parseInt(time[1]) * 60 * 1000 //min
                + Number.parseInt(time[2]) * 1000 //sec
            );

            return {
                name: petname,
                endTime: NOW + totalTime
            }

        });
        GM.setValue(STORAGE, JSON.stringify(petData));
    }

    if (location.href.indexOf("academy.phtml?type=status") != -1) {
        updateTrainingData(TYPES.PIRATE);
    }
    if (location.href.indexOf("training.phtml?type=status") != -1) {
        updateTrainingData(TYPES.MYSTERY);
    }
    if (location.href.indexOf("fight_training.phtml?type=status") != -1) {
        updateTrainingData(TYPES.NINJA);
    }

    const checkPetsInTraining = () => {
        PROPS.completeTrainingLocation = [];
        const types = Object.values(TYPES);
        types.forEach(school => {
            console.log(school);
            if (petData[school] && petData[school].length) {
                petData[school].forEach(pet => {
                    PROPS.petsInTraining = true;
                    if (pet.endTime <= NOW) {
                        console.log("Pet done");
                        PROPS.trainingComplete = true;
                        PROPS.completeTrainingLocation.push(school);
                    } else {
                        console.log("Pet not done");
                    }
                });
            }
        });
    }
    checkPetsInTraining();

    const getTrainingIcon = () => {
        if (PROPS.trainingComplete) {
            if (TRAINING_COMPLETE_ICON) {
                return TRAINING_COMPLETE_ICON;
            } else {
                if (PROPS.completeTrainingLocation && PROPS.completeTrainingLocation.length) {
                    return SCHOOL_DATA[PROPS.completeTrainingLocation[0]].completeIcon;
                }
            }
        }
        if (PROPS.petsInTraining) {
            return TRAINING_IN_PROGRESS_ICON;
        }
        return NONE_TRAINING_ICON;
    };

    const element = `
  <style>
    #trainingTimers {
        position: fixed;
        bottom: 20px;
        right: 30px;
        z-index: 1000;
    }
    #trainingTimersToggleContainer {
    	text-align: right;
    }
    .trainingIcon {
      width: 50px;
      height: 50px;
      border-radius: 25px;
    }
    .trainingIcon.inProgress {
      opacity: 0.7;
    }
    .trainingIcon.complete {
        border: 6px solid orange;
    }
    .pointer {
        cursor: pointer;
    }
    #trainingTimersReport {
	    width: 260px;
        border: 2px solid #EFEFEF;
        background: white;
    }

    .trainingCompleteHeader {
        background-color: orange;
    }
    .trainingTimerPets {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        flex-direction: row;
    }
    .trainingTimerPets-detail{
        display: flex;
        align-items: center;
        width:60%;
    }
    .trainingTimerPets-time {
        width: 40%;
    }
    .trainingTimesHiddenItem {
        display: none;
    }
    ${document.getElementById("content") == null ? `
    #trainingTimers .sidebarHeader {
        background-color: #676B6C;
        border-bottom: 2px solid #C9C9C9;
        color: #000000;
    }
    #trainingTimers .sidebarHeader {
        height: 22px;
        font-weight: bold;
        text-align: left;
        padding-left: 3px;
    }
    #trainingTimers .sidebarHeader A:link, #trainingTimers .sidebarHeader A:hover, #trainingTimers .sidebarHeader A:visited {
        color: #A0EFE3;
    }
    #trainingTimers .sidebarHeader A:link, #trainingTimers .sidebarHeader A:hover, #trainingTimers .sidebarHeader A:visited {
        text-decoration: none;
    }
    #trainingTimers A:link, #trainingTimers A:visited {
        color: #2E72C0;
    }
    #trainingTimers a:link, #trainingTimers a:visited, #trainingTimers a:hover {
        text-decoration: none;
    }
    #trainingTimers a {
        font-weight: bold;
    }
    ` : ''}
  </style>
  <div id="trainingTimers">
      <div id="trainingTimersReport" class="trainingTimesHiddenItem">
        ${SHOW_SCHOOLS.map((s) => {
        const schoolData = SCHOOL_DATA[s];
        return `
          <div class="schoolContainer">
            <div class="sidebarHeader 
              ${PROPS.completeTrainingLocation.indexOf(s) !== -1 ? 'trainingCompleteHeader' : ''}">
              <a href="${schoolData.link}"
              ${OPEN_LINKS_IN_NEW_TAB ? 'target="_blank"' : ''}>
                <b>${schoolData.name}</b>
                </a>
            </div>
            ${petData && petData[s] && petData[s].length ? petData[s].map(pet => {
                console.log(pet);
                const timeLeft = pet.endTime - NOW;
                let hr, min, displayTime;
                if (timeLeft > 0) {
                    hr = (timeLeft) / (60 * 60 * 1000);
                    min = (hr - Math.floor(hr)) * 60;
                    displayTime = new Date(pet.endTime).toLocaleTimeString();
                }
                return `
              <div class="trainingTimerPets">
                <div class="trainingTimerPets-detail">
										<img src="//pets.neopets.com/cpn/${pet.name}/1/1.png">
										<b>${pet.name}</b> 
								</div> 
                <div class="trainingTimerPets-time"> 
                ${timeLeft > 0 ?
                    `${Math.floor(hr)}hrs, ${Math.floor(min)}mins (${displayTime})` : `<b>Complete!</b>`}
                </div>
              </div>
              `
        }).join(' ')
                : ''}
      		</div>
      `;
    }).join(' ')}
      </div>
			<div id="trainingTimersToggleContainer"> 
            <img
            id="trainingTimersToggleIcon"
            class="trainingIcon  ${PROPS.completeTrainingLocation.length ? 'complete' : ''} pointer"
            src="${getTrainingIcon()}">
      </div>
  </div>
  `;
    const trainingTimer = document.createElement('div');
    trainingTimer.innerHTML = element;
    const parentEl = document.getElementById("content") || document.getElementsByTagName("body")[0]
    parentEl.append(trainingTimer);

    const toggle = document.getElementById("trainingTimersToggleIcon");
    toggle && toggle.addEventListener('click', () => {
        const report = document.getElementById("trainingTimersReport");
        report.classList.toggle("trainingTimesHiddenItem");
    });


})().then();