-- Ensure correct encoding
SET NAMES 'utf8mb4';

-- 1. Update Schema to support 'drawing_recall'
ALTER TABLE questions MODIFY COLUMN question_type ENUM('flash_recall','visual_spatial','audio_story','connect_dots', 'audio_words', 'executive', 'semantic', 'number_recall', 'drawing_recall') NOT NULL;

-- 2. Clean up existing data for Module 10
DELETE FROM responses WHERE session_id IN (SELECT id FROM sessions WHERE module_id = 10);
DELETE FROM sessions WHERE module_id = 10;
DELETE FROM question_item_i18n WHERE question_item_id BETWEEN 1000 AND 1099;
DELETE FROM question_items WHERE question_id BETWEEN 100 AND 109;
DELETE FROM questions_i18n WHERE question_id BETWEEN 100 AND 109;
DELETE FROM questions WHERE id BETWEEN 100 AND 109;
DELETE FROM modules_i18n WHERE module_id = 10;
DELETE FROM modules WHERE id = 10;

-- 3. Insert Module 10
INSERT INTO modules (id, code, name, description, order_index, max_score, is_active) 
VALUES (10, 'DRAWING_RECALL', 'Drawing Recall', 'Remember the following drawing that will be displayed for 10 seconds.Draw on the next screen with the help of square and line tab on the tap of the screen.', 10, 5, 1);

-- 4. Insert Module Translations
-- English
INSERT INTO modules_i18n (module_id, language_code, name, description) 
VALUES (10, 'en', 'Drawing Recall', 'Remember the following drawing that will be displayed for 10 seconds.Draw on the next screen with the help of square and line tab on the tap of the screen.');

-- Hindi
INSERT INTO modules_i18n (module_id, language_code, name, description) 
VALUES (10, 'hi', 'चित्र स्मरण', 'निम्नलिखित चित्र को याद रखें जो 10 सेकंड के लिए प्रदर्शित किया जाएगा। अगली स्क्रीन पर वर्ग और रेखा टैब की मदद से चित्र बनाएं।');

-- Spanish
INSERT INTO modules_i18n (module_id, language_code, name, description) 
VALUES (10, 'es', 'Recuperación de Dibujo', 'Recuerde el siguiente dibujo que se mostrará durante 10 segundos. Dibuje en la siguiente pantalla con la ayuda de la pestaña de cuadrado y línea.');

-- Arabic
INSERT INTO modules_i18n (module_id, language_code, name, description) 
VALUES (10, 'ar', 'استرجاع الرسم', 'تذكر الرسم التالي الذي سيتم عرضه لمدة 10 ثوانٍ. ارسم على الشاشة التالية بمساعدة علامة تبويب المربع والخط.');

-- 5. Insert Question for Drawing Task
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) 
VALUES (100, 10, 'DRAW_RECALL_Q1', 'drawing_recall', 1, 'REMEMBER THE DRAWING');

-- Question Translations
INSERT INTO questions_i18n (question_id, language_code, prompt_text) 
VALUES (100, 'en', 'REMEMBER THE DRAWING');

INSERT INTO questions_i18n (question_id, language_code, prompt_text) 
VALUES (100, 'hi', 'चित्र याद रखें');

INSERT INTO questions_i18n (question_id, language_code, prompt_text) 
VALUES (100, 'es', 'RECUERDA EL DIBUJO');

INSERT INTO questions_i18n (question_id, language_code, prompt_text) 
VALUES (100, 'ar', 'تذكر الرسم');

-- 6. Insert Question Item (for reference image)
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) 
VALUES (1000, 100, 1, 'drawing_recall_ref', '');

-- Item Translations
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) 
VALUES (1000, 'en', '', 'Draw the shapes you remember', '');

INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) 
VALUES (1000, 'hi', '', 'जो आकृतियाँ आपको याद हैं उन्हें बनाएं', '');

INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) 
VALUES (1000, 'es', '', 'Dibuja las formas que recuerdes', '');

INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) 
VALUES (1000, 'ar', '', 'ارسم الأشكال التي تتذكرها', '');
