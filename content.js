function getConfigData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("configData", (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      if (result.configData) {
        resolve(result.configData);
      } else {
        reject(new Error("No configData found"));
      }
    });
  });
}

(async () => {
  try {
    let config = await getConfigData();
    console.log("Loaded config:", config);

    const HF_API_URL = `https://router.huggingface.co/featherless-ai/v1/chat/completions`;
    const HF_API_TOKEN = config.apiKey;
    document.addEventListener('mouseup', async (e) => {
      config = await getConfigData();
      console.log("Loaded config:", config);

      let oldBox = document.getElementById('floating-box');
      if (oldBox) oldBox.remove();

      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const selectedText = range.toString();

        const box = document.createElement('div');
        box.id = 'floating-box';
        box.textContent = 'Loading...';
        box.style.position = 'absolute';
        box.style.left = `${rect.left + window.scrollX}px`;
        box.style.top = `${rect.bottom + window.scrollY + 5}px`;
        box.style.maxWidth = '600px';
        box.style.minWidth = '200px';
        box.style.maxHeight = '300px';
        box.style.overflowY = 'auto';
        box.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        box.style.backdropFilter = 'blur(10px)';
        box.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        box.style.color = '#ffffff';
        box.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
        box.style.fontSize = '14px';
        box.style.fontWeight = '400';
        box.style.lineHeight = '1.5';
        box.style.padding = '16px 20px';
        box.style.margin = '0';
        box.style.borderRadius = '12px';
        box.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)';
        box.style.cursor = 'pointer';
        box.style.zIndex = '10000';
        box.style.transform = 'translateY(-5px)';
        box.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        box.style.opacity = '0';

        setTimeout(() => {
          box.style.opacity = '1';
          box.style.transform = 'translateY(0)';
        }, 10);

        box.addEventListener('mouseenter', () => {
          box.style.transform = 'translateY(-2px)';
          box.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)';
        });

        box.addEventListener('mouseleave', () => {
          box.style.transform = 'translateY(0)';
          box.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)';
        });

        document.body.appendChild(box);

        fetch(HF_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "mistralai/Magistral-Small-2506",
            messages: [
              {
                role: "user",
                content: `The response must respect these parameters:\n${config.params.map(p => `- ${p}`).join('\n')}\n\nText to process:\n${selectedText}`
              }
            ],
            stream: false
          })
        })
          .then(res => res.json())
          .then(data => {
            let text = data?.choices?.[0]?.message?.content ||
                       data?.error?.message ||
                       "No response from API.";

            // Formatting enhancements
            text = text
              .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #f0f8ff;">$1</strong>')
              .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #e6f3ff;">$1</em>')
              .replace(/```(.*?)```/gs, '<code style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; display: block; margin: 8px 0; font-family: monospace; font-size: 13px; border-left: 3px solid #4fc3f7;">$1</code>')
              .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">$1</code>')
              .replace(/\n/g, '<br>')
              .replace(/^- (.*$)/gm, '<div style="margin: 4px 0; padding-left: 16px; position: relative;"><span style="position: absolute; left: 0; color: #81c784;">•</span>$1</div>');

            box.style.opacity = '0.7';

            setTimeout(() => {
              box.innerHTML = `
                <div style="position: relative;">
                  ${text}
                  <div style="position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;" onclick="this.closest('#gemini-floating-box').remove()">×</div>
                </div>
              `;
              box.style.opacity = '1';
            }, 200);
          })
          .catch(error => {
            box.innerHTML = `
              <div style="color: #ffcdd2;">
                <strong style="color: #f44336;">⚠ Error:</strong> ${error.message}
              </div>
            `;
          });

        document.addEventListener('mousedown', function handler(ev) {
          if (!box.contains(ev.target)) {
            box.remove();
            document.removeEventListener('mousedown', handler);
          }
        });
      }
    });
  } catch (error) {
    console.log("Error loading config:", error.message);
  }
})();
