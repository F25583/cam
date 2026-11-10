import streamlit as st
import cv2
import numpy as np
import tempfile

st.title("أداة التكبير الذكي للفيديو (مقاوم البكسلة) 🎥")

# 1. رفع ملف الفيديو من التخزين
uploaded_file = st.file_uploader("اختر ملف الفيديو من ذاكرة التخزين:", type=["mp4", "avi", "mov"])

if uploaded_file is not None:
    # حفظ الفيديو في ملف مؤقت ليتمكن OpenCV من قراءته
    tfile = tempfile.NamedTemporaryFile(delete=False)
    tfile.write(uploaded_file.read())
    
    cap = cv2.VideoCapture(tfile.name)
    
    # 2. خيارات التحكم في الزوم
    zoom_type = st.radio("اختر تقنية التكبير:", ("زوم ذكي (Lanczos Filter)", "زوم ذكي جداً (AI - FSRCNN)"))
    zoom_factor = st.slider("معامل التكبير (Zoom Factor):", 1.0, 4.0, 2.0, step=0.5)

    # تجهيز نموذج الذكاء الاصطناعي إذا تم اختياره
    if zoom_type == "زوم ذكي جداً (AI - FSRCNN)":
        try:
            sr = cv2.dnn_superres.DnnSuperResImpl_create()
            sr.readModel("FSRCNN_x2.pb")
            sr.setModel("fsrcnn", 2) # تكبير بمقدار ضعفين كمثال ثابت للنموذج
        except Exception as e:
            st.error("تأكد من وجود ملف FSRCNN_x2.pb في مجلد المشروع.")

    # مكان لعرض إطارات الفيديو
    frame_placeholder = st.empty()
    
    # زر لبدء المعالجة والعرض
    if st.button("ابدأ عرض الفيديو المحسن"):
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # حساب الأبعاد الجديدة بناءً على معامل التكبير
            width = int(frame.shape[1] * zoom_factor)
            height = int(frame.shape[0] * zoom_factor)
            
            # تطبيق خوارزمية المعالجة لمنع البكسلة
            if zoom_type == "زوم ذكي (Lanczos Filter)":
                # معالجة رياضية متطورة وسريعة جداً للحفاظ على حدة الحواف
                processed_frame = cv2.resize(frame, (width, height), interpolation=cv2.INTER_LANCZOS4)
            else:
                # معالجة عبر الذكاء الاصطناعي لإعادة رسم البكسلات المفقودة
                processed_frame = sr.upsample(frame)
            
            # تحويل الألوان للعرض الصحيح في Streamlit (من BGR إلى RGB)
            processed_frame = cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB)
            
            # تحديث الإطار المعروض في الواجهة
            frame_placeholder.image(processed_frame, channels="RGB", use_container_width=True)
            
        cap.release()
