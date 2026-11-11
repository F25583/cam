(function() {
    // متغيرات لحفظ حالة البرنامج والتحكم في الإغلاق النهائي
    let isClosedByUser = false;
    let currentZoom = 1;
    let currentPanX = 0;
    let currentPanY = 0;

    function applyAdvancedTransformations() {
        let mainWrapper = document.body;
        let panel = document.getElementById('ai_camera_panel');

        // الحفاظ على أبعاد المتصفح مع تفعيل التحرك الحر (X, Y) في جميع الاتجاهات دون مساحات بيضاء
        mainWrapper.style.imageRendering = "auto";
        mainWrapper.style.transformOrigin = "center center"; // الزوم من المنتصف لمنع قطع الشاشة
        mainWrapper.style.transform = `scale(${currentZoom}) translate(${currentPanX}px, ${currentPanY}px)`;
        
        // جلب قيم الفلاتر والميزات الجديدة
        let brightness = document.getElementById('smart_light') ? document.getElementById('smart_light').value : 100;
        let sharpValue = document.getElementById('smart_sharp') ? document.getElementById('smart_sharp').value : 0;
        let isMonochrome = document.getElementById('ai_mono_mode') && document.getElementById('ai_mono_mode').checked;
        let isInverted = document.getElementById('ai_invert_mode') && document.getElementById('ai_invert_mode').checked;

        let calculatedContrast = 100 + (sharpValue * 10);
        let saturateValue = isMonochrome ? 0 : 110;
        let invertValue = isInverted ? 100 : 0;

        // دمج فلاتر الشحذ والميزات المتقدمة معاً مصفوفياً
        mainWrapper.style.filter = `brightness(${brightness}%) contrast(${calculatedContrast}%) saturate(${saturateValue}%) invert(${invertValue}%) drop-shadow(0px 0px ${sharpValue/2}px rgba(0,0,0,0.5))`;
        
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

    function initEnhancer() {
        // حظر إعادة الفتح تلقائياً إذا قام المستخدم بإغلاق البرنامج
        if (isClosedByUser || document.getElementById('ai_camera_panel')) return;

        let panel = document.createElement('div');
        panel.id = 'ai_camera_panel';
        panel.style.cssText = "position:fixed; top:120px; left:20px; z-index:99999999; background:rgba(20,20,20,0.96); color:white; padding:15px; border-radius:12px; font-family:Arial, sans-serif; direction:rtl; box-shadow: 0 10px 30px rgba(0,0,0,0.7); width:280px; border: 1px solid #4CAF50;";
        
        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:5px;">
                <span id="ai_close_btn" style="cursor:pointer; color:#ff4d4d; font-weight:bold; font-size:16px; padding:0 5px; user-select:none;">✕</span>
                <div id="ai_drag_handle" style="cursor:move; flex-grow:1; text-align:center; font-weight:bold; color:#4CAF50; font-size:13px; user-select:none;">
                    ⣿ محرك المراجعة والنقاء الفائق V2 ⣿
                </div>
            </div>
            
            <!-- قسم أشرطة التحكم الأساسية -->
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
                <label style="font-size:11px; display:block; margin-bottom:2px;">☀️ تفتيح الممرات والظلال: <span id="l_val" style="color:#4CAF50;">100%</span></label>
                <input type="range" id="smart_light" min="100" max="250" value="100" step="5" style="width:100%; cursor:pointer;">
            </div>
            
            <div style="margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:8px;">
                <label style="font-size:11px; display:block; margin-bottom:2px;">✨ شحذ وتوضيح تفاصيل الحواف (AI Sharp): <span id="c_val" style="color:#4CAF50;">+0%</span></label>
                <input type="range" id="smart_sharp" min="0" max="10" value="0" step="0.5" style="width:100%; cursor:pointer;">
            </div>

            <!-- 🆕 أدوات مراجعة الكاميرات الجنائية المضافة حديثاً -->
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
            document.getElementById('c_val').innerText = "+" + (sharpSlider.value * 10) + "%";

            applyAdvancedTransformations();
        }

        zoomSlider.addEventListener('input', updateAllFilters);
        xSlider.addEventListener('input', updateAllFilters);
        ySlider.addEventListener('input', updateAllFilters);
        lightSlider.addEventListener('input', updateAllFilters);
        sharpSlider.addEventListener('input', updateAllFilters);
        monoCheck.addEventListener('change', updateAllFilters);
        invertCheck.addEventListener('change', updateAllFilters);

        // برمجة زر الإغلاق لمنع الفتح التلقائي مجدداً نهائياً
        document.getElementById('ai_close_btn').onclick = function() {
            isClosedByUser = true;
            document.body.style.transform = "none";
            document.body.style.filter = "none";
            document.body.style.imageRendering = "auto";
            panel.remove();
        };
    }

    // تشغيل الفحص الدوري الذكي مع احترام رغبة المستخدم في الإغلاق
    setInterval(initEnhancer, 1000);
})();
