-- Insert Module 12 (Audio Reverse Number Recall)
INSERT INTO modules (id, code, name, description, order_index, max_score, is_active)
VALUES (12, 'REVERSE_NUMBER_RECALL', 'Audio Reverse number recall', 'Audio will play a combination of numbers, you have to remember and enter the answer in the text box in reverse order. Ex. 789 your correct answer is 987. Speak or type in text box.', 11, 5, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- Insert Module 12 I18N
INSERT INTO modules_i18n (module_id, language_code, name, description)
VALUES 
(12, 'en', 'Audio Reverse number recall', 'Audio will play a combination of numbers, you have to remember and enter the answer in the text box in reverse order. Ex. 789 your correct answer is 987. Speak or type in text box.')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- Insert I18N for other languages (using English as placeholder/fallback or translating if possible)
-- Hindi
INSERT INTO modules_i18n (module_id, language_code, name, description)
VALUES 
(12, 'hi', 'ऑडियो रिवर्स नंबर रिकॉल', 'ऑडियो संख्याओं का एक संयोजन चलाएगा, आपको याद रखना होगा और टेक्स्ट बॉक्स में उत्तर को उल्टे क्रम में दर्ज करना होगा। उदाहरण 789 आपका सही उत्तर 987 है। टेक्स्ट बॉक्स में बोलें या टाइप करें।')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- Spanish
INSERT INTO modules_i18n (module_id, language_code, name, description)
VALUES 
(12, 'es', 'Retirada de número inverso de audio', 'El audio reproducirá una combinación de números, debe recordar e ingresar la respuesta en el cuadro de texto en orden inverso. Ej. 789 su respuesta correcta es 987. Hable o escriba en el cuadro de texto.')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- Arabic
INSERT INTO modules_i18n (module_id, language_code, name, description)
VALUES 
(12, 'ar', 'استدعاء الرقم العكسي الصوتي', 'سيقوم الصوت بتشغيل مجموعة من الأرقام، وعليك تذكر الإجابة وإدخالها في مربع النص بترتيب عكسي. مثال 789 إجابتك الصحيحة هي 987. تحدث أو اكتب في مربع النص.')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);


-- Create Questions for Module 12
-- We need 10 questions (similar to Module 9) with reverse audio
-- Assuming IDs 1201-1210 for questions

-- Q1 (Reverse First)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text)
VALUES (1201, 12, 'REV_NUM_1', 'number_recall', 1, 'Sequence 1')
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (1201, 1, 'rev_seq_1', 'reverse_first.m4a')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Q2 (Reverse Second)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text)
VALUES (1202, 12, 'REV_NUM_2', 'number_recall', 2, 'Sequence 2')
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (1202, 1, 'rev_seq_2', 'reverse_second.m4a')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Q3 (Reverse Third)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text)
VALUES (1203, 12, 'REV_NUM_3', 'number_recall', 3, 'Sequence 3')
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (1203, 1, 'rev_seq_3', 'reverse_third.m4a')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Q4 (Reverse Fourth)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text)
VALUES (1204, 12, 'REV_NUM_4', 'number_recall', 4, 'Sequence 4')
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (1204, 1, 'rev_seq_4', 'reverse_fourth.m4a')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Q5 (Reverse Fifth)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text)
VALUES (1205, 12, 'REV_NUM_5', 'number_recall', 5, 'Sequence 5')
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (1205, 1, 'rev_seq_5', 'reverse_fifth.m4a')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Q6 (Reverse Sixth)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text)
VALUES (1206, 12, 'REV_NUM_6', 'number_recall', 6, 'Sequence 6')
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (1206, 1, 'rev_seq_6', 'reverse_sixth.m4a')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Q7 (Reverse Seven)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text)
VALUES (1207, 12, 'REV_NUM_7', 'number_recall', 7, 'Sequence 7')
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (1207, 1, 'rev_seq_7', 'reverse_seven.m4a')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Q8 (Reverse Eight)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text)
VALUES (1208, 12, 'REV_NUM_8', 'number_recall', 8, 'Sequence 8')
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (1208, 1, 'rev_seq_8', 'reverse_eight.m4a')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Q9 (Reverse Nine)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text)
VALUES (1209, 12, 'REV_NUM_9', 'number_recall', 9, 'Sequence 9')
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (1209, 1, 'rev_seq_9', 'reverse_nine.m4a')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Q10 (Reverse Ten)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text)
VALUES (1210, 12, 'REV_NUM_10', 'number_recall', 10, 'Sequence 10')
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (1210, 1, 'rev_seq_10', 'reverse_ten.m4a')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Insert Questions I18N (Only English for prompt text for now, others can default or be added)
INSERT INTO questions_i18n (question_id, language_code, prompt_text)
SELECT id, 'en', prompt_text FROM questions WHERE module_id = 12
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO questions_i18n (question_id, language_code, prompt_text)
SELECT id, 'hi', prompt_text FROM questions WHERE module_id = 12
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO questions_i18n (question_id, language_code, prompt_text)
SELECT id, 'es', prompt_text FROM questions WHERE module_id = 12
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

INSERT INTO questions_i18n (question_id, language_code, prompt_text)
SELECT id, 'ar', prompt_text FROM questions WHERE module_id = 12
ON DUPLICATE KEY UPDATE prompt_text=VALUES(prompt_text);

-- Insert Question Item I18N (Required for fetchItems inner join)
-- This ensures items are returned by the API.
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers)
SELECT qi.id, l.code, '', '', '321'
FROM question_items qi
CROSS JOIN (
    SELECT 'en' as code UNION ALL SELECT 'hi' UNION ALL SELECT 'es' UNION ALL SELECT 'ar'
) l
WHERE qi.question_id BETWEEN 1201 AND 1210
AND NOT EXISTS (
    SELECT 1 FROM question_item_i18n t 
    WHERE t.question_item_id = qi.id AND t.language_code = l.code
);
