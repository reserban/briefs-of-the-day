document.addEventListener('DOMContentLoaded', () => {
    initializeFlatpickr();
    initializeThemeSwitcher();
    startCountdown();
    const today = new Date();
    const dateString = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    generateBriefForToday(dateString);
});

function initializeFlatpickr() {
    flatpickr("#datePicker", {
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        defaultDate: new Date(), 
        maxDate: new Date(), 
        disableMobile: true, 
        onChange: function(selectedDates, dateStr, instance) {
            generateBriefForToday(dateStr); 
        }
    });
    document.querySelector("#datePicker").setAttribute("autocomplete", "nope");
}

function generateSeed(date) {
    var hash = 0;
    for (var i = 0; i < date.length; i++) {
        var char = date.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; 
    }
    return hash;
}

function pseudoRandom(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function initializeThemeSwitcher() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.checked = savedTheme === 'dark';
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

function copyBriefContent() {
    // Select the div with the class 'briefContent'
    var content = document.querySelector('.briefContent').innerHTML;

    // Strip HTML tags
    var plainText = content.replace(/<[^>]*>?/gm, '');

    // Normalize spaces - replace multiple spaces with a single space and trim
    plainText = plainText.replace(/\s\s+/g, ' ').trim();

    // Use the Clipboard API to copy the text to the clipboard
    navigator.clipboard.writeText(plainText).then(function() {
    }).catch(function(err) {
        console.error('Unable to copy', err);
    });
}

function updateDownloadButton(dateString) {
    const logoElement = document.getElementById('logoPicture');
    const downloadButton = document.getElementById('downloadLogoBtn');
    const logoSrc = logoElement.getAttribute('src');
    const fileName = logoSrc.startsWith('data:image/svg+xml') ? 'logo.svg' : logoSrc.split('/').pop();

    downloadButton.onclick = async function() {
        const zip = new JSZip();

        if (logoSrc.startsWith('data:image/svg+xml')) {
            const svgData = atob(logoSrc.split(',')[1]);
            zip.file(fileName, svgData, {binary: true});
        } else {
            // Fetching external URL may fail due to CORS
            try {
                const response = await fetch(logoSrc);
                if (!response.ok) throw new Error('Network response was not ok.');
                const blob = await response.blob();
                zip.file(fileName, blob);
            } catch (error) {
                console.error('Failed to fetch the logo for zipping:', error);
                alert('Failed to download the logo. Please check the console for more details.');
                return;
            }
        }

        zip.generateAsync({type: "blob"}).then(function(content) {
            const url = URL.createObjectURL(content);
            const tempLink = document.createElement('a');
            tempLink.href = url;
            tempLink.setAttribute('download', `logo_${dateString}.zip`);
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            URL.revokeObjectURL(url);
        });
    };
}


function adjustCountdownVisibility(selectedDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    selectedDate.setHours(0, 0, 0, 0); 
    const isToday = today.getTime() === selectedDate.getTime();

    const countdownElement = document.getElementById('countdown');
    countdownElement.style.visibility = isToday ? 'visible' : 'hidden';
    countdownElement.style.opacity = isToday ? '1' : '0';
    countdownElement.style.pointerEvents = isToday ? 'auto' : 'none';
}

function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msLeft = tomorrow - now;

        const hours = Math.floor(msLeft / (1000 * 60 * 60));
        const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((msLeft % (1000 * 60)) / 1000);

        document.getElementById('countdown').textContent = `Time left: ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown(); 
    setInterval(updateCountdown, 1000); 
}

function updateProfilePicture(dateString) {
    const seed = generateSeed(dateString) + 5; 
    const pictureIndex = Math.floor(pseudoRandom(seed) * 300) + 1;
    const imageFileName = `Images/Persons/${pictureIndex}p.jpg`;

    const imgElement = document.getElementById('profilePicture');
    imgElement.src = imageFileName;
}

function getLogoIndexFromDate(dateString) {
    const seed = generateSeed(dateString) + 10; // Adjust the seed for variety
    return Math.floor(pseudoRandom(seed) * newLogoFilenames.length);
}

function updateLogoPicture(dateString) {
    const logoIndex = getLogoIndexFromDate(dateString);
    const fullLogoFileName = newLogoFilenames[logoIndex];

    updateLogoImageSource(fullLogoFileName);
}


function updateLogoImageSource(fullLogoFileName) {
    const logoElement = document.getElementById('logoPicture');
    logoElement.src = `Images/Logos/${fullLogoFileName}`;
    logoElement.classList.add("black-fill");
}

function generateNameFromDate(dateString) {
    const seed = generateSeed(dateString); 
  
    const firstNameIndex = Math.floor(pseudoRandom(seed) * firstNames.length);
    const lastNameIndex = Math.floor(pseudoRandom(seed + 1) * lastNames.length);
  
    const fullName = firstNames[firstNameIndex] + " " + lastNames[lastNameIndex];
  
    return fullName;
  }
  
  function updateProfileName(dateString) {
    const nameElements = document.querySelectorAll('.profileName'); // Select all elements with class 'profileName'
    const generatedName = generateNameFromDate(dateString);
    nameElements.forEach(element => {
        element.textContent = generatedName; // Update the content of each element with the generated name
    });
}

function generateEmailFromDate(dateString) {
    const seed = generateSeed(dateString); 
  
    const firstNameIndex = Math.floor(pseudoRandom(seed) * firstNames.length);
    const lastNameIndex = Math.floor(pseudoRandom(seed + 1) * lastNames.length);
  
    // Generate logoIndex for logoFileName
    const logoSeed = seed + 10; 
    const logoIndex = Math.floor(pseudoRandom(logoSeed) * newLogoFilenames.length);
    const fullLogoFileName = newLogoFilenames[logoIndex];
    
    const logoFileNameWithExtension = fullLogoFileName.split('.').slice(0, -1).join('.'); // Remove the extension more reliably
    let logoFileName = logoFileNameWithExtension.includes(' ') ? logoFileNameWithExtension.split(' ')[1] : logoFileNameWithExtension; // Correctly handle filenames with spaces if any
  
    logoFileName = logoFileName.replace(/[\s-]/g, '').toLowerCase();

    const email = firstNames[firstNameIndex].toLowerCase() + "." + lastNames[lastNameIndex].toLowerCase() + "@" + logoFileName; // Assuming .com domain for simplicity
  
    // Return the generated email
    return email;
}


function updateProfileEmail(dateString) {
  const emailElements = document.querySelectorAll('.profileEmail'); // Select all elements with class 'profileEmail'
  const generatedEmail = generateEmailFromDate(dateString);
  emailElements.forEach(element => {
      element.textContent = generatedEmail; // Update the content of each element with the generated email
  });
}

function generateCompanyNameFromDate(dateString) {
    const seed = generateSeed(dateString); // Reuse the existing generateSeed function for a consistent seed

    // Generate companyIndex for companyName using the same speed as the email function
    const companySeed = seed + 10; // Align seed adjustment with the email function for consistency
    const companyIndex = Math.floor(pseudoRandom(companySeed) * newLogoFilenames.length);
    const fullLogoFileName = newLogoFilenames[companyIndex];

    // Extract the logoFileName without the extension and remove any leading numbers
    const logoFileNameWithoutExtensionAndNumbers = fullLogoFileName.split('.').slice(0, -1).join('.')
        .replace(/^\d+/, ''); // This regex removes leading digits

    // Replace hyphens with spaces
    const logoFileNameWithSpaces = logoFileNameWithoutExtensionAndNumbers.replace(/-/g, ' ');

    // Capitalize the first letter of each word
    const companyName = logoFileNameWithSpaces.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    // Return the formatted company name
    return companyName;
}

function updateProductNames(dateString) {
    const seed = generateSeed(dateString);
    const productNameIndex = Math.floor(pseudoRandom(seed) * productNames.length);
    const selectedProductName = productNames[productNameIndex];

    const productNameDivs = document.querySelectorAll('.productNames'); // Use querySelectorAll to select all elements
    productNameDivs.forEach(div => {
        div.textContent = selectedProductName; // Update each element with the selected product name
    });
}

function updateProductAreas(dateString) {
    const seed = generateSeed(dateString);
    // Ensure productAreas is defined and has at least one entry
    if (!productAreas || productAreas.length === 0) {
        console.error('productAreas array is undefined or empty');
        return;
    }
    const productAreaIndex = Math.floor(pseudoRandom(seed) * productAreas.length);
    const selectedProductArea = productAreas[productAreaIndex]; 

    const productAreaDivs = document.querySelectorAll('.productAreas'); // Use querySelectorAll to get all matching elements
    productAreaDivs.forEach(div => {
        div.textContent = selectedProductArea; // Update each div's content
    });
}


function updateCompanyName(dateString) {
  const companyNameElements = document.getElementsByClassName('companyName'); // Get all elements with class 'companyName'
  const generatedCompanyName = generateCompanyNameFromDate(dateString);
  for (let i = 0; i < companyNameElements.length; i++) { // Iterate over all elements
      companyNameElements[i].textContent = generatedCompanyName; // Update each element's content
  }
}


function generateBriefTitle(seed) {
    const titleIndex = Math.floor(pseudoRandom(seed) * briefTitle.length);

    return briefTitle[titleIndex];
}

function generateBriefIntro(seed) {
    const introIndex = Math.floor(pseudoRandom(seed) * briefIntro.length);
    
    return briefIntro[introIndex];
}

function generateBriefContext(seed) {
    const contextIndex = Math.floor(pseudoRandom(seed) * briefContext.length);
    
    return briefContext[contextIndex];
}

function generateBriefAreas(seed) {
    const areasIndex = Math.floor(pseudoRandom(seed) * briefAreas.length);
    
    return briefAreas[areasIndex];
}

function generateBriefRelations(seed) {
    const relationsIndex = Math.floor(pseudoRandom(seed) * briefRelations.length);
    
    return briefRelations[relationsIndex];
}

function generateBriefChallenges(seed) {
    const challengesIndex = Math.floor(pseudoRandom(seed) * briefChallenges.length);
    
    return briefChallenges[challengesIndex];
}

function generateBriefStyles(seed) {
    const stylesIndex = Math.floor(pseudoRandom(seed) * briefStyles.length);
    
    return briefStyles[stylesIndex];
}

function generateBriefUsages(seed) {
    const usagesIndex = Math.floor(pseudoRandom(seed) * briefUsages.length);
    
    return briefUsages[usagesIndex];
}

function generateBriefFreedoms(seed) {
    const freedomsIndex = Math.floor(pseudoRandom(seed) * briefFreedoms.length);
    
    return briefFreedoms[freedomsIndex];
}

function generateBriefAttached(seed) {
    const attachedIndex = Math.floor(pseudoRandom(seed) * briefAttached.length);
    
    return briefAttached[attachedIndex];
}

function generateBriefDeadline(seed) {
    const deadlineIndex = Math.floor(pseudoRandom(seed) * briefDeadline.length);
    
    return briefDeadline[deadlineIndex];
}

function generateBriefEnding(seed) {
    const endingIndex = Math.floor(pseudoRandom(seed) * briefEnding.length);
    
    return briefEnding[endingIndex];
}

function generateBriefForToday(dateString) {
    const seed = generateSeed(dateString); 
    const selectedDate = new Date(dateString); 

    function getRandomElement(array) {
        return array[Math.floor(pseudoRandom(seed) * array.length)];
    }

    const briefTitleText = generateBriefTitle(seed); 
    document.getElementById('briefTitle').textContent = briefTitleText; 

    const briefIntroText = generateBriefIntro(seed); 
    document.getElementById('briefIntro').textContent = briefIntroText; 

    const briefContextText = generateBriefContext(seed); 
    document.getElementById('briefContext').textContent = briefContextText; 

    const briefAreasText = generateBriefAreas(seed); 
    document.getElementById('briefAreas').textContent = briefAreasText; 

    const briefRelationsText = generateBriefRelations(seed); 
    document.getElementById('briefRelations').textContent = briefRelationsText; 

    const briefChallengesText = generateBriefChallenges(seed); 
    document.getElementById('briefChallenges').textContent = briefChallengesText; 

    const briefStylesText = generateBriefStyles(seed); 
    document.getElementById('briefStyles').textContent = briefStylesText; 

    const briefUsagesText = generateBriefUsages(seed); 
    document.getElementById('briefUsages').textContent = briefUsagesText; 

    const briefFreedomsText = generateBriefFreedoms(seed); 
    document.getElementById('briefFreedoms').textContent = briefFreedomsText; 

    const briefAttachedText = generateBriefAttached(seed); 
    document.getElementById('briefAttached').textContent = briefAttachedText; 

    const briefDeadlineText = generateBriefDeadline(seed); 
    document.getElementById('briefDeadline').textContent = briefDeadlineText; 

    const briefEndingText = generateBriefEnding(seed); 
    document.getElementById('briefEnding').textContent = briefEndingText; 

    updateProfilePicture(dateString); 
    updateProfileName(dateString); 
    updateProfileEmail(dateString); 
    updateCompanyName(dateString); 
    updateLogoPicture(dateString); 
    updateProductNames(dateString);
    updateProductAreas(dateString);
    updateDownloadButton(dateString);
    adjustCountdownVisibility(selectedDate);
}