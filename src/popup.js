document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sendButton").addEventListener("click", sendToServer);
  document
    .getElementById("maliciousButton")
    .addEventListener("click", reportMalicious);
  document.getElementById("safeButton").addEventListener("click", reportSafe);
});

async function sendToServer() {
  (async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log("sending url: " + tab.url);
    inputString = tab.url;
    try {
      const response = await fetch("http://localhost:3000/checkURL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputString }),
      });

      const data = await response.json();
      document.getElementById("response").textContent = data.message;
      console.log("got result from server.");
    } catch (error) {
      document.getElementById("response").textContent =
        "Error: Unable to connect to the server.";
      console.error(error);
    }
  })();
}

async function reportMalicious() {
  (async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log("rating url mal: " + tab.url);
    inputString = tab.url;
    try {
      const response = await fetch("http://localhost:3000/reportMalicious", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputString }),
      });

      const data = await response.json();
      document.getElementById("response").textContent = data.message;
    } catch (error) {
      document.getElementById("response").textContent =
        "Error: Unable to connect to the server.";
      console.error(error);
    }
  })();
}

async function reportSafe() {
  (async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log("rating url safe: " + tab.url);
    inputString = tab.url;
    try {
      const response = await fetch("http://localhost:3000/reportSafe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputString }),
      });

      const data = await response.json();
      document.getElementById("response").textContent = data.message;
    } catch (error) {
      document.getElementById("response").textContent =
        "Error: Unable to connect to the server.";
      console.error(error);
    }
  })();
}
