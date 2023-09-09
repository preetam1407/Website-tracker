chrome.action.setBadgeBackgroundColor({ color: "#00CED1" });

function isValidURL(givenURL) {
  return givenURL && givenURL.includes(".");
}

function secondsToString(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const timeComponents = [];
  if (hours > 0) timeComponents.push(`${hours} h`);
  if (minutes > 0 || (hours === 0 && remainingSeconds === 0)) timeComponents.push(`${minutes} m`);
  if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) timeComponents.push(`${remainingSeconds} s`);
  
  return timeComponents.join(" ");
}

function getDateString(nDate) {
  return `${nDate.getFullYear()}-${String(nDate.getMonth() + 1).padStart(2, "0")}-${String(nDate.getDate()).padStart(2, "0")}`;
}

function getDomain(url) {
  return new URL(url).hostname;
}

function updateTime() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (activeTab) {
    const domain = getDomain(activeTab[0].url);
    if (!isValidURL(domain)) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    const today = getDateString(new Date());
    chrome.storage.local.get(today, function (storedObject) {
      const domainTime = (storedObject[today] && storedObject[today][domain]) || 0;
      const updatedTime = domainTime + 1;

      if (!storedObject[today]) storedObject[today] = {};
      storedObject[today][domain] = updatedTime;

      chrome.storage.local.set(storedObject, function () {
        console.log(`Set ${domain} at ${updatedTime}`);
        chrome.action.setBadgeText({ text: secondsToString(updatedTime) });
        checkTimeAgainstGlobalLimit(domain, updatedTime);
        // Check against specific website threshold
        checkTimeAgainstWebsiteSpecificLimit(domain, updatedTime);
      });
    });
  });
}

function checkTimeAgainstGlobalLimit(domain, timeSpent) {
  const timeSpentInMinutes = timeSpent / 60;
  chrome.storage.sync.get(["globallimit", "notifiedDomains"], function(items) {
      const notifiedDomains = items.notifiedDomains || [];

      if (timeSpentInMinutes >= items.globallimit && !notifiedDomains.includes(domain)) {
          chrome.notifications.create({
              type: 'basic',
              iconUrl: 'popup/icons/fast-time.png',
              title: 'Time Limit Exceeded',
              message: `You've spent more than ${items.globallimit} minutes on ${domain}.`
          });

          // Save this domain to the notified list
          notifiedDomains.push(domain);
          chrome.storage.sync.set({ "notifiedDomains": notifiedDomains });
      }
  });
}

function checkTimeAgainstWebsiteSpecificLimit(domain, timeSpent) {
  chrome.storage.sync.get(['websiteThresholds'], function(items) {
      const websiteThresholds = items.websiteThresholds || {};
      const domainSettings = websiteThresholds[domain];

      if (domainSettings) {
          const thresholdInSeconds = domainSettings.threshold * 60;
          const isPeriodic = domainSettings.notificationType === "periodic";

          if (timeSpent >= thresholdInSeconds && (timeSpent % thresholdInSeconds === 0 || !isPeriodic)) {
              chrome.notifications.create({
                  type: 'basic',
                  iconUrl: 'popup/icons/fast-time.png',
                  title: 'Website Specific Time Limit Exceeded',
                  message: `You've spent more than ${(timeSpent / 60)} minutes on ${domain}.`
              });
          }
      }
  });
}


let intervalID;

function startTimer() {
    if (!intervalID) {
        intervalID = setInterval(updateTime, 1000);
    }
}

function stopTimer() {
    if (intervalID) {
        clearInterval(intervalID);
        intervalID = null;
    }
}

function checkAndUpdateTimer() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        if (tabs.length) {
            const tab = tabs[0];
            chrome.windows.get(tab.windowId, {}, function(window) {
                if (window.focused && tab.active) {
                    startTimer();
                } else {
                    stopTimer();
                }
            });
        } else {
            stopTimer();
        }
    });
}


chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        stopTimer();
    } else {
        checkAndUpdateTimer();
    }
});

