document.getElementById("rate-safe").addEventListener("click", () => {
  alert("Website rated as safe!");
});

document.getElementById("rate-phishing").addEventListener("click", () => {
  alert("Website rated as phishing!");
});

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const response = await chrome.runtime.sendMessage({
    action: "evaluateSite",
    url: tab.url,
  });

  document.getElementById("status").innerText = response.status;
  const detailsList = document.getElementById("details");
  response.details.forEach((detail) => {
    const li = document.createElement("li");
    li.textContent = detail;
    detailsList.appendChild(li);
  });
});
