-- Ensure correct encoding
SET NAMES 'utf8mb4';

-- 1. Update Schema to support 'semantic'
-- Actually we can reuse 'executive' or add 'semantic'. Let's add 'semantic' for clarity.
ALTER TABLE questions MODIFY COLUMN question_type ENUM('flash_recall','visual_spatial','audio_story','connect_dots', 'audio_words', 'executive', 'semantic') NOT NULL;

-- 2. Clean up existing data for Module 8
DELETE FROM responses WHERE session_id IN (SELECT id FROM sessions WHERE module_id = 8);
DELETE FROM sessions WHERE module_id = 8;
DELETE FROM question_item_i18n WHERE question_item_id BETWEEN 800 AND 899; 
DELETE FROM question_items WHERE question_id BETWEEN 80 AND 89;
DELETE FROM questions_i18n WHERE question_id BETWEEN 80 AND 89;
DELETE FROM questions WHERE id BETWEEN 80 AND 89;
DELETE FROM modules_i18n WHERE module_id = 8;
DELETE FROM modules WHERE id = 8;

-- 3. Insert Module 8
INSERT INTO modules (id, code, name, description, order_index, max_score, is_active) 
VALUES (8, 'SEMANTIC', 'Semantic Questions', 'You will be asked few questions. Please answer them in 60 seconds.', 8, 5, 1);

-- 4. Insert Module Translations
INSERT INTO modules_i18n (module_id, language_code, name, description) 
VALUES (8, 'en', 'Semantic Questions', 'You will be asked few questions. Please answer them in 60 seconds.');

INSERT INTO modules_i18n (module_id, language_code, name, description) 
VALUES (8, 'hi', 'शब्दिक प्रश्न', 'आपसे कुछ प्रश्न पूछे जाएंगे। कृपया 60 सेकंड में उनका उत्तर दें।');

INSERT INTO modules_i18n (module_id, language_code, name, description) 
VALUES (8, 'es', 'Preguntas Semánticas', 'Se le harán algunas preguntas. Por favor responda en 60 segundos.');

INSERT INTO modules_i18n (module_id, language_code, name, description) 
VALUES (8, 'ar', 'الأسئلة الدلالية', 'سيتم طرح بضعة أسئلة عليك. يرجى الإجابة عليها في غضون 60 ثانية.');

-- 5. Insert Questions (80-84)

-- Question 11: Holiday Knowledge (Thursday)
-- ID 80
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (80, 8, 'SEM_Q1', 'semantic', 1, 'On what day of the week does the United States celebrate Thanksgiving Day?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (80, 'en', 'On what day of the week does the United States celebrate Thanksgiving Day?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (80, 'hi', 'संयुक्त राज्य अमेरिका में थैंक्सगिविंग डे सप्ताह के किस दिन मनाया जाता है?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (80, 'es', '¿En qué día de la semana celebra Estados Unidos el Día de Acción de Gracias?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (80, 'ar', 'في أي يوم من أيام الأسبوع تحتفل الولايات المتحدة بعيد الشكر؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (800, 80, 1, 'sem_q1', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (800, 'en', '', 'Answer', 'thursday');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (800, 'hi', '', 'उत्तर', 'thursday,गुरुवार,बृहस्पतिवार');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (800, 'es', '', 'Respuesta', 'thursday,jueves');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (800, 'ar', '', 'إجابة', 'thursday,الخميس,يوم الخميس');


-- Question 12: Personal Temporal Memory (Last Year NYE - Dynamic)
-- ID 81
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (81, 8, 'SEM_Q2', 'semantic', 2, 'What was the last year you observed New Year\'s Eve?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (81, 'en', 'What was the last year you observed New Year\'s Eve?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (81, 'hi', 'पिछली बार आपने नए साल की पूर्व संध्या किस वर्ष मनाई थी?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (81, 'es', '¿Cuál fue el último año en que celebraste la víspera de Año Nuevo?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (81, 'ar', 'ما هي آخر سنة احتفلت فيها بليلة رأس السنة؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (810, 81, 1, 'sem_q2', '');
-- Logic handled dynamically: DYNAMIC_YEAR_LAST_NYE
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (810, 'en', '', 'Answer', 'DYNAMIC_YEAR_LAST_NYE');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (810, 'hi', '', 'उत्तर', 'DYNAMIC_YEAR_LAST_NYE');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (810, 'es', '', 'Respuesta', 'DYNAMIC_YEAR_LAST_NYE');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (810, 'ar', '', 'إجابة', 'DYNAMIC_YEAR_LAST_NYE');


-- Question 13: Geographic Knowledge (LA -> California)
-- ID 82
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (82, 8, 'SEM_Q3', 'semantic', 3, 'Los Angeles is in which state?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (82, 'en', 'Los Angeles is in which state?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (82, 'hi', 'लॉस एंजिल्स किस राज्य में है?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (82, 'es', '¿En qué estado está Los Ángeles?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (82, 'ar', 'لوس أنجلوس في أي ولاية؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (820, 82, 1, 'sem_q3', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (820, 'en', '', 'Answer', 'california,ca');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (820, 'hi', '', 'उत्तर', 'california,ca,कैलिफ़ोर्निया');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (820, 'es', '', 'Respuesta', 'california,ca');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (820, 'ar', '', 'إجابة', 'california,ca,كاليفورنيا');


-- Question 14: Civic Knowledge (Capital of USA)
-- ID 83
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (83, 8, 'SEM_Q4', 'semantic', 4, 'What is the capital of the United States of America?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (83, 'en', 'What is the capital of the United States of America?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (83, 'hi', 'संयुक्त राज्य अमेरिका की राजधानी क्या है?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (83, 'es', '¿Cuál es la capital de los Estados Unidos de América?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (83, 'ar', 'ما هي عاصمة الولايات المتحدة الأمريكية؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (830, 83, 1, 'sem_q4', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (830, 'en', '', 'Answer', 'washington dc,washington d.c.,dc');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (830, 'hi', '', 'उत्तर', 'washington dc,washington d.c.,dc,वाशिंगटन डीसी');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (830, 'es', '', 'Respuesta', 'washington dc,washington d.c.,dc');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (830, 'ar', '', 'إجابة', 'washington dc,washington d.c.,dc,واشنطن العاصمة');


-- Question 15: Traffic Knowledge (Speed limit - Range)
-- ID 84
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (84, 8, 'SEM_Q5', 'semantic', 5, 'At what speed, in miles per hour, do you drive on interstate highways?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (84, 'en', 'At what speed, in miles per hour, do you drive on interstate highways?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (84, 'hi', 'इंटरस्टेट हाइवे पर आप कितनी गति (मील प्रति घंटा) से गाड़ी चलाते हैं?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (84, 'es', '¿A qué velocidad, en millas por hora, conduces en las autopistas interestatales?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (84, 'ar', 'بأي سرعة، بالأميال في الساعة، تقود على الطرق السريعة بين الولايات؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (840, 84, 1, 'sem_q5', '');
-- Logic handled dynamically: RANGE_55_75
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (840, 'en', '', 'Answer', 'RANGE_55_75');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (840, 'hi', '', 'उत्तर', 'RANGE_55_75');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (840, 'es', '', 'Respuesta', 'RANGE_55_75');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (840, 'ar', '', 'إجابة', 'RANGE_55_75');
