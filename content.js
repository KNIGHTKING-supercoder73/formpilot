// 1. Create the assistant window
const assistant = document.createElement("div");
assistant.id = "formpilot-assistant";
assistant.innerHTML = `
  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
    <h3 style="margin:0; color: #0056b3; font-size: 16px; font-family: Arial, sans-serif; line-height: 1.2;">FormPilot Guide</h3>
    <button id="formpilot-lang-btn" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc; background: white; color: black; font-size: 12px;">हिंदी</button>
  </div>
  <div id="formpilot-progress" style="font-size: 12px; color: #666; margin-bottom: 10px; font-family: Arial, sans-serif; line-height: 1.2;"></div>
  <div id="formpilot-title" style="font-weight: bold; margin-bottom: 5px; color: #111; font-size: 14px; font-family: Arial, sans-serif; line-height: 1.2;"></div>
  <div id="formpilot-text" style="margin: 0; color: #222; font-size: 13px; font-family: Arial, sans-serif; line-height: 1.4;"></div>
  <div id="formpilot-warning" style="color: red; font-weight: bold; display: none; margin-top: 10px; font-size: 12px; font-family: Arial, sans-serif; line-height: 1.2;"></div>
`;
document.body.appendChild(assistant);

let currentLang = "en";
let currentActiveElement = null; 

// 2. Local Dictionary for "Slang" and Web Acronyms (Things not in a normal dictionary)
const dictionary = {
  "fname": { en: "Your first given name.", hi: "आपका पहला नाम।" },
  "lname": { en: "Your family name or surname.", hi: "आपके परिवार का नाम या उपनाम।" },
  "email": { en: "Your electronic mail address.", hi: "आपका ईमेल पता।" },
  "dob": { en: "Date of Birth: The exact day, month, and year you were born.", hi: "जन्म तिथि।" },
  "zip": { en: "A postal code used to sort mail.", hi: "पिन कोड।" },
  "otp": { en: "One Time Password: A temporary code sent to you.", hi: "वन टाइम पासवर्ड।" },
  "beneficiary": { en: "The person who will receive the money or benefits.", hi: "वह व्यक्ति जिसे पैसा या लाभ मिलेगा (लाभार्थी)।" }
};

// 3. 100,000+ Word Live Dictionary Engine
async function updatePopupText() {
  if (!currentActiveElement) return;

  // Extract all data from the clicked box
  let nameAttr = (currentActiveElement.name || "").toLowerCase();
  let idAttr = (currentActiveElement.id || "").toLowerCase();
  let placeholderAttr = (currentActiveElement.placeholder || "").toLowerCase();
  let fullText = `${nameAttr} ${idAttr} ${placeholderAttr}`;

  // STEP 1: Check Local Dictionary First
  for (const [term, meanings] of Object.entries(dictionary)) {
    if (fullText.includes(term)) {
      document.getElementById("formpilot-title").innerText = term.toUpperCase() + ":";
      document.getElementById("formpilot-text").innerText = currentLang === "en" ? meanings.en : meanings.hi;
      return; 
    }
  }

  // STEP 2: Find the main word and search the Live Dictionary
  document.getElementById("formpilot-title").innerText = "SEARCHING...";
  document.getElementById("formpilot-text").innerText = "Fetching meaning from 100,000+ word database...";

  // Get the longest, most important word from the placeholder or name
  let rawWords = placeholderAttr.split(" ").concat(nameAttr.split("_"), idAttr.split("-"));
  let searchWord = rawWords.sort((a, b) => b.length - a.length)[0].replace(/[^a-zA-Z]/g, '');

  try {
    // Ping the official Free Dictionary API
    let dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord}`);
    
    if (dictResponse.ok) {
      let data = await dictResponse.json();
      let englishMeaning = data[0].meanings[0].definitions[0].definition; // Get the actual meaning
      
      document.getElementById("formpilot-title").innerText = searchWord.toUpperCase() + ":";
      
      if (currentLang === "en") {
        document.getElementById("formpilot-text").innerText = englishMeaning;
      } else {
        document.getElementById("formpilot-text").innerText = "अनुवाद हो रहा है... (Translating...)";
        // Translate the dictionary meaning to Hindi
        let transResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishMeaning)}&langpair=en|hi`);
        let transData = await transResponse.json();
        document.getElementById("formpilot-text").innerText = transData.responseData.translatedText;
      }
      return;
    }
  } catch (error) {
    console.log("Dictionary lookup failed.");
  }

  // STEP 3: Ultimate Fallback if the word is total gibberish
  let fallbackWord = currentActiveElement.placeholder || currentActiveElement.name || "information";
  document.getElementById("formpilot-title").innerText = "FIELD INSTRUCTIONS:";
  document.getElementById("formpilot-text").innerText = currentLang === "en" 
    ? `Please enter your ${fallbackWord} here.` 
    : `कृपया यहां अपना ${fallbackWord} दर्ज करें।`;
}

// 4. Language Button Logic
const langBtn = document.getElementById("formpilot-lang-btn");
langBtn.addEventListener("mousedown", (e) => e.preventDefault()); 
langBtn.addEventListener("click", function() {
  currentLang = currentLang === "en" ? "hi" : "en";
  this.innerText = currentLang === "en" ? "हिंदी" : "English";
  updatePopupText(); 
});

// 5. Trigger FormPilot on Click
document.addEventListener("focusin", function(event) {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    currentActiveElement = event.target;
    
    const parentForm = event.target.closest("form");
    let allFields = parentForm 
      ? Array.from(parentForm.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']), textarea"))
      : Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']), textarea"));
    
    const currentIndex = allFields.indexOf(event.target) + 1;
    const totalFields = allFields.length;
    
    document.getElementById("formpilot-progress").innerText = (totalFields > 0) 
      ? (currentLang === "en" ? `Step ${currentIndex} of ${totalFields}` : `चरण ${currentIndex} / ${totalFields}`)
      : "";

    assistant.style.display = "block";
    updatePopupText();
    
    let fieldText = (currentActiveElement.name || currentActiveElement.id || currentActiveElement.placeholder || "").toLowerCase();
    const warningEl = document.getElementById("formpilot-warning");
    if (fieldText.includes("pin") || fieldText.includes("zip") || fieldText.includes("otp")) {
      warningEl.innerText = currentLang === "en" ? "Reminder: Codes are usually exactly 6 digits." : "अनुस्मारक: कोड आमतौर पर 6 अंकों का होता है।";
      warningEl.style.color = "blue";
      warningEl.style.display = "block";
    } else {
      warningEl.style.display = "none";
    }
  }
});

// 6. Live Typing Validation
document.addEventListener("input", function(event) {
  let fieldText = (event.target.name || event.target.id || event.target.placeholder || "").toLowerCase();
  if (fieldText.includes("pin") || fieldText.includes("zip") || fieldText.includes("otp")) {
    let typedValue = event.target.value;
    const warningEl = document.getElementById("formpilot-warning");
    
    if (typedValue.length > 0 && typedValue.length !== 6) {
      warningEl.innerText = currentLang === "en" ? "⚠️ Error: Code must be exactly 6 digits!" : "⚠️ त्रुटि: कोड ठीक 6 अंकों का होना चाहिए!";
      warningEl.style.color = "red";
      warningEl.style.display = "block";
    } else if (typedValue.length === 6) {
      warningEl.innerText = currentLang === "en" ? "✅ Code looks perfect!" : "✅ कोड सही है!";
      warningEl.style.color = "green";
    }
  }
});

// 7. Hide Assistant
document.addEventListener("focusout", function(event) {
  setTimeout(() => { assistant.style.display = "none"; }, 150); 
});