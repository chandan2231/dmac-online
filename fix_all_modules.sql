-- Consolidated Fix Script for Modules 13, 14, 15
-- Goal Order: 
-- 1. COLOR_RECALL (ID 13, Order 12)
-- 2. VISUAL_PICTURE_RECALL (ID 14, Order 13)
-- 3. GROUP_MATCHING (ID 15, Order 14)

-- =========================================================
-- 1. FIX MODULE ORDER AND DEFINITIONS
-- =========================================================

-- Ensure Color Recall is 12
UPDATE modules SET order_index = 12 WHERE id = 13;

-- Ensure Visual Picture Recall is 13
INSERT INTO modules (id, code, name, description, order_index, max_score, is_active) 
VALUES (14, 'VISUAL_PICTURE_RECALL', 'Visual Picture Recall', 'Please recall 5 visual pictures you have seen in the beginning of the test, speak or type in the text box.', 13, 5, 1)
ON DUPLICATE KEY UPDATE order_index=13, is_active=1;

-- Ensure Group Matching is 14 (ID 15)
-- Note: User previously had ID 13 conflict, we moved it to 15.
INSERT INTO modules (id, code, name, description, order_index, max_score, is_active)
VALUES (15, 'GROUP_MATCHING', 'Group Matching', 'Words are displayed in a tab, drag words that belong to similar groups or have an association.', 14, 5, 1)
ON DUPLICATE KEY UPDATE order_index=14, is_active=1;

-- =========================================================
-- 2. FIX VISUAL PICTURE RECALL QUESTIONS (ID 14)
-- =========================================================
-- Clean existing questions for ID 14 to avoid duplicates/stale data
DELETE FROM responses WHERE question_id IN (SELECT id FROM questions WHERE module_id = 14); -- Fix FK
DELETE FROM question_items WHERE question_id IN (SELECT id FROM questions WHERE module_id = 14);
DELETE FROM questions_i18n WHERE question_id IN (SELECT id FROM questions WHERE module_id = 14);
DELETE FROM questions WHERE module_id = 14;

-- Insert Question (ID 1400 range roughly, usually auto-increment but we let DB handle it or force if critical)
INSERT INTO questions (module_id, code, question_type, order_index, prompt_text) 
VALUES (14, 'VISUAL_PICTURE_RECALL_Q1', 'flash_recall', 1, 'Please recall 5 visual pictures you have seen in the beginning of the test, speak or type in the text box.');

-- Get the ID of the question we just inserted
SET @vpr_qid = (SELECT id FROM questions WHERE module_id = 14 LIMIT 1);

-- Insert Translations
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES 
(@vpr_qid, 'en', 'Please recall 5 visual pictures you have seen in the beginning of the test, speak or type in the text box.'),
(@vpr_qid, 'ar', 'يرجى تذكر 5 صور مرئية رأيتها في بداية الاختبار، تحدث أو اكتب في مربع النص.'),
(@vpr_qid, 'es', 'Por favor, recuerde 5 imágenes visuales que haya visto al principio de la prueba, hable o escriba en el cuadro de texto.'),
(@vpr_qid, 'hi', 'कृपया परीक्षण की शुरुआत में देखे गए 5 दृश्य चित्रों को याद करें, बोलें या टेक्स्ट बॉक्स में टाइप करें।');

-- Populate Items (copy from Image Flash module = 1 if available, otherwise dummy items)
-- Find Image Flash Question ID
SET @img_flash_qid = (
    SELECT q.id FROM questions q JOIN modules m ON q.module_id = m.id WHERE m.code = 'IMAGE_FLASH' LIMIT 1
);

-- Insert items
INSERT INTO question_items (question_id, item_order, image_key, image_url)
SELECT @vpr_qid, item_order, image_key, image_url 
FROM question_items 
WHERE question_id = @img_flash_qid;


-- =========================================================
-- 3. FIX GROUP MATCHING QUESTIONS (ID 15)
-- =========================================================
-- Clean existing questions for ID 15
DELETE FROM responses WHERE question_id IN (SELECT id FROM questions WHERE module_id = 15); -- Fix FK
DELETE FROM question_item_i18n WHERE question_item_id IN (SELECT id FROM question_items WHERE question_id IN (SELECT id FROM questions WHERE module_id = 15));
DELETE FROM question_items WHERE question_id IN (SELECT id FROM questions WHERE module_id = 15);
DELETE FROM questions_i18n WHERE question_id IN (SELECT id FROM questions WHERE module_id = 15);
DELETE FROM questions WHERE module_id = 15;

