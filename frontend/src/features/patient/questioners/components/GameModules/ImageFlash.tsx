import { useState, useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import ConfirmationModal from '../../../../../components/modal/ConfirmationModal';
import type { SessionData, QuestionItem } from '../../../../../services/gameApi';
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
    isRecallOnly?: boolean;
}

const ImageFlash = ({ session, onComplete, languageCode, isRecallOnly = false }: ImageFlashProps) => {
    const { languageConstants } = useLanguageConstantContext();

    // Get all translations
    const t = {
        instructions: getLanguageText(languageConstants, 'game_instructions'),
        instruction: getLanguageText(languageConstants, 'game_instruction'),
        start: getLanguageText(languageConstants, 'game_start'),
        next: getLanguageText(languageConstants, 'game_next'),
        enterAnswers: getLanguageText(languageConstants, 'game_answer_now') || 'Answer Now', // Changed from game_enter_answers
        inputPlaceholder: getLanguageText(languageConstants, 'game_input_placeholder'),
        validationError: getLanguageText(languageConstants, 'game_validation_error'),
        answerNow: getLanguageText(languageConstants, 'game_next') || 'NEXT', // Changed from game_answer_now/ANSWER NOW
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction',
        nextEllipsis: (() => {
            const val = getLanguageText(languageConstants, 'game_next_ellipsis');
            return (!val || val === 'game_next_ellipsis') ? 'NEXT...' : val;
        })()
    };

    // Phases:
    // - instruction: initial instructions
    // - playing: images are flashing
    // - input: user enters recalled items
    // Requirement: after flashing ends, go directly to input (no intermediate screen).
    const [phase, setPhase] = useState<'instruction' | 'playing' | 'input'>('instruction');
    const [currentItemIndex, setCurrentItemIndex] = useState(0);

    // Input state - single text field for all answers
    const [inputText, setInputText] = useState('');
    const [validationError, setValidationError] = useState('');

    // Confirmation Modal State
    const [showConfirmation, setShowConfirmation] = useState(false);

    type ImageFlashItem = {
        question_item_id: number;
        image_url: string;
        image_key?: string;
        audio_url?: string;
        accepted_answers?: string;
        display_text?: string;
        order?: number;
    };

    // Construct items list from API using static images only
    const items: ImageFlashItem[] = useMemo(() => {
        const apiItems = session.questions?.[0]?.items || [];
        return apiItems.map((item, index) => {
            const key = (item.image_key || '').toLowerCase();
            console.log(`[ImageFlash] Processing item: key="${key}"`);

            // Direct lookup in IMAGE_MAP
            const mappedImage = IMAGE_MAP[key];

            if (mappedImage) {
                console.log(`[ImageFlash] Found mapping for "${key}": image=${mappedImage.substring(mappedImage.lastIndexOf('/') + 1)}`);
                return {
                    ...(item as QuestionItem),
                    image_url: mappedImage
                };
            }

            // No mapping found - use defaults from arrays by index
            console.warn(`[ImageFlash] No mapping found for "${key}", using fallback at index ${index}`);
            return {
                ...(item as QuestionItem),
                image_url: ALL_IMAGES[index % ALL_IMAGES.length]
            };
        });
    }, [session.questions]);

    const [gameItems, setGameItems] = useState<ImageFlashItem[]>([]);

    useEffect(() => {
        if (items.length > 0) {
            console.log('[ImageFlash] Session items from API:', session.questions?.[0]?.items);

            // Randomize items order
            const shuffledItems = [...items].sort(() => Math.random() - 0.5);
            console.log('[ImageFlash] Processed and Shuffled items:', shuffledItems);

            setGameItems(shuffledItems);
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
    }, [items, session.questions]);

    // Clear input when language changes
    useEffect(() => {
        setInputText('');
        setValidationError('');
    }, [languageCode]);

    const handleStart = () => {
        if (isRecallOnly) {
            setPhase('input');
        } else {
            setPhase('playing');
        }
        setCurrentItemIndex(0);
        setInputText(''); // Clear any previous answers
        setValidationError('');
    };

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        if (phase === 'playing') {
            if (currentItemIndex < gameItems.length - 1) {
                timer = setTimeout(() => {
                    setCurrentItemIndex((prev) => prev + 1);
                }, 5000);
            } else if (currentItemIndex === gameItems.length - 1) {
                timer = setTimeout(() => {
                    setPhase('input');
                }, 5000);
            }
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [phase, currentItemIndex, gameItems.length]);

    const handleSubmit = () => {
        const trimmedInput = inputText.trim().toLowerCase();

        if (!trimmedInput) {
            setShowConfirmation(true);
            return;
        }

        setValidationError(''); // Clear error
        console.log('ImageFlash submitting answers:', trimmedInput);
        onComplete(trimmedInput);
    };

    const handleConfirmSubmit = () => {
        setShowConfirmation(false);
        // Clean up empty input or just send as string
        const trimmedInput = inputText.trim().toLowerCase();
        console.log('ImageFlash submitting empty answer after confirmation');
        onComplete(trimmedInput);
    };

    const currentItem = gameItems[currentItemIndex];

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: '80vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${t.instructions}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleStart}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                audioButtonAlignment="center"
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

            {
                phase === 'input' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '600px', px: 2, pb: 25 }}>

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
                            enableModeSelection={true}
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
                                    position: 'absolute',
                                    bottom: '150px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '90%',
                                    maxWidth: '600px',
                                    zIndex: 10,
                                    backgroundColor: '#1976d2',
                                    py: 2.5,
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {t.answerNow}
                            </MorenButton>
                        </Box>
                    </Box>
                )
            }

            <ConfirmationModal
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmSubmit}
            />
        </Box >
    );
};

export default ImageFlash;
