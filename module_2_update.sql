-- Update Module 2 Name and Description (English)
UPDATE modules 
SET name = 'Image display',
    description = 'The image will be displayed for 5 seconds, select the same image from the choices in the next screen.'
WHERE id = 2;

-- Update Module 2 I18N Name and Description

-- English
UPDATE modules_i18n 
SET name = 'Image display',
    description = 'The image will be displayed for 5 seconds, select the same image from the choices in the next screen.'
WHERE module_id = 2 AND language_code = 'en';

-- Hindi
UPDATE modules_i18n 
SET name = 'छवि प्रदर्शन',
    description = 'छवि 5 सेकंड के लिए प्रदर्शित की जाएगी, अगली स्क्रीन में विकल्पों में से उसी छवि का चयन करें।'
WHERE module_id = 2 AND language_code = 'hi';

-- Spanish
UPDATE modules_i18n 
SET name = 'Visualización de imagen',
    description = 'La imagen se mostrará durante 5 segundos, seleccione la misma imagen de las opciones en la siguiente pantalla.'
WHERE module_id = 2 AND language_code = 'es';

-- Arabic
UPDATE modules_i18n 
SET name = 'عرض الصورة',
    description = 'سيتم عرض الصورة لمدة 5 ثوانٍ، حدد نفس الصورة من الخيارات في الشاشة التالية.'
WHERE module_id = 2 AND language_code = 'ar';