chrome.tabs.onActivated.addListener(function() {
    checkAndUpdateTimer();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active) {
        checkAndUpdateTimer();
    }
});

chrome.tabs.onRemoved.addListener(function() {
    checkAndUpdateTimer();
});

// Initialize timer on extension load.
checkAndUpdateTimer();











































// function isValidURL(givenURL) {
//   return givenURL && givenURL.includes(".");
// }

// function secondsToString(seconds,compressed=false){
//     let hours = parseInt(seconds/3600);
//     seconds = seconds%3600;
//     let minutes= parseInt(seconds/60);
//     seconds = seconds%60;
//     let timeString = "";
//     if(hours){
//       timeString += hours + " hrs ";
//     }
//     if(minutes){
//       timeString += minutes + " min ";
//     }
//     if(seconds){
//       timeString += seconds+ " sec ";
//     }
//     if(!compressed){
//       return timeString;
//     }
//     else{
//       if(hours){
//         return(`${hours}h`);
//       }
//       if(minutes){
//         return(`${minutes}m`);
//       }
//       if(seconds){
//         return(`${seconds}s`);
//       }
//     }
//   };

// // function getDateString(nDate) {
// //   return moment(nDate).format("YYYY-MM-DD");
// // }


// function getDateString(nDate){
//   let nDateDate=nDate.getDate();
//   let nDateMonth=nDate.getMonth()+1;
//   let nDateYear=nDate.getFullYear();
//   if(nDateDate<10){nDateDate="0"+nDateDate;};
//   if(nDateMonth<10){nDateMonth="0"+nDateMonth;};
//   let presentDate = nDateYear+"-"+nDateMonth+"-"+nDateDate;
//   return presentDate;
// }


// function getDomain(tablink){
//   if(tablink){
//     let url =  tablink[0].url;
//     return url.split("/")[2];
//   }
//   else{
//     return null;
//   }
// };

// function updateTime(){
//     chrome.tabs.query({"active":true,"lastFocusedWindow": true},function(activeTab){
//         let domain = getDomain(activeTab);
//         if(isValidURL(domain)){
//           let today = new Date();
//         let presentDate = getDateString(today);
//         let myObj = {};
//         myObj[presentDate]={};
//         myObj[presentDate][domain] = "";
//         let timeSoFar = 0;
//         chrome.storage.local.get(presentDate,function(storedObject){
//             if(storedObject[presentDate]){
//               if(storedObject[presentDate][domain]){
//                 timeSoFar = storedObject[presentDate][domain]+1;
//                 storedObject[presentDate][domain] = timeSoFar;
//                 chrome.storage.local.set(storedObject,function(){
//                     console.log("Set "+domain+" at "+storedObject[presentDate][domain]);
//                     chrome.action.setBadgeText({'text':secondsToString(timeSoFar,true)});
//                 });
//               }
//               else{
//                 timeSoFar++;
//                 storedObject[presentDate][domain] = timeSoFar;
//                 chrome.storage.local.set(storedObject,function(){
//                   console.log("Set "+domain+" at "+storedObject[presentDate][domain]);
//                   chrome.action.setBadgeText({'text':secondsToString(timeSoFar,true)});
//                 })
//               }
//             }
//             else{
//               timeSoFar++;
//               storedObject[presentDate] = {};
//               storedObject[presentDate][domain] = timeSoFar;
//               chrome.storage.local.set(storedObject,function(){
//                 console.log("Set "+domain+" at "+storedObject[presentDate][domain]);
//                 chrome.action.setBadgeText({'text':secondsToString(timeSoFar,true)});
//               })
//             }
//         }); 
//         }
//       else{
//         chrome.action.setBadgeText({'text':''});
//       }
//     });

//     // console.log(timeSoFar);
// };

// var intervalID;


// // Initial interval setup
// var intervalID = setInterval(updateTime, 1000);

// function startInterval() {
//   clearInterval(intervalID);
//   updateTime();
//   intervalID = setInterval(updateTime, 1000);
// }

