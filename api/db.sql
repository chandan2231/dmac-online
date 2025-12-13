Here’s the **updated full SQL file** including the multilingual design (`question_item_i18n`) and all inserts for both modules. You can save this as e.g. `game_schema_multilang.sql` and run it directly.

```sql
-- =====================================================================
-- SIMPLE GENERIC DB FOR 2 MODULES (MULTILINGUAL READY)
--  - Module 1: Image Flash (Immediate Visual Recall)
--  - Module 2: Visual Spatial Selection
--  - Multilingual audio + accepted answers via question_item_i18n
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop in dependency order
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS question_options;
DROP TABLE IF EXISTS question_item_i18n;
DROP TABLE IF EXISTS question_items;
DROP TABLE IF EXISTS questions_i18n;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS modules_i18n;
DROP TABLE IF EXISTS modules;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1) MODULES
-- =====================================================================
CREATE TABLE modules (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    code         VARCHAR(50)  NOT NULL,      -- 'IMAGE_FLASH', 'VISUAL_SPATIAL', ...
    name         VARCHAR(150) NOT NULL,
    description  TEXT         NULL,
    order_index  INT          NOT NULL,      -- 1,2,… sequence in whole game
    max_score    INT          NOT NULL,
    is_active    TINYINT(1)   NOT NULL DEFAULT 1,
    UNIQUE KEY uq_modules_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 1b) MODULES_I18N
--     Multilingual module names and descriptions
-- =====================================================================
CREATE TABLE modules_i18n (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    module_id     INT NOT NULL,
    language_code VARCHAR(10) NOT NULL,           -- 'en', 'hi', 'es', 'ar', etc.
    name          VARCHAR(150) NOT NULL,          -- translated module name
    description   TEXT NULL,                      -- translated description
    FOREIGN KEY (module_id) REFERENCES modules(id),
    UNIQUE KEY uq_module_lang (module_id, language_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 2) QUESTIONS
--    One row per logical question / round
-- =====================================================================
CREATE TABLE questions (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    module_id            INT NOT NULL,
    code                 VARCHAR(50) NULL,   -- e.g. 'M1_MAIN', 'VS_R1', etc.
    question_type        ENUM('flash_recall','visual_spatial') NOT NULL,
    order_index          INT NOT NULL,       -- order inside module
    prompt_text          TEXT NULL,          -- instructions / text prompt
    correct_answer_text  VARCHAR(255) NULL,  -- optional, for text-based questions
    FOREIGN KEY (module_id) REFERENCES modules(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 2b) QUESTIONS_I18N
--     Multilingual question prompts and instructions
-- =====================================================================
CREATE TABLE questions_i18n (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    question_id   INT NOT NULL,
    language_code VARCHAR(10) NOT NULL,           -- 'en', 'hi', 'es', 'ar', etc.
    prompt_text   TEXT NULL,                      -- translated prompt/instructions
    FOREIGN KEY (question_id) REFERENCES questions(id),
    UNIQUE KEY uq_question_lang (question_id, language_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 3) QUESTION_ITEMS
--    Language-independent items for Module 1 (images only)
-- =====================================================================
CREATE TABLE question_items (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    question_id   INT NOT NULL,
    item_order    INT NOT NULL,              -- 1..5 for sequence display order
    image_key     VARCHAR(100) NOT NULL,     -- logical key: 'car','pen',...
    image_url     VARCHAR(500) NOT NULL,     -- same across languages
    FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 4) QUESTION_ITEM_I18N
--    Per-language audio + display text + accepted answers
-- =====================================================================
CREATE TABLE question_item_i18n (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    question_item_id INT NOT NULL,
    language_code    VARCHAR(10) NOT NULL,      -- 'en', 'hi', 'mr', etc.
    audio_url        VARCHAR(500) NOT NULL,     -- audio that speaks the name
    display_text     VARCHAR(100) NOT NULL,     -- label in that language
    accepted_answers TEXT NULL,                 -- comma-separated synonyms
    FOREIGN KEY (question_item_id) REFERENCES question_items(id),
    UNIQUE KEY uq_item_lang (question_item_id, language_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 5) QUESTION_OPTIONS
--    Options for MCQ-style visual selection (Module 2)
-- =====================================================================
CREATE TABLE question_options (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    question_id   INT NOT NULL,
    option_key    VARCHAR(50) NOT NULL,      -- e.g. 'cube1', 'cube2'
    image_url     VARCHAR(500) NOT NULL,
    is_correct    TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 6) SESSIONS
--    Per user per module run
-- =====================================================================
CREATE TABLE sessions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,    -- link to your existing users table logically
    module_id   INT NOT NULL,
    score       INT DEFAULT 0,
    status      ENUM('in_progress','completed') DEFAULT 'in_progress',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 7) RESPONSES
--    Stores answers for both modules
-- =====================================================================
CREATE TABLE responses (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    session_id           INT NOT NULL,
    question_id          INT NOT NULL,
    answer_text          TEXT NULL,          -- free text recall (Module 1)
    selected_option_key  VARCHAR(50) NULL,   -- chosen option (Module 2)
    is_correct           TINYINT(1) DEFAULT 0,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- INSERT SAMPLE DATA
-- =====================================================================

-- ---------------------------------------------------------------------
-- MODULES
-- ---------------------------------------------------------------------
INSERT INTO modules (code, name, description, order_index, max_score, is_active)
VALUES
('IMAGE_FLASH', 'Image Flash Memory', 'The picture will flash for 5 second one after another. Remember the pictures, you will be asked to recall them immediately after and later.', 1, 5, 1),
('VISUAL_SPATIAL', 'Visual Spatial Selection', 'Remember the image. Select the same image from the choice in next screen.', 2, 5, 1);

-- At this point (fresh DB):
-- IMAGE_FLASH    => id = 1
-- VISUAL_SPATIAL => id = 2

-- Multilingual module descriptions
-- ENGLISH
INSERT INTO modules_i18n (module_id, language_code, name, description)
VALUES
(1, 'en', 'Image Flash Memory', 'The picture will flash for 5 second one after another. Remember the pictures, you will be asked to recall them immediately after and later.'),
(2, 'en', 'Visual Spatial Selection', 'Remember the image. Select the same image from the choice in next screen.');

-- HINDI
INSERT INTO modules_i18n (module_id, language_code, name, description)
VALUES
(1, 'hi', 'छवि फ्लैश स्मृति', 'तस्वीर एक के बाद एक 5 सेकंड के लिए फ्लैश होगी। तस्वीरों को याद रखें, आपसे तुरंत बाद और बाद में उन्हें याद करने के लिए कहा जाएगा।'),
(2, 'hi', 'दृश्य स्थानिक चयन', 'छवि को याद रखें। अगली स्क्रीन में विकल्प में से उसी छवि का चयन करें।');

-- SPANISH
INSERT INTO modules_i18n (module_id, language_code, name, description)
VALUES
(1, 'es', 'Memoria Flash de Imágenes', 'La imagen parpadeará durante 5 segundos una tras otra. Recuerde las imágenes, se le pedirá que las recuerde inmediatamente después y más tarde.'),
(2, 'es', 'Selección Espacial Visual', 'Recuerde la imagen. Seleccione la misma imagen de la opción en la siguiente pantalla.');

-- ARABIC
INSERT INTO modules_i18n (module_id, language_code, name, description)
VALUES
(1, 'ar', 'ذاكرة الصور السريعة', 'ستومض الصورة لمدة 5 ثوانٍ واحدة تلو الأخرى. تذكر الصور، سيُطلب منك تذكرها فورًا وبعد ذلك.'),
(2, 'ar', 'اختيار المكان البصري', 'تذكر الصورة. حدد نفس الصورة من الخيار في الشاشة التالية.');

-- ---------------------------------------------------------------------
-- MODULE 1: Image Flash (one question with a sequence of 5 items)
-- ---------------------------------------------------------------------
INSERT INTO questions (module_id, code, question_type, order_index, prompt_text, correct_answer_text)
VALUES
(1, 'M1_MAIN', 'flash_recall', 1,
 'Please recall the picture you have been asked to remember in beginning of the exam. Examiner please take the tablet to enter the answers.',
 NULL);

-- This question gets id = 1

-- 5 images in fixed order for this module:
INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES
(1, 1, 'car',  'https://cdn.example.com/images/car.png'),
(1, 2, 'pen',  'https://cdn.example.com/images/pen.png'),
(1, 3, 'bird', 'https://cdn.example.com/images/bird.png'),
(1, 4, 'boat', 'https://cdn.example.com/images/boat.png'),
(1, 5, 'bus',  'https://cdn.example.com/images/bus.png');

-- Assume AUTO_INCREMENT made these:
-- question_items: id = 1..5 (in same order)

-- ENGLISH translations + audio + accepted answers
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers)
VALUES
(1, 'en', 'https://cdn.example.com/audio/en/car.mp3',   'car',   'car'),
(2, 'en', 'https://cdn.example.com/audio/en/pen.mp3',   'pen',   'pen'),
(3, 'en', 'https://cdn.example.com/audio/en/bird.mp3',  'bird',  'bird'),
(4, 'en', 'https://cdn.example.com/audio/en/boat.mp3',  'boat',  'boat'),
(5, 'en', 'https://cdn.example.com/audio/en/bus.mp3',   'bus',   'bus');

-- HINDI translations + audio + accepted answers
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers)
VALUES
(1, 'hi', 'https://cdn.example.com/audio/hi/gaadi.mp3', 'गाड़ी', 'gaadi,gadi,gaadi.'),
(2, 'hi', 'https://cdn.example.com/audio/hi/pen.mp3',   'पेन',  'pen,pen.'),
(3, 'hi', 'https://cdn.example.com/audio/hi/panchi.mp3','पंछी','panchi,panchi.'),
(4, 'hi', 'https://cdn.example.com/audio/hi/naav.mp3',  'नाव',  'naav,nav,naao'),
(5, 'hi', 'https://cdn.example.com/audio/hi/bas.mp3',   'बस',   'bas,bus');

-- SPANISH translations + audio + accepted answers
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers)
VALUES
(1, 'es', 'https://cdn.example.com/audio/es/coche.mp3',   'coche',   'coche,carro,auto'),
(2, 'es', 'https://cdn.example.com/audio/es/pluma.mp3',   'pluma',   'pluma,bolígrafo,boli'),
(3, 'es', 'https://cdn.example.com/audio/es/pajaro.mp3',  'pájaro',  'pájaro,pajaro,ave'),
(4, 'es', 'https://cdn.example.com/audio/es/barco.mp3',   'barco',   'barco,bote,barca'),
(5, 'es', 'https://cdn.example.com/audio/es/autobus.mp3', 'autobús', 'autobús,autobus,bus,camion');

-- ARABIC translations + audio + accepted answers
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers)
VALUES
(1, 'ar', 'https://cdn.example.com/audio/ar/sayyara.mp3', 'سيارة', 'سيارة,عربية,sayyara,arabiya'),
(2, 'ar', 'https://cdn.example.com/audio/ar/qalam.mp3',   'قلم',   'قلم,qalam'),
(3, 'ar', 'https://cdn.example.com/audio/ar/tair.mp3',    'طائر',  'طائر,عصفور,tair,asfur'),
(4, 'ar', 'https://cdn.example.com/audio/ar/qarib.mp3',   'قارب',  'قارب,مركب,qarib,markab'),
(5, 'ar', 'https://cdn.example.com/audio/ar/hafila.mp3',  'حافلة', 'حافلة,باص,hafila,bas');

-- Multilingual question prompts for Module 1
-- ENGLISH
INSERT INTO questions_i18n (question_id, language_code, prompt_text)
VALUES
(1, 'en', 'Please recall the picture you have been asked to remember in beginning of the exam. Examiner please take the tablet to enter the answers.');

-- HINDI
INSERT INTO questions_i18n (question_id, language_code, prompt_text)
VALUES
(1, 'hi', 'कृपया उस तस्वीर को याद करें जिसे आपसे परीक्षा की शुरुआत में याद रखने के लिए कहा गया था। परीक्षक कृपया उत्तर दर्ज करने के लिए टैबलेट लें।');

-- SPANISH
INSERT INTO questions_i18n (question_id, language_code, prompt_text)
VALUES
(1, 'es', 'Por favor recuerde la imagen que se le pidió recordar al comienzo del examen. Examinador, por favor tome la tableta para ingresar las respuestas.');

-- ARABIC
INSERT INTO questions_i18n (question_id, language_code, prompt_text)
VALUES
(1, 'ar', 'يرجى تذكر الصورة التي طُلب منك تذكرها في بداية الامتحان. الفاحص يرجى أخذ الجهاز اللوحي لإدخال الإجابات.');

-- ---------------------------------------------------------------------
-- MODULE 2: Visual Spatial Selection (5 rounds = 5 questions)
-- ---------------------------------------------------------------------
-- Round 1: Cube set
INSERT INTO questions (module_id, code, question_type, order_index, prompt_text, correct_answer_text)
VALUES
(2, 'VS_R1', 'visual_spatial', 1, 'Select the same cube as shown.', 'cube3');

-- Round 2: Bee set
INSERT INTO questions (module_id, code, question_type, order_index, prompt_text, correct_answer_text)
VALUES
(2, 'VS_R2', 'visual_spatial', 2, 'Select the same bee as shown.', 'bee2');

-- Round 3: Star set
INSERT INTO questions (module_id, code, question_type, order_index, prompt_text, correct_answer_text)
VALUES
(2, 'VS_R3', 'visual_spatial', 3, 'Select the same star as shown.', 'star4');

-- Round 4: Face set
INSERT INTO questions (module_id, code, question_type, order_index, prompt_text, correct_answer_text)
VALUES
(2, 'VS_R4', 'visual_spatial', 4, 'Select the same face as shown.', 'face1');

-- Round 5: Cube set again (different target)
INSERT INTO questions (module_id, code, question_type, order_index, prompt_text, correct_answer_text)
VALUES
(2, 'VS_R5', 'visual_spatial', 5, 'Select the same cube as shown.', 'cube2');

-- Now, questions table IDs should be:
-- 1: M1_MAIN (already used above)
-- 2: VS_R1
-- 3: VS_R2
-- 4: VS_R3
-- 5: VS_R4
-- 6: VS_R5

-- Multilingual question prompts for Module 2 (Visual Spatial)
-- ENGLISH
INSERT INTO questions_i18n (question_id, language_code, prompt_text)
VALUES
(2, 'en', 'Select the same cube as shown.'),
(3, 'en', 'Select the same bee as shown.'),
(4, 'en', 'Select the same star as shown.'),
(5, 'en', 'Select the same face as shown.'),
(6, 'en', 'Select the same cube as shown.');

-- HINDI
INSERT INTO questions_i18n (question_id, language_code, prompt_text)
VALUES
(2, 'hi', 'दिखाए गए समान घन का चयन करें।'),
(3, 'hi', 'दिखाई गई समान मधुमक्खी का चयन करें।'),
(4, 'hi', 'दिखाए गए समान तारे का चयन करें।'),
(5, 'hi', 'दिखाए गए समान चेहरे का चयन करें।'),
(6, 'hi', 'दिखाए गए समान घन का चयन करें।');

-- SPANISH
INSERT INTO questions_i18n (question_id, language_code, prompt_text)
VALUES
(2, 'es', 'Selecciona el mismo cubo que se muestra.'),
(3, 'es', 'Selecciona la misma abeja que se muestra.'),
(4, 'es', 'Selecciona la misma estrella que se muestra.'),
(5, 'es', 'Selecciona la misma cara que se muestra.'),
(6, 'es', 'Selecciona el mismo cubo que se muestra.');

-- ARABIC
INSERT INTO questions_i18n (question_id, language_code, prompt_text)
VALUES
(2, 'ar', 'اختر نفس المكعب كما هو موضح.'),
(3, 'ar', 'اختر نفس النحلة كما هو موضح.'),
(4, 'ar', 'اختر نفس النجمة كما هو موضح.'),
(5, 'ar', 'اختر نفس الوجه كما هو موضح.'),
(6, 'ar', 'اختر نفس المكعب كما هو موضح.');

-- ---------------------------------------------------------------------
-- QUESTION OPTIONS for each Visual Spatial round
-- Each question has 4 options, only one is_correct = 1
-- ---------------------------------------------------------------------

-- VS_R1 (question_id = 2), Cube options
INSERT INTO question_options (question_id, option_key, image_url, is_correct)
VALUES
(2, 'cube1', 'https://cdn.example.com/images/cube1.png', 0),
(2, 'cube2', 'https://cdn.example.com/images/cube2.png', 0),
(2, 'cube3', 'https://cdn.example.com/images/cube3.png', 1),
(2, 'cube4', 'https://cdn.example.com/images/cube4.png', 0);

-- VS_R2 (question_id = 3), Bee options
INSERT INTO question_options (question_id, option_key, image_url, is_correct)
VALUES
(3, 'bee1', 'https://cdn.example.com/images/bee1.png', 0),
(3, 'bee2', 'https://cdn.example.com/images/bee2.png', 1),
(3, 'bee3', 'https://cdn.example.com/images/bee3.png', 0),
(3, 'bee4', 'https://cdn.example.com/images/bee4.png', 0);

-- VS_R3 (question_id = 4), Star options
INSERT INTO question_options (question_id, option_key, image_url, is_correct)
VALUES
(4, 'star1', 'https://cdn.example.com/images/star1.png', 0),
(4, 'star2', 'https://cdn.example.com/images/star2.png', 0),
(4, 'star3', 'https://cdn.example.com/images/star3.png', 0),
(4, 'star4', 'https://cdn.example.com/images/star4.png', 1);

-- VS_R4 (question_id = 5), Face options
INSERT INTO question_options (question_id, option_key, image_url, is_correct)
VALUES
(5, 'face1', 'https://cdn.example.com/images/face1.png', 1),
(5, 'face2', 'https://cdn.example.com/images/face2.png', 0),
(5, 'face3', 'https://cdn.example.com/images/face3.png', 0),
(5, 'face4', 'https://cdn.example.com/images/face4.png', 0);

-- VS_R5 (question_id = 6), Cube options again
INSERT INTO question_options (question_id, option_key, image_url, is_correct)
VALUES
(6, 'cube1', 'https://cdn.example.com/images/cube1.png', 0),
(6, 'cube2', 'https://cdn.example.com/images/cube2.png', 1),
(6, 'cube3', 'https://cdn.example.com/images/cube3.png', 0),
(6, 'cube4', 'https://cdn.example.com/images/cube4.png', 0);

-- ---------------------------------------------------------------------
-- SAMPLE SESSIONS (for a dummy user_id = 1)
-- ---------------------------------------------------------------------
INSERT INTO sessions (user_id, module_id, score, status)
VALUES
(1, 1, 0, 'in_progress'),  -- session_id = 1, for IMAGE_FLASH
(1, 2, 0, 'in_progress');  -- session_id = 2, for VISUAL_SPATIAL

-- ---------------------------------------------------------------------
-- SAMPLE RESPONSES
-- ---------------------------------------------------------------------

-- Example: Module 1 user answered "car bird bus pen"
-- (Backend would evaluate and set is_correct / update sessions.score)
INSERT INTO responses (session_id, question_id, answer_text, selected_option_key, is_correct)
VALUES
(1, 1, 'car bird bus pen', NULL, 1);

-- Example: Module 2 Round 1 user selected cube3 (correct)
INSERT INTO responses (session_id, question_id, answer_text, selected_option_key, is_correct)
VALUES
(2, 2, NULL, 'cube3', 1);

-- Example: Module 2 Round 2 user selected bee1 (wrong)
INSERT INTO responses (session_id, question_id, answer_text, selected_option_key, is_correct)
VALUES
(2, 3, NULL, 'bee1', 0);

-- =====================================================================
-- END OF FILE
-- =====================================================================
```

If you want, next step I can give you the exact SQL `SELECT` queries and sample API handler logic that uses `question_item_i18n.language_code` to serve the right audio + accepted answers.

