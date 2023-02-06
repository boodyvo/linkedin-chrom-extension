if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded',afterDOMLoaded);
} else {
    afterDOMLoaded();
}

let link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("href", chrome.runtime.getURL("styles.css"));
document.head.appendChild(link);

let loading = false;
let processButton = null;
let processParent = null;

function afterDOMLoaded(){
    chrome.runtime.sendMessage({ type: "console-log", message: "DOM loaded" });

    document.addEventListener("focusin", function(event) {
        console.log('target', event.target)

        // check if comment
        if (event.target.classList.contains("ql-editor")) {
            console.log("event.target", event.target);

            const parentForm = event.target.closest(".comments-comment-texteditor");
            if (parentForm && !parentForm.classList.contains("buttons-appended")) {
                processPostComment(parentForm)

                return
            }
        }

        // check if custom message
        if (event.target && event.target.id === "custom-message") {
            console.log('custom message processing', event.target)
            processCustomMessage(event.target)
        }
    });
}

function processPostComment(parentForm) {
    console.log('appended buttons')
    parentForm.classList.add("buttons-appended");

    let expertBtn = document.createElement("button");
    expertBtn.classList.add("rounded-button");
    expertBtn.classList.add("first-rounded-button");
    expertBtn.innerText = "🧠 Expert";

    let emotionBtn = document.createElement("button");
    emotionBtn.classList.add("rounded-button");
    emotionBtn.innerText = "😃 Emotion";

    let engageBtn = document.createElement("button");
    engageBtn.classList.add("rounded-button");
    engageBtn.innerText = "🤝 Engage";

    parentForm.appendChild(expertBtn);
    parentForm.appendChild(emotionBtn);
    parentForm.appendChild(engageBtn);

    engageBtn.addEventListener("click", function(event) {
        processButtonClicked(event, "engage", parentForm);
    })
    emotionBtn.addEventListener("click", function(event) {
        processButtonClicked(event, "emotion", parentForm);
    })
    expertBtn.addEventListener("click", function(event) {
        processButtonClicked(event, "expert", parentForm);
    })
}

function processButtonClicked(event, buttonType, parentForm) {
    if (loading) {
        console.log('already loading');

        return;
    }

    document.querySelectorAll(".rounded-button").forEach(function(button) {
        button.setAttribute("disabled", true);
        button.classList.add("disabled");
    });

    event.currentTarget.classList.add("loading-animation");

    console.log('processButtonClicked', buttonType, parentForm);
    const parent = event.currentTarget.closest(".feed-shared-update-v2");
    const elements = parent.getElementsByClassName("feed-shared-update-v2__description-wrapper")
    let text = elements[0].innerText;
    const textWithoutSeeMore = text.replace(/…see more/g, "");

    loading = true
    processButton = event.currentTarget
    processParent = parentForm

    chrome.runtime.sendMessage({
        type: "generate-comment",
        buttonType: buttonType,
        event: event,
        parentForm: parentForm,
        text: textWithoutSeeMore,
    });
}

function emulateWriting(parentElement, text) {
    if (!text) {
        return
    }

    let input = parentElement.querySelector(".ql-editor.ql-blank p");
    let i = 0;
    let interval = setInterval(() => {
        if (i < text.length) {
            input.innerText += text[i];
            i++;
            for(let j = 0; j < 3; j++) {
                if (i < text.length) {
                    input.innerText += text[i];
                    i++;
                }
            }
        } else {
            clearInterval(interval);
            input.parentElement.classList.remove("ql-blank");
        }
    }, 10);
}

function emulateElementWriting(element, text) {
    if (!text) {
        return
    }
    text = text.trim();

    console.log('emulateElementWriting', element, text)
    let i = 0;
    let interval = setInterval(() => {
        if (i < text.length) {
            element.value += text[i];
            i++;
            for(let j = 0; j < 10; j++) {
                if (i < text.length) {
                    element.value += text[i];
                    i++;
                }
            }
        } else {
            clearInterval(interval);
        }
    }, 10);
}