// chrome.tabs.onActivated.addListener(function(_activeInfo) {
//   startInterval();
// });

// chrome.windows.onFocusChanged.addListener(function(windowId) {
//   if (windowId !== chrome.windows.WINDOW_ID_NONE) {
//       startInterval();
//   }
// });





// // chrome.alarms.create({
// //   periodInMinutes: 1/60,
// // })

// // chrome.alarms.onAlarm.addListener((alarm) => {
// //   chrome.storage.local.get(["timer", "running"], (res) => {
// //     const time = res.timer ?? 0
// //     const running = res.running ?? true
// //     if(!running) return

// //     chrome.storage.local.set({
// //       timer: time+1,
// //     })
// //     chrome.action.setBadgeText({
// //       text: `${time+1}`
// //     })
// //     chrome.storage.sync.get(["notificationTime"], (res) => {
// //       const notificationTime = res.notificationTime ?? 1000
// //       if(time % notificationTime === 0) { 
// //     this.registration.showNotification("Time spent on this site", {
// //       body: `${notificationTime} second has passed!` , 
// //       icon: 'icon.png'
// //     })
// //   }
// //   })
// // })
// // })




// function isValidURL(givenURL) {
//   return givenURL && givenURL.includes(".");
// }

// function secondsToString(seconds, compressed = false) {
//   let hours = parseInt(seconds / 3600);
//   seconds = seconds % 3600;
//   let minutes = parseInt(seconds / 60);
//   seconds = seconds % 60;
//   let timeString = "";
//   if (hours) {
//     timeString += hours + " hrs ";
//   }
//   if (minutes) {
//     timeString += minutes + " min ";
//   }
//   if (seconds) {
//     timeString += seconds + " sec ";
//   }
//   if (!compressed) {
//     return timeString;
//   } else {
//     if (hours) {
//       return `${hours}h`;
//     }
//     if (minutes) {
//       return `${minutes}m`;
//     }
//     if (seconds) {
//       return `${seconds}s`;
//     }
//   }
// }

// function getDateString(nDate) {
//   let nDateDate = nDate.getDate();
//   let nDateMonth = nDate.getMonth() + 1;
//   let nDateYear = nDate.getFullYear();
//   if (nDateDate < 10) {
//     nDateDate = "0" + nDateDate;
//   }
//   if (nDateMonth < 10) {
//     nDateMonth = "0" + nDateMonth;
//   }
//   let presentDate = nDateYear + "-" + nDateMonth + "-" + nDateDate;
//   return presentDate;
// }

// function getDomain(tablink) {
//   if (tablink) {
//     let url = tablink[0].url;
//     return url.split("/")[2];
//   } else {
//     return null;
//   }
// }

// let activeTabInFocus = true; // Flag to track if the active tab is in focus
// let intervalID = null;
// let timeSoFar = 0;

// // Initial interval setup
// intervalID = setInterval(updateTime, 1000);

// function updateTime() {
//   if (activeTabInFocus) {
//     chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (activeTab) {
//       let domain = getDomain(activeTab);
//       if (isValidURL(domain)) {
//         let today = new Date();
//         let presentDate = getDateString(today);
//         let myObj = {};
//         myObj[presentDate] = {};
//         myObj[presentDate][domain] = "";

