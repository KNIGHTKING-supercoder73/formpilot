chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchTranslation") {
    
    // Fetch English Meaning
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${request.word}`)
      .then(res => res.json())
      .then(dictData => {
        let englishMeaning = dictData[0]?.meanings[0]?.definitions[0]?.definition || null;
        
        if (!englishMeaning) {
          sendResponse({ success: false });
          return;
        }

        if (request.lang === "en") {
          sendResponse({ success: true, text: englishMeaning });
        } else {
          // Fetch Hindi Translation
          fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishMeaning)}&langpair=en|hi`)
            .then(res => res.json())
            .then(transData => {
              sendResponse({ success: true, text: transData.responseData.translatedText });
            })
            .catch(() => sendResponse({ success: false }));
        }
      })
      .catch(() => sendResponse({ success: false }));

    return true; // Keeps the message channel open for the async API responses
  }
});