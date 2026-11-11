import streamlit as st
import cv2
import numpy as np
import time
from PIL import Image

# التحقق من نظام التشغيل لاستيراد مكتبة التقاط النوافذ بأمان
import platform
if platform.system() == "Windows":
    import win32gui
    import win32ui
    import win32con
else:
    win32gui = None

st.set_page_config(page_title="AI Video Enhancer & Zoom", layout="wide")

st.title("🛡️ أداة المعالجة الذكية والزوم الفائق للفيديو (منفصل وأمن)")
st.write("البرنامج يعمل محلياً بالكامل عبر التقاط عرض نافذة DIGIEVER الحالية ومعالجتها رسومياً.")

# --- دالة التقاط نافذة معينة من الشاشة برمجياً بأمان ---
def capture_window(window_title_keyword):
    if not win32gui:
        return None
        
    hwnd = None
    # البحث عن نافذة المتصفح المفتوحة التي تحتوي على اسم ديفيجر أو التشغيل
    def foreach_window(h, lParam):
        nonlocal hwnd
        if window_title_keyword.lower() in win32gui.GetWindowText(h).lower():
            hwnd = h
    win32gui.EnumWindows(foreach_window, None)
    
    if not hwnd:
        return None
        
    # الحصول على أبعاد النافذة
    left, top, right, bot = win32gui.GetWindowRect(hwnd)
    w = right - left
    h = bot - top
    
    if w <= 0 or h <= 0:
        return None

    # التقاط واجهة النافذة رسومياً من نظام التشغيل مباشرة دون اتصال شبكي
    hwndDC = win32gui.GetWindowDC(hwnd)
    mfcDC  = win32ui.CreateDCFromHandle(hwndDC)
    saveDC = mfcDC.CreateCompatibleDC()
    
    saveBitMap = win32ui.CreateBitmap()
    saveBitMap.CreateCompatibleBitmap(mfcDC, w, h)
    saveDC.SelectObject(saveBitMap)
    
    # نسخ محتوى النافذة
    saveDC.BitBlt((0, 0), (w, h), mfcDC, (0, 0), win32con.SRCCOPY)
    
    signedIntsArray = saveBitMap.GetBitmapBits(True)
    img = np.frombuffer(signedIntsArray, dtype='uint8')
    img.shape = (h, w, 4)
    
    # تنظيف الذاكرة فوراً
    win32gui.DeleteObject(saveBitMap.GetHandle())
    saveDC.DeleteDC()
    mfcDC.DeleteDC()
    win32gui.ReleaseDC(hwnd, hwndDC)
    
    # تحويل الصورة إلى صيغة BGR القياسية لمعالجتها
    return cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

# --- بناء لوحة التحكم الجانبية (Sidebar Control Panel) ---
st.sidebar.header("🎛️ لوحة تحكم التحسين الذكي")

# 1. نظام التقاط الشاشة
window_keyword = st.sidebar.text_input("كلمة مفتاحية من اسم نافذة العرض:", "playback")

# 2. متحكمات الزوم الفائق (Super Resolution / Lanczos)
st.sidebar.subheader("🔍 الزوم والموضع")
zoom_factor = st.sidebar.slider("معامل التكبير (Zoom Factor):", 1.0, 5.0, 1.0, step=0.2)

# تحريك مركز الزوم لرصد أجزاء مختلفة من الممر
center_x = st.sidebar.slider("تحريك أفقي (X Center):", 0.1, 0.9, 0.5, step=0.05)
center_y = st.sidebar.slider("تحريك رأسي (Y Center):", 0.1, 0.9, 0.5, step=0.05)

# 3. متحكمات الجودة والذكاء الاصطناعي لتوضيح الرؤية
st.sidebar.subheader("✨ تحسين الصورة والإضاءة")
enhance_light = st.sidebar.checkbox("تفعيل تفتيح الأماكن المظلمة (AI Low-Light)")
clip_limit = st.sidebar.slider("قوة معالجة التباين والظلال:", 1.0, 4.0, 2.0, step=0.5) if enhance_light else 0.0

denoise = st.sidebar.checkbox("تصفية تشويش ونقاط الكاميرا الضعيفة (Denoising)")
denoise_strength = st.sidebar.slider("قوة تنعيم الصورة:", 3, 15, 7, step=2) if denoise else 0

# --- منطقة العرض الرئيسية ---
frame_placeholder = st.empty()
status_placeholder = st.sidebar.empty()

# زر بدء تشغيل البث الموازي المحسن
if st.sidebar.button("تشغيل المعالجة الفورية"):
    status_placeholder.success("تم بدء المراقبة والمعالجة الحية...")
    
    while True:
        # التقاط الإطار الحالي من النافذة المستهدفة بأمان
        frame = capture_window(window_keyword)
        
        if frame is None:
            status_placeholder.error(f"لم يتم العثور على نافذة تحتوي على '{window_keyword}'. يرجى فتح المتصفح على صفحة ديفيجر.")
            time.sleep(1)
            continue
            
        h, w, _ = frame.shape
        
        # أولاً: تطبيق الزوم الذكي وتنعيم الحواف (Lanczos Interpolation لمنع البكسلة)
        if zoom_factor > 1.0:
            # تحديد المربع المستهدف بناءً على معاملات التحريك الجانبية
            crop_w, crop_h = int(w / zoom_factor), int(h / zoom_factor)
            x1 = max(0, int(w * center_x - crop_w / 2))
            y1 = max(0, int(h * center_y - crop_h / 2))
            x2 = min(w, x1 + crop_w)
            y2 = min(h, y1 + crop_h)
            
            cropped = frame[y1:y2, x1:x2]
            # إعادة تكبير الجزء المقطوع لملء الشاشة مع إعادة رسم الحواف بدقة عالية
            frame = cv2.resize(cropped, (w, h), interpolation=cv2.INTER_LANCZOS4)
            
        # ثانياً: تفتيح الرؤية في الممرات المظلمة (Low-Light Contrast Enhancement)
        if enhance_light:
            # تحويل لصيغة LAB لعزل الإضاءة عن الألوان ومعالجة الضوء بشكل نقي
            lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            # تطبيق خوارزمية CLAHE الذكية لتفتيح المعالم دون تدمير ملامح الصورة
            clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8,8))
            cl = clahe.apply(l)
            limg = cv2.merge((cl,a,b))
            frame = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
            
        # ثالثاً: تصفية ضوضاء وحبيبات الكاميرا الضعيفة (Denoising Filter)
        if denoise:
            # فلتر ذكي لتنعيم المسطحات مع الحفاظ على الخطوط الحادة للوجوه والأبواب
            frame = cv2.bilateralFilter(frame, d=9, sigmaColor=denoise_strength*10, sigmaSpace=denoise_strength*10)
            
        # تحويل الألوان لصيغة العرض الصحيحة في الويب
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # تحديث العرض في الواجهة الرسومية
        frame_placeholder.image(frame_rgb, channels="RGB", use_container_width=True)
        
        # معدل تحديث طفيف لتوفير مجهود المعالج للكمبيوتر
        time.sleep(0.03)
