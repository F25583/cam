// الانتظار حتى تحميل الصفحة بالكامل لتركيب أداة المعالجة الذكية
window.addEventListener('load', function() {
    // 1. البحث عن عنصر الفيديو أو الكاميرا النشطة في صفحة ديفيجر
    let video = document.querySelector('video') || document.querySelector('canvas');
    if (!video) return;

    // 2. تطبيق فلاتر التنعيم الرياضية المتقدمة لمنع البكسلة برمجياً عند التكبير
    video.style.imageRendering = "auto";
    video.style.transition = "transform 0.1s ease-out";
    video.style.transformOrigin = "center center";

    // 3. بناء لوحة التحكم الرسومية (Control Panel) في زاوية الشاشة
    let panel = document.createElement('div');
    panel.style.cssText = "position:fixed; top:20px; right:20px; z-index:999999; background:rgba(0,0,0,0.85); color:white; padding:15px; border-radius:10px; font-family:Arial, sans-serif; direction:rtl; box-shadow: 0 4px 15px rgba(0,0,0,0.5); width:260px;";
    
    panel.innerHTML = `
        <h4 style="margin:0 0 10px 0; color:#4CAF50; font-size:14px; text-align:center;">🎛️ لوحة التحكم الذكي (DIGIEVER)</h4>
        
        <label style="font-size:12px;">🔍 الزوم الفائق (Zoom): <span id="z_val">1x</span></label>
        <input type="range" id="smart_zoom" min="1" max="5" value="1" step="0.1" style="width:100%; margin-bottom:10px;">
        
        <label style="font-size:12px;">☀️ تفتيح الإضاءة والظلال (AI Light): <span id="l_val">100%</span></label>
        <input type="range" id="ai_light" min="100" max="250" value="100" style="width:100%; margin-bottom:10px;">
        
        <label style="font-size:12px;">✨ حدة الحواف والتنعيم (Contrast): <span id="c_val">100%</span></label>
        <input type="range" id="ai_contrast" min="100" max="200" value="100" style="width:100%;">
    `;
    document.body.appendChild(panel);

    // 4. ربط عناصر التحكم وأشرطة التمرير بالفيديو حياً ومباشراً
    let zoomSlider = document.getElementById('smart_zoom');
    let lightSlider = document.getElementById('ai_light');
    let contrastSlider = document.getElementById('ai_contrast');

    function applyFilters() {
        let zoom = zoomSlider.value;
        let brightness = lightSlider.value;
        let contrast = contrastSlider.value;

        // تحديث أرقام القراءات في اللوحة
        document.getElementById('z_val').innerText = zoom + "x";
        document.getElementById('l_val').innerText = brightness + "%";
        document.getElementById('c_val').innerText = contrast + "%";

        // تنفيذ المعالجة الفورية وتعديل المصفوفة الرسومية للبث الحي
        video.style.transform = `scale(${zoom})`;
        video.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(110%)`;
    }

    zoomSlider.addEventListener('input', applyFilters);
    lightSlider.addEventListener('input', applyFilters);
    contrastSlider.addEventListener('input', applyFilters);
});
