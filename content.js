// 1. Create the assistant window (With Progress Tracker & Language Toggle)
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

// 2. State & Expanded Bilingual Dictionary
let currentLang = "en";
let currentFieldName = ""; 

const dictionary = {
  "beneficiary": { en: "The person who will receive the money or benefits.", hi: "वह व्यक्ति जिसे पैसा या लाभ मिलेगा (लाभार्थी)।" },
  "indemnity": { en: "Protection or security against damage or financial loss.", hi: "नुकसान या वित्तीय हानि से सुरक्षा (क्षतिपूर्ति)।" },
  "spouse": { en: "Your legally married husband or wife.", hi: "आपका कानूनी रूप से विवाहित पति या पत्नी।" },
  
  // Common Form Fields added below
  "fname": { en: "Your first given name.", hi: "आपका पहला नाम।" },
  "first": { en: "Your first given name.", hi: "आपका पहला नाम।" },
  "lname": { en: "Your family name or surname.", hi: "आपके परिवार का नाम या उपनाम।" },
  "last": { en: "Your family name or surname.", hi: "आपके परिवार का नाम या उपनाम।" },
  "email": { en: "Your electronic mail address (e.g., you@example.com).", hi: "आपका ईमेल पता (जैसे, you@example.com)।" },
  "mail": { en: "Your electronic mail address.", hi: "आपका ईमेल पता।" },
  "pass": { en: "A secret word or phrase to protect your account.", hi: "आपके खाते की सुरक्षा के लिए एक गुप्त शब्द (पासवर्ड)।" },
  "address": { en: "The physical location where you live or receive mail.", hi: "वह स्थान जहाँ आप रहते हैं या डाक प्राप्त करते हैं।" },
  "phone": { en: "Your mobile or landline contact number.", hi: "आपका मोबाइल या लैंडलाइन नंबर।" },
  "mobile": { en: "Your mobile contact number.", hi: "आपका मोबाइल नंबर।" },
  "dob": { en: "Date of Birth: The exact day, month, and year you were born.", hi: "जन्म तिथि: वह दिन, महीना और वर्ष जब आपका जन्म हुआ था।" },
  "birth": { en: "The date you were born.", hi: "आपके जन्म की तारीख।" },
  "zip": { en: "A postal code used to sort mail.", hi: "डाक छांटने के लिए इस्तेमाल किया जाने वाला कोड (पिन कोड)।" },
  "search": { en: "Type what you are looking for here to find it on this website.", hi: "इस वेबसाइट पर आप जो खोजना चाहते हैं, उसे यहां टाइप करें।" }
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
    
    const parentForm = event.target.closest("form");
    let allFields = [];
    
    if (parentForm) {
      allFields = Array.from(parentForm.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']), textarea"));
    } else {
      allFields = Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']), textarea"));
    }
    
    const currentIndex = allFields.indexOf(event.target) + 1;
    const totalFields = allFields.length;
    
    if (totalFields > 0) {
      document.getElementById("formpilot-progress").innerText = currentLang === "en" ? `Step ${currentIndex} of ${totalFields}` : `चरण ${currentIndex} / ${totalFields}`;
    } else {
      document.getElementById("formpilot-progress").innerText = "";
    }

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

// 6. Live typing check (Bilingual validation)
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