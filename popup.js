function getDateString(nDate) {
  let nDateDate = nDate.getDate();
  let nDateMonth = nDate.getMonth() + 1;
  let nDateYear = nDate.getFullYear();
  if (nDateDate < 10) {
    nDateDate = "0" + nDateDate;
  }
  if (nDateMonth < 10) {
    nDateMonth = "0" + nDateMonth;
  }
  let presentDate = "" + nDateYear + "-" + nDateMonth + "-" + nDateDate;
  return presentDate;
}

function getPreviousMonthDateString(nDate) {
  let nDateMonth = nDate.getMonth();
  let nDateYear = nDate.getFullYear();
  if (nDateMonth === 0) {
    nDateYear -= 1;
    nDateMonth = 12;
  }
  if (nDateMonth < 10) {
    nDateMonth = "0" + nDateMonth;
  }
  let previousMonthDate = "" + nDateYear + "-" + nDateMonth + "-01";
  return previousMonthDate;
}

function getDomain(tablink) {
  let url = tablink[0].url;
  return url.split("/")[2];
}

function secondsToString(seconds,compressed=false){
  let hours = parseInt(seconds/3600);
  seconds = seconds%3600;
  let minutes= parseInt(seconds/60);
  seconds = seconds%60;
  let timeString = "";
  if(hours){
    timeString += hours + " h ";
  }
  if(minutes){
    timeString += minutes + " m ";
  }
  if(seconds){
    timeString += seconds+ " s "
  }
  if(!compressed){
    return timeString;
  }
  else{
    if(hours){
      return(`${hours}h`);
    }
    if(minutes){
      return(`${minutes}m`);
    }
    if(seconds){
      return(`${seconds}s`);
    }
  }
};


// Function to fetch and display the top 10 websites
function displayTopWebsites() {
  // Get the current and previous month dates as strings
  var today = getDateString(new Date());
  var previousMonthDate = getPreviousMonthDateString(new Date());
  let totalTimeSpent = 0;

  chrome.storage.local.get([previousMonthDate, today], function (storedItems) {
    const previousMonthData = storedItems[previousMonthDate] || {};
    const currentMonthData = storedItems[today] || {};

    let allKeys = Object.keys(currentMonthData).filter(key => key !== 'totalTime');
    let sortedTimeList = [];

    for (let i = 0; i < allKeys.length; i++) {
      let webURL = allKeys[i];
      sortedTimeList.push([webURL, currentMonthData[webURL]]);
    }

    sortedTimeList.sort((a, b) => b[1] - a[1]);

    // Extract the top 10 websites from the sorted list
    const topWebsitesData = sortedTimeList.slice(0, 7);

    const webList = document.getElementById('topWebList');
    webList.innerHTML = ''; // Clear the existing table data

    for (let i = 0; i < topWebsitesData.length; i++) {
      let webURL = topWebsitesData[i][0];
      let timeSpent = secondsToString(topWebsitesData[i][1]);

      // Create a new row for each website
      let row = document.createElement('tr');
      let serialNumber = document.createElement('td');
      serialNumber.innerText = i + 1;
      let siteURL = document.createElement('td');
      siteURL.innerText = webURL;
      let siteTime = document.createElement('td');
      siteTime.innerText = timeSpent;

      row.appendChild(serialNumber);
      row.appendChild(siteURL);
      row.appendChild(siteTime);
      webList.appendChild(row);
    }
  });
}




let totalTimeSpent = 0;
  
function displayTotalWebsites() {
  var today = getDateString(new Date());
    var previousMonthDate = getPreviousMonthDateString(new Date());
  
    chrome.storage.local.get([previousMonthDate, today], function (storedItems) {
      const previousMonthData = storedItems[previousMonthDate] || {};
      const currentMonthData = storedItems[today] || {};
    
      let allKeys = Object.keys(currentMonthData).filter(key => key !== 'totalTime');
      let sortedTimeList = [];
    
      for (let i = 0; i < allKeys.length; i++) {
        let webURL = allKeys[i];
        sortedTimeList.push([webURL, currentMonthData[webURL]]);
      }
    
      sortedTimeList.sort((a, b) => b[1] - a[1]);
      console.log(sortedTimeList);
    
    
      const webTable = document.getElementById('todayWebList');
      for (let i = 0; i < allKeys.length; i++) {
        let webURL = sortedTimeList[i][0];
        let row = document.createElement('tr');
        let serialNumber = document.createElement('td');
        serialNumber.innerText = i + 1;
        let siteURL = document.createElement('td');
        siteURL.innerText = webURL;
        let siteTime = document.createElement('td');
        siteTime.innerText = secondsToString(sortedTimeList[i][1]);
        row.appendChild(serialNumber);
        row.appendChild(siteURL);
        row.appendChild(siteTime);
        webTable.appendChild(row);
        console.log(row);
      }
      for (let i = 0; i < sortedTimeList.length; i++) {
        totalTimeSpent += sortedTimeList[i][1];
      }
      const totalTimeSpentElement = document.getElementById('totalTimeSpent');
      totalTimeSpentElement.innerText = secondsToString(totalTimeSpent);


    });
  }

    

