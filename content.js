// 1. Create the assistant window (Now with Progress Tracker element)
const assistant = document.createElement("div");
assistant.id = "formpilot-assistant";
assistant.innerHTML = `
  <div style="display: flex; justify-content: space-between; align-items: start;">
    <h3 style="margin-top:0; color: #0056b3; margin-bottom: 2px;">FormPilot Guide</h3>
    <button id="formpilot-lang-btn" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc;">हिंदी</button>
  </div>
  <p id="formpilot-progress" style="font-size: 12px; color: #666; margin-top: 0; margin-bottom: 10px;"></p>
  <p id="formpilot-title" style="font-weight: bold; margin-bottom: 5px;"></p>
  <p id="formpilot-text" style="margin-top: 0;"></p>
  <p id="formpilot-warning" style="color: red; font-weight: bold; display: none; margin-top: 10px; font-size: 12px;"></p>
`;
document.body.appendChild(assistant);

// 2. State & Dictionary
let currentLang = "en";
let currentFieldName = ""; 

const dictionary = {
  "beneficiary": {
    en: "The person who will receive the money or benefits.",
    hi: "वह व्यक्ति जिसे पैसा या लाभ मिलेगा (लाभार्थी)।"
  },
  "indemnity": {
    en: "Protection or security against damage or financial loss.",
    hi: "नुकसान या वित्तीय हानि से सुरक्षा (क्षतिपूर्ति)।"
  },
  "spouse": {
    en: "Your legally married husband or wife.",
    hi: "आपका कानूनी रूप से विवाहित पति या पत्नी।"
  }
};

// 3. Update UI Text
function updatePopupText() {
  let explanation = currentLang === "en" ? "Just a standard text field. Type your answer here." : "यह एक सामान्य टेक्स्ट फ़ील्ड है। अपना उत्तर यहां लिखें।";
  let matchedTerm = currentLang === "en" ? "Form Field" : "फॉर्म फ़ील्ड";

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
  
  // Re-trigger the focus event to update progress translation instantly
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
    activeElement.blur();
    activeElement.focus();
  }
});

// 5. Listen for clicks on form input fields
document.addEventListener("focusin", function(event) {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    assistant.style.display = "block";
    currentFieldName = (event.target.name || event.target.id || event.target.placeholder || "").toLowerCase();
    
    // --- Progress Tracker Logic ---
    // Find the specific form this input belongs to
    const parentForm = event.target.closest("form");
    
    let allFields = [];
    if (parentForm) {
      // If inside a form, only count fields inside that specific form
      allFields = Array.from(parentForm.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']), textarea"));
    } else {
      // Fallback: if there is no form tag, count all fields on the page
      allFields = Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']), textarea"));
    }
    
    const currentIndex = allFields.indexOf(event.target) + 1;
    const totalFields = allFields.length;
    
    document.getElementById("formpilot-progress").innerText = currentLang === "en" ? `Step ${currentIndex} of ${totalFields}` : `चरण ${currentIndex} / ${totalFields}`;
    // ------------------------------
    updatePopupText();
    
    const warningEl = document.getElementById("formpilot-warning");
    if (currentFieldName.includes("pin")) {
      warningEl.innerText = currentLang === "en" ? "Reminder: PIN codes must be exactly 6 digits." : "अनुस्मारक: पिन कोड ठीक 6 अंकों का होना चाहिए।";
      warningEl.style.color = "blue";
      warningEl.style.display = "block";
    } else {
      warningEl.style.display = "none";
    }
  }
});

// 6. Live typing check (Bilingual)
document.addEventListener("input", function(event) {
  if (currentFieldName.includes("pin")) {
    let typedValue = event.target.value;
    const warningEl = document.getElementById("formpilot-warning");
    
    if (typedValue.length > 0 && typedValue.length !== 6) {
      warningEl.innerText = currentLang === "en" ? "⚠️ Error: PIN code must be exactly 6 digits!" : "⚠️ त्रुटि: पिन कोड ठीक 6 अंकों का होना चाहिए!";
      warningEl.style.color = "red";
      warningEl.style.display = "block";
    } else if (typedValue.length === 6) {
      warningEl.innerText = currentLang === "en" ? "✅ PIN code looks perfect!" : "✅ पिन कोड सही है!";
      warningEl.style.color = "green";
    }
  }
});

// 7. Hide assistant when clicking outside
document.addEventListener("focusout", function(event) {
  setTimeout(() => { assistant.style.display = "none"; }, 150); 
});