// 1. Create the assistant window with strict CSS to block website interference
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
let currentActiveElement = null; // Remembers the exact box clicked

// 2. Specialized Legal/Complex Dictionary
const dictionary = {
  "beneficiary": { en: "The person who will receive the money or benefits.", hi: "वह व्यक्ति जिसे पैसा या लाभ मिलेगा (लाभार्थी)।" },
  "indemnity": { en: "Protection against damage or financial loss.", hi: "नुकसान या वित्तीय हानि से सुरक्षा (क्षतिपूर्ति)।" },
  "spouse": { en: "Your legally married husband or wife.", hi: "आपका कानूनी रूप से विवाहित पति या पत्नी।" },
  "dob": { en: "Date of Birth: The exact day, month, and year you were born.", hi: "जन्म तिथि: वह दिन, महीना और वर्ष जब आपका जन्म हुआ था।" }
};

// 3. Dynamic "Infinite" Dictionary Logic
function updatePopupText() {
  if (!currentActiveElement) return;

  // Grab the website's code name for the box and clean it up (e.g. "first_name" becomes "first name")
  let rawName = (currentActiveElement.placeholder || currentActiveElement.name || currentActiveElement.id || "information");
  rawName = rawName.replace(/[-_]/g, " ").trim();
  
  // Create a dynamic sentence automatically if it's a normal word
  let explanation = currentLang === "en" 
    ? `Please enter your ${rawName} in this field.` 
    : `कृपया इस फ़ील्ड में अपना ${rawName} दर्ज करें।`;
  let matchedTerm = rawName.toUpperCase();

  // Override with specialized definitions if it's a complex legal word
  for (const [term, meanings] of Object.entries(dictionary)) {
    if (currentFieldName.includes(term)) {
      explanation = meanings[currentLang];
      matchedTerm = term.toUpperCase();
      break;
    }
  }

  document.getElementById("formpilot-title").innerText = matchedTerm + ":";
  document.getElementById("formpilot-text").innerText = explanation;
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
    
    // Progress Tracker
    const parentForm = event.target.closest("form");
    let allFields = parentForm 
      ? Array.from(parentForm.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']), textarea"))
      : Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']), textarea"));
    
    const currentIndex = allFields.indexOf(event.target) + 1;
    const totalFields = allFields.length;
    
    document.getElementById("formpilot-progress").innerText = (totalFields > 0) 
      ? (currentLang === "en" ? `Step ${currentIndex} of ${totalFields}` : `चरण ${currentIndex} / ${totalFields}`)
      : "";

    // Show box and generate text
    assistant.style.display = "block";
    updatePopupText();
    
    // Warnings
    const warningEl = document.getElementById("formpilot-warning");
    if (currentFieldName.includes("pin") || currentFieldName.includes("zip")) {
      warningEl.innerText = currentLang === "en" ? "Reminder: Codes are usually exactly 6 digits." : "अनुस्मारक: पिन कोड ठीक 6 अंकों का होना चाहिए।";
      warningEl.style.color = "blue";
      warningEl.style.display = "block";
    } else {
      warningEl.style.display = "none";
    }
  }
});

// 6. Live Typing Validation
document.addEventListener("input", function(event) {
  if (currentFieldName.includes("pin") || currentFieldName.includes("zip")) {
    let typedValue = event.target.value;
    const warningEl = document.getElementById("formpilot-warning");
    
    if (typedValue.length > 0 && typedValue.length !== 6) {
      warningEl.innerText = currentLang === "en" ? "⚠️ Error: Code must be exactly 6 digits!" : "⚠️ त्रुटि: पिन कोड ठीक 6 अंकों का होना चाहिए!";
      warningEl.style.color = "red";
      warningEl.style.display = "block";
    } else if (typedValue.length === 6) {
      warningEl.innerText = currentLang === "en" ? "✅ Code looks perfect!" : "✅ पिन कोड सही है!";
      warningEl.style.color = "green";
    }
  }
});

// 7. Hide Assistant
document.addEventListener("focusout", function(event) {
  setTimeout(() => { assistant.style.display = "none"; }, 150); 
});