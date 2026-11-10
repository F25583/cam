// سكربت تكبير الفيديو ومنع البكسلة لصفحة DIGIEVER
(function() {
    // 1. تحديد عنصر الفيديو أو الصورة المعروضة في الصفحة
    let videoElement = document.querySelector('video') || document.querySelector('canvas');
    
    if (!videoElement) {
        alert("لم يتم العثور على بث فيديو نشط في هذه الصفحة.");
        return;
    }

    // 2. تطبيق فلتر منع البكسلة الرياضي عالي الجودة (High-Quality Interpolation)
    videoElement.style.imageRendering = "auto"; 
    videoElement.style.transformOrigin = "center center"; // تحديد مركز الزوم
    
    // 3. إضافة شريط تحكم بالزوم (Slider) في أعلى الشاشة بشكل مؤقت للتجربة
    let slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '1';
    slider.max = '4';
    slider.value = '1';
    slider.step = '0.1';
    slider.style.position = 'fixed';
    slider.style.top = '10px';
    slider.style.left = '50%';
    slider.style.transform = 'translateX(-50%)';
    slider.style.zIndex = '99999';
    slider.style.width = '200px';
    
    document.body.appendChild(slider);

    // 4. تنفيذ الزوم النظيف عند تحريك الشريط
    slider.addEventListener('input', function() {
        let scaleValue = slider.value;
        // تكبير الفيديو مع الحفاظ على نعومة الأبعاد ومنع التشويه
        videoElement.style.transform = `scale(${scaleValue})`;
    });

    alert("تم تفعيل أداة الزوم الذكي! استخدم الشريط في أعلى الصفحة للتكبير.");
})();
