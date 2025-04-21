let observer = null;
let isActive = false;
let styleElement = null;
const knownSelectors = [
  ".fJsklc.nulMpf.Didmac.sOkDId", // main container
  ".mIw6Bf.nTlZFe.P9KVBf",
  '[jscontroller="Uat36"]',
  '[jsaction*="NeHV7"]',
];

function injectGlobalStyle() {
  if (styleElement) return;
  //!important is a must, doom shadow fucks it up otherwise
  styleElement = document.createElement("style");
  styleElement.id = "meet-notification-blocker-style";
  styleElement.textContent = `
    ${knownSelectors.join(", ")} {           
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(styleElement);
}

function removeGlobalStyle() {
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
}

function hideNotificationPopups() {
  //css selectors fallback (do i rl need it? eh)
  knownSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
    });
  });

  //main div class to hide
  document
    .querySelectorAll('[jscontroller="Uat36"][jsaction*="NeHV7"]')
    .forEach((el) => {
      el.style.setProperty("display", "none", "important");
    });

  injectGlobalStyle(); //plan c - let's go global
}

function showNotificationPopups() {
  removeGlobalStyle();

  knownSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.style.removeProperty("display");
      el.style.removeProperty("visibility");
    });
  });
}

function startObserver() {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    if (!isActive) return;

    mutations.forEach((mutation) => {
      if (mutation.addedNodes) {
        hideNotificationPopups();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "jscontroller", "jsaction"],
  });
}

function startPeriodicCheck() {
  if (!isActive) return;

  hideNotificationPopups();
  setTimeout(startPeriodicCheck, 300);
}

function initialize() {
  chrome.storage.local.get(["isActive"], (result) => {
    isActive = result.isActive !== undefined ? result.isActive : false;

    if (isActive) {
      hideNotificationPopups();
      startPeriodicCheck();
    }

    startObserver();
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //listeners
  if (message.action === "toggle") {
    isActive = message.isActive;

    if (isActive) {
      hideNotificationPopups();
      startPeriodicCheck();
    } else {
      showNotificationPopups();
    }

    sendResponse({ status: "success" });
  } else if (message.action === "getStatus") {
    sendResponse({ isActive });
  }

  return true;
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  setTimeout(initialize, 1000); // spa delay, meet's doom are kinda messy
}

setTimeout(() => {
  if (isActive) {
    hideNotificationPopups();
  }
}, 2000);