function processCustomMessage(element) {
    console.log('appended buttons for custom message', element);

    const relativeElement = element.closest(".relative");
    if (!relativeElement || relativeElement.classList.contains("buttons-appended")) {
        return;
    }

    relativeElement.classList.add("buttons-appended");

    // let salesBtn = document.createElement("button");
    // salesBtn.classList.add("rounded-custom-button");
    // salesBtn.classList.add("first-rounded-button");
    // salesBtn.innerText = "💰 Sales";

    let valueBtn = document.createElement("button");
    valueBtn.classList.add("rounded-custom-button");
    valueBtn.innerText = "💡 Value";

    let engageBtn = document.createElement("button");
    engageBtn.classList.add("rounded-custom-button");
    engageBtn.innerText = "💬 Engagement";

    // relativeElement.appendChild(salesBtn);
    relativeElement.appendChild(valueBtn);
    relativeElement.appendChild(engageBtn);

    engageBtn.addEventListener("click", function(event) {
        processCustomMessageBtnClick(event, "sales", element);
    })
    valueBtn.addEventListener("click", function(event) {
        processCustomMessageBtnClick(event, "value", element);
    })
    // salesBtn.addEventListener("click", function(event) {
    //     processCustomMessageBtnClick(event, "engagement", element);
    // })
}

function processCustomMessageBtnClick(event, buttonType, element) {
    if (loading) {
        console.log('already loading');

        return;
    }

    let header = parseHeader()
    let data = parseTextByClass("artdeco-card");
    data.header = header;

    console.log('data', data);

    document.querySelectorAll(".rounded-custom-button").forEach(function(button) {
        button.setAttribute("disabled", true);
        button.classList.add("disabled");
    });

    event.currentTarget.classList.add("loading-animation");

    loading = true
    processButton = event.currentTarget
    processParent = element

    chrome.runtime.sendMessage({
        type: "generate-custom-message",
        buttonType: buttonType,
        element: element,
        text: JSON.stringify(data),
        message: element.value,
        data,
    });
}

function parseHeader() {
    let elements = document.getElementsByClassName("pv-top-card");
    console.log('parseHeader', elements)

    let name, personMediumDescription, personSmallDescription, appLink

    const nameBlock = elements[0].querySelector(".text-heading-xlarge")
    if (nameBlock !== null) {
        name = nameBlock.textContent.trim()
    }

    console.log('name', name)

    const bodyMediumBlock = elements[0].querySelector(".text-body-medium")
    if (bodyMediumBlock !== null) {
        personMediumDescription = bodyMediumBlock.textContent.trim()
    }

    console.log('bodyMedium', personMediumDescription)

    const bodySmallBlocks = elements[0].querySelectorAll(".text-body-small")
    if (bodySmallBlocks !== null) {
        console.log('bodySmallBlocks', bodySmallBlocks)

        personSmallDescription = Array.from(bodySmallBlocks).map(element => {
            const text = element.textContent.trim()
            if (text.includes("degree connection")) {
                return ""
            }

            return text
        });
    }

    const appAwareLink = elements[0].querySelector(".app-aware-link")
    if (appAwareLink !== null) {
        appLink = appAwareLink.href
    }

    return {
        name,
        personSmallDescription,
        personMediumDescription,
        appLink,
    }
}

function parseTextByClass(className) {
    console.log('parseTextByClass', className)
    let elements = document.getElementsByClassName(className);
    let header = elements[0].getElementsByClassName("text-heading-large");

    let textArray = {};
    for (let i = 0; i < elements.length; i++) {
        const dataPart = parseBlock(elements[i])
        if (dataPart == null) {
            continue
        }

        textArray[dataPart.type] = dataPart.data;
    }

    return textArray;
}

