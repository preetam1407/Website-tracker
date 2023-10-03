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


let localTimeCache = {};

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
            const updatedTime = (localTimeCache[domain] || domainTime) + 1;
            localTimeCache[domain] = updatedTime;

            if (updatedTime % 2 === 0) {
                if (!storedObject[today]) storedObject[today] = {};
                storedObject[today][domain] = updatedTime;
                chrome.storage.local.set(storedObject, function () {
                    console.log(`Set ${domain} at ${updatedTime}`);
                });
            }

            chrome.action.setBadgeText({ text: secondsToString(updatedTime) });
            checkTimeAgainstGlobalLimit(domain, updatedTime);
            checkTimeAgainstWebsiteSpecificLimit(domain, updatedTime);
        });
    });
}


function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function updateDailyTotal() {
    const today = getTodayString();
    
    // First, get the total time spent on all domains for today
    chrome.storage.local.get(today, function(storedObject) {
        let todayTotal = 0;
        if (storedObject[today]) {
            for (const domain in storedObject[today]) {
                todayTotal += storedObject[today][domain];
            }
        }

        console.log(`Total time spent today (${today}): ${todayTotal} seconds`);

        // Now, update the daily totals for the last 7 days
        chrome.storage.local.get("dailyTotals", function(data) {
            let dailyTotals = data.dailyTotals || [];
            
            // Check if today's data is already there
            const todayIndex = dailyTotals.findIndex(entry => entry.date === today);
            
            if (todayIndex !== -1) {
                dailyTotals[todayIndex].total = todayTotal; 
            } else {
                dailyTotals.push({ date: today, total: todayTotal }); 
            }
            
            // Ensure we only keep the last 7 days of data
            if (dailyTotals.length > 7) {
                dailyTotals.shift();
            }
            
            
           
            chrome.storage.local.set({ dailyTotals: dailyTotals });

            console.log("Daily totals for the last 7 days:");
            dailyTotals.forEach(entry => {
                console.log(`${entry.date}: ${entry.total} seconds`);
            });
        });
    });
}

// Start updating the daily total every 10 seconds
const DAILY_TOTAL_UPDATE_INTERVAL = 10000;  
setInterval(updateDailyTotal, DAILY_TOTAL_UPDATE_INTERVAL);


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

let oneTimeNotifiedDomains = [];

function checkTimeAgainstWebsiteSpecificLimit(domain, timeSpent) {
    chrome.storage.sync.get(['websiteThresholds'], function(items) {
        const websiteThresholds = items.websiteThresholds || {};
        const domainSettings = websiteThresholds[domain];

        if (domainSettings) {
            const thresholdInSeconds = domainSettings.threshold * 60;
            const isPeriodic = domainSettings.notificationType === "periodic";

            if (isPeriodic && timeSpent >= thresholdInSeconds && timeSpent % thresholdInSeconds === 0) {
                sendNotification(domain, timeSpent);
            } else if (!isPeriodic && timeSpent >= thresholdInSeconds && !oneTimeNotifiedDomains.includes(domain)) {
                sendNotification(domain, timeSpent);
                oneTimeNotifiedDomains.push(domain);
            }
        }
    });
}

function sendNotification(domain, timeSpent) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'popup/icons/fast-time.png',
        title: 'Website Specific Time Limit Exceeded',
        message: `You've spent more than ${(timeSpent / 60)} minutes on ${domain}.`
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
