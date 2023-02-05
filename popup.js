document.getElementById("fill-button").addEventListener("click", function() {
    chrome.runtime.sendMessage({ type: "console-log", message: "Clicked" });

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "fill-input" });
    });
});