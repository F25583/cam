(function() {
    function initEnhancer() {
        // إذا كانت اللوحة موجودة بالفعل في الصفحة، لا تقم بإنشائها مجدداً
        if (document.getElementById('ai_camera_panel')) return;

        let panel = document.createElement('div');
        panel.id = 'ai_camera_panel';
        panel.style.cssText = "position:fixed; top:120px; left:20px; z-index:99999999; background:rgba(20,20,20,0.95); color:white; padding:15px; border-radius:12px; font-family:Arial, sans-serif; direction:rtl; box-shadow: 0 10px 30px rgba(0,0,0,0.7); width:270px; border: 1px solid #4CAF50;";
        
        // هندسة تصميم اللوحة مع إضافة زر الإغلاق (X) في أعلى اليمين
        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #333; padding-bottom:5px;">
                <span id="ai_close_btn" style="cursor:pointer; color:#ff4d4d; font-weight:bold; font-size:16px; padding:0 5px; user-select:none;" title="إغلاق الأداة وإعادة ضبط الشاشة">✕</span>
                <div id="ai_drag_handle" style="cursor:move; flex-grow:1; text-align:center; font-weight:bold; color:#4CAF50; font-size:14px; user-select:none;">
                    ⣿ محرك النقاء والزوم الفائق ⣿
                </div>
            </div>
            
            <div style="margin-bottom:12px;">
                <label style="font-size:12px; display:block; margin-bottom:4px;">🔍 الزوم الفائق بدون بكسلة: <span id="z_val" style="color:#4CAF50; font-weight:bold;">1x</span></label>
                <input type="range" id="smart_zoom" min="1" max="5" value="1" step="0.1" style="width:100%; cursor:pointer;">
            </div>
            
            <div style="margin-bottom:12px;">
                <label style="font-size:12px; display:block; margin-bottom:4px;">↕️ تحريك الشاشة بعد الزوم (Y): <span id="y_val" style="color:#4CAF50; font-weight:bold;">0px</span></label>
                <input type="range" id="move_y" min="-500" max="500" value="0" step="10" style="width:100%; cursor:pointer;">
            </div>
            
            <div style="margin-bottom:12px;">
                <label style="font-size:12px; display:block; margin-bottom:4px;">☀️ تفتيح الممرات والظلال: <span id="l_val" style="color:#4CAF50; font-weight:bold;">100%</span></label>
                <input type="range" id="smart_light" min="100" max="250" value="100" step="5" style="width:100%; cursor:pointer;">
            </div>
            
            <div style="margin-bottom:5px;">
                <label style="font-size:12px; display:block; margin-bottom:4px;">✨ شحذ وتوضيح تفاصيل الحواف (AI Sharp): <span id="c_val" style="color:#4CAF50; font-weight:bold;">0px</span></label>
                <input type="range" id="smart_sharp" min="0" max="10" value="0" step="0.5" style="width:100%; cursor:pointer;">
            </div>
        `;
        document.body.appendChild(panel);

        // تفعيل ميزة السحب والتحريك للوحة
        let dragHandle = document.getElementById('ai_drag_handle');
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        dragHandle.onmousedown = function(e) {
            e.preventDefault();
            pos3 = e.clientX; pos4 = e.clientY;
            document.onmouseup = function() { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = function(e) {
                pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY;
                panel.style.top = (panel.offsetTop - pos2) + "px"; panel.style.left = (panel.offsetLeft - pos1) + "px";
            };
        };

        let zoomSlider = document.getElementById('smart_zoom');
        let ySlider = document.getElementById('move_y');
        let lightSlider = document.getElementById('smart_light');
        let sharpSlider = document.getElementById('smart_sharp');
        let mainWrapper = document.body;

        // دالة التحكم والمعالجة الرسومية للشاشة
        function applyGlobalTransformation() {
            let zoom = zoomSlider.value;
            let translateY = ySlider.value;
            let brightness = lightSlider.value;
            let sharpValue = sharpSlider.value;
            let calculatedContrast = 100 + (sharpValue * 10);

            mainWrapper.style.imageRendering = "auto";
            mainWrapper.style.transformOrigin = "top center";
            mainWrapper.style.transform = `scale(${zoom}) translateY(${translateY}px)`;
            mainWrapper.style.filter = `brightness(${brightness}%) contrast(${calculatedContrast}%) saturate(110%) drop-shadow(0px 0px ${sharpValue/2}px rgba(0,0,0,0.5))`;
            
            panel.style.transform = `scale(${1 / zoom})`;
            panel.style.transformOrigin = "top left";
            
            document.getElementById('z_val').innerText = zoom + "x";
            document.getElementById('y_val').innerText = translateY + "px";
            document.getElementById('l_val').innerText = brightness + "%";
            document.getElementById('c_val').innerText = "+" + (sharpValue * 10) + "%";
        }

        zoomSlider.addEventListener('input', applyGlobalTransformation);
        ySlider.addEventListener('input', applyGlobalTransformation);
        lightSlider.addEventListener('input', applyGlobalTransformation);
        sharpSlider.addEventListener('input', applyGlobalTransformation);

        // برمجة زر الإغلاق (✕) لإعادة ضبط الشاشة ومسح اللوحة
        document.getElementById('ai_close_btn').onclick = function() {
            // إعادة الشاشة لوضعها الأصلي تماماً قبل الحذف
            mainWrapper.style.transform = "none";
            mainWrapper.style.filter = "none";
            mainWrapper.style.imageRendering = "auto";
            // حذف لوحة التحكم من واجهة المتصفح
            panel.remove();
        };
    }

    // فحص دوري كل ثانية لتركيب اللوحة تلقائياً عند تحديث الصفحة أو فتح بث جديد
    setInterval(initEnhancer, 1000);
})();
