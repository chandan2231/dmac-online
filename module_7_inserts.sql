-- Ensure correct encoding
SET NAMES 'utf8mb4';

-- 1. Update Schema to support 'executive'
ALTER TABLE questions MODIFY COLUMN question_type ENUM('flash_recall','visual_spatial','audio_story','connect_dots', 'audio_words', 'executive') NOT NULL;

-- 2. Clean up existing data for Module 7 (idempotency)
DELETE FROM responses WHERE session_id IN (SELECT id FROM sessions WHERE module_id = 7);
DELETE FROM sessions WHERE module_id = 7;
DELETE FROM question_item_i18n WHERE question_item_id BETWEEN 700 AND 799; 
DELETE FROM question_items WHERE question_id BETWEEN 70 AND 79;
DELETE FROM questions_i18n WHERE question_id BETWEEN 70 AND 79;
DELETE FROM questions WHERE id BETWEEN 70 AND 79;
DELETE FROM modules_i18n WHERE module_id = 7;
DELETE FROM modules WHERE id = 7;

-- 3. Insert Module 7
INSERT INTO modules (id, code, name, description, order_index, max_score, is_active) 
VALUES (7, 'EXECUTIVE', 'Executive Questions', 'You will be asked few questions. Please answer them.', 7, 10, 1);

-- 4. Insert Module Translations
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (7, 'en', 'Executive Questions', 'You will be asked few questions. Please answer them.');
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (7, 'hi', 'कार्यकारी प्रश्न', 'आपसे कुछ प्रश्न पूछे जाएंगे। कृपया उनका उत्तर दें।');
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (7, 'es', 'Preguntas Ejecutivas', 'Se le harán algunas preguntas. Por favor respóndalas.');
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES (7, 'ar', 'الأسئلة التنفيذية', 'سيتم طرح بضعة أسئلة عليك. يرجى الإجابة عليها.');

-- 5. Insert Questions & Translations & Items

