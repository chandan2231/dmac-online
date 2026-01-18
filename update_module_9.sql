-- Update Module 9 (Number Recall) to "Audio Number Recall"

-- 1. Update the main modules table
UPDATE modules 
SET 
    name = 'Audio Number Recall',
    description = 'Audio will play a combination of numbers, Please speak or type to enter the numbers in the text box.'
WHERE id = 9;

-- 2. Update existing translations (Native Translations)

-- English
UPDATE modules_i18n 
SET 
    name = 'Audio Number Recall',
    description = 'Audio will play a combination of numbers, Please speak or type to enter the numbers in the text box.'
WHERE module_id = 9 AND language_code = 'en';

-- Spanish
-- Name: Recuerdo de Números de Audio
-- Desc: El audio reproducirá una combinación de números. Por favor, hable o escriba para ingresar los números en el cuadro de texto.
UPDATE modules_i18n 
SET 
    name = 'Recuerdo de Números de Audio',
    description = 'El audio reproducirá una combinación de números. Por favor, hable o escriba para ingresar los números en el cuadro de texto.'
WHERE module_id = 9 AND language_code = 'es';

-- Hindi
-- Name: ऑडियो नंबर रिकॉल
-- Desc: ऑडियो संख्याओं का एक संयोजन चलाएगा, कृपया टेक्स्ट बॉक्स में संख्याएँ दर्ज करने के लिए बोलें या टाइप करें।
UPDATE modules_i18n 
SET 
    name = 'ऑडियो नंबर रिकॉल',
    description = 'ऑडियो संख्याओं का एक संयोजन चलाएगा, कृपया टेक्स्ट बॉक्स में संख्याएँ दर्ज करने के लिए बोलें या टाइप करें।'
WHERE module_id = 9 AND language_code = 'hi';

-- Arabic
-- Name: استدعاء الرقم الصوتي
-- Desc: سيقوم الصوت بتشغيل مجموعة من الأرقام، يرجى التحدث أو الكتابة لإدخال الأرقام في مربع النص.
UPDATE modules_i18n 
SET 
    name = 'استدعاء الرقم الصوتي',
    description = 'سيقوم الصوت بتشغيل مجموعة من الأرقام، يرجى التحدث أو الكتابة لإدخال الأرقام في مربع النص.'
WHERE module_id = 9 AND language_code = 'ar';
