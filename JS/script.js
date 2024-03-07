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

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const localDateStr = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
    document.getElementById('currentDate').textContent = today.toLocaleDateString();
    document.getElementById('datePicker').max = localDateStr;
    document.getElementById('datePicker').value = localDateStr;
    changeDate(localDateStr);
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.checked = savedTheme === 'dark';
    themeToggle.addEventListener('click', toggleTheme);
});

function parseColorValues(colorValues) {
    var colorValuesArray = colorValues.match(/\b[0-9A-Fa-f]{3}\b|[0-9A-Fa-f]{6}\b/g);
    if (colorValuesArray) {
        colorValuesArray = colorValuesArray.map(function(item) {
            if (item.length === 3) {
                var newItem = item.toString().split('');
                newItem = newItem.reduce(function(acc, it) {
                    return acc + it + it;
                }, '');
                return newItem;
            }
            return item;
        });
    }
    return colorValuesArray;
}

function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function hexToRGB(colorValue) {
    return {
        red: parseInt(colorValue.substr(0, 2), 16),
        green: parseInt(colorValue.substr(2, 2), 16),
        blue: parseInt(colorValue.substr(4, 2), 16)
    }
}

function intToHex(rgbint) {
    return pad(Math.min(Math.max(Math.round(rgbint), 0), 255).toString(16), 2);
}

function rgbToHex(rgb) {
    return intToHex(rgb.red) + intToHex(rgb.green) + intToHex(rgb.blue);
}

function rgbShade(rgb, i) {
    return {
        red: Math.max(0, Math.round(rgb.red * (1 - 0.1 * i))),
        green: Math.max(0, Math.round(rgb.green * (1 - 0.1 * i))),
        blue: Math.max(0, Math.round(rgb.blue * (1 - 0.1 * i)))
    };
}

function rgbTint(rgb, i) {
    return {
        red: Math.min(255, Math.round(rgb.red + (255 - rgb.red) * i * 0.1)),
        green: Math.min(255, Math.round(rgb.green + (255 - rgb.green) * i * 0.1)),
        blue: Math.min(255, Math.round(rgb.blue + (255 - rgb.blue) * i * 0.1))
    };
}

function calculateShades(colorValue) {
    const color = hexToRGB(colorValue);
    const shadeValues = [];
    for (let i = 1; i <= 10; i++) {
        shadeValues.push(rgbToHex(rgbShade(color, i)));
    }
    return shadeValues;
}

function calculateTints(colorValue) {
    const color = hexToRGB(colorValue);
    const tintValues = [];
    for (let i = 1; i <= 10; i++) {
        tintValues.push(rgbToHex(rgbTint(color, i)));
    }
    return tintValues;
}