//         chrome.storage.local.get(presentDate, function (storedObject) {
//           if (storedObject[presentDate]) {
//             if (storedObject[presentDate][domain]) {
//               timeSoFar = storedObject[presentDate][domain] + 1;
//               storedObject[presentDate][domain] = timeSoFar;
//               chrome.storage.local.set(storedObject, function () {
//                 console.log("Set " + domain + " at " + storedObject[presentDate][domain]);
//                 chrome.action.setBadgeText({ 'text': secondsToString(timeSoFar, true) });
//               });
//             } else {
//               timeSoFar++;
//               storedObject[presentDate][domain] = timeSoFar;
//               chrome.storage.local.set(storedObject, function () {
//                 console.log("Set " + domain + " at " + storedObject[presentDate][domain]);
//                 chrome.action.setBadgeText({ 'text': secondsToString(timeSoFar, true) });
//               })
//             }
//           } else {
//             timeSoFar++;
//             storedObject[presentDate] = {};
//             storedObject[presentDate][domain] = timeSoFar;
//             chrome.storage.local.set(storedObject, function () {
//               console.log("Set " + domain + " at " + storedObject[presentDate][domain]);
//               chrome.action.setBadgeText({ 'text': secondsToString(timeSoFar, true) });
//             })
//           }
//         });
//       } else {
//         chrome.action.setBadgeText({ 'text': '' });
//       }
//     });
//   }
// }

// function startInterval() {
//   clearInterval(intervalID);
//   updateTime();
//   intervalID = setInterval(updateTime, 1000);
// }

// chrome.tabs.onActivated.addListener(function (_activeInfo) {
//   startInterval();
// });

// chrome.windows.onFocusChanged.addListener(function (windowId) {
//   if (windowId !== chrome.windows.WINDOW_ID_NONE) {
//     activeTabInFocus = true;
//     startInterval();
//   } else {
//     activeTabInFocus = false;
//     clearInterval(intervalID); // Stop the timer when the window loses focus
//   }
// });

// chrome.action.onClicked.addListener(function () {
//   activeTabInFocus = !activeTabInFocus; // Toggle the active tab's focus state
//   if (activeTabInFocus) {
//     startInterval();
//   } else {
//     clearInterval(intervalID); // Stop the timer if the active tab is not in focus
//   }
// });
























































































// let activeTabInFocus = true;
// let timeSoFar = 0;
// let intervalID = null;
// let currentWindowId = null;

// function updateTime() {
//   if (activeTabInFocus) {
//     chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (activeTab) {
//       let domain = getDomain(activeTab);
//       if (isValidURL(domain)) {
//         let today = new Date();
//         let presentDate = getDateString(today);
//         let timeKey = `${presentDate}-${domain}`;

//         chrome.storage.local.get(timeKey, function (storedObject) {
//           timeSoFar = (storedObject[timeKey] || 0) + 1;
//           let newData = {};
//           newData[timeKey] = timeSoFar;

//           chrome.storage.local.set(newData, function () {
//             chrome.action.setBadgeText({ text: secondsToString(timeSoFar, true) });
//             console.log("Updated time spent on", domain, "to", secondsToString(timeSoFar, true));
//           });
//         });
//       } else {
//         chrome.action.setBadgeText({ text: "" });
//         console.log("Invalid domain or no domain detected.");
//       }
//     });
//   }
// }

// function startInterval() {
//   clearInterval(intervalID);
//   updateTime();
//   intervalID = setInterval(updateTime, 1000);
//   console.log("Interval started.");
// }

// // Initialize the current window ID
// chrome.windows.getCurrent({}, function (window) {
//   currentWindowId = window.id;
// });

// chrome.windows.onFocusChanged.addListener(function (windowId) {
//   if (windowId === chrome.windows.WINDOW_ID_NONE) {
//     activeTabInFocus = false;
//     clearInterval(intervalID);
//     console.log("Window lost focus. Interval cleared.");
//   } else {
//     if (windowId !== currentWindowId) {
//       // Focus has switched to a different window
//       currentWindowId = windowId;
//       startInterval();
//       console.log("Window focus switched.");
//     }
//   }
// });

// chrome.action.onClicked.addListener(function () {
//   activeTabInFocus = !activeTabInFocus;
//   if (activeTabInFocus) {
//     startInterval();
//     console.log("Tab is in focus.");
//   } else {
//     clearInterval(intervalID);
//     console.log("Tab lost focus. Interval cleared.");
//   }
// });

// // Add an event listener to detect tab changes
// chrome.tabs.onActivated.addListener(function (_activeInfo) {
//   startInterval();
//   console.log("Tab changed.");
// });