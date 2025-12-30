-- Module 9: Number Recall (Audio)
-- FINAL CLEAN INSTALL SCRIPT

-- 1. Updates Schema to support 'number_recall' if not exists
-- Using safe alter if possible, or just running it.
ALTER TABLE questions MODIFY COLUMN question_type ENUM('flash_recall','visual_spatial','audio_story','connect_dots', 'audio_words', 'executive', 'semantic', 'number_recall') NOT NULL;

-- 2. Cleanup (Delete existing data for Module 9 to avoid conflicts/duplicates)
-- Also clear sessions/responses to ensure fresh start
DELETE FROM responses WHERE session_id IN (SELECT id FROM sessions WHERE module_id = 9);
-- If there is a session_questions table (common in this app usually), delete from it too.
-- Checking schema via assumption from other modules is risky, but safe to try DELETE FROM session_questions... if it exists.
-- But standard `responses` and `sessions` cleanup is usually enough to invalidate cache.
-- Actually, let's just delete from sessions. `ON DELETE CASCADE` often handles the rest if properly set up, but let's be explicit if possible.
-- Given I don't see session_questions in the file list but I suspect it, I'll stick to what I know: responses and sessions.

DELETE FROM responses WHERE session_id IN (SELECT id FROM sessions WHERE module_id = 9);
DELETE FROM sessions WHERE module_id = 9;

DELETE FROM question_item_i18n WHERE question_item_id BETWEEN 9000 AND 9099;
DELETE FROM question_items WHERE question_id BETWEEN 900 AND 999;
DELETE FROM questions WHERE module_id = 9;
DELETE FROM modules_i18n WHERE module_id = 9;
DELETE FROM modules WHERE id = 9;

-- 3. Insert Module
INSERT INTO modules (id, code, name, description, max_score, order_index, is_active)
VALUES (9, 'NUMBER_RECALL', 'Number Recall (Audio)', 'Audio will play combination of the numbers, Please type or speak the numbers to enter.', 5.0, 9, 1);

-- 4. Translations for Module
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES
(9, 'es', 'Recuerdo de Números (Audio)', 'El audio reproducirá una combinación de números. Por favor, escriba o diga los números para entrar.'),
(9, 'hi', 'संख्या याद (ऑडियो)', 'ऑडियो संख्याओं का संयोजन चलाएगा, कृपया प्रवेश करने के लिए संख्याएँ टाइप करें या बोलें।'),
(9, 'ar', 'تذكر الأرقام (صوتي)', 'سيقوم الصوت بتشغيل مجموعة من الأرقام، يرجى كتابة أو نطق الأرقام للدخول.');

-- 5. Questions (Sequences)
-- IDs 901-910
-- We use 'number_recall' type

INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES
(901, 9, 'NUM_SEQ_1', 'number_recall', 1, 'Sequence 1'),
(902, 9, 'NUM_SEQ_2', 'number_recall', 2, 'Sequence 2'),
(903, 9, 'NUM_SEQ_3', 'number_recall', 3, 'Sequence 3'),
(904, 9, 'NUM_SEQ_4', 'number_recall', 4, 'Sequence 4'),
(905, 9, 'NUM_SEQ_5', 'number_recall', 5, 'Sequence 5'),
(906, 9, 'NUM_SEQ_6', 'number_recall', 6, 'Sequence 6'),
(907, 9, 'NUM_SEQ_7', 'number_recall', 7, 'Sequence 7'),
(908, 9, 'NUM_SEQ_8', 'number_recall', 8, 'Sequence 8'),
(909, 9, 'NUM_SEQ_9', 'number_recall', 9, 'Sequence 9'),
(910, 9, 'NUM_SEQ_10', 'number_recall', 10, 'Sequence 10');

-- 6. Question Items and Audio/Answer
-- Item IDs 9001-9010 (Keeping consistent with our unique numbering)