document.addEventListener('DOMContentLoaded', function () {

  var homebtn = document.getElementById("home");
  var showStatsButton = document.getElementById("showAllStats");
  var customizationButton = document.getElementById("customizationBtn");
  var summerybutton = document.getElementById("summeryBtn");
  var topwebsitesheading = document.querySelector(".topwebsitesheading");
  var totaltimeheading = document.querySelector(".totaltimeheading");
  var totaltime = document.getElementById("totalTimeSpent");
  var topWebsitesContainer = document.getElementById("topWebsitesTable");
  var totalWebsitesContainer = document.getElementById("dataTable");
  var notificationSection = document.querySelector(".notification-section");
  var notificationHeading = document.querySelector(".notification-heading");
  var restrictedheading = document.getElementById("restrictedheading");
  var restrictedsection = document.getElementById("restrictedsection");
  var summeryheading = document.getElementById("summeryheading");
  var chartCanvas = document.getElementById("chartCanvas");
  const buttons = document.querySelectorAll('.allbtn button');
  
  // Set default active button
  document.getElementById('home').classList.add('active');
  buttons.forEach(function(button) {

    button.addEventListener('click', function() {

        // Remove the active class from all buttons
        buttons.forEach(function(innerButton) {
            innerButton.classList.remove('active');
        });
        
        // Add the active class to the clicked button
        button.classList.add('active');
    });
});


// Function to handle button and tick mark toggle
function handleButtonClick(buttonId, tickMarkId) {
  const button = document.getElementById(buttonId);
  const tickMark = document.getElementById(tickMarkId);

  // Hide the button and show the tick mark
  button.style.display = "none";
  tickMark.style.display = "inline";

  // After 2 seconds, hide the tick mark and show the button back
  setTimeout(() => {
      tickMark.style.display = "none";
      button.style.display = "inline";
  }, 2000);
}

// Function to validate input
function validateInput(inputId, errorId) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  const inputValue = parseInt(inputElement.value, 10);

  if (isNaN(inputValue) || inputValue <= 0) {
      errorElement.style.display = "block";
      setTimeout(() => {
          errorElement.style.display = "none";
      }, 2000);
      return false;
  } else {
      return true;
  }
}

document.getElementById("setgloballimitBtn").addEventListener("click", function() {
  // Validate input
  if (!validateInput("globallimit", "errorGlobalLimit")) return;

  const globalLimitValue = document.getElementById("globallimit").value;

  // Save to chrome storage
  chrome.storage.sync.set({ "globallimit": globalLimitValue }, function() {
      console.log('Global limit set to ' + globalLimitValue + ' minutes.');
  });
  
  // Toggle button and tick mark
  handleButtonClick("setgloballimitBtn", "tickMarkGlobal");
});

document.getElementById('setThreshold').addEventListener('click', function() {
  // Validate input
  if (!validateInput("specificThreshold", "errorSpecificThreshold")) return;

  const website = document.getElementById('specificWebsite').value;
  const threshold = document.getElementById('specificThreshold').value;
  const notificationType = document.getElementById('notificationType').value;

  // Get website thresholds and set new values
  chrome.storage.sync.get(['websiteThresholds'], function(items) {
      const websiteThresholds = items.websiteThresholds || {};
      websiteThresholds[website] = {
          threshold: threshold,
          notificationType: notificationType
      };

      chrome.storage.sync.set({ 'websiteThresholds': websiteThresholds });
  });
  
  // Toggle button and tick mark
  handleButtonClick("setThreshold", "tickMarkThreshold");
});

  function updateUIWithStoredData() {
    displayTotalWebsites();
    displayTopWebsites();
    
  }


  homebtn.addEventListener("click", function () {
    topWebsitesContainer.style.display = "block"; // Show the "Top 10 Usage Websites" table container
    totaltimeheading.style.display = "block";
    totaltime.style.display = "block";
    topwebsitesheading.style.display = "block";
    totalWebsitesContainer.style.display = "none"; // Hide the "Total Usage Websites" table container
    notificationHeading.style.display = "none";
    notificationSection.style.display = "none";
    restrictedheading.style.display = "none";
    restrictedsection.style.display = "none";
    summeryheading.style.display = "none";
    chartCanvas.style.display = "none";
});

// Add click event listeners to the buttons
showStatsButton.addEventListener("click", function () {
    topwebsitesheading.style.display = "none";
    totaltimeheading.style.display = "none";  
    totaltime.style.display = "none";
    topWebsitesContainer.style.display = "none"; // Hide the "Top 10 Usage Websites" table container
    totalWebsitesContainer.style.display = "block"; // Show the "Total Usage Websites" table container
    notificationHeading.style.display = "none";
    notificationSection.style.display = "none";
    restrictedheading.style.display = "none";
    restrictedsection.style.display = "none";
    summeryheading.style.display = "none";
    chartCanvas.style.display = "none";
});

  customizationButton.addEventListener("click", function () {
        notificationSection.style.display = "block";
        notificationHeading.style.display = "block";
        restrictedheading.style.display = "block";
        restrictedsection.style.display = "block";
        totaltimeheading.style.display = "none"; 
        topwebsitesheading.style.display = "none";
        totaltimeheading.style.display = "none";  
        totaltime.style.display = "none";
        topWebsitesContainer.style.display = "none"; // Hide the "Top 10 Usage Websites" table container
        totalWebsitesContainer.style.display = "none";
        totaltime.style.display = "none";
        summeryheading.style.display = "none";
        chartCanvas.style.display = "none";
    
  });

summerybutton.addEventListener("click", function () {
        notificationSection.style.display = "none";
        notificationHeading.style.display = "none";
        restrictedheading.style.display = "none";
        restrictedsection.style.display = "none";
        totaltimeheading.style.display = "none"; 
        topwebsitesheading.style.display = "none";
        totaltimeheading.style.display = "none";  
        totaltime.style.display = "none";
        topWebsitesContainer.style.display = "none"; // Hide the "Top 10 Usage Websites" table container
        totalWebsitesContainer.style.display = "none";
        totaltime.style.display = "none";
        summeryheading.style.display = "block";
        chartCanvas.style.display = "block";
});

updateUIWithStoredData();
});





























