function extractColorsFromSVG(svgContent) {
    const colorRegex = /fill=["']?(#[0-9a-fA-F]{3,6}|none|currentColor|rgb\(\d+,\s*\d+,\s*\d+\))["']?/g;
    let match;
    const colors = new Set();
    while ((match = colorRegex.exec(svgContent)) !== null) {
        if (match[1] !== 'none' && match[1] !== 'currentColor') {
            colors.add(match[1]);
        }
    }
    return Array.from(colors);
}

function updateDownloadButton(dateString) {
    const logoElement = document.getElementById('logoPicture');
    const downloadButton = document.getElementById('downloadLogoBtn');
    const logoSrc = logoElement.getAttribute('src');
    const isSvg = logoSrc.startsWith('data:image/svg+xml');
    const originalFileName = logoSrc.split('/').pop();
    const originalExtension = originalFileName.includes('.') ? originalFileName.split('.').pop() : 'png';
    const fileName = `logo.${isSvg ? 'svg' : originalExtension}`;
    downloadButton.onclick = async function() {
        const zip = new JSZip();
        let svgContent = '';
        if (logoSrc.startsWith('data:image/svg+xml')) {
            const encodedSvg = logoSrc.split(',')[1];
            svgContent = decodeURIComponent(atob(encodedSvg).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        } else {
            try {
                const response = await fetch(logoSrc);
                if (!response.ok) throw new Error('Network response was not ok.');
                svgContent = await response.text();
            } catch (error) {
                console.error('Failed to fetch SVG:', error);
                alert('Failed to fetch SVG content. Please check the console for more details.');
                return;
            }
        }
        const svgColors = extractColorsFromSVG(svgContent);
        const svgColorsSVG = createColorsSVG(svgColors);
        if (isSvg) {
            zip.file(fileName, svgContent);
        } else {
        }
        const profilePicElement = document.getElementById('profilePicture');
        const profilePicSrc = profilePicElement.getAttribute('src');
        const isProfilePicSvg = profilePicSrc.startsWith('data:image/svg+xml');
        const profilePicFileName = `profile.${isProfilePicSvg ? 'svg' : 'jpg'}`;
        if (profilePicSrc.startsWith('data:image/svg+xml')) {
            const svgData = atob(profilePicSrc.split(',')[1]);
            zip.file(profilePicFileName, svgData, {binary: true});
        } else {
            if (profilePicSrc.startsWith('data:')) {
                const base64Data = profilePicSrc.split(',')[1];
                zip.file(profilePicFileName, base64Data, {base64: true});
            } else {
                try {
                    const response = await fetch(profilePicSrc);
                    if (!response.ok) throw new Error('Network response was not ok.');
                    const blob = await response.blob();
                    zip.file(profilePicFileName, blob);
                } catch (error) {
                    console.error('Failed to fetch the profile picture for zipping:', error);
                    alert('Failed to download the profile picture. Please check the console for more details.');
                    return;
                }
            }
        }
        if (logoSrc.startsWith('data:image/svg+xml')) {
            const svgData = atob(logoSrc.split(',')[1]);
            zip.file(fileName, svgData, {binary: true});
        } else {
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
        const tintsAndShadesSVG = createTintsAndShadesSVG(svgColors);
        zip.file('maincolors.svg', tintsAndShadesSVG);
        zip.generateAsync({type: "blob"}).then(function(content) {
            const url = URL.createObjectURL(content);
            const tempLink = document.createElement('a');
            tempLink.href = url;
            tempLink.setAttribute('download', `Assets.zip`);
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            URL.revokeObjectURL(url);
        });
    };
}

function createColorsSVG(colors) {
    const rectHeight = 50;
    const rectWidth = 100;
    const fontSize = 12;
    const svgHeight = colors.length * (rectHeight + 10);
    const svgWidth = rectWidth;
    let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    colors.forEach((color, index) => {
        const yPosition = index * (rectHeight + 5);
        svgContent += `<rect x="0" y="${yPosition}" width="${rectWidth}" height="${rectHeight}" fill="${color}" />`;
        svgContent += `<text x="5" y="${yPosition + rectHeight / 2 + fontSize / 2}" fill="white" font-size="${fontSize}" font-family="Lexend">${color}</text>`;
    });
    svgContent += `</svg>`;
    return svgContent;
}


function setTextContrast(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? '#000000' : '#FFFFFF';
}

function createTintsAndShadesSVG(colors) {
    const rectHeight = 20;
    const rectWidth = 50;
    const svgWidth = rectWidth * 21;
    const fontSize = 10;
    const textYOffset = rectHeight / 2 + fontSize / 3;
    const svgHeight = colors.length * (rectHeight + 10);
    let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Lexend', sans-serif;">`;
    colors.forEach((color, index) => {
        const yPosition = index * (rectHeight + 10);
        const originalColor = hexToRGB(color.replace('#', ''));
        const textColor = setTextContrast(color);
        const originalXPosition = 10 * rectWidth;
        svgContent += `<rect x="${originalXPosition}" y="${yPosition}" width="${rectWidth}" height="${rectHeight}" fill="${color}" />`;
        svgContent += `<text x="${originalXPosition + 5}" y="${yPosition + textYOffset}" fill="${textColor}" font-size="${fontSize}">${color}</text>`;
        for (let i = 1; i <= 10; i++) {
            const tint = rgbToHex(rgbTint(originalColor, i));
            svgContent += `<rect x="${originalXPosition - rectWidth * i}" y="${yPosition}" width="${rectWidth}" height="${rectHeight}" fill="#${tint}" />`;
            svgContent += `<text x="${originalXPosition - rectWidth * i + 5}" y="${yPosition + textYOffset}" fill="black" font-size="${fontSize}">#${tint}</text>`;
            const shade = rgbToHex(rgbShade(originalColor, i));
            svgContent += `<rect x="${originalXPosition + rectWidth * i}" y="${yPosition}" width="${rectWidth}" height="${rectHeight}" fill="#${shade}" />`;
            svgContent += `<text x="${originalXPosition + rectWidth * i + 5}" y="${yPosition + textYOffset}" fill="white" font-size="${fontSize}">#${shade}</text>`;
        }
    });
    svgContent += `</svg>`;
    return svgContent;
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
    const img = new Image();
    img.onload = function() {
        imgElement.src = this.src;
    };
    img.src = imageFileName;
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

function generateBriefInfo(seed) {
    const infoIndex = Math.floor(pseudoRandom(seed) * briefInfo.length);
    
    return briefInfo[infoIndex];
}

function generateBriefChallenges(seed) {
    const challengesIndex = Math.floor(pseudoRandom(seed) * briefChallenges.length);
    
    return briefChallenges[challengesIndex];
}

function generateBriefStyles(seed) {
    const stylesIndex = Math.floor(pseudoRandom(seed) * briefStyles.length);
    
    return briefStyles[stylesIndex];
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

    const briefInfoText = generateBriefInfo(seed); 
    document.getElementById('briefInfo').textContent = briefInfoText; 

    const briefChallengesText = generateBriefChallenges(seed); 
    document.getElementById('briefChallenges').textContent = briefChallengesText; 

    const briefStylesText = generateBriefStyles(seed); 
    document.getElementById('briefStyles').textContent = briefStylesText; 

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