-- Item 1: 5628 (first.mp3)
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (9001, 901, 1, 'num_seq_1', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES 
(9001, 'en', 'assets/NumberRecall/first.mp3', 'Answer', '5628'),
(9001, 'es', 'assets/NumberRecall/first.mp3', 'Respuesta', '5628'),
(9001, 'hi', 'assets/NumberRecall/first.mp3', 'उत्तर', '5628'),
(9001, 'ar', 'assets/NumberRecall/first.mp3', 'إجابة', '5628');

-- Item 2: 9685 (second.mp3)
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (9002, 902, 1, 'num_seq_2', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES 
(9002, 'en', 'assets/NumberRecall/second.mp3', 'Answer', '9685'),
(9002, 'es', 'assets/NumberRecall/second.mp3', 'Respuesta', '9685'),
(9002, 'hi', 'assets/NumberRecall/second.mp3', 'उत्तर', '9685'),
(9002, 'ar', 'assets/NumberRecall/second.mp3', 'إجابة', '9685');

-- Item 3: 24367 (third.mp3)
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (9003, 903, 1, 'num_seq_3', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES 
(9003, 'en', 'assets/NumberRecall/third.mp3', 'Answer', '24367'),
(9003, 'es', 'assets/NumberRecall/third.mp3', 'Respuesta', '24367'),
(9003, 'hi', 'assets/NumberRecall/third.mp3', 'उत्तर', '24367'),
(9003, 'ar', 'assets/NumberRecall/third.mp3', 'إجابة', '24367');

-- Item 4: 97451 (fourth.mp3)
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (9004, 904, 1, 'num_seq_4', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES 
(9004, 'en', 'assets/NumberRecall/fourth.mp3', 'Answer', '97451'),
(9004, 'es', 'assets/NumberRecall/fourth.mp3', 'Respuesta', '97451'),
(9004, 'hi', 'assets/NumberRecall/fourth.mp3', 'उत्तर', '97451'),
(9004, 'ar', 'assets/NumberRecall/fourth.mp3', 'إجابة', '97451');

-- Item 5: 835926 (fifth.mp3)
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (9005, 905, 1, 'num_seq_5', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES 
(9005, 'en', 'assets/NumberRecall/fifth.mp3', 'Answer', '835926'),
(9005, 'es', 'assets/NumberRecall/fifth.mp3', 'Respuesta', '835926'),
(9005, 'hi', 'assets/NumberRecall/fifth.mp3', 'उत्तर', '835926'),
(9005, 'ar', 'assets/NumberRecall/fifth.mp3', 'إجابة', '835926');

-- Item 6: 980156 (six.mp3)
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (9006, 906, 1, 'num_seq_6', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES 
(9006, 'en', 'assets/NumberRecall/six.mp3', 'Answer', '980156'),
(9006, 'es', 'assets/NumberRecall/six.mp3', 'Respuesta', '980156'),
(9006, 'hi', 'assets/NumberRecall/six.mp3', 'उत्तर', '980156'),
(9006, 'ar', 'assets/NumberRecall/six.mp3', 'إجابة', '980156');

-- Item 7: 4518792 (seven.mp3)
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (9007, 907, 1, 'num_seq_7', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES 
(9007, 'en', 'assets/NumberRecall/seven.mp3', 'Answer', '4518792'),
(9007, 'es', 'assets/NumberRecall/seven.mp3', 'Respuesta', '4518792'),
(9007, 'hi', 'assets/NumberRecall/seven.mp3', 'उत्तर', '4518792'),
(9007, 'ar', 'assets/NumberRecall/seven.mp3', 'إجابة', '4518792');

-- Item 8: 7894534 (eight.mp3)
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (9008, 908, 1, 'num_seq_8', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES 
(9008, 'en', 'assets/NumberRecall/eight.mp3', 'Answer', '7894534'),
(9008, 'es', 'assets/NumberRecall/eight.mp3', 'Respuesta', '7894534'),
(9008, 'hi', 'assets/NumberRecall/eight.mp3', 'उत्तर', '7894534'),
(9008, 'ar', 'assets/NumberRecall/eight.mp3', 'إجابة', '7894534');

-- Item 9: 56387321 (nine.mp3)
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (9009, 909, 1, 'num_seq_9', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES 
(9009, 'en', 'assets/NumberRecall/nine.mp3', 'Answer', '56387321'),
(9009, 'es', 'assets/NumberRecall/nine.mp3', 'Respuesta', '56387321'),
(9009, 'hi', 'assets/NumberRecall/nine.mp3', 'उत्तर', '56387321'),
(9009, 'ar', 'assets/NumberRecall/nine.mp3', 'إجابة', '56387321');

-- Item 10: 60423687 (ten.mp3)
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (9010, 910, 1, 'num_seq_10', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES 
(9010, 'en', 'assets/NumberRecall/ten.mp3', 'Answer', '60423687'),
(9010, 'es', 'assets/NumberRecall/ten.mp3', 'Respuesta', '60423687'),
(9010, 'hi', 'assets/NumberRecall/ten.mp3', 'उत्तर', '60423687'),
(9010, 'ar', 'assets/NumberRecall/ten.mp3', 'إجابة', '60423687');
