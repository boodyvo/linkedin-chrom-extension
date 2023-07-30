document.getElementById("api-key-button").addEventListener("click", function() {
    const inputValue = document.getElementById("api-key").value;

    chrome.storage.local.set({
        apiKey: inputValue
    });
});