// document.addEventListener('DOMContentLoaded', function () {
//   const setnotificationtime = document.getElementById("setNotificationLimitBtn");
//   const notificationtime = document.getElementById("notificationLimit");

//   setnotificationtime.addEventListener("click", () => {
//     chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
//       if (tabs.length === 0) {
//         alert("No active tab found.");
//       } else {
//         const activeTab = tabs[0];
//         const tabUrl = activeTab.url;
//         const domain = tabUrl.split("/")[2];
//         const notificationLimitMinutes = parseInt(notificationtime.value);
//         const notificationKey = `${domain}`;
//         chrome.storage.local.set({ [notificationKey]: notificationLimitMinutes }, function () {
//           alert(`Notification time set to ${notificationLimitMinutes} minutes for ${domain}.`);
//         });
//       }
//     });
//   });



//   // Function to check badge time and show notifications
//   function checkBadgeTimeAndNotify() {
//     chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
//       if (tabs.length > 0) {
//         const activeTab = tabs[0];
//         const domain = activeTab.url.split("/")[2];
//         const notificationKey = `${domain}`;

//         chrome.storage.local.get([notificationKey], function (result) {
//           const notificationLimitMinutes = parseInt(result[notificationKey]) || 0;

//           // Get the badge text of the active tab
//           // chrome.action.getBadgeText({ tabId: activeTab.id }, function (badgeText) {
//             for (let i = 0; i < allKeys.length; i++) {
//             if (notificationLimitMinutes <= sortedTimeList[i][1] && sortedTimeList[i][0] == domain) {
//               var notificationOptions = {
//                 type: "basic",
//                 title: `You have spent ${notificationLimitMinutes} minutes on this page, exceeding the ${notificationLimitMinutes} minute limit for ${domain}.`,
//                 message: "https://iq.opengenus.org",
//                 iconUrl: "icons/icon128.png"
//               };

//               // Use chrome.runtime instead of this.registration to access showNotification
//               chrome.notifications.create(null, notificationOptions, function () {
//                 // Notification callback
//               });
//             }
//           }
//         });
//       }
//     });
//   }

//   // Set up an interval to periodically check badge time and notify
//   const notificationInterval = setInterval(checkBadgeTimeAndNotify, 6000); // Check every 60 seconds

//   // Add a listener to stop the interval when the popup is closed
//   window.addEventListener('beforeunload', function () {
//     clearInterval(notificationInterval);
//   });

//   // Initial check when the popup is opened
//   checkBadgeTimeAndNotify();
// });

// // Function to parse badge time to minutes
// function parseBadgeTimeToMinutes(badgeTime) {
//   const timeParts = badgeTime.split(" ");
//   let totalMinutes = 0;

//   for (let i = 0; i < timeParts.length; i += 2) {
//     const value = parseInt(timeParts[i]);
//     const unit = timeParts[i + 1];

//     if (!isNaN(value)) {
//       if (unit.includes("sec")) {
//         totalMinutes += value / 60;
//       } else if (unit.includes("min")) {
//         totalMinutes += value;
//       } else if (unit.includes("hrs")) {
//         totalMinutes += value * 60;
//       }
//     }
//   }

//   return totalMinutes;
// }