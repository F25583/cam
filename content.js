(function() {
    function findCameraElement(doc) {
        if (!doc) return null;
        return doc.querySelector('video') || 
               doc.querySelector('canvas') || 
               doc.querySelector('img[id*="video"]') || 
               doc.querySelector('img[src*="video"]') || 
               doc.querySelector('img[src*="live"]') ||
               doc.querySelector('object') || 
               doc.querySelector('embed') ||
               doc.getElementById('vlc') ||
               doc.querySelector('.video-stream') ||
               doc.querySelector('img[id*="cam"]');
    }

    function initEnhancer() {
        if (document.getElementById('ai_camera_panel')) return;

        let target = findCameraElement(document);
        
        if (!target) {
            let iframes = document.querySelectorAll('iframe');
            for (let i = 0; i < iframes.length; i++) {
                try {
                    let iframeDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
                    target = findCameraElement(iframeDoc);
                    if (target) break;
                } catch(e) {}
            }
        }

        if (!target) return;

        target.style.imageRendering = "crisp-edges";
        target.style.imageRendering = "-webkit-optimize-contrast";
        target.style.transition = "transform 0.1s ease-out";
        target.style.transformOrigin = "top left";

        let panel = document.createElement('div');
        panel.id = 'ai_camera_panel';
        panel.style.cssText = "position:fixed; top:120px; left:20px; z-index:9999999; background:rgba(20,20,20,0.92); color:white; padding:15px; border-radius:12px; font-family:Arial, sans-serif; direction:rtl; box-shadow: 0 10px 30px rgba(0,0,0,0.7); width:270px; border: 1px solid #4CAF50;";
        
        panel.innerHTML = `
            <h4 style="margin:0 0 12px 0; color:#4CAF50; font-size:14px; text-align:center; font-weight:bold; border-bottom:1px solid #333; padding-bottom:5px;">🎛️ تحسين الكاميرات الذكي (DIGIEVER)</h4>
            
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

        let zoomSlider = document.getElementById('smart_zoom');
        let lightSlider = document.getElementById('smart_light');
        let contrastSlider = document.getElementById('smart_contrast');

        function applyLiveFilters() {
            let zoom = zoomSlider.value;
            let brightness = lightSlider.value;
            let contrast = contrastSlider.value;

            document.getElementById('z_val').innerText = zoom + "x";
            document.getElementById('l_val').innerText = brightness + "%";
            document.getElementById('c_val').innerText = contrast + "%";
            
            target.style.transform = `scale(${zoom})`;
            target.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(115%)`;
        }

        zoomSlider.addEventListener('input', applyLiveFilters);
        lightSlider.addEventListener('input', applyLiveFilters);
        contrastSlider.addEventListener('input', applyLiveFilters);
    }

    // فحص تلقائي ذكي كل ثانية للتكيف عند تنقلك بين الكاميرات أو السيرفرات المختلفة
    setInterval(initEnhancer, 1000);
})();
