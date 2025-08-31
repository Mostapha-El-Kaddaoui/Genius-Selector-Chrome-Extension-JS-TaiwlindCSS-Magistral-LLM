const params = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-btn").addEventListener("click", addNewParam);
  document.getElementById("sub-btn").addEventListener("click", subNewConfig);
});

function addNewParam() {
  const descInput = document.getElementById('description');
  const value = descInput.value.trim();

  if (!value) return; // ✅ check before adding

  params.push(value); // ✅ now it's safe to add

  const container = document.getElementById('divParams');
  const item = document.createElement('div');
  item.className = 'bg-white/50 backdrop-blur p-3 rounded border border-gray-300 shadow-sm flex justify-between items-center';

  const text = document.createElement('span');
  text.textContent = value;

  const btn = document.createElement('button');
  btn.textContent = 'Remove';
  btn.className = 'ml-4 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600';

  // ✅ remove from array too
  btn.onclick = () => {
    const index = params.indexOf(value);
    if (index !== -1) {
      params.splice(index, 1); // remove from array
    }
    item.remove(); // remove from DOM
  };

  item.appendChild(text);
  item.appendChild(btn);
  container.appendChild(item);

  descInput.value = '';
}

function subNewConfig() {
  const nameInput = document.getElementById('name').value.trim();
  const apiKeyInput = document.getElementById('apiKey').value.trim();

  chrome.storage.local.get("configData", (result) => {
    let name = nameInput;
    let apiKey = apiKeyInput;

    // If config exists, use saved values if input is empty
    if (result.configData) {
      if (!name && result.configData.name) {
        name = result.configData.name;
      }
      if (!apiKey && result.configData.apiKey) {
        apiKey = result.configData.apiKey;
      }
    }

    // Now validate
    if (!name || !apiKey) {
      alert("Please fill in all fields.");
      return;
    }

    if (params.length === 0) {
      alert("Please add at least one parameter.");
      return;
    }

    const config = {
      name,
      apiKey,
      params
    };

    chrome.storage.local.set({ configData: config }, () => {
      console.log("Config saved in chrome.storage.local");

      // Clear fields
      document.getElementById('name').value = '';
      document.getElementById('apiKey').value = '';
      document.getElementById('divParams').innerHTML = '';
      params.length = 0;

      alert("Configuration saved successfully!");
    });
  });
}
