-- Update Instruction Text for Module 1 (All Languages)

-- English (Default)
-- Updates both the main `modules` table and the English entry in `modules_i18n`.
UPDATE modules 
SET description = "The pictures will flash for 5 seconds one after another. Remember the pictures, You will be asked to recall immediately and later in the test as visual picture recall." 
WHERE id = 1;

UPDATE modules_i18n 
SET description = "The pictures will flash for 5 seconds one after another. Remember the pictures, You will be asked to recall immediately and later in the test as visual picture recall." 
WHERE id = 1 AND language_code = 'en';

-- Arabic (ar)
UPDATE modules_i18n 
SET description = "ستومض الصور لمدة 5 ثوانٍ الواحدة تلو الأخرى. تذكر الصور، حيث سيُطلب منك استرجاعها فورًا ولاحقًا في الاختبار كجزء من استدعاء الصور المرئي." 
WHERE module_id = 1 AND language_code = 'ar';

-- Spanish (es)
UPDATE modules_i18n 
SET description = "Las imágenes parpadearán durante 5 segundos una tras otra. Recuerde las imágenes, se le pedirá que las recuerde inmediatamente y más tarde en la prueba como recuerdo visual de imágenes." 
WHERE module_id = 1 AND language_code = 'es';

-- Hindi (hi)
UPDATE modules_i18n 
SET description = "तस्वीरें 5 सेकंड के लिए एक के बाद एक फ्लैश होंगी। चित्रों को याद रखें, आपसे उन्हें तुरंत और बाद में परीक्षण में दृश्य चित्र स्मरण के रूप में याद करने के लिए कहा जाएगा।" 
WHERE module_id = 1 AND language_code = 'hi';

-- Update Prompt Text for Question 1 (All Languages)

-- English (Default)
-- Updates both the main `questions` table and the English entry in `questions_i18n`.
UPDATE questions
SET prompt_text = "Please recall the pictures. You may be able to speak or type the answers in the text box."
WHERE id = 1;

UPDATE questions_i18n
SET prompt_text = "Please recall the pictures. You may be able to speak or type the answers in the text box."
WHERE question_id = 1 AND language_code = 'en';

-- Arabic (ar)
UPDATE questions_i18n
SET prompt_text = "يرجى تذكر الصور. يمكنك التحدث أو كتابة الإجابات في مربع النص."
WHERE question_id = 1 AND language_code = 'ar';

-- Spanish (es)
UPDATE questions_i18n
SET prompt_text = "Por favor, recuerde las imágenes. Puede hablar o escribir las respuestas en el cuadro de texto."
WHERE question_id = 1 AND language_code = 'es';

-- Hindi (hi)
UPDATE questions_i18n
SET prompt_text = "कृपया चित्रों को याद करें। आप बोल सकते हैं या उत्तरों को टेक्स्ट बॉक्स में टाइप कर सकते हैं।"
WHERE question_id = 1 AND language_code = 'hi';
