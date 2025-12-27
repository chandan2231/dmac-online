-- Ensure correct encoding for the connection to handle Hindi/Arabic/Spanish characters
SET NAMES 'utf8mb4';

-- 1. Update Schema to support 'connect_dots'
ALTER TABLE questions MODIFY COLUMN question_type ENUM('flash_recall','visual_spatial','audio_story','connect_dots') NOT NULL;

-- 2. Clean up existing data for Module 4 (to ensure idempotency)
DELETE FROM question_item_i18n WHERE question_item_id BETWEEN 20 AND 33;
DELETE FROM question_items WHERE question_id = 9;
DELETE FROM questions_i18n WHERE question_id = 9;
DELETE FROM questions WHERE id = 9;
DELETE FROM modules_i18n WHERE module_id = 4;
DELETE FROM modules WHERE id = 4;

-- 3. Insert Module 4
INSERT INTO modules (id, code, name, description, order_index, max_score, is_active) VALUES (4, 'CONNECT_DOTS', 'Connect the Dots', 'Tap to start from the green M, Tap the letters & numbers in increasing order.', 4, 5, 1);

-- 4. Insert Module Translations
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (4, 'en', 'Connect the Dots', 'Tap to start from the green M, Tap the letters & numbers in increasing order.');
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (4, 'hi', 'बिंदुओं को जोड़ें', 'हरे M से शुरू करने के लिए टैप करें, अक्षरों और संख्याओं को बढ़ते क्रम में टैप करें।');
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (4, 'es', 'Conecta los Puntos', 'Toca para comenzar desde la M verde, Toca las letras y números en orden creciente.');
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (4, 'ar', 'وصّل النقاط', 'اضغط للبدء من الحرف M الأخضر، اضغط على الحروف والأرقام بترتيب تصاعدي.');

-- 5. Insert Question
INSERT INTO questions (id, module_id, code, question_type, order_index, post_game_text, prompt_text) VALUES (9, 4, 'CONNECT_DOTS_Q1', 'connect_dots', 1, 'Well done!', 'DRAW PATTERN');

-- 6. Insert Question Translations
INSERT INTO questions_i18n (question_id, language_code, prompt_text, post_game_text) VALUES (9, 'en', 'DRAW PATTERN', 'Well done!');
INSERT INTO questions_i18n (question_id, language_code, prompt_text, post_game_text) VALUES (9, 'hi', 'पैटर्न बनाएं', 'बहुत बढ़िया!');
INSERT INTO questions_i18n (question_id, language_code, prompt_text, post_game_text) VALUES (9, 'es', 'DIBUJAR PATRÓN', '¡Bien hecho!');
INSERT INTO questions_i18n (question_id, language_code, prompt_text, post_game_text) VALUES (9, 'ar', 'رسم النمط', 'أحسنت!');

-- 7. Insert Items and Translations
-- Item L
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (20, 9, 1, 'L', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (20, 'en', '', 'L', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (20, 'hi', '', 'L', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (20, 'es', '', 'L', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (20, 'ar', '', 'L', '');

-- Item 5
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (21, 9, 2, '5', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (21, 'en', '', '5', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (21, 'hi', '', '5', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (21, 'es', '', '5', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (21, 'ar', '', '5', '');

-- Item M
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (22, 9, 3, 'M', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (22, 'en', '', 'M', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (22, 'hi', '', 'M', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (22, 'es', '', 'M', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (22, 'ar', '', 'M', '');

-- Item 6
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (23, 9, 4, '6', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (23, 'en', '', '6', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (23, 'hi', '', '6', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (23, 'es', '', '6', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (23, 'ar', '', '6', '');

-- Item N
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (24, 9, 5, 'N', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (24, 'en', '', 'N', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (24, 'hi', '', 'N', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (24, 'es', '', 'N', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (24, 'ar', '', 'N', '');

-- Item 7
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (25, 9, 6, '7', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (25, 'en', '', '7', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (25, 'hi', '', '7', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (25, 'es', '', '7', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (25, 'ar', '', '7', '');

-- Item O
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (26, 9, 7, 'O', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (26, 'en', '', 'O', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (26, 'hi', '', 'O', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (26, 'es', '', 'O', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (26, 'ar', '', 'O', '');

-- Item 8
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (27, 9, 8, '8', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (27, 'en', '', '8', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (27, 'hi', '', '8', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (27, 'es', '', '8', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (27, 'ar', '', '8', '');

-- Item P
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (28, 9, 9, 'P', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (28, 'en', '', 'P', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (28, 'hi', '', 'P', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (28, 'es', '', 'P', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (28, 'ar', '', 'P', '');

-- Item 9
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (29, 9, 10, '9', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (29, 'en', '', '9', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (29, 'hi', '', '9', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (29, 'es', '', '9', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (29, 'ar', '', '9', '');

-- Item Q
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (30, 9, 11, 'Q', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (30, 'en', '', 'Q', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (30, 'hi', '', 'Q', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (30, 'es', '', 'Q', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (30, 'ar', '', 'Q', '');

-- Item 10
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (31, 9, 12, '10', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (31, 'en', '', '10', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (31, 'hi', '', '10', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (31, 'es', '', '10', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (31, 'ar', '', '10', '');

-- Item R
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (32, 9, 13, 'R', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (32, 'en', '', 'R', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (32, 'hi', '', 'R', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (32, 'es', '', 'R', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (32, 'ar', '', 'R', '');

-- Item 11
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (33, 9, 14, '11', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (33, 'en', '', '11', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (33, 'hi', '', '11', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (33, 'es', '', '11', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (33, 'ar', '', '11', '');
