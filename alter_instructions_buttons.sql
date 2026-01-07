-- Add column for secondary button text
-- ALTER TABLE dmac_webapp_page_translations ADD COLUMN secondary_button_text VARCHAR(255) DEFAULT NULL;

-- Update English Translations for Instructions Page (page_id = 2)
UPDATE dmac_webapp_page_translations
SET 
    button_text = 'Start S-DMAC Test Now',
    secondary_button_text = 'Take S-DMAC Test Later'
WHERE page_id = 2 AND language_code = 'en';

-- Update Hindi (hi) Translations
UPDATE dmac_webapp_page_translations
SET 
    button_text = 'अभी S-DMAC टेस्ट शुरू करें',
    secondary_button_text = 'बाद में S-DMAC टेस्ट लें'
WHERE page_id = 2 AND language_code = 'hi';

-- Update Spanish (es) Translations
UPDATE dmac_webapp_page_translations
SET 
    button_text = 'Comenzar la prueba S-DMAC ahora',
    secondary_button_text = 'Realizar la prueba S-DMAC más tarde'
WHERE page_id = 2 AND language_code = 'es';

-- Update Arabic (ar) Translations
UPDATE dmac_webapp_page_translations
SET 
    button_text = 'ابدأ اختبار S-DMAC الآن',
    secondary_button_text = 'إجراء اختبار S-DMAC لاحقًا'
WHERE page_id = 2 AND language_code = 'ar';

-- Update Chinese (zh) Translations
UPDATE dmac_webapp_page_translations
SET 
    button_text = '立即开始 S-DMAC 测试',
    secondary_button_text = '稍后进行 S-DMAC 测试'
WHERE page_id = 2 AND language_code = 'zh';
