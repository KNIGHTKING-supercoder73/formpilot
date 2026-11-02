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

// Local fallback for absolute emergencies
const emergencyDictionary = {
  "beneficiary": { en: "The person who will receive the money or benefits.", hi: "वह व्यक्ति जिसे पैसा या लाभ मिलेगा (लाभार्थी)।" }
};

function updatePopupText() {
  if (!currentActiveElement) return;

  let rawName = (currentActiveElement.placeholder || currentActiveElement.name || currentActiveElement.id || "information").toLowerCase();
  rawName = rawName.replace(/[-_]/g, " ").trim();

  // Find the primary search word
  let rawWords = rawName.split(" ");
  let searchWord = rawWords.sort((a, b) => b.length - a.length)[0].replace(/[^a-zA-Z]/g, '');

  document.getElementById("formpilot-title").innerText = searchWord.toUpperCase() + ":";
  document.getElementById("formpilot-text").innerText = "Loading meaning securely...";

  // Check emergency dictionary first
  for (const [term, meanings] of Object.entries(emergencyDictionary)) {
    if (rawName.includes(term)) {
      document.getElementById("formpilot-text").innerText = currentLang === "en" ? meanings.en : meanings.hi;
      return; 
    }
  }

  // Send message to background.js to bypass website security blocks
  chrome.runtime.sendMessage(
    { action: "fetchTranslation", word: searchWord, lang: currentLang },
    function(response) {
      if (response && response.success) {
        document.getElementById("formpilot-text").innerText = response.text;
      } else {
        // Ultimate grammatical fallback if API completely fails
        document.getElementById("formpilot-text").innerText = currentLang === "en" 
          ? `Please enter your ${searchWord} in this box.` 
          : `कृपया इस बॉक्स में '${searchWord}' दर्ज करें।`;
      }
    }
  );
}

const langBtn = document.getElementById("formpilot-lang-btn");
langBtn.addEventListener("mousedown", (e) => e.preventDefault()); 
langBtn.addEventListener("click", function() {
  currentLang = currentLang === "en" ? "hi" : "en";
  this.innerText = currentLang === "en" ? "हिंदी" : "English";
  updatePopupText(); 
});

document.addEventListener("focusin", function(event) {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    currentActiveElement = event.target;
    assistant.style.display = "block";
    updatePopupText();
  }
});

document.addEventListener("focusout", function(event) {
  setTimeout(() => { assistant.style.display = "none"; }, 150); 
});