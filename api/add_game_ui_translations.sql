-- =====================================================================
-- ADD GAME MODULE UI TEXT TRANSLATIONS
-- This script adds multilingual UI text for game modules
-- Tables: dmac_webapp_ui_texts, dmac_webapp_ui_text_translations
-- =====================================================================

-- Insert UI text keys
INSERT INTO dmac_webapp_ui_texts (code, status) VALUES
('game_instructions', 1),
('game_instruction', 1),
('game_start', 1),
('game_repeat', 1),
('game_next', 1),
('game_enter_answers', 1),
('game_input_placeholder', 1),
('game_validation_error', 1),
('game_no_modules_found', 1),
('game_fetch_error', 1),
('game_session_error', 1),
('game_completion_title', 1),
('game_completion_message', 1),
('game_home_button', 1);

-- Get the IDs (assumes auto_increment starting from last id)
-- You can verify these IDs after running the above INSERT
-- SELECT id, code FROM dmac_webapp_ui_texts WHERE code LIKE 'game_%';

-- For this script, we'll use subqueries to get the correct IDs dynamically

-- =====================================================================
-- ENGLISH TRANSLATIONS (en)
-- =====================================================================
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'en', 'Instructions' FROM dmac_webapp_ui_texts WHERE code = 'game_instructions'
UNION ALL
SELECT id, 'en', 'Instruction' FROM dmac_webapp_ui_texts WHERE code = 'game_instruction'
UNION ALL
SELECT id, 'en', 'Start' FROM dmac_webapp_ui_texts WHERE code = 'game_start'
UNION ALL
SELECT id, 'en', 'REPEAT' FROM dmac_webapp_ui_texts WHERE code = 'game_repeat'
UNION ALL
SELECT id, 'en', 'NEXT' FROM dmac_webapp_ui_texts WHERE code = 'game_next'
UNION ALL
SELECT id, 'en', 'Enter Answers' FROM dmac_webapp_ui_texts WHERE code = 'game_enter_answers'
UNION ALL
SELECT id, 'en', 'Enter answers separated by spaces (e.g., bird car tree)' FROM dmac_webapp_ui_texts WHERE code = 'game_input_placeholder'
UNION ALL
SELECT id, 'en', 'Please enter at least one answer before submitting.' FROM dmac_webapp_ui_texts WHERE code = 'game_validation_error'
UNION ALL
SELECT id, 'en', 'No active game modules found.' FROM dmac_webapp_ui_texts WHERE code = 'game_no_modules_found'
UNION ALL
SELECT id, 'en', 'Failed to fetch game modules.' FROM dmac_webapp_ui_texts WHERE code = 'game_fetch_error'
UNION ALL
SELECT id, 'en', 'Failed to start game session. Please check your connection.' FROM dmac_webapp_ui_texts WHERE code = 'game_session_error'
UNION ALL
SELECT id, 'en', 'Game Completed' FROM dmac_webapp_ui_texts WHERE code = 'game_completion_title'
UNION ALL
SELECT id, 'en', 'Game is over. We will send you score report in next 4 hours.' FROM dmac_webapp_ui_texts WHERE code = 'game_completion_message'
UNION ALL
SELECT id, 'en', 'Home' FROM dmac_webapp_ui_texts WHERE code = 'game_home_button';

-- =====================================================================
-- HINDI TRANSLATIONS (hi)
-- =====================================================================
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'hi', 'निर्देश' FROM dmac_webapp_ui_texts WHERE code = 'game_instructions'
UNION ALL
SELECT id, 'hi', 'निर्देश' FROM dmac_webapp_ui_texts WHERE code = 'game_instruction'
UNION ALL
SELECT id, 'hi', 'शुरू करें' FROM dmac_webapp_ui_texts WHERE code = 'game_start'
UNION ALL
SELECT id, 'hi', 'दोहराएँ' FROM dmac_webapp_ui_texts WHERE code = 'game_repeat'
UNION ALL
SELECT id, 'hi', 'आगे' FROM dmac_webapp_ui_texts WHERE code = 'game_next'
UNION ALL
SELECT id, 'hi', 'उत्तर दर्ज करें' FROM dmac_webapp_ui_texts WHERE code = 'game_enter_answers'
UNION ALL
SELECT id, 'hi', 'स्थानों से अलग किए गए उत्तर दर्ज करें (उदाहरण: पक्षी कार पेड़)' FROM dmac_webapp_ui_texts WHERE code = 'game_input_placeholder'
UNION ALL
SELECT id, 'hi', 'कृपया सबमिट करने से पहले कम से कम एक उत्तर दर्ज करें।' FROM dmac_webapp_ui_texts WHERE code = 'game_validation_error'
UNION ALL
SELECT id, 'hi', 'कोई सक्रिय गेम मॉड्यूल नहीं मिला।' FROM dmac_webapp_ui_texts WHERE code = 'game_no_modules_found'
UNION ALL
SELECT id, 'hi', 'गेम मॉड्यूल प्राप्त करने में विफल।' FROM dmac_webapp_ui_texts WHERE code = 'game_fetch_error'
UNION ALL
SELECT id, 'hi', 'गेम सत्र शुरू करने में विफल। कृपया अपना कनेक्शन जांचें।' FROM dmac_webapp_ui_texts WHERE code = 'game_session_error'
UNION ALL
SELECT id, 'hi', 'गेम पूर्ण हुआ' FROM dmac_webapp_ui_texts WHERE code = 'game_completion_title'
UNION ALL
SELECT id, 'hi', 'गेम समाप्त हो गया है। हम आपको अगले 4 घंटों में स्कोर रिपोर्ट भेजेंगे।' FROM dmac_webapp_ui_texts WHERE code = 'game_completion_message'
UNION ALL
SELECT id, 'hi', 'होम' FROM dmac_webapp_ui_texts WHERE code = 'game_home_button';

