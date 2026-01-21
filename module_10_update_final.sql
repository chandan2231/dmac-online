-- Update Module 10 Description (English)
UPDATE modules 
SET description = 'A short video will play with audio to show you how to draw a picture from the square and line tools provided. The screen will show the first picture of the box and lines.'
WHERE id = 10;

-- Update Module 10 I18N Descriptions

-- English
UPDATE modules_i18n 
SET description = 'A short video will play with audio to show you how to draw a picture from the square and line tools provided. The screen will show the first picture of the box and lines.'
WHERE module_id = 10 AND language_code = 'en';

-- Hindi
UPDATE modules_i18n 
SET description = 'एक छोटा वीडियो ऑडिओ के साथ चलेगा जो आपको दिखाएगा कि दिए गए वर्ग और रेखा उपकरणों से चित्र कैसे बनाया जाए। स्क्रीन बॉक्स और लाइनों की पहली तस्वीर दिखाएगी।'
WHERE module_id = 10 AND language_code = 'hi';

-- Spanish
UPDATE modules_i18n 
SET description = 'Se reproducirá un video corto con audio para mostrarle cómo dibujar una imagen con las herramientas de cuadrado y línea proporcionadas. La pantalla mostrará la primera imagen de la caja y las líneas.'
WHERE module_id = 10 AND language_code = 'es';

-- Arabic
UPDATE modules_i18n 
SET description = 'سيعمل فيديو قصير مع صوت ليوضح لك كيفية رسم صورة باستخدام أدوات المربع والخط المتوفرة. ستظهر الشاشة الصورة الأولى للمربع والخطوط.'
WHERE module_id = 10 AND language_code = 'ar';


-- Update Memorize Phase Prompt Text (Question ID 100)

-- English
UPDATE questions 
SET prompt_text = 'The picture will be displayed for 10 seconds, you are instructed to draw the same picture with the square and line tools provided as shown in the video before.'
WHERE id = 100;

UPDATE questions_i18n
SET prompt_text = 'The picture will be displayed for 10 seconds, you are instructed to draw the same picture with the square and line tools provided as shown in the video before.'
WHERE question_id = 100 AND language_code = 'en';

-- Hindi
UPDATE questions_i18n
SET prompt_text = 'चित्र 10 सेकंड के लिए प्रदर्शित किया जाएगा, आपको निर्देश दिया जाता है कि जैसा कि पहले वीडियो में दिखाया गया है, दिए गए वर्ग और रेखा उपकरणों के साथ वही चित्र बनाएं।'
WHERE question_id = 100 AND language_code = 'hi';

-- Spanish
UPDATE questions_i18n
SET prompt_text = 'La imagen se mostrará durante 10 segundos, se le indica que dibuje la misma imagen con las herramientas de cuadrado y línea proporcionadas como se muestra en el video anterior.'
WHERE question_id = 100 AND language_code = 'es';

-- Arabic
UPDATE questions_i18n
SET prompt_text = 'سيتم عرض الصورة لمدة 10 ثوانٍ، ويُطلب منك رسم نفس الصورة باستخدام أدوات المربع والخط المتوفرة كما هو موضح في الفيديو السابق.'
WHERE question_id = 100 AND language_code = 'ar';


-- Insert 'game_undo' key
INSERT INTO dmac_webapp_ui_texts (code, status)
SELECT 'game_undo', 1 FROM DUAL WHERE NOT EXISTS (SELECT * FROM dmac_webapp_ui_texts WHERE code = 'game_undo');

-- Insert 'game_undo' translations for requested languages only

-- English
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'en', 'UNDO' FROM dmac_webapp_ui_texts WHERE code = 'game_undo'
AND NOT EXISTS (SELECT * FROM dmac_webapp_ui_text_translations WHERE ui_text_id = (SELECT id FROM dmac_webapp_ui_texts WHERE code = 'game_undo') AND language_code = 'en');

-- Hindi
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'hi', 'पूर्ववत करें' FROM dmac_webapp_ui_texts WHERE code = 'game_undo'
AND NOT EXISTS (SELECT * FROM dmac_webapp_ui_text_translations WHERE ui_text_id = (SELECT id FROM dmac_webapp_ui_texts WHERE code = 'game_undo') AND language_code = 'hi');

-- Spanish
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'es', 'DESHACER' FROM dmac_webapp_ui_texts WHERE code = 'game_undo'
AND NOT EXISTS (SELECT * FROM dmac_webapp_ui_text_translations WHERE ui_text_id = (SELECT id FROM dmac_webapp_ui_texts WHERE code = 'game_undo') AND language_code = 'es');

-- Arabic
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'ar', 'تراجع' FROM dmac_webapp_ui_texts WHERE code = 'game_undo'
AND NOT EXISTS (SELECT * FROM dmac_webapp_ui_text_translations WHERE ui_text_id = (SELECT id FROM dmac_webapp_ui_texts WHERE code = 'game_undo') AND language_code = 'ar');
