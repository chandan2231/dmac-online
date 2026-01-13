-- 1. Update Base Module (English)
UPDATE modules 
SET name = 'Auditory Word' 
WHERE id = 5;

-- 2. Update Base Questions (English)
UPDATE questions 
SET 
    prompt_text = 'You will listen to 5 words on Audio, Remember the words, You will be asked to recall immediately and later in the test as Audio word recall.',
    post_game_text = 'Please recall the words you have just heard on audio. You may be able to speak or type the answers in the text box.'
WHERE module_id = 5;

-- 3. Update Module Translations (modules_i18n)
-- Spanish
INSERT INTO modules_i18n (module_id, language_code, name, description) 
VALUES (5, 'es', 'Palabra Auditiva', NULL)
ON DUPLICATE KEY UPDATE name = 'Palabra Auditiva';

-- Arabic
INSERT INTO modules_i18n (module_id, language_code, name, description) 
VALUES (5, 'ar', 'الكلمة السمعية', NULL)
ON DUPLICATE KEY UPDATE name = 'الكلمة السمعية';

-- Hindi
INSERT INTO modules_i18n (module_id, language_code, name, description) 
VALUES (5, 'hi', 'श्रवण शब्द', NULL)
ON DUPLICATE KEY UPDATE name = 'श्रवण शब्द';

-- 4. Update Question Translations (questions_i18n)
-- Note: 'questions' table update above affects all questions for module_id=5.
-- We need to find the specific question_ids to update translations.
-- A safe way is to update WHERE question_id IN (SELECT id FROM questions WHERE module_id = 5)

-- Spanish
UPDATE questions_i18n qi
JOIN questions q ON q.id = qi.question_id
SET 
    qi.prompt_text = 'Escucharás 5 palabras en audio, recuerda las palabras, se te pedirá que las recuerdes inmediatamente y más tarde en la prueba como recuperación de palabras de audio.',
    qi.post_game_text = 'Por favor, recuerda las palabras que acabas de escuchar en el audio. Puedes hablar o escribir las respuestas en el cuadro de texto.'
WHERE q.module_id = 5 AND qi.language_code = 'es';

-- If rows don't exist, we should ideally insert them. But strictly updating existing ones is safer if we assume they exist.
-- If they assume they might NOT exist, we'd need a more complex query or stored procedure, or just rely on backend fallback if acceptable.
-- For now, let's assume if it's a supported language, the rows were created by initial seed.

-- Arabic
UPDATE questions_i18n qi
JOIN questions q ON q.id = qi.question_id
SET 
    qi.prompt_text = 'ستستمع إلى 5 كلمات صوتية، تذكر الكلمات، سيطلب منك استرجاعها فورًا وفي وقت لاحق من الاختبار كاسترجاع للكلمات الصوتية.',
    qi.post_game_text = 'يرجى تذكر الكلمات التي سمعتها للتو في الصوت. يمكنك التحدث أو كتابة الإجابات في مربع النص.'
WHERE q.module_id = 5 AND qi.language_code = 'ar';

-- Hindi
UPDATE questions_i18n qi
JOIN questions q ON q.id = qi.question_id
SET 
    qi.prompt_text = 'आप ऑडियो पर 5 शब्द सुनेंगे, शब्दों को याद रखें, आपसे परीक्षण में तुरंत और बाद में ऑडियो शब्द पुनर्प्राप्ति के रूप में याद करने के लिए कहा जाएगा।',
    qi.post_game_text = 'कृपया उन शब्दों को याद करें जो आपने अभी ऑडियो पर सुने हैं। आप टेक्स्ट बॉक्स में उत्तर बोल या लिख सकते हैं।'
WHERE q.module_id = 5 AND qi.language_code = 'hi';
