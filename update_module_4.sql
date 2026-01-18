-- Update Module 4 (Connect the Dots) to "Trail Sequence Tracing Test"

-- 1. Update the main modules table
UPDATE modules 
SET 
    name = 'Trail Sequence Tracing Test',
    description = 'Tap to start from the Green M, Tap or touch the letters to number tab in increasing order, low to high.'
WHERE id = 4;

-- 2. Update existing translations (Native Translations)

-- English
UPDATE modules_i18n 
SET 
    name = 'Trail Sequence Tracing Test',
    description = 'Tap to start from the Green M, Tap or touch the letters to number tab in increasing order, low to high.'
WHERE module_id = 4 AND language_code = 'en';

-- Spanish
-- Name: Prueba de Rastreo de Secuencias
-- Desc: Toque para comenzar desde la M verde, toque las letras y números en orden ascendente, de menor a mayor.
UPDATE modules_i18n 
SET 
    name = 'Prueba de Rastreo de Secuencias',
    description = 'Toque para comenzar desde la M verde, toque las letras y números en orden ascendente, de menor a mayor.'
WHERE module_id = 4 AND language_code = 'es';

-- Hindi
-- Name: ट्रेल सीक्वेंस ट्रेसिंग टेस्ट
-- Desc: हरे M से शुरू करने के लिए टैप करें, अक्षरों और संख्याओं को बढ़ते क्रम में (निम्न से उच्च) टैप करें।
UPDATE modules_i18n 
SET 
    name = 'ट्रेल सीक्वेंस ट्रेसिंग टेस्ट',
    description = 'हरे M से शुरू करने के लिए टैप करें, अक्षरों और संख्याओं को बढ़ते क्रम में (निम्न से उच्च) टैप करें।'
WHERE module_id = 4 AND language_code = 'hi';

-- Arabic
-- Name: اختبار تتبع المسار
-- Desc: اضغط للبدء من حرف M الأخضر، اضغط على الحروف والأرقام بترتيب تصاعدي، من الأدنى إلى الأعلى.
UPDATE modules_i18n 
SET 
    name = 'اختبار تتبع المسار',
    description = 'اضغط للبدء من حرف M الأخضر، اضغط على الحروف والأرقام بترتيب تصاعدي، من الأدنى إلى الأعلى.'
WHERE module_id = 4 AND language_code = 'ar';
