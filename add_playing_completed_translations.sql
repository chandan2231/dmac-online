-- =====================================================================
-- Add "Playing..." and "Completed" UI texts
-- =====================================================================

INSERT INTO dmac_webapp_ui_texts (code, status) VALUES
('game_playing', 1),
('game_completed_status', 1);

-- English
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'en', 'Playing...' FROM dmac_webapp_ui_texts WHERE code = 'game_playing'
UNION ALL
SELECT id, 'en', 'Completed' FROM dmac_webapp_ui_texts WHERE code = 'game_completed_status';

-- Hindi
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'hi', 'चल रहा है...' FROM dmac_webapp_ui_texts WHERE code = 'game_playing'
UNION ALL
SELECT id, 'hi', 'पूरा हुआ' FROM dmac_webapp_ui_texts WHERE code = 'game_completed_status';

-- Spanish
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'es', 'Reproduciendo...' FROM dmac_webapp_ui_texts WHERE code = 'game_playing'
UNION ALL
SELECT id, 'es', 'Completado' FROM dmac_webapp_ui_texts WHERE code = 'game_completed_status';

-- Arabic
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text)
SELECT id, 'ar', 'جار التشغيل...' FROM dmac_webapp_ui_texts WHERE code = 'game_playing'
UNION ALL
SELECT id, 'ar', 'مكتمل' FROM dmac_webapp_ui_texts WHERE code = 'game_completed_status';
