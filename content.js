(function() {
    function applyStyleToAllCameras(zoom, brightness, contrast) {
        let elements = document.querySelectorAll('video, canvas, img, object, embed');
        
        elements.forEach(el => {
            if (el.closest('#ai_camera_panel') || el.width < 100 || el.height < 100) return;

            el.style.setProperty('image-rendering', 'crisp-edges', 'important');
            el.style.setProperty('image-rendering', '-webkit-optimize-contrast', 'important');
            el.style.setProperty('transform-origin', 'top left', 'important');
            el.style.setProperty('transform', `scale(${zoom})`, 'important');
            el.style.setProperty('filter', `brightness(${brightness}%) contrast(${contrast}%) saturate(115%)`, 'important');
        });

        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                let innerElements = iframeDoc.querySelectorAll('video, canvas, img, object, embed');
                innerElements.forEach(el => {
                    if (el.width < 100 || el.height < 100) return;
                    el.style.setProperty('image-rendering', 'crisp-edges', 'important');
                    el.style.setProperty('transform-origin', 'top left', 'important');
                    el.style.setProperty('transform', `scale(${zoom})`, 'important');
                    el.style.setProperty('filter', `brightness(${brightness}%) contrast(${contrast}%) saturate(115%)`, 'important');
                });
            } catch(e) {}
        });
    }

    function makeElementDraggable(panel, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            // التحقق من أن السحب لا يتم من أشرطة التمرير
            if (e.target.type === 'range') return;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            panel.style.top = (panel.offsetTop - pos2) + "px";
            panel.style.left = (panel.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function initEnhancer() {
        if (document.getElementById('ai_camera_panel')) return;

        let panel = document.createElement('div');
        panel.id = 'ai_camera_panel';
        panel.style.cssText = "position:fixed; top:120px; left:20px; z-index:99999999; background:rgba(20,20,20,0.95); color:white; padding:15px; border-radius:12px; font-family:Arial, sans-serif; direction:rtl; box-shadow: 0 10px 30px rgba(0,0,0,0.7); width:270px; border: 1px solid #4CAF50;";
        
        panel.innerHTML = `
            <div id="ai_drag_handle" style="cursor:move; margin:0 0 12px 0; border-bottom:1px solid #333; padding-bottom:5px; text-align:center;">
                <h4 style="margin:0; color:#4CAF50; font-size:14px; font-weight:bold;">⣿ تحسين الكاميرات الذكي ⣿</h4>
            </div>
            
            <div style="margin-bottom:12px;">
                <label style="font-size:12px; display:block; margin-bottom:4px;">🔍 الزوم الفائق بدون بكسلة: <span id="z_val" style="color:#4CAF50; font-weight:bold;">1x</span></label>
                <input type="range" id="smart_zoom" min="1" max="5" value="1" step="0.1" style="width:100%; cursor:pointer;">
            </div>
            
            <div style="margin-bottom:12px;">
                <label style="font-size:12px; display:block; margin-bottom:4px;">☀️ تفتيح الممرات والظلال: <span id="l_val" style="color:#4CAF50; font-weight:bold;">100%</span></label>
                <input type="range" id="smart_light" min="100" max="250" value="100" step="5" style="width:100%; cursor:pointer;">
            </div>
            
            <div style="margin-bottom:5px;">
                <label style="font-size:12px; display:block; margin-bottom:4px;">✨ حدة وتباين تفاصيل الوجوه: <span id="c_val" style="color:#4CAF50; font-weight:bold;">100%</span></label>
                <input type="range" id="smart_contrast" min="100" max="200" value="100" step="5" style="width:100%; cursor:pointer;">
            </div>
        `;
        document.body.appendChild(panel);

        let dragHandle = document.getElementById('ai_drag_handle');
        makeElementDraggable(panel, dragHandle);

        let zoomSlider = document.getElementById('smart_zoom');
        let lightSlider = document.getElementById('smart_light');
        let contrastSlider = document.getElementById('smart_contrast');

        function updateLiveFilters() {
            let zoom = zoomSlider.value;
            let brightness = lightSlider.value;
            let contrast = contrastSlider.value;

            document.getElementById('z_val').innerText = zoom + "x";
            document.getElementById('l_val').innerText = brightness + "%";
            document.getElementById('c_val').innerText = contrast + "%";
            
            applyStyleToAllCameras(zoom, brightness, contrast);
        }

        zoomSlider.addEventListener('input', updateLiveFilters);
        lightSlider.addEventListener('input', updateLiveFilters);
        contrastSlider.addEventListener('input', updateLiveFilters);

        setInterval(() => {
            applyStyleToAllCameras(zoomSlider.value, lightSlider.value, contrastSlider.value);
        }, 500);
    }

    setInterval(initEnhancer, 1000);
})();