-- =====================================================================
-- SPANISH TRANSLATIONS (es)
-- =====================================================================
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'es', 'Instrucciones' FROM dmac_webapp_ui_texts WHERE code = 'game_instructions'
UNION ALL
SELECT id, 'es', 'Instrucción' FROM dmac_webapp_ui_texts WHERE code = 'game_instruction'
UNION ALL
SELECT id, 'es', 'Comenzar' FROM dmac_webapp_ui_texts WHERE code = 'game_start'
UNION ALL
SELECT id, 'es', 'REPETIR' FROM dmac_webapp_ui_texts WHERE code = 'game_repeat'
UNION ALL
SELECT id, 'es', 'SIGUIENTE' FROM dmac_webapp_ui_texts WHERE code = 'game_next'
UNION ALL
SELECT id, 'es', 'Ingrese Respuestas' FROM dmac_webapp_ui_texts WHERE code = 'game_enter_answers'
UNION ALL
SELECT id, 'es', 'Ingrese respuestas separadas por espacios (ej: pájaro coche árbol)' FROM dmac_webapp_ui_texts WHERE code = 'game_input_placeholder'
UNION ALL
SELECT id, 'es', 'Por favor ingrese al menos una respuesta antes de enviar.' FROM dmac_webapp_ui_texts WHERE code = 'game_validation_error'
UNION ALL
SELECT id, 'es', 'No se encontraron módulos de juego activos.' FROM dmac_webapp_ui_texts WHERE code = 'game_no_modules_found'
UNION ALL
SELECT id, 'es', 'Error al obtener los módulos del juego.' FROM dmac_webapp_ui_texts WHERE code = 'game_fetch_error'
UNION ALL
SELECT id, 'es', 'Error al iniciar la sesión del juego. Verifique su conexión.' FROM dmac_webapp_ui_texts WHERE code = 'game_session_error'
UNION ALL
SELECT id, 'es', 'Juego Completado' FROM dmac_webapp_ui_texts WHERE code = 'game_completion_title'
UNION ALL
SELECT id, 'es', 'El juego ha terminado. Le enviaremos el informe de puntuación en las próximas 4 horas.' FROM dmac_webapp_ui_texts WHERE code = 'game_completion_message'
UNION ALL
SELECT id, 'es', 'Inicio' FROM dmac_webapp_ui_texts WHERE code = 'game_home_button';

-- =====================================================================
-- ARABIC TRANSLATIONS (ar)
-- =====================================================================
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'ar', 'تعليمات' FROM dmac_webapp_ui_texts WHERE code = 'game_instructions'
UNION ALL
SELECT id, 'ar', 'تعليمات' FROM dmac_webapp_ui_texts WHERE code = 'game_instruction'
UNION ALL
SELECT id, 'ar', 'ابدأ' FROM dmac_webapp_ui_texts WHERE code = 'game_start'
UNION ALL
SELECT id, 'ar', 'كرر' FROM dmac_webapp_ui_texts WHERE code = 'game_repeat'
UNION ALL
SELECT id, 'ar', 'التالي' FROM dmac_webapp_ui_texts WHERE code = 'game_next'
UNION ALL
SELECT id, 'ar', 'أدخل الإجابات' FROM dmac_webapp_ui_texts WHERE code = 'game_enter_answers'
UNION ALL
SELECT id, 'ar', 'أدخل الإجابات مفصولة بمسافات (مثال: طائر سيارة شجرة)' FROM dmac_webapp_ui_texts WHERE code = 'game_input_placeholder'
UNION ALL
SELECT id, 'ar', 'يرجى إدخال إجابة واحدة على الأقل قبل الإرسال.' FROM dmac_webapp_ui_texts WHERE code = 'game_validation_error'
UNION ALL
SELECT id, 'ar', 'لم يتم العثور على وحدات لعبة نشطة.' FROM dmac_webapp_ui_texts WHERE code = 'game_no_modules_found'
UNION ALL
SELECT id, 'ar', 'فشل في جلب وحدات اللعبة.' FROM dmac_webapp_ui_texts WHERE code = 'game_fetch_error'
UNION ALL
SELECT id, 'ar', 'فشل في بدء جلسة اللعبة. يرجى التحقق من اتصالك.' FROM dmac_webapp_ui_texts WHERE code = 'game_session_error'
UNION ALL
SELECT id, 'ar', 'اكتملت اللعبة' FROM dmac_webapp_ui_texts WHERE code = 'game_completion_title'
UNION ALL
SELECT id, 'ar', 'انتهت اللعبة. سنرسل لك تقرير النتيجة في غضون 4 ساعات القادمة.' FROM dmac_webapp_ui_texts WHERE code = 'game_completion_message'
UNION ALL
SELECT id, 'ar', 'الصفحة الرئيسية' FROM dmac_webapp_ui_texts WHERE code = 'game_home_button';

-- =====================================================================
-- VERIFICATION QUERY
-- Run this to verify all translations were added correctly
-- =====================================================================
-- SELECT 
--     ut.code,
--     utt.language_code,
--     utt.text
-- FROM dmac_webapp_ui_texts ut
-- JOIN dmac_webapp_ui_text_translations utt ON ut.id = utt.ui_text_id
-- WHERE ut.code LIKE 'game_%'
-- ORDER BY ut.code, utt.language_code;

-- Expected: 14 keys × 4 languages = 56 rows
