console.log("Background script running");

const apiBaseURL = 'https://1hp4qvie0k.execute-api.us-east-1.amazonaws.com/production/api/v1'

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    switch(request.type) {
        case "generate-comment":
            await processGenerateCommentRequest(request);

            break;
        case "generate-custom-message":
            await processGenerateCustomMessageRequest(request);

            break;
        case "console-log":
            console.log(request.message);
            break;
        default:
            console.log('unknown request type', request.type);
    }
});

async function processGenerateCommentRequest(request) {
    console.log("processGenerateCommentRequest", request);

    const config = {
        text: request.text,
        commentType: request.buttonType,
    }

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
    };

    console.log(`making request for ads to ${apiBaseURL}/comment with config ${config}`)

    let response = {
        type: "generate-comment-response",
        error: "something went wrong",
    };
    try {
        let res = await fetch(`${apiBaseURL}/comment`, requestOptions);

        const results = await res.json()

        console.log("results", results)
        response = {
            type: "generate-comment-response",
            parentForm: request.parentForm,
            comment: results.results.comment,
        }
    } catch (error) {
        response = {
            type: "generate-comment-response",
            error: error,
        };
    }

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, response, function(response) {
            console.log('send response', response)
        });
    });
}

async function processGenerateCustomMessageRequest(request) {
    console.log("processGenerateCustomMessageRequest", request);

    const config = {
        text: request.text,
        message: request.message,
        messageType: request.buttonType,
    }

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
    };

    console.log(`making request for ads to ${apiBaseURL}/custommessage with config ${config}`)

    let response = {
        type: "generate-custom-message-response",
        error: "something went wrong",
    };
    try {
        let res = await fetch(`${apiBaseURL}/custommessage`, requestOptions);

        const results = await res.json()

        console.log("results", results)
        response = {
            type: "generate-custom-message-response",
            parentForm: request.parentForm,
            customMessage: results.results.customMessage,
        }
    } catch (error) {
        response = {
            type: "generate-custom-message-response",
            error: error,
        };
    }

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, response, function(response) {
            console.log('send custom message response', response)
        });
    });
}
