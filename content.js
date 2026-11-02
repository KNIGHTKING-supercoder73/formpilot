// 1. Create the assistant window with a Language Button
const assistant = document.createElement("div");
assistant.id = "formpilot-assistant";
assistant.innerHTML = `
  <div style="display: flex; justify-content: space-between; align-items: start;">
    <h3 style="margin-top:0; color: #0056b3;">FormPilot Guide</h3>
    <button id="formpilot-lang-btn" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc;">हिंदी</button>
  </div>
  <p id="formpilot-title" style="font-weight: bold; margin-bottom: 5px;"></p>
  <p id="formpilot-text" style="margin-top: 0;"></p>
  <p id="formpilot-warning" style="color: red; font-weight: bold; display: none; margin-top: 10px; font-size: 12px;"></p>
`;
document.body.appendChild(assistant);

// 2. Set up the current language state
let currentLang = "en";
let currentFieldName = ""; // Remembers the clicked field so we can translate it instantly

// 3. The Bilingual Dictionary
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

// 4. Function to update text on the screen
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

// 5. Language Toggle Button Logic
const langBtn = document.getElementById("formpilot-lang-btn");

// Prevent the form field from losing focus when clicking the button
langBtn.addEventListener("mousedown", function(e) {
  e.preventDefault(); 
});

langBtn.addEventListener("click", function() {
  if (currentLang === "en") {
    currentLang = "hi";
    this.innerText = "English"; // Change button text to offer English
  } else {
    currentLang = "en";
    this.innerText = "हिंदी";
  }
  updatePopupText(); // Instantly translate the current screen
});

// 6. Listen for clicks on form input fields
document.addEventListener("focusin", function(event) {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    assistant.style.display = "block";
    currentFieldName = (event.target.name || event.target.id || event.target.placeholder || "").toLowerCase();
    
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

// 7. Live typing check (Bilingual)
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

// 8. Hide assistant when clicking outside the form
document.addEventListener("focusout", function(event) {
  setTimeout(() => { assistant.style.display = "none"; }, 150); 
});