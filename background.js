chrome.action.onClicked.addListener((tab) => {
    // إرسال رسالة إلى صفحة الكاميرات المفتوحة لتفعيل أو إخفاء اللوحة
    chrome.tabs.sendMessage(tab.id, { action: "toggle_ai_panel" }).catch((err) => {
        // إذا لم تكن الصفحة محملة بالكامل، نقوم بحقن الكود يدوياً
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        }).then(() => {
            chrome.tabs.sendMessage(tab.id, { action: "toggle_ai_panel" });
        });
    });
});
