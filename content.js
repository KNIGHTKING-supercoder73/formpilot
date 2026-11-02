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
let currentFieldName = ""; 
let currentActiveElement = null; 

// 2. Specialized Dictionary (Only for complex words that need explanations, not just direct translations)
const dictionary = {
  "beneficiary": { en: "The person who will receive the money or benefits.", hi: "वह व्यक्ति जिसे पैसा या लाभ मिलेगा (लाभार्थी)।" },
  "indemnity": { en: "Protection against damage or financial loss.", hi: "नुकसान या वित्तीय हानि से सुरक्षा (क्षतिपूर्ति)।" },
  "spouse": { en: "Your legally married husband or wife.", hi: "आपका कानूनी रूप से विवाहित पति या पत्नी।" },
  "dob": { en: "Date of Birth: The exact day, month, and year you were born.", hi: "जन्म तिथि: वह दिन, महीना और वर्ष जब आपका जन्म हुआ था।" },
  "otp": { en: "One Time Password: A temporary code sent to your phone or email.", hi: "वन टाइम पासवर्ड: आपके फोन या ईमेल पर भेजा गया एक अस्थायी कोड।" }
};

// 3. Smart Live API Translation Logic
async function updatePopupText() {
  if (!currentActiveElement) return;

  let rawName = (currentActiveElement.placeholder || currentActiveElement.name || currentActiveElement.id || "information");
  rawName = rawName.replace(/[-_]/g, " ").trim();
  let matchedTerm = rawName.toUpperCase();

  document.getElementById("formpilot-title").innerText = matchedTerm + ":";

  // Check the specialized dictionary first
  for (const [term, meanings] of Object.entries(dictionary)) {
    if (currentFieldName.includes(term)) {
      document.getElementById("formpilot-text").innerText = meanings[currentLang];
      return; 
    }
  }

  // If not in dictionary, handle it dynamically
  if (currentLang === "en") {
    document.getElementById("formpilot-text").innerText = `This field is asking for: "${rawName}".`;
  } else {
    // Show a loading message while waiting for the live API
    document.getElementById("formpilot-text").innerText = "अनुवाद हो रहा है... (Translating...)";
    
    try {
      // Connect to a free translation API
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(rawName)}&langpair=en|hi`);
      const data = await response.json();
      
      if (data && data.responseData && data.responseData.translatedText) {
        document.getElementById("formpilot-text").innerText = `इस फ़ील्ड में यह जानकारी मांगी गई है: "${data.responseData.translatedText}"।`;
      } else {
        throw new Error("Translation missing");
      }
    } catch (error) {
      // Fallback if the user's internet is offline
      document.getElementById("formpilot-text").innerText = `इस फ़ील्ड में यह जानकारी मांगी गई है: "${rawName}"।`;
    }
  }
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
    currentFieldName = (event.target.name || event.target.id || event.target.placeholder || "").toLowerCase();
    
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
    
    const warningEl = document.getElementById("formpilot-warning");
    if (currentFieldName.includes("pin") || currentFieldName.includes("zip") || currentFieldName.includes("otp")) {
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
  if (currentFieldName.includes("pin") || currentFieldName.includes("zip") || currentFieldName.includes("otp")) {
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