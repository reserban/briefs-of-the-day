document.addEventListener('DOMContentLoaded', () => {
    initializeFlatpickr();
    initializeThemeSwitcher();
    startCountdown();
    const today = new Date();
    // Format the date to 'YYYY-MM-DD' in the local time zone
    const dateString = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    generateBriefForToday(dateString); // Generate a brief and update profile picture for today
});
function initializeFlatpickr() {
    flatpickr("#datePicker", {
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        defaultDate: new Date(), // Sets today's date as default
        maxDate: new Date(), // Prevents selection of future dates
        disableMobile: true, // Disables the mobile-friendly version
        onChange: function(selectedDates, dateStr, instance) {
            generateBriefForToday(dateStr); // Pass the selected date as a string
        }
    });
    document.querySelector("#datePicker").setAttribute("autocomplete", "nope");
}

function generateSeed(date) {
    var hash = 0;
    for (var i = 0; i < date.length; i++) {
        var char = date.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function pseudoRandom(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function generateBriefForToday(dateString) {
    const seed = generateSeed(dateString); // Use the same seed for consistency
    const selectedDate = new Date(dateString); // Define selectedDate at the start

    // Function to select a random element from an array
    function getRandomElement(array) {
        return array[Math.floor(pseudoRandom(seed) * array.length)];
    }

    // Generate a brief
    const companyDescription = getRandomElement(companyDescriptions);
    const productDescription = getRandomElement(productDescriptions);
    const targetAudience = getRandomElement(targetAudiences);

    const brief = `${companyDescription}\n\n${productDescription}\n\n <br><br> Our target audience is ${targetAudience}. We aim to convey a sense of comfort and liveliness.\n\nPackaging Details:\n- Materials: ${clientPreferences.materials}\n- Design Style: ${clientPreferences.designStyle}\n- Brand Color: ${clientPreferences.brandColor}`;

    document.getElementById('brief').innerHTML = brief;
    updateProfilePicture(dateString); // Update profile picture based on the date
    updateProfileName(dateString); 
    updateProfileEmail(dateString); 
    updateCompanyName(dateString); 
    updateLogoPicture(dateString); // Update logo picture based on the date
    adjustCountdownVisibility(selectedDate);
    const mailEndingParagraph = document.getElementById('mailEndingParagraph');
    mailEndingParagraph.textContent = generateMailEnding(seed);
}

function updateProfilePicture(dateString) {
    const seed = generateSeed(dateString) + 5; // Use a different base seed for variety
    const pictureIndex = Math.floor(pseudoRandom(seed) * 300) + 1;
    const imageFileName = `Images/Persons/${pictureIndex}p.jpg`;

    const imgElement = document.getElementById('profilePicture');
    imgElement.src = imageFileName;
}


function adjustCountdownVisibility(selectedDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date for comparison
    selectedDate.setHours(0, 0, 0, 0); // Normalize selected date for comparison

    const isToday = today.getTime() === selectedDate.getTime();

    const countdownElement = document.getElementById('countdown');
    countdownElement.style.visibility = isToday ? 'visible' : 'hidden';
    countdownElement.style.opacity = isToday ? '1' : '0';
    countdownElement.style.pointerEvents = isToday ? 'auto' : 'none';
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

    updateCountdown(); // Initialize countdown immediately
    setInterval(updateCountdown, 1000); // Update countdown every second
}

function updateLogoPicture(dateString) {
    // Generate a logo index based on a pseudo-random seed
    const logoIndex = getLogoIndexFromDate(dateString);
    const fullLogoFileName = newLogoFilenames[logoIndex];

    // Update the logo image source
    updateLogoImageSource(fullLogoFileName);
}

function getLogoIndexFromDate(dateString) {
    const seed = generateSeed(dateString) + 10; // Adjust the seed for variety
    return Math.floor(pseudoRandom(seed) * newLogoFilenames.length);
}

function updateLogoImageSource(fullLogoFileName) {
    const logoElement = document.getElementById('logoPicture');
    logoElement.src = `Images/Logos/${fullLogoFileName}`;
}

function generateNameFromDate(dateString) {
    const seed = generateSeed(dateString); // Reuse existing generateSeed function to get a consistent seed from dateString
  
    const firstNameIndex = Math.floor(pseudoRandom(seed) * firstNames.length);
    const lastNameIndex = Math.floor(pseudoRandom(seed + 1) * lastNames.length);
  
    // Combine the selected first and last names into a full name
    const fullName = firstNames[firstNameIndex] + " " + lastNames[lastNameIndex];
  
    // Return the generated name
    return fullName;
  }
  
  function updateProfileName(dateString) {
    const nameElements = document.querySelectorAll('.profileName'); // Select all elements with class 'profileName'
    const generatedName = generateNameFromDate(dateString);
    nameElements.forEach(element => {
        element.textContent = generatedName; // Update the content of each element with the generated name
    });
}

  function generateMailEnding(seed) {
    return mailEnding[Math.floor(pseudoRandom(seed) * mailEnding.length)];
}

  
  function generateEmailFromDate(dateString) {
      const seed = generateSeed(dateString); 
    
      const firstNameIndex = Math.floor(pseudoRandom(seed) * firstNames.length);
      const lastNameIndex = Math.floor(pseudoRandom(seed + 1) * lastNames.length);
    
      // Generate logoIndex for logoFileName
      const logoSeed = seed + 10; // Use a different base seed for variety, similar to updateLogoPicture
      const logoIndex = Math.floor(pseudoRandom(logoSeed) * newLogoFilenames.length);
      const fullLogoFileName = newLogoFilenames[logoIndex];
      
      // Extract the logoFileName without extension and remove spaces or hyphens
      const logoFileNameWithExtension = fullLogoFileName.split('.').slice(0, -1).join('.'); // Remove the extension more reliably
      let logoFileName = logoFileNameWithExtension.includes(' ') ? logoFileNameWithExtension.split(' ')[1] : logoFileNameWithExtension; // Correctly handle filenames with spaces if any
    
      // Remove spaces or hyphens and convert to lowercase for email compatibility
      logoFileName = logoFileName.replace(/[\s-]/g, '').toLowerCase();
  
      // Combine the selected first and last names into an email format, now including logoFileName
      const email = firstNames[firstNameIndex].toLowerCase() + "." + lastNames[lastNameIndex].toLowerCase() + "@not" + logoFileName + ".com"; // Assuming .com domain for simplicity
    
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
  
  
  function updateCompanyName(dateString) {
      const companyNameElement = document.getElementById('companyName'); // Assuming there's an element with id 'companyName'
      const generatedCompanyName = generateCompanyNameFromDate(dateString);
      companyNameElement.textContent = generatedCompanyName; // Update the content of the company name element
  }
  
  function updateLogoImageSource(fullLogoFileName) {
    const logoElement = document.getElementById('logoPicture');
    logoElement.src = `Images/Logos/${fullLogoFileName}`;
    logoElement.classList.add("black-fill"); // Apply the CSS class
}