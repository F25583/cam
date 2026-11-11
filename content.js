(function() {
    let currentZoom = 1;
    let currentPanX = 0;
    let currentPanY = 0;

    function applyAdvancedTransformations() {
        let mainWrapper = document.body;
        let panel = document.getElementById('ai_camera_panel');

        // 1. إجبار المتصفح على تشغيل أقوى محركات شحذ الحواف الرسومية لمنع الضبابية نهائياً
        mainWrapper.style.setProperty('image-rendering', 'crisp-edges', 'important');
        mainWrapper.style.setProperty('image-rendering', '-webkit-optimize-contrast', 'important');
        mainWrapper.style.setProperty('image-rendering', 'pixelated', 'important');
        
        mainWrapper.style.transformOrigin = "center center"; 
        mainWrapper.style.transform = `scale(${currentZoom}) translate(${currentPanX}px, ${currentPanY}px)`;
        
        let brightness = document.getElementById('smart_light') ? document.getElementById('smart_light').value : 100;
        let sharpValue = document.getElementById('smart_sharp') ? document.getElementById('smart_sharp').value : 0;
        let isMonochrome = document.getElementById('ai_mono_mode') && document.getElementById('ai_mono_mode').checked;
        let isInverted = document.getElementById('ai_invert_mode') && document.getElementById('ai_invert_mode').checked;

        // 2. معادلة رياضية مطورة لزيادة التباين والشحذ النقي مصفوفياً (AI Sharp Extended)
        let calculatedContrast = 100 + (sharpValue * 15); // زيادة القوة بنسبة 50% عن الإصدار السابق
        let saturateValue = isMonochrome ? 0 : (110 + parseInt(sharpValue * 2));
        let invertValue = isInverted ? 100 : 0;

        // دمج الفلاتر معاً لإنتاج أعلى حدة ممكنة لتفاصيل الحركة والوجوه
        mainWrapper.style.filter = `brightness(${brightness}%) contrast(${calculatedContrast}%) saturate(${saturateValue}%) invert(${invertValue}%) contrast(105%)`;
        
        if (panel) {
            panel.style.transform = `scale(${1 / currentZoom})`;
            panel.style.transformOrigin = "top left";
        }
    }

    function makeElementDraggable(panel, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        handle.onmousedown = function(e) {
            if (e.target.type === 'range' || e.target.type === 'checkbox') return;
            e.preventDefault();
            pos3 = e.clientX; pos4 = e.clientY;
            document.onmouseup = function() { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = function(e) {
                pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY;
                panel.style.top = (panel.offsetTop - pos2) + "px"; panel.style.left = (panel.offsetLeft - pos1) + "px";
            };
        };
    }

    function closeAndResetPanel() {
        let panel = document.getElementById('ai_camera_panel');
        if (panel) {
            document.body.style.transform = "none";
            document.body.style.filter = "none";
            document.body.style.imageRendering = "auto";
            panel.remove();
            currentZoom = 1; currentPanX = 0; currentPanY = 0;
        }
    }

    function toggleEnhancerPanel() {
        let panel = document.getElementById('ai_camera_panel');
        
        if (panel) {
            closeAndResetPanel();
            return;
        }

        panel = document.createElement('div');
        panel.id = 'ai_camera_panel';
        panel.style.cssText = "position:fixed; top:120px; left:20px; z-index:99999999; background:rgba(20,20,20,0.96); color:white; padding:15px; border-radius:12px; font-family:Arial, sans-serif; direction:rtl; box-shadow: 0 10px 30px rgba(0,0,0,0.7); width:280px; border: 1px solid #4CAF50;";
        
        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:5px;">
                <span id="ai_close_btn" style="cursor:pointer; color:#ff4d4d; font-weight:bold; font-size:16px; padding:0 5px; user-select:none;">✕</span>
                <div id="ai_drag_handle" style="cursor:move; flex-grow:1; text-align:center; font-weight:bold; color:#4CAF50; font-size:13px; user-select:none;">
                    ⣿ محرك النقاء والوضوح الأقصى V3 ⣿
                </div>
            </div>
            
            <div style="margin-bottom:10px;">
                <label style="font-size:11px; display:block; margin-bottom:2px;">🔍 الزوم الفائق بدون بكسلة: <span id="z_val" style="color:#4CAF50;">1x</span></label>
                <input type="range" id="smart_zoom" min="1" max="5" value="1" step="0.1" style="width:100%; cursor:pointer;">
            </div>
            
            <div style="margin-bottom:10px;">
                <label style="font-size:11px; display:block; margin-bottom:2px;">↔️ تحريك الشاشة أفقيًا (يمين/شمال): <span id="x_val" style="color:#4CAF50;">0px</span></label>
                <input type="range" id="move_x" min="-400" max="400" value="0" step="5" style="width:100%; cursor:pointer;">
            </div>

            <div style="margin-bottom:10px;">
                <label style="font-size:11px; display:block; margin-bottom:2px;">↕️ تحريك الشاشة رأسيًا (أعلى/أسفل): <span id="y_val" style="color:#4CAF50;">0px</span></label>
                <input type="range" id="move_y" min="-400" max="400" value="0" step="5" style="width:100%; cursor:pointer;">
            </div>
            
            <div style="margin-bottom:10px;">
                <label style="font-size:11px; display:block; margin-bottom:2px;">☀️ التحكم في مستوي الإضاءة: <span id="l_val" style="color:#4CAF50;">100%</span></label>
                <input type="range" id="smart_light" min="50" max="250" value="100" step="5" style="width:100%; cursor:pointer;">
            </div>
            
            <div style="margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:8px;">
                <label style="font-size:11px; display:block; margin-bottom:2px;">✨ شحذ وتوضيح تفاصيل الحواف (AI Sharp): <span id="c_val" style="color:#4CAF50;">+0%</span></label>
                <input type="range" id="smart_sharp" min="0" max="10" value="0" step="0.5" style="width:100%; cursor:pointer;">
            </div>

            <div style="background:rgba(0,0,0,0.3); padding:8px; border-radius:6px;">
                <h5 style="margin:0 0 6px 0; color:#4CAF50; font-size:12px; font-weight:bold;">🛠️ أدوات تدقيق ومراجعة الفيديو الحية:</h5>
                <label style="display:flex; align-items:center; font-size:11px; cursor:pointer; margin-bottom:6px;">
                    <input type="checkbox" id="ai_mono_mode" style="margin-left:6px;"> 🌓 وضع الأبيض والأسود (High Contrast B&W)
                </label>
                <label style="display:flex; align-items:center; font-size:11px; cursor:pointer;">
                    <input type="checkbox" id="ai_invert_mode" style="margin-left:6px;"> 👁️ وضع الرؤية العكسية (Invert / Negative)
                </label>
            </div>
        `;
        document.body.appendChild(panel);

        let dragHandle = document.getElementById('ai_drag_handle');
        makeElementDraggable(panel, dragHandle);

        let zoomSlider = document.getElementById('smart_zoom');
        let xSlider = document.getElementById('move_x');
        let ySlider = document.getElementById('move_y');
        let lightSlider = document.getElementById('smart_light');
        let sharpSlider = document.getElementById('smart_sharp');
        let monoCheck = document.getElementById('ai_mono_mode');
        let invertCheck = document.getElementById('ai_invert_mode');

        function updateAllFilters() {
            currentZoom = zoomSlider.value;
            currentPanX = xSlider.value;
            currentPanY = ySlider.value;

            document.getElementById('z_val').innerText = currentZoom + "x";
            document.getElementById('x_val').innerText = currentPanX + "px";
            document.getElementById('y_val').innerText = currentPanY + "px";
            document.getElementById('l_val').innerText = lightSlider.value + "%";
            document.getElementById('c_val').innerText = "+" + (sharpSlider.value * 15) + "%";

            applyAdvancedTransformations();
        }

        zoomSlider.addEventListener('input', updateAllFilters);
        xSlider.addEventListener('input', updateAllFilters);
        ySlider.addEventListener('input', updateAllFilters);
        lightSlider.addEventListener('input', updateAllFilters);
        sharpSlider.addEventListener('input', updateAllFilters);
        monoCheck.addEventListener('change', updateAllFilters);
        invertCheck.addEventListener('change', updateAllFilters);

        document.getElementById('ai_close_btn').onclick = closeAndResetPanel;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "toggle_ai_panel") {
            toggleEnhancerPanel();
        }
    });
})();
