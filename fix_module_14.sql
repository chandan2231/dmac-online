-- Fix Module 14: Visual Picture Recall
-- It was missing the questions entry, causing the frontend to freeze.

-- 1. Ensure Module 14 exists (already checked, but safe to ignore duplicate)
INSERT INTO modules (id, code, name, description, order_index, max_score, is_active) 
VALUES (14, 'VISUAL_PICTURE_RECALL', 'Visual Picture Recall', 'Please recall 5 visual pictures  you have seen in the beginning of the test, speak or type in the text box.', 14, 5, 1)
ON DUPLICATE KEY UPDATE order_index=14;

-- 2. Insert Question if not exists
-- Clean slate: Delete dependent child records first to avoid foreign key errors
DELETE FROM question_items WHERE question_id IN (SELECT id FROM questions WHERE module_id = 14);
DELETE FROM questions_i18n WHERE question_id IN (SELECT id FROM questions WHERE module_id = 14);
DELETE FROM questions WHERE module_id = 14; 

INSERT INTO questions (module_id, code, question_type, order_index, prompt_text) 
VALUES (14, 'VISUAL_PICTURE_RECALL_Q1', 'flash_recall', 1, 'Please recall 5 visual pictures  you have seen in the beginning of the test, speak or type in the text box.');

-- 3. Populate Question Items from the original Image Flash module (Module 6 usually)
-- Find the source question ID from IMAGE_FLASH module
SET @source_qid = (
    SELECT q.id 
    FROM questions q 
    JOIN modules m ON q.module_id = m.id 
    WHERE m.code = 'IMAGE_FLASH' 
    LIMIT 1
);

-- Get the newly inserted target question ID
SET @target_qid = (SELECT id FROM questions WHERE module_id = 14 LIMIT 1);

-- Insert items
DELETE FROM question_items WHERE question_id = @target_qid;
INSERT INTO question_items (question_id, item_order, image_key, image_url)
SELECT @target_qid, item_order, image_key, image_url 
FROM question_items 
WHERE question_id = @source_qid;

-- 4. Insert translations for the question
DELETE FROM questions_i18n WHERE question_id = @target_qid;
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES 
(@target_qid, 'en', 'Please recall 5 visual pictures you have seen in the beginning of the test, speak or type in the text box.'),
(@target_qid, 'ar', 'يرجى تذكر 5 صور مرئية رأيتها في بداية الاختبار، تحدث أو اكتب في مربع النص.'),
(@target_qid, 'es', 'Por favor, recuerde 5 imágenes visuales que haya visto al principio de la prueba, hable o escriba en el cuadro de texto.'),
(@target_qid, 'hi', 'कृपया परीक्षण की शुरुआत में देखे गए 5 दृश्य चित्रों को याद करें, बोलें या टेक्स्ट बॉक्स में टाइप करें।');
