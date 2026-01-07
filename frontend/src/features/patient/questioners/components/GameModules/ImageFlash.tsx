import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import type { SessionData } from '../../../../../services/gameApi';
import SpeechInput from '../../../../../components/SpeechInput';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';

// Assets
import Bird from '../../../../../assets/ImageRecal/bird.webp';
import Boat from '../../../../../assets/ImageRecal/boat.webp';
import Bus from '../../../../../assets/ImageRecal/bus.webp';
import Car from '../../../../../assets/ImageRecal/car.webp';
import Chair from '../../../../../assets/ImageRecal/chair.webp';
import Cow from '../../../../../assets/ImageRecal/cow.webp';
import Key from '../../../../../assets/ImageRecal/key.webp';
import Tree from '../../../../../assets/ImageRecal/tree.webp';
import Flower from '../../../../../assets/ImageRecal/flower.webp';
import Pen from '../../../../../assets/ImageRecal/pen.webp';



// Map for quick lookup - images only
const IMAGE_MAP: Record<string, string> = {
    'bird': Bird,
    'boat': Boat,
    'bus': Bus,
    'car': Car,
    'chair': Chair,
    'cow': Cow,
    'key': Key,
    'tree': Tree,
    'flower': Flower,
    'pen': Pen
};

// Fallback list if keys don't match
const ALL_IMAGES = [Bird, Boat, Bus, Car, Chair, Cow, Key, Tree, Flower, Pen];

interface ImageFlashProps {
    session: SessionData;
    onComplete: (answerText: string) => void;
    languageCode: string;
}