function parseBlock(element) {
    console.log('parsing element', element)
    // find element with class "text-heading-large"
    const headline = element.querySelector(".text-heading-large span[aria-hidden=\"true\"]")
    if (headline === null) {
        return null
    }

    const blockType = headline.textContent.trim();
    switch(blockType) {
        case "Activity":
            return parseActivity(element);
        case "Featured":
            return parseFeatured(element);
        case "About":
            return parseAbout(element);
        case "Experience":
            return parseExperiences(element);
        case "Education":
            return parseSkip(element);
        case "Volunteering":
            return parseSkip(element);
        case "Skills":
            return parseSkip(element);
        case "Recommendations":
            return parseSkip(element);
        case "Publications":
            return parseSkip(element);
        case "Courses":
            return parseSkip(element);
        case "Honors & awards":
            return parseSkip(element);
        case "Causes":
            return parseSkip(element);
        case "Interests":
            return parseSkip(element);
        default:
            return null;
    }
}

function parseAbout(element) {
    const aboutElement = element.querySelector(".display-flex")
    if (aboutElement === null) {
        return null
    }

    const text = convertString(aboutElement.textContent.trim())
    return {
        type: "about the person",
        data: text,
    }
}

function parseActivity(element) {
    const listItems = element.querySelectorAll(".artdeco-list__item");

    let activities = []

    for(let item of listItems) {
        const activityBlock = item.querySelector(".feed-mini-update-contextual-description__text")
        if (activityBlock === null) {
            continue
        }

        const activityBlockText = activityBlock.textContent.trim()
        let activityType;
        console.log("activityBlockText", activityBlockText)

        if (activityBlockText.includes("reposted this")) {
            activityType = "reposted"
        } else if (activityBlockText.includes("posted this")) {
            activityType = "posted"
        } else {
            continue
        }

        const activitiesElement = item.querySelector("span[dir=\"ltr\"]")
        if (activitiesElement === null) {
            continue
        }

        const activityText = convertString(activitiesElement.textContent.trim())

        activities.push({
            type: activityType,
            text: activityText,
        })

        if (activities.length > 2) {
            break
        }
    }

    return {
        type: "recent activities",
        data: activities,
    }
}

function parseFeatured(element) {
    const listItems = element.querySelectorAll(".artdeco-card");

    let featuredList = []

    for(let item of listItems) {
        if (item === null) {
            continue
        }

        let linkText, itemText

        const linkData = item.querySelector('.optional-action-target-wrapper')
        if (linkData !== null) {
            linkText = convertString(linkData.textContent.trim())
        }

        const textData = item.querySelector('.feed-shared-text-view')
        if (textData !== null) {
            itemText = convertString(textData.textContent.trim())
        }

        if ((linkText === null || linkText === '') && (itemText === null || itemText === '')) {
            continue
        }

        featuredList.push(
            (itemText + ' ' + linkText).trim(),
        )
    }

    return {
        type: "featured articles",
        data: featuredList,
    }
}

function parseExperiences(element) {
    const listItems = element.querySelectorAll(".artdeco-list__item");

    let experiences = []

    for(let item of listItems) {
        console.log("experience item", item)
        const text = convertString(item.textContent.trim())

        console.log("text", text)

        experiences.push({
            text,
        })

        if (experiences.length > 2) {
            break
        }
    }

    return {
        type: "experience",
        data: experiences,
    }
}

function convertString(str) {
    console.log('convertString', str)

    if (str === null || str === '') {
        return ''
    }

    return str.replace(/\s\s+/g, ' ').trim();
}

function parseSkip(element) {
    return null
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('got message', request);

    switch(request.type) {
        case "generate-comment-response":
            loading = false;
            processButton.classList.remove("loading-animation");
            console.log("generate-comment-response", request.comment);

            document.querySelectorAll(".rounded-button").forEach(function(button) {
                button.removeAttribute("disabled");
                button.classList.remove("disabled");
            });

            if (request.error) {
                console.error(request.error);

                return
            }

            emulateWriting(processParent, request.comment);

            break;
        case "generate-custom-message-response":
            loading = false;
            processButton.classList.remove("loading-animation");
            console.log("generate-comment-response", request.message);

            document.querySelectorAll(".rounded-custom-button").forEach(function(button) {
                button.removeAttribute("disabled");
                button.classList.remove("disabled");
            });

            if (request.error) {
                console.error(request.error);

                return
            }

            emulateElementWriting(processParent, request.message);

            break;
        default:
            console.log('unknown request type', request.type);
    }
});