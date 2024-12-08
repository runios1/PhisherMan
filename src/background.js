import { evaluateSite } from "./filters.mjs";

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const evaluation = await evaluateSite(tab.url);

    // Update the badge with site status
    const badgeText = evaluation.status === "Safe" ? "SAFE" : "WARN";
    chrome.action.setBadgeText({ text: badgeText, tabId });
    chrome.action.setBadgeBackgroundColor({
      color: evaluation.status === "Safe" ? "green" : "red",
      tabId,
    });

    console.log("Site evaluation results:", evaluation);
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "evaluateSite") {
    const evaluation = await evaluateSite(message.url);
    sendResponse(evaluation);
  }
  return true; // Required to indicate the response will be asynchronous
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Phishing Detector installed!");
});

// Example: Interact with the current tab
chrome.action.onClicked.addListener((tab) => {
  console.log(`Extension clicked on: ${tab.url}`);
});
