-- Insert 'dmac_pre_test' into dmac_webapp_page with explicit ID 4
INSERT INTO dmac_webapp_page (id, page_key) VALUES (4, 'dmac_pre_test');

-- English (en) - ID 18
INSERT INTO dmac_webapp_page_translations (id, page_id, language_code, title, content, button_text)
VALUES (18, 4, 'en', 'Pre S-DMAC AI 5.0 Test', '<p>You are taking the Pre S-DMAC test.</p><p>Post S-DMAC test is the final test after your LICCA Brain Training.</p>', 'START');

-- Hindi (hi) - ID 19
INSERT INTO dmac_webapp_page_translations (id, page_id, language_code, title, content, button_text)
VALUES (19, 4, 'hi', 'प्री S-DMAC AI 5.0 टेस्ट', '<p>आप प्री S-DMAC टेस्ट ले रहे हैं।</p><p>पोस्ट S-DMAC टेस्ट आपके LICCA ब्रेन ट्रेनिंग के बाद अंतिम टेस्ट है।</p>', 'शुरू करें');

-- Spanish (es) - ID 20
INSERT INTO dmac_webapp_page_translations (id, page_id, language_code, title, content, button_text)
VALUES (20, 4, 'es', 'Prueba Pre S-DMAC AI 5.0', '<p>Usted está tomando la prueba Pre S-DMAC.</p><p>La prueba Post S-DMAC es la prueba final después de su entrenamiento cerebral LICCA.</p>', 'COMENZAR');

-- Arabic (ar) - ID 21
INSERT INTO dmac_webapp_page_translations (id, page_id, language_code, title, content, button_text)
VALUES (21, 4, 'ar', 'اختبار ما قبل S-DMAC AI 5.0', '<p>أنت تقوم بإجراء اختبار ما قبل S-DMAC.</p><p>اختبار ما بعد S-DMAC هو الاختبار النهائي بعد تدريب الدماغ LICCA الخاص بك.</p>', 'ابدأ');

-- Chinese (zh) - ID 22
INSERT INTO dmac_webapp_page_translations (id, page_id, language_code, title, content, button_text)
VALUES (22, 4, 'zh', 'Pre S-DMAC AI 5.0 测试', '<p>您正在参加 Pre S-DMAC 测试。</p><p>Post S-DMAC 测试是您完成 LICCA 大脑训练后的最终测试。</p>', '开始');
