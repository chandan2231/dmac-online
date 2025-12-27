-- Ensure correct encoding
SET NAMES 'utf8mb4';

-- 1. Update Schema to support 'audio_words'
ALTER TABLE questions MODIFY COLUMN question_type ENUM('flash_recall','visual_spatial','audio_story','connect_dots', 'audio_words') NOT NULL;

-- 2. Clean up existing data for Module 5 (idempotency)
DELETE FROM question_item_i18n WHERE question_item_id BETWEEN 40 AND 50; -- Arbitrary range for safety, adjust based on IDs used below
DELETE FROM question_items WHERE question_id = 10;
DELETE FROM questions_i18n WHERE question_id = 10;
DELETE FROM questions WHERE id = 10;
DELETE FROM modules_i18n WHERE module_id = 5;
DELETE FROM modules WHERE id = 5;

-- 3. Insert Module 5
INSERT INTO modules (id, code, name, description, order_index, max_score, is_active) 
VALUES (5, 'AUDIO_WORDS', 'Audio Words Recall', 'Listen to the words and recall them.', 5, 5, 1);

-- 4. Insert Module Translations
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (5, 'en', 'Audio Words Recall', 'Listen to the words and recall them.');
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (5, 'hi', 'ऑडियो शब्द याद करें', 'शब्दों को सुनें और उन्हें याद करें।');
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (5, 'es', 'Recuerdo de Palabras de Audio', 'Escucha las palabras y recuérdalas.');
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (5, 'ar', 'استدعاء الكلمات الصوتية', 'استمع إلى الكلمات وتذكرها.');

-- 5. Insert Question
-- Note: prompt_text is "Pre instruction", post_game_text is used for "Post instruction" in this context?
-- User request: 
-- Pre: "Please listen to and remember the following spoken words..."
-- Post: "Please recall the words you have just heard..."
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text, post_game_text) 
VALUES (10, 5, 'AUDIO_WORDS_Q1', 'audio_words', 1, 
'Please listen to and remember the following spoken words. You will be asked to recall them immediate after and later', 
'Please recall the words you have just heard on audio. Examiner, please take the tablet to enter the words');

-- 6. Insert Question Translations
INSERT INTO questions_i18n (question_id, language_code, prompt_text, post_game_text) 
VALUES (10, 'en', 
'Please listen to and remember the following spoken words. You will be asked to recall them immediate after and later', 
'Please recall the words you have just heard on audio. Examiner, please take the tablet to enter the words');

INSERT INTO questions_i18n (question_id, language_code, prompt_text, post_game_text) 
VALUES (10, 'hi', 
'कृपया निम्नलिखित बोले गए शब्दों को सुनें और याद रखें। आपसे उन्हें तुरंत बाद और बाद में याद करने के लिए कहा जाएगा', 
'कृपया उन शब्दों को याद करें जो आपने अभी ऑडियो पर सुने हैं। परीक्षक, कृपया शब्दों को दर्ज करने के लिए टैबलेट लें');

INSERT INTO questions_i18n (question_id, language_code, prompt_text, post_game_text) 
VALUES (10, 'es', 
'Por favor, escuche y recuerde las siguientes palabras habladas. Se le pedirá que las recuerde inmediatamente después y más tarde', 
'Por favor, recuerde las palabras que acaba de escuchar en el audio. Examinador, por favor tome la tableta para ingresar las palabras');

INSERT INTO questions_i18n (question_id, language_code, prompt_text, post_game_text) 
VALUES (10, 'ar', 
'يرجى الاستماع وتذكر الكلمات المنطوقة التالية. سيُطلب منك تذكرها فورًا وفي وقت لاحق', 
'يرجى تذكر الكلمات التي سمعتها للتو في الصوت. أيها الممتحن، يرجى أخذ الجهاز لادخال الكلمات');


-- 7. Insert Item with Accepted Answers (All 10 words)
-- We use one item to hold all valid words for scoring purposes.
-- Words: spoon, purple, laptop, rope, jasmine, banana, clock, nose, tiger, picture
INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (40, 10, 1, 'audio_words_list', 'audio_words_version_1.mp3');

INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) 
VALUES (40, 'en', '', 'Word List', 'spoon,purple,laptop,rope,jasmine,banana,clock,nose,tiger,picture');

INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) 
VALUES (40, 'hi', '', 'Word List', 'चम्मच,बैंगनी,लैपटॉप,रस्सी,चमेली,केला,घड़ी,नाक,बाघ,चित्र,spoon,purple,laptop,rope,jasmine,banana,clock,nose,tiger,picture');

INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) 
VALUES (40, 'es', '', 'Word List', 'cuchara,púrpura,morado,portátil,computadora,cuerda,jazmín,plátano,banana,reloj,nariz,tigre,imagen,foto,cuadro,spoon,purple,laptop,rope,jasmine,banana,clock,nose,tiger,picture');

INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) 
VALUES (40, 'ar', '', 'Word List', 'ملعقة,بنفسجي,لابتوب,حاسوب,حبل,ياسمين,موز,ساعة,أنف,نمر,صورة,spoon,purple,laptop,rope,jasmine,banana,clock,nose,tiger,picture');
