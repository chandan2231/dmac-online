import { db } from '../connect.js'

export const getGameInstructions = (req, res) => {
  const languageCode = req.query.language_code || 'en'

  // Instructions hardcoded as they are not present in the provided DB schema
  const instructions = {
    en: {
      title: 'Before starting the game',
      instructions: [
        'You will be shown different types of games.',
        'Read or listen to the instructions for each game carefully.',
        'Ask staff for help if needed.'
      ]
    },
    hi: {
      title: 'खेल शुरू होने से पहले',
      instructions: [
        'आपको अलग-अलग प्रकार के खेल दिखाए जाएंगे।',
        'हर खेल में दिए गए निर्देश को ध्यान से पढ़ें या सुनें।',
        'कोई दिक्कत हो तो स्टाफ से मदद लें।'
      ]
    }
  }

  // Fallback to English if language not found
  const data = instructions[languageCode] || instructions['en']

  res.json({
    language_code: languageCode,
    title: data.title,
    instructions: data.instructions
  })
}