// Type for SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const ImageFlash = ({ session, onComplete, languageCode }: ImageFlashProps) => {
    const { languageConstants } = useLanguageConstantContext();

    // Get all translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instructions'),
        instruction: getLanguageText(languageConstants, 'game_instruction'),
        start: getLanguageText(languageConstants, 'game_start'),
        repeat: getLanguageText(languageConstants, 'game_repeat'),
        next: getLanguageText(languageConstants, 'game_next'),
        enterAnswers: getLanguageText(languageConstants, 'game_enter_answers'),
        inputPlaceholder: getLanguageText(languageConstants, 'game_input_placeholder'),
        validationError: getLanguageText(languageConstants, 'game_validation_error'),
        answerNow: getLanguageText(languageConstants, 'game_answer_now') || 'ANSWER NOW'
    };

    const [phase, setPhase] = useState<'instruction' | 'playing' | 'lastImageWithButtons' | 'beforeInput' | 'input'>('instruction');
    const [currentItemIndex, setCurrentItemIndex] = useState(0);

    // Input state - single text field for all answers
    const [inputText, setInputText] = useState('');
    const [validationError, setValidationError] = useState('');

    // Construct items list from API using static images only
    const items = (session.questions?.[0]?.items || []).map((item, index) => {
        const key = (item.image_key || '').toLowerCase();
        console.log(`[ImageFlash] Processing item: key="${key}"`);

        // Direct lookup in IMAGE_MAP
        const mappedImage = IMAGE_MAP[key];

        if (mappedImage) {
            console.log(`[ImageFlash] Found mapping for "${key}": image=${mappedImage.substring(mappedImage.lastIndexOf('/') + 1)}`);
            return {
                ...item,
                image_url: mappedImage
            };
        } else {
            // No mapping found - use defaults from arrays by index
            console.warn(`[ImageFlash] No mapping found for "${key}", using fallback at index ${index}`);
            return {
                ...item,
                image_url: ALL_IMAGES[index % ALL_IMAGES.length]
            };
        }
    });

    const [gameItems, setGameItems] = useState<any[]>([]);

    useEffect(() => {
        if (items.length > 0) {
            console.log('[ImageFlash] Session items from API:', session.questions?.[0]?.items);
            console.log('[ImageFlash] Processed items with images:', items);
            setGameItems(items);
        } else {
            // Fallback for testing or if API returns nothing
            const shuffled = [...ALL_IMAGES].sort(() => 0.5 - Math.random()).slice(0, 5);
            const dummyItems = shuffled.map((img, idx) => ({
                question_item_id: idx,
                image_url: img
            }));
            console.log('[ImageFlash] Using fallback dummy items:', dummyItems);
            setGameItems(dummyItems);
        }
    }, [session]);

    // Clear input when language changes
    useEffect(() => {
        setInputText('');
        setValidationError('');
    }, [languageCode]);

    const handleStart = () => {
        setPhase('playing');
        setCurrentItemIndex(0);
        setInputText(''); // Clear any previous answers
        setValidationError('');
    };

    useEffect(() => {
        let timer: any;
        if (phase === 'playing') {
            if (currentItemIndex < gameItems.length - 1) {
                timer = setTimeout(() => {
                    setCurrentItemIndex((prev) => prev + 1);
                }, 5000);
            } else if (currentItemIndex === gameItems.length - 1) {
                timer = setTimeout(() => {
                    setPhase('lastImageWithButtons');
                }, 5000);
            }
        }
        return () => clearTimeout(timer);
    }, [phase, currentItemIndex, gameItems.length]);

    const handleRepeat = () => {
        setInputText('');
        setValidationError('');
        handleStart();
    };

    const handleSubmit = () => {
        const trimmedInput = inputText.trim().toLowerCase();

        // Validation removed to allow empty answers
        // if (!trimmedInput) {
        //     setValidationError(t.validationError);
        //     return;
        // }

        setValidationError(''); // Clear error
        console.log('ImageFlash submitting answers:', trimmedInput);
        onComplete(trimmedInput);
    };

    const currentItem = gameItems[currentItemIndex];

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: phase === 'input' ? 'flex-start' : 'center', pt: phase === 'input' ? 4 : 0 }}>
            <GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${t.instructions}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleStart}
                enableAudio={true}
                instructionText={session.instructions || session.questions?.[0]?.prompt_text || ''}
                languageCode={languageCode}
            >
                <Typography>{session.instructions || session.questions?.[0]?.prompt_text}</Typography>
            </GenericModal>

            {phase === 'playing' && currentItem && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <Box
                        component="img"
                        src={currentItem.image_url}
                        alt="Recall Item"
                        sx={{ maxWidth: '80%', maxHeight: '60vh', objectFit: 'contain' }}
                    />
                </Box>
            )}

            {/* Last image with REPEAT and NEXT buttons */}
            {phase === 'lastImageWithButtons' && gameItems[gameItems.length - 1] && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <Box
                        component="img"
                        src={gameItems[gameItems.length - 1].image_url}
                        alt="Recall Item"
                        sx={{ maxWidth: '80%', maxHeight: '60vh', objectFit: 'contain', mb: 4 }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <MorenButton
                            variant="contained"
                            onClick={() => {
                                setCurrentItemIndex(0);
                                setPhase('playing');
                            }}
                            sx={{
                                backgroundColor: '#3f51b5',
                                width: '120px',
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {t.repeat}
                        </MorenButton>

                        <MorenButton
                            variant="contained"
                            onClick={() => setPhase('beforeInput')}
                            sx={{
                                backgroundColor: '#3f51b5',
                                minWidth: '160px',
                                px: 2,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {t.answerNow}
                        </MorenButton>
                    </Box>
                </Box>
            )
            }

            {/* Instruction before input - from backend */}
            <GenericModal
                isOpen={phase === 'beforeInput'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${t.instruction}`}
                hideCancelButton={true}
                submitButtonText={t.answerNow}
                onSubmit={() => setPhase('input')}
                enableAudio={true}
                instructionText={session.questions?.[0]?.prompt_text || ''}
                languageCode={languageCode}
            >
                <Typography sx={{ color: '#d32f2f', fontSize: '1.1rem' }}>
                    {session.questions?.[0]?.prompt_text}
                </Typography>
            </GenericModal>

            {
                phase === 'input' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '600px', px: 2 }}>

                        <Typography variant="h6" sx={{ textAlign: 'center', color: '#666' }}>{t.enterAnswers}</Typography>

                        <SpeechInput
                            fullWidth
                            value={inputText}
                            onChange={(value) => {
                                setInputText(value);
                                setValidationError(''); // Clear error when typing
                            }}
                            onSpeechResult={(transcript) => {
                                // Append to existing text with space (no comma)
                                const currentText = inputText.trim();
                                const newText = currentText
                                    ? `${currentText} ${transcript.toLowerCase()}`
                                    : transcript.toLowerCase();
                                setInputText(newText);
                                setValidationError(''); // Clear error when speaking
                            }}
                            languageCode={languageCode}
                            placeholder={t.inputPlaceholder}
                        />

                        {/* Validation Error Message */}
                        {validationError && (
                            <Typography
                                sx={{
                                    color: '#d32f2f',
                                    fontSize: '0.875rem',
                                    textAlign: 'center',
                                    fontWeight: 500
                                }}
                            >
                                {validationError}
                            </Typography>
                        )}

                        {/* Navigation Buttons */}

                        <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <MorenButton
                                variant="contained"
                                onClick={handleSubmit}
                                sx={{
                                    backgroundColor: '#1976d2',
                                    width: '100%',
                                    py: 1.5,
                                    fontSize: '1.1rem'
                                }}
                            >
                                {t.answerNow}
                            </MorenButton>
                        </Box>
                    </Box>
                )}
        </Box>
    );
};

export default ImageFlash;
