document.addEventListener("DOMContentLoaded", () => {
  const toggleSwitch = document.getElementById("toggleSwitch");
  const statusText = document.getElementById("statusText");

  // Atualiza a UI
  function updateUI(isActive) {
    toggleSwitch.checked = isActive;
    statusText.textContent = isActive
      ? "Notificações bloqueadas"
      : "Notificações visíveis";
    statusText.style.color = isActive ? "#1e8e3e" : "#5f6368";
  }

  // Carrega o estado salvo
  chrome.storage.local.get(["isActive"], (result) => {
    const isActive = result.isActive !== undefined ? result.isActive : false;
    updateUI(isActive);
  });

  // Listener do toggle
  toggleSwitch.addEventListener("change", () => {
    const isActive = toggleSwitch.checked;
    chrome.storage.local.set({ isActive }, () => {
      updateUI(isActive);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url.includes("meet.google.com")) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "toggle",
            isActive: isActive,
          });
        }
      });
    });
  });

  // Listener do link do GitHub (NOVO)
  document.getElementById("githubLink").addEventListener("click", () => {
    chrome.tabs.create({ url: "https://github.com/lucaxjordo" });
  });
});
