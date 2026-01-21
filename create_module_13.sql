-- Clean up existing data for Module 13
-- 1. Delete responses linked to questions of this module
DELETE FROM responses WHERE question_id BETWEEN 1301 AND 1305;
-- 2. Delete responses linked to sessions of this module (safety net)
DELETE FROM responses WHERE session_id IN (SELECT id FROM sessions WHERE module_id = 13);
-- Clean up existing data for Module 15 (Group Matching)
-- To prevent foreign key errors, delete dependent sessions and responses first
DELETE FROM responses WHERE session_id IN (SELECT id FROM sessions WHERE module_id = 15);
DELETE FROM sessions WHERE module_id = 15;

-- Now delete dependent child records for the module
DELETE FROM question_item_i18n WHERE question_item_id IN (SELECT id FROM question_items WHERE question_id IN (SELECT id FROM questions WHERE module_id = 15));
DELETE FROM question_items WHERE question_id IN (SELECT id FROM questions WHERE module_id = 15);
DELETE FROM questions_i18n WHERE question_id IN (SELECT id FROM questions WHERE module_id = 15);
DELETE FROM questions WHERE module_id = 15;
DELETE FROM modules_i18n WHERE module_id = 15;
DELETE FROM modules WHERE id = 15;

-- Alter ENUM to allow 'group_matching'
ALTER TABLE questions MODIFY COLUMN question_type ENUM('flash_recall','visual_spatial','audio_story','connect_dots','audio_words','executive','semantic','number_recall','drawing_recall','color_recall','group_matching') NOT NULL;

-- Insert-- Module 13/15 Definition: Group Matching
-- ID 15 to avoid conflict with Color Recall (13)
INSERT INTO modules (id, code, name, description, order_index, max_score, is_active)
VALUES (15, 'GROUP_MATCHING', 'Group Matching', 'Words are displayed in a tab, drag words that belong to similar groups or have an association.', 13, 5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), order_index=VALUES(order_index), is_active=1;

INSERT INTO modules_i18n (module_id, language_code, name, description)
-- Round 4: Meats vs Pets
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (1304, 13, 'GROUP_MATCH_4', 'group_matching', 4, 'Meats vs Pets');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (1304, 'en', 'Group the items into Meats and Pets');

-- Round 5: Writing Tools vs Transportation
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (1305, 13, 'GROUP_MATCH_5', 'group_matching', 5, 'Writing Tools vs Transportation');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (1305, 'en', 'Group the items into Writing Tools and Transportation');

-- Helper procedure to insert items (using temporary logic for simplicity in script)
-- Q1301: Cities (Paris, Rome, New York) vs Meats (Steak, Sausage, Ground Pork)
INSERT INTO question_items (question_id, item_order, image_key, image_url) VALUES (1301, 1, 'Paris', ''), (1301, 2, 'Rome', ''), (1301, 3, 'New York', ''), (1301, 4, 'Steak', ''), (1301, 5, 'Sausage', ''), (1301, 6, 'Ground Pork', '');
-- Q1302: Writing Tools (Pen, Chalk, Ink) vs Pets (Dog, Cat, Hamster)
INSERT INTO question_items (question_id, item_order, image_key, image_url) VALUES (1302, 1, 'Pen', ''), (1302, 2, 'Chalk', ''), (1302, 3, 'Ink', ''), (1302, 4, 'Dog', ''), (1302, 5, 'Cat', ''), (1302, 6, 'Hamster', '');
-- Q1303: Transportation (Car, Train, Plane) vs Cities (Paris, Rome, New York)
INSERT INTO question_items (question_id, item_order, image_key, image_url) VALUES (1303, 1, 'Car', ''), (1303, 2, 'Train', ''), (1303, 3, 'Plane', ''), (1303, 4, 'Paris', ''), (1303, 5, 'Rome', ''), (1303, 6, 'New York', '');
-- Q1304: Meats (Steak, Sausage, Ground Pork) vs Pets (Dog, Cat, Hamster)
INSERT INTO question_items (question_id, item_order, image_key, image_url) VALUES (1304, 1, 'Steak', ''), (1304, 2, 'Sausage', ''), (1304, 3, 'Ground Pork', ''), (1304, 4, 'Dog', ''), (1304, 5, 'Cat', ''), (1304, 6, 'Hamster', '');
-- Q1305: Writing Tools (Pen, Chalk, Ink) vs Transportation (Car, Train, Plane)
INSERT INTO question_items (question_id, item_order, image_key, image_url) VALUES (1305, 1, 'Pen', ''), (1305, 2, 'Chalk', ''), (1305, 3, 'Ink', ''), (1305, 4, 'Car', ''), (1305, 5, 'Train', ''), (1305, 6, 'Plane', '');

