import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import type { SessionData } from '../../../../../services/gameApi';
import AudioPlayer from './Shared/AudioPlayer';
import SpeechInput from '../../../../../components/SpeechInput';

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
import AudioFile from '../../../../../assets/ImageRecal/forAll.mp3';

// Map for quick lookup if we want to match API keys
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
    const [phase, setPhase] = useState<'instruction' | 'playing' | 'lastImageWithButtons' | 'beforeInput' | 'input'>('instruction');
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // Input state - single text field for all answers
    const [inputText, setInputText] = useState('');
    const [validationError, setValidationError] = useState('');

    // Configuration: Set to false when images are uploaded to S3
    const USE_STATIC_IMAGES = true; // TODO: Change to false once S3 images are ready

    // Construct items list from API but override URLs if using static images
    const items = (session.question?.items || []).map((item, index) => {
        if (USE_STATIC_IMAGES) {
            // STATIC MODE: Use local images
            const key = (item.image_key || '').toLowerCase();

            // Robust fallback
            const localImg = IMAGE_MAP[key] ||
                IMAGE_MAP[Object.keys(IMAGE_MAP).find(k => key.includes(k)) || ''] ||
                ALL_IMAGES[index % ALL_IMAGES.length];

            return {
                ...item,
                image_url: localImg,      // Use local static image
                audio_url: AudioFile      // Use local static audio
            };
        } else {
            // API MODE: Use URLs from backend (S3)
            return {
                ...item,
                image_url: item.image_url,  // Use API URL
                audio_url: item.audio_url   // Use API URL
            };
        }
    });

    const [gameItems, setGameItems] = useState<any[]>([]);

    useEffect(() => {
        if (items.length > 0) {
            setGameItems(items);
        } else {
            // Fallback for testing or if API returns nothing
            const shuffled = [...ALL_IMAGES].sort(() => 0.5 - Math.random()).slice(0, 5);
            const dummyItems = shuffled.map((img, idx) => ({
                question_item_id: idx,
                image_url: img,
                audio_url: AudioFile
            }));
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
        setIsPlayingAudio(true);
        setInputText(''); // Clear any previous answers
        setValidationError('');
    };

    const handleAudioEnded = () => {
        setIsPlayingAudio(false);
    };

    useEffect(() => {
        let timer: any;
        if (phase === 'playing') {
            if (currentItemIndex < gameItems.length - 1) {
                setIsPlayingAudio(true);
                timer = setTimeout(() => {
                    setCurrentItemIndex((prev) => prev + 1);
                }, 5000);
            } else if (currentItemIndex === gameItems.length - 1) {
                setIsPlayingAudio(true);
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

        // Validation
        if (!trimmedInput) {
            setValidationError('Please enter at least one answer before submitting.');
            return;
        }

        setValidationError(''); // Clear error
        console.log('ImageFlash submitting answers:', trimmedInput);
        onComplete(trimmedInput);
    };

    const currentItem = gameItems[currentItemIndex];

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: phase === 'playing' ? 'center' : 'flex-start', pt: phase === 'input' ? 4 : 0 }}>
            <GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }}
                title="Instructions"
                hideCancelButton={true}
                submitButtonText="Start"
                onSubmit={handleStart}
            >
                <Typography>{session.instructions || session.question?.prompt_text}</Typography>
            </GenericModal>

            {phase === 'playing' && currentItem && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                        component="img"
                        src={currentItem.image_url}
                        alt="Recall Item"
                        sx={{ maxWidth: '80%', maxHeight: '60vh', objectFit: 'contain' }}
                    />
                    {/* Always play the override audio */}
                    <AudioPlayer
                        src={currentItem.audio_url}
                        play={isPlayingAudio}
                        onEnded={handleAudioEnded}
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
                            REPEAT
                        </MorenButton>

                        <MorenButton
                            variant="contained"
                            onClick={() => setPhase('beforeInput')}
                            sx={{
                                backgroundColor: '#3f51b5',
                                width: '120px',
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            NEXT
                        </MorenButton>
                    </Box>
                </Box>
            )}

            {/* Instruction before input - from backend */}
            <GenericModal
                isOpen={phase === 'beforeInput'}
                onClose={() => { }}
                title="Instruction"
                hideCancelButton={true}
                submitButtonText="Next"
                onSubmit={() => setPhase('input')}
            >
                <Typography sx={{ color: '#d32f2f', fontSize: '1.1rem' }}>
                    {session.question?.prompt_text || 'Please recall the pictures you have been asked to remember.'}
                </Typography>
            </GenericModal>

            {phase === 'input' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '600px', px: 2 }}>

                    <Typography variant="h6" sx={{ textAlign: 'center', color: '#666' }}>Enter Answers</Typography>

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
                        placeholder="Enter answers separated by spaces (e.g., bird car tree)"
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
                            NEXT
                        </MorenButton>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default ImageFlash;
