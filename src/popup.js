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
    const responseElement = document.getElementById("response");
    responseElement.style.color = "";
    responseElement.textContent = "Waiting for server response";
    const inputString = tab.url;
    try {
      const response = await fetch("http://localhost:3000/checkURL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputString }),
      });

      const data = await response.json();
      if (!data.message || data.error) {
        responseElement.textContent = data.error || "Error occurred";
        responseElement.style.color = "red";
      } else {
        responseElement.textContent = data.message + "%";
        if (data.message <= 50) responseElement.style.color = "red";
        else if (data.message <= 80) responseElement.style.color = "orange";
        else responseElement.style.color = "green";
      }
      console.log("got result from server.");
    } catch (error) {
      const responseElement = document.getElementById("response");
      responseElement.textContent = "Error: Unable to connect to the server.";
      responseElement.style.color = "red";
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
    const responseElement = document.getElementById("response");
    responseElement.style.color = "";
    console.log("rating url mal: " + tab.url);
    inputString = tab.url;
    try {
      const response = await fetch("http://localhost:3000/reportMalicious", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputString }),
      });

      const data = await response.json();
      responseElement.textContent = data.message;
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
    const responseElement = document.getElementById("response");
    responseElement.style.color = "";
    inputString = tab.url;
    try {
      const response = await fetch("http://localhost:3000/reportSafe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputString }),
      });

      const data = await response.json();
      responseElement.textContent = data.message;
    } catch (error) {
      document.getElementById("response").textContent =
        "Error: Unable to connect to the server.";
      console.error(error);
    }
  })();
}

document.getElementById("maliciousButton").addEventListener("click", () => {
  displayResult("This website has been reported as malicious.", "malicious");
  alert("Reported successfully!");
});

document.getElementById("safeButton").addEventListener("click", () => {
  displayResult("This website has been reported as safe.", "safe");
  alert("Reported successfully!");
});