-- Insert Questions for Group Matching (5 Rounds)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES 
(1501, 15, 'GROUP_MATCH_1', 'group_matching', 1, 'Group the related items'),
(1502, 15, 'GROUP_MATCH_2', 'group_matching', 2, 'Group the related items'),
(1503, 15, 'GROUP_MATCH_3', 'group_matching', 3, 'Group the related items'),
(1504, 15, 'GROUP_MATCH_4', 'group_matching', 4, 'Group the related items'),
(1505, 15, 'GROUP_MATCH_5', 'group_matching', 5, 'Group the related items');

INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES
(1501, 'en', 'Group the related items'),
(1502, 'en', 'Group the related items'),
(1503, 'en', 'Group the related items'),
(1504, 'en', 'Group the related items'),
(1505, 'en', 'Group the related items');

-- Items ---------------------------
-- Round 1: Cities vs Meats
-- Group 1: Paris, Rome, New York
-- Group 2: Steak, Sausage, Ground Pork
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES
(15001, 1501, 1, 'Paris', ''), (15002, 1501, 2, 'Rome', ''), (15003, 1501, 3, 'New York', ''),
(15004, 1501, 4, 'Steak', ''), (15005, 1501, 5, 'Sausage', ''), (15006, 1501, 6, 'Ground Pork', '');

INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) VALUES
(15001, 'en', 'Paris', 'Cities', ''), (15002, 'en', 'Rome', 'Cities', ''), (15003, 'en', 'New York', 'Cities', ''),
(15004, 'en', 'Steak', 'Meats', ''), (15005, 'en', 'Sausage', 'Meats', ''), (15006, 'en', 'Ground Pork', 'Meats', '');

-- Round 2: Writing Tools vs Pets
-- Group 1: Pen, Chalk, Ink
-- Group 2: Dog, Cat, Hamster
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES
(15011, 1502, 1, 'Pen', ''), (15012, 1502, 2, 'Chalk', ''), (15013, 1502, 3, 'Ink', ''),
(15014, 1502, 4, 'Dog', ''), (15015, 1502, 5, 'Cat', ''), (15016, 1502, 6, 'Hamster', '');

INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) VALUES
(15011, 'en', 'Pen', 'Writing Tools', ''), (15012, 'en', 'Chalk', 'Writing Tools', ''), (15013, 'en', 'Ink', 'Writing Tools', ''),
(15014, 'en', 'Dog', 'Pets', ''), (15015, 'en', 'Cat', 'Pets', ''), (15016, 'en', 'Hamster', 'Pets', '');

-- Round 3: Transportation vs Cities
-- Group 1: Car, Train, Plane
-- Group 2: Paris, Rome, New York
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES
(15021, 1503, 1, 'Car', ''), (15022, 1503, 2, 'Train', ''), (15023, 1503, 3, 'Plane', ''),
(15024, 1503, 4, 'Paris', ''), (15025, 1503, 5, 'Rome', ''), (15026, 1503, 6, 'New York', '');

INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) VALUES
(15021, 'en', 'Car', 'Transportation', ''), (15022, 'en', 'Train', 'Transportation', ''), (15023, 'en', 'Plane', 'Transportation', ''),
(15024, 'en', 'Paris', 'Cities', ''), (15025, 'en', 'Rome', 'Cities', ''), (15026, 'en', 'New York', 'Cities', '');

-- Round 4: Meats vs Pets
-- Group 1: Steak, Sausage, Ground Pork
-- Group 2: Dog, Cat, Hamster
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES
(15031, 1504, 1, 'Steak', ''), (15032, 1504, 2, 'Sausage', ''), (15033, 1504, 3, 'Ground Pork', ''),
(15034, 1504, 4, 'Dog', ''), (15035, 1504, 5, 'Cat', ''), (15036, 1504, 6, 'Hamster', '');

INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) VALUES
(15031, 'en', 'Steak', 'Meats', ''), (15032, 'en', 'Sausage', 'Meats', ''), (15033, 'en', 'Ground Pork', 'Meats', ''),
(15034, 'en', 'Dog', 'Pets', ''), (15035, 'en', 'Cat', 'Pets', ''), (15036, 'en', 'Hamster', 'Pets', '');

-- Round 5: Writing Tools vs Transportation
-- Group 1: Pen, Chalk, Ink
-- Group 2: Car, Train, Plane
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES
(15041, 1505, 1, 'Pen', ''), (15042, 1505, 2, 'Chalk', ''), (15043, 1505, 3, 'Ink', ''),
(15044, 1505, 4, 'Car', ''), (15045, 1505, 5, 'Train', ''), (15046, 1505, 6, 'Plane', '');

INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) VALUES
(15041, 'en', 'Pen', 'Writing Tools', ''), (15042, 'en', 'Chalk', 'Writing Tools', ''), (15043, 'en', 'Ink', 'Writing Tools', ''),
(15044, 'en', 'Car', 'Transportation', ''), (15045, 'en', 'Train', 'Transportation', ''), (15046, 'en', 'Plane', 'Transportation', '');