-- Insert Question Items I18N
-- We need to link back to the IDs we just inserted. Since this is a script, we insert based on select.

-- Q1301 Items
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Paris', 'Cities', '' FROM question_items WHERE question_id=1301 AND image_key='Paris';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Rome', 'Cities', '' FROM question_items WHERE question_id=1301 AND image_key='Rome';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'New York', 'Cities', '' FROM question_items WHERE question_id=1301 AND image_key='New York';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Steak', 'Meats', '' FROM question_items WHERE question_id=1301 AND image_key='Steak';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Sausage', 'Meats', '' FROM question_items WHERE question_id=1301 AND image_key='Sausage';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Ground Pork', 'Meats', '' FROM question_items WHERE question_id=1301 AND image_key='Ground Pork';

-- Q1302 Items
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Pen', 'Writing Tools', '' FROM question_items WHERE question_id=1302 AND image_key='Pen';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Chalk', 'Writing Tools', '' FROM question_items WHERE question_id=1302 AND image_key='Chalk';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Ink', 'Writing Tools', '' FROM question_items WHERE question_id=1302 AND image_key='Ink';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Dog', 'Pets', '' FROM question_items WHERE question_id=1302 AND image_key='Dog';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Cat', 'Pets', '' FROM question_items WHERE question_id=1302 AND image_key='Cat';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Hamster', 'Pets', '' FROM question_items WHERE question_id=1302 AND image_key='Hamster';

-- Q1303 Items
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Car', 'Transportation', '' FROM question_items WHERE question_id=1303 AND image_key='Car';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Train', 'Transportation', '' FROM question_items WHERE question_id=1303 AND image_key='Train';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Plane', 'Transportation', '' FROM question_items WHERE question_id=1303 AND image_key='Plane';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Paris', 'Cities', '' FROM question_items WHERE question_id=1303 AND image_key='Paris';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Rome', 'Cities', '' FROM question_items WHERE question_id=1303 AND image_key='Rome';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'New York', 'Cities', '' FROM question_items WHERE question_id=1303 AND image_key='New York';

-- Q1304 Items
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Steak', 'Meats', '' FROM question_items WHERE question_id=1304 AND image_key='Steak';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Sausage', 'Meats', '' FROM question_items WHERE question_id=1304 AND image_key='Sausage';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Ground Pork', 'Meats', '' FROM question_items WHERE question_id=1304 AND image_key='Ground Pork';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Dog', 'Pets', '' FROM question_items WHERE question_id=1304 AND image_key='Dog';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Cat', 'Pets', '' FROM question_items WHERE question_id=1304 AND image_key='Cat';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Hamster', 'Pets', '' FROM question_items WHERE question_id=1304 AND image_key='Hamster';

-- Q1305 Items
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Pen', 'Writing Tools', '' FROM question_items WHERE question_id=1305 AND image_key='Pen';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Chalk', 'Writing Tools', '' FROM question_items WHERE question_id=1305 AND image_key='Chalk';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Ink', 'Writing Tools', '' FROM question_items WHERE question_id=1305 AND image_key='Ink';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Car', 'Transportation', '' FROM question_items WHERE question_id=1305 AND image_key='Car';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Train', 'Transportation', '' FROM question_items WHERE question_id=1305 AND image_key='Train';
INSERT INTO question_item_i18n (question_item_id, language_code, display_text, accepted_answers, audio_url) SELECT id, 'en', 'Plane', 'Transportation', '' FROM question_items WHERE question_id=1305 AND image_key='Plane';
