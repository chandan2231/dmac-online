import { db } from './connect.js';

const run = async () => {
    try {
        console.log('Starting database update...');

        // Check if key already exists to avoid duplicates
        const [existing] = await db.promise().query(
            "SELECT id FROM dmac_webapp_ui_texts WHERE code = ?",
            ['game_next_ellipsis']
        );

        let newId;

        if (existing.length > 0) {
            newId = existing[0].id;
            console.log(`Key 'game_next_ellipsis' already exists with ID: ${newId}. Skipping insert.`);
        } else {
            // 1. Insert UI Text
            const [result] = await db.promise().query(
                "INSERT INTO dmac_webapp_ui_texts (code, status) VALUES (?, ?)",
                ['game_next_ellipsis', 1]
            );
            newId = result.insertId;
            console.log(`Inserted 'game_next_ellipsis' with ID: ${newId}`);
        }

        // 2. Insert Translations (ignore if exists or use replace/on duplicate key update)
        // For simplicity, we will delete existing translations for this ID and re-insert
        await db.promise().query("DELETE FROM dmac_webapp_ui_text_translations WHERE ui_text_id = ?", [newId]);

        const values = [
            [newId, 'en', 'NEXT...'],
            [newId, 'es', 'SIGUIENTE...'],
            [newId, 'ar', 'التالي...'],
            [newId, 'hi', 'आगे...']
        ];

        await db.promise().query(
            "INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text) VALUES ?",
            [values]
        );
        console.log('Inserted/Updated translations successfully.');

        process.exit(0);
    } catch (error) {
        console.error('Error updating database:', error);
        process.exit(1);
    }
};

run();
