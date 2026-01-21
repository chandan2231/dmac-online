INSERT INTO modules (id, code, name, description, order_index, max_score, is_active) 
VALUES (14, 'VISUAL_PICTURE_RECALL', 'Visual Picture Recall', 'Please recall 5 visual pictures  you have seen in the beginning of the test, speak or type in the text box.', 13, 5, 1)
ON DUPLICATE KEY UPDATE code=code;

-- Translations
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES 
(14, 'en', 'Visual Picture Recall', 'Please recall 5 visual pictures  you have seen in the beginning of the test, speak or type in the text box.'),
(14, 'ar', 'استرجاع الصور المرئية', 'Please recall 5 visual pictures  you have seen in the beginning of the test, speak or type in the text box.'),
(14, 'es', 'Recuerdo de Imagen Visual', 'Please recall 5 visual pictures  you have seen in the beginning of the test, speak or type in the text box.'),
(14, 'hi', 'दृश्य चित्र स्मरण', 'Please recall 5 visual pictures  you have seen in the beginning of the test, speak or type in the text box.')
ON DUPLICATE KEY UPDATE description=description;

-- Question
INSERT INTO questions (module_id, code, question_type, order_index, prompt_text) 
VALUES (14, 'VISUAL_PICTURE_RECALL_Q1', 'flash_recall', 1, 'Please recall 5 visual pictures  you have seen in the beginning of the test, speak or type in the text box.');

-- Get new question ID and insert items
SET @new_qid = (SELECT id FROM questions WHERE module_id = 14 LIMIT 1);

INSERT INTO question_items (question_id, item_order, image_key, image_url)
SELECT @new_qid, item_order, image_key, image_url 
FROM question_items 
WHERE question_id = 1;
