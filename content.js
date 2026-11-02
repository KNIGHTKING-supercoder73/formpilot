// 1. Create the assistant window on the web page
const assistant = document.createElement("div");
assistant.id = "formpilot-assistant";
assistant.innerHTML = `
  <h3 style="margin-top:0;">FormPilot Guide</h3>
  <p id="formpilot-text">Click any form field to get help.</p>
`;
document.body.appendChild(assistant);

// 2. Listen for clicks on form input fields
document.addEventListener("focusin", function(event) {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    assistant.style.display = "block";
    const fieldName = event.target.name || event.target.id || "this field";
    document.getElementById("formpilot-text").innerText = "You clicked: " + fieldName + ". (Explanations will go here!)";
  }
});

// 3. Hide assistant when clicking outside the form
document.addEventListener("focusout", function(event) {
  assistant.style.display = "none";
});