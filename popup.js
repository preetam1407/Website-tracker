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

  
  handleButtonClick("setThreshold", "tickMarkThreshold");
});

  function updateUIWithStoredData() {
    displayTotalWebsites();
    displayTopWebsites();
  }

  function secondsToMinutes(seconds) {
    return seconds / 60;
}

  function secondsToFormattedString(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}


function drawGraph(dates, timeSpent) {
  const canvas = document.getElementById("chartCanvas");
  const ctx = canvas.getContext("2d");

  const padding = 50;
  const labelPadding = 10;
  const graphWidth = canvas.width - 2 * padding;
  const graphHeight = canvas.height - 2 * padding;

  const maxYValue = 24 * 60; 
  const yScale = graphHeight / maxYValue;

  // Draw X & Y axes
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  const barWidth = graphWidth / dates.length;

  for (let i = 0; i < dates.length; i++) {
      const x = padding + i * barWidth;

      if (timeSpent[i] !== null) { 
          const y = canvas.height - padding - timeSpent[i] * yScale;
          const barHeight = timeSpent[i] * yScale;

      
          ctx.fillStyle = "#3498db";
          ctx.fillRect(x, y, barWidth - 10, barHeight); 
      }

      // Draw date on X axis
      ctx.fillStyle = "#000";
      ctx.fillText(dates[i], x, canvas.height - padding + labelPadding * 2);

  }

  // Draw hours and minutes on Y axis
  for (let i = 0; i <= maxYValue; i += 60) {
    const y = canvas.height - padding - i * yScale;
    ctx.fillText(i / 60 + "h", padding - labelPadding * 3, y);
}
}


function plotGraphData() {
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i)); 
      return d.toISOString().split('T')[0]; 
  });

  chrome.storage.local.get("dailyTotals", function(data) {
      let dailyTotals = data.dailyTotals || [];

      const timeSpent = dates.map(date => {
        const entry = dailyTotals.find(e => e.date === date);
        return entry ? secondsToMinutes(entry.total) : 0;
    });

      console.log(dates, timeSpent); 
      drawGraph(dates, timeSpent);
  });
}


function storeRestrictedWebsite(website, restrictionType) {
  if (!website || !restrictionType) {
      console.error("Both website and restrictionType are required to store a restricted website.");
      return;
  }

 
  chrome.storage.local.get("restrictedWebsites", function(data) {
      let restrictedWebsites = data.restrictedWebsites || [];
      const websiteIndex = restrictedWebsites.findIndex(entry => entry.website === website);

      if (websiteIndex !== -1) {
          restrictedWebsites[websiteIndex].restrictionType = restrictionType;
      } else {
          restrictedWebsites.push({ website: website, restrictionType: restrictionType });
      }

      chrome.storage.local.set({ restrictedWebsites: restrictedWebsites }, function() {
          if (chrome.runtime.lastError) {
              console.error("There was an error storing the restricted website: ", chrome.runtime.lastError);
          } else {
              console.log("Restricted website stored successfully!");
          }
      });
  });
}

document.getElementById("setRestriction").addEventListener("click", function() {
  const website = document.getElementById("specificRestrictedWebsite").value.trim();
  const restrictionType = document.getElementById("restrictionType").value;

  if (website && restrictionType) {
      storeRestrictedWebsite(website, restrictionType);
  } else {
      console.error("Please provide valid inputs for both website and restriction type.");
  }
});



  homebtn.addEventListener("click", function () {
    topWebsitesContainer.style.display = "block";
    totaltimeheading.style.display = "block";
    totaltime.style.display = "block";
    topwebsitesheading.style.display = "block";
    totalWebsitesContainer.style.display = "none"; 
    notificationHeading.style.display = "none";
    notificationSection.style.display = "none";
    summeryheading.style.display = "none";
    chartCanvas.style.display = "none";
});


showStatsButton.addEventListener("click", function () {
    topwebsitesheading.style.display = "none";
    totaltimeheading.style.display = "none";  
    totaltime.style.display = "none";
    topWebsitesContainer.style.display = "none"; 
    totalWebsitesContainer.style.display = "block"; 
    notificationHeading.style.display = "none";
    notificationSection.style.display = "none";
    summeryheading.style.display = "none";
    chartCanvas.style.display = "none";
});

  customizationButton.addEventListener("click", function () {
        notificationSection.style.display = "block";
        notificationHeading.style.display = "block";
        totaltimeheading.style.display = "none"; 
        topwebsitesheading.style.display = "none";
        totaltimeheading.style.display = "none";  
        totaltime.style.display = "none";
        topWebsitesContainer.style.display = "none"; 
        totalWebsitesContainer.style.display = "none";
        totaltime.style.display = "none";
        summeryheading.style.display = "none";
        chartCanvas.style.display = "none";
    
  });

summerybutton.addEventListener("click", function () {
        notificationSection.style.display = "none";
        notificationHeading.style.display = "none";
        totaltimeheading.style.display = "none"; 
        topwebsitesheading.style.display = "none";
        totaltimeheading.style.display = "none";  
        totaltime.style.display = "none";
        topWebsitesContainer.style.display = "none"; 
        totalWebsitesContainer.style.display = "none";
        totaltime.style.display = "none";
        summeryheading.style.display = "block";
        chartCanvas.style.display = "block";
        plotGraphData();
});

updateUIWithStoredData();
});