-- Question 1: Spatial Reasoning
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (70, 7, 'EXEC_Q1', 'executive', 1, 'A circle has no corners. How many corners does a square have?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (70, 'en', 'A circle has no corners. How many corners does a square have?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (70, 'hi', 'एक वृत्त में कोई कोने नहीं होते। एक वर्ग में कितने कोने होते हैं?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (70, 'es', 'Un círculo no tiene esquinas. ¿Cuántas esquinas tiene un cuadrado?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (70, 'ar', 'الدائرة ليس لها زوايا. كم عدد الزوايا للمربع؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (700, 70, 1, 'exec_q1', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (700, 'en', '', 'Answer', '4,four');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (700, 'hi', '', 'उत्तर', '4,चार,four');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (700, 'es', '', 'Respuesta', '4,cuatro,four');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (700, 'ar', '', 'إجابة', '4,أربعة,four');


-- Question 2: Directional Reasoning
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (71, 7, 'EXEC_Q2', 'executive', 2, 'To the right is the grocery store. To the left is the auto shop. Straight ahead is the library. Which direction do you go to get milk?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (71, 'en', 'To the right is the grocery store. To the left is the auto shop. Straight ahead is the library. Which direction do you go to get milk?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (71, 'hi', 'दाईं ओर किराने की दुकान है। बाईं ओर ऑटो शॉप है। सीधे आगे पुस्तकालय है। दूध लेने के लिए आप किस दिशा में जाएंगे?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (71, 'es', 'A la derecha está la tienda de comestibles. A la izquierda está el taller de autos. Todo recto está la biblioteca. ¿En qué dirección vas para conseguir leche?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (71, 'ar', 'على اليمين يوجد متجر البقالة. على اليسار ورشة السيارات. الأمام مباشرة المكتبة. في أي اتجاه تذهب للحصول على الحليب؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (710, 71, 1, 'exec_q2', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (710, 'en', '', 'Answer', 'right,to the right');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (710, 'hi', '', 'उत्तर', 'दाएं,दाईं ओर,right');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (710, 'es', '', 'Respuesta', 'derecha,a la derecha,right');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (710, 'ar', '', 'إجابة', 'يمين,إلى اليمين,right');


-- Question 3: Geographic Knowledge
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (72, 7, 'EXEC_Q3', 'executive', 3, 'If you are driving to Canada from Mexico, which direction do you go?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (72, 'en', 'If you are driving to Canada from Mexico, which direction do you go?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (72, 'hi', 'यदि आप मेक्सिको से कनाडा जा रहे हैं, तो आप किस दिशा में जाएंगे?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (72, 'es', 'Si conduces de México a Canadá, ¿en qué dirección vas?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (72, 'ar', 'إذا كنت تقود السيارة من المكسيك إلى كندا، ففي أي اتجاه تذهب؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (720, 72, 1, 'exec_q3', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (720, 'en', '', 'Answer', 'north');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (720, 'hi', '', 'उत्तर', 'उत्तर,north');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (720, 'es', '', 'Respuesta', 'norte,north');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (720, 'ar', '', 'إجابة', 'شمال,north');


-- Question 4: Temporal Reasoning (Dynamic)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (73, 7, 'EXEC_Q4', 'executive', 4, 'What was the day of the week, the day before yesterday?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (73, 'en', 'What was the day of the week, the day before yesterday?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (73, 'hi', 'परसों (बीते हुए कल से पहले) सप्ताह का कौन सा दिन था?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (73, 'es', '¿Qué día de la semana fue anteayer?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (73, 'ar', 'ماذا كان اليوم قبل أمس؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (730, 73, 1, 'exec_q4', '');
-- Accepted answers handled dynamically in code
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (730, 'en', '', 'Answer', 'DYNAMIC_DATE_BEFORE_YESTERDAY');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (730, 'hi', '', 'उत्तर', 'DYNAMIC_DATE_BEFORE_YESTERDAY');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (730, 'es', '', 'Respuesta', 'DYNAMIC_DATE_BEFORE_YESTERDAY');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (730, 'ar', '', 'إجابة', 'DYNAMIC_DATE_BEFORE_YESTERDAY');


-- Question 5: Date Calculation (Dynamic)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (74, 7, 'EXEC_Q5', 'executive', 5, 'What is the date of the month tomorrow?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (74, 'en', 'What is the date of the month tomorrow?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (74, 'hi', 'कल महीने की कौन सी तारीख है?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (74, 'es', '¿Cuál es la fecha del mes mañana?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (74, 'ar', 'ما هو تاريخ الغد؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (740, 74, 1, 'exec_q5', '');
-- Accepted answers handled dynamically in code
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (740, 'en', '', 'Answer', 'DYNAMIC_DATE_TOMORROW');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (740, 'hi', '', 'उत्तर', 'DYNAMIC_DATE_TOMORROW');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (740, 'es', '', 'Respuesta', 'DYNAMIC_DATE_TOMORROW');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (740, 'ar', '', 'إجابة', 'DYNAMIC_DATE_TOMORROW');


-- Question 6: Sequential Pattern
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (75, 7, 'EXEC_Q6', 'executive', 6, 'In the sequence 2, 4, 6, __, what comes next?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (75, 'en', 'In the sequence 2, 4, 6, __, what comes next?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (75, 'hi', 'अनुक्रम 2, 4, 6, __ में, आगे क्या आता है?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (75, 'es', 'En la secuencia 2, 4, 6, __, ¿qué sigue?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (75, 'ar', 'في التسلسل 2، 4، 6، __، ماذا يأتي بعد ذلك؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (750, 75, 1, 'exec_q6', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (750, 'en', '', 'Answer', '8,eight');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (750, 'hi', '', 'उत्तर', '8,आठ,eight');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (750, 'es', '', 'Respuesta', '8,ocho,eight');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (750, 'ar', '', 'إجابة', '8,ثمانية,eight');


-- Question 7: Basic Math
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (76, 7, 'EXEC_Q7', 'executive', 7, 'You buy a hamburger for $3 and a Coke for $1. How much do you need to pay the cashier?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (76, 'en', 'You buy a hamburger for $3 and a Coke for $1. How much do you need to pay the cashier?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (76, 'hi', 'आप $3 का बर्गर और $1 का कोक खरीदते हैं। आपको कैशियर को कितना भुगतान करना होगा?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (76, 'es', 'Compras una hamburguesa por $3 y una Coca-Cola por $1. ¿Cuánto tienes que pagarle al cajero?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (76, 'ar', 'تشتري همبرغر مقابل 3 دولارات وكوكا كولا مقابل دولار واحد. كم عليك أن تدفع للصراف؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (760, 76, 1, 'exec_q7', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (760, 'en', '', 'Answer', '4,$4,four');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (760, 'hi', '', 'उत्तर', '4,$4,चार,four');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (760, 'es', '', 'Respuesta', '4,$4,cuatro,four');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (760, 'ar', '', 'إجابة', '4,$4,أربعة,four');


-- Question 8: Time/Distance
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (77, 7, 'EXEC_Q8', 'executive', 8, 'You are driving 50 miles per hour. How much time will it take to cover the 25-mile distance?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (77, 'en', 'You are driving 50 miles per hour. How much time will it take to cover the 25-mile distance?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (77, 'hi', 'आप 50 मील प्रति घंटे की गति से गाड़ी चला रहे हैं। 25 मील की दूरी तय करने में कितना समय लगेगा?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (77, 'es', 'Conduces a 50 millas por hora. ¿Cuánto tiempo tomará cubrir la distancia de 25 millas?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (77, 'ar', 'أنت تقود بسرعة 50 ميلاً في الساعة. كم من الوقت سيستغرق تغطية مسافة 25 ميلاً؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (770, 77, 1, 'exec_q8', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (770, 'en', '', 'Answer', '30,30 minutes,half hour,25');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (770, 'hi', '', 'उत्तर', '30,30 मिनट,आधा घंटा,25,30 minutes');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (770, 'es', '', 'Respuesta', '30,30 minutos,media hora,25,30 minutes');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (770, 'ar', '', 'إجابة', '30,30 دقيقة,نصف ساعة,25,30 minutes');


-- Question 9: Emergency Reasoning
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (78, 7, 'EXEC_Q9', 'executive', 9, 'You see a burglar breaking into your house. Who should you call first?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (78, 'en', 'You see a burglar breaking into your house. Who should you call first?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (78, 'hi', 'आप देखते हैं कि एक चोर आपके घर में घुस रहा है। आपको सबसे पहले किसे कॉल करना चाहिए?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (78, 'es', 'Ves a un ladrón entrando a tu casa. ¿A quién deberías llamar primero?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (78, 'ar', 'ترى لصًا يقتحم منزلك. بمن يجب أن تتصل أولاً؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (780, 78, 1, 'exec_q9', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (780, 'en', '', 'Answer', 'police,cops,911');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (780, 'hi', '', 'उत्तर', 'police,cops,911,पुलिस');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (780, 'es', '', 'Respuesta', 'police,cops,911,policía');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (780, 'ar', '', 'إجابة', 'police,cops,911,الشرطة');


-- Question 10: Date Calculation (Vacation)
INSERT INTO questions (id, module_id, code, question_type, order_index, prompt_text) VALUES (79, 7, 'EXEC_Q10', 'executive', 10, 'You are going on a 5-day beach vacation. You begin your vacation on Monday. On what day of the week will you return?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (79, 'en', 'You are going on a 5-day beach vacation. You begin your vacation on Monday. On what day of the week will you return?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (79, 'hi', 'आप 5 दिन की बीच वेकेशन पर जा रहे हैं। आप अपनी छुट्टियां सोमवार को शुरू करते हैं। आप सप्ताह के किस दिन वापस आएंगे?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (79, 'es', 'Te vas de vacaciones a la playa por 5 días. Comienzas tus vacaciones el lunes. ¿Qué día de la semana regresarás?');
INSERT INTO questions_i18n (question_id, language_code, prompt_text) VALUES (79, 'ar', 'أنت ذاهب في إجازة شاطئية لمدة 5 أيام. تبدأ إجازتك يوم الاثنين. في أي يوم من أيام الأسبوع ستعود؟');

INSERT INTO question_items (id, question_id, item_order, image_key, image_url) VALUES (790, 79, 1, 'exec_q10', '');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (790, 'en', '', 'Answer', 'friday');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (790, 'hi', '', 'उत्तर', 'friday,शुक्रवार');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (790, 'es', '', 'Respuesta', 'friday,viernes');
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers) VALUES (790, 'ar', '', 'إجابة', 'friday,يوم الجمعة,الجمعة');
