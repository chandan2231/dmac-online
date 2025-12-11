import { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton, Chip } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import type { SessionData } from '../../../../../services/gameApi'; // Adjusted path
import AudioPlayer from './Shared/AudioPlayer';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

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

    // Input state
    const [inputText, setInputText] = useState('');
    const [collectedAnswers, setCollectedAnswers] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = useRef<any>(null);
    const isInitializedRef = useRef(false);

    // Construct items list from API but override URLs
    const items = (session.question?.items || []).map((item, index) => {
        // Try to find image by key (lowercase)
        const key = (item.image_key || '').toLowerCase();

        // Robust fallback
        const localImg = IMAGE_MAP[key] ||
            IMAGE_MAP[Object.keys(IMAGE_MAP).find(k => key.includes(k)) || ''] ||
            ALL_IMAGES[index % ALL_IMAGES.length];

        return {
            ...item,
            image_url: localImg, // Force local image
            audio_url: AudioFile // Force local audio
        };
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

    // Initialize speech recognition once
    useEffect(() => {
        if (isInitializedRef.current) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = languageCode || 'en-US';

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (interimTranscript) {
                    setInputText(interimTranscript);
                }

                if (finalTranscript) {
                    const text = finalTranscript.trim();
                    if (text && !collectedAnswers.includes(text.toUpperCase())) {
                        setCollectedAnswers(prev => [...prev, text.toUpperCase()]);
                        setInputText('');
                    }
                }
            };

            recognition.onend = () => {
                if (isListening) {
                    setTimeout(() => {
                        try {
                            recognition.start();
                        } catch (e) {
                            console.log("Recognition restart skipped");
                        }
                    }, 100); // Small delay before restart
                }
            };

            recognition.onerror = (event: any) => {
                console.log("Speech recognition error:", event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    alert('Microphone access denied. Please enable microphone permissions.');
                    setIsListening(false);
                } else if (event.error === 'aborted') {
                    // Common when recognition restarts, just log it
                    console.log('Recognition aborted (normal during restart)');
                } else if (event.error === 'no-speech') {
                    console.log('No speech detected, waiting...');
                }
            };

            recognitionRef.current = recognition;
            isInitializedRef.current = true;
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, [languageCode]);

    // Toggle listening
    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition not available in this browser');
            return;
        }

        if (isListening) {
            setIsListening(false);
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.log('Stop failed:', e);
            }
        } else {
            setIsListening(true);
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Start failed", e);
                setIsListening(false);
            }
        }
    };

    const addAnswer = (text: string) => {
        if (text && !collectedAnswers.includes(text.toUpperCase())) {
            setCollectedAnswers(prev => [...prev, text.toUpperCase()]);
            setInputText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addAnswer(inputText);
        }
    };

    const handleRemoveAnswer = (answer: string) => {
        setCollectedAnswers(prev => prev.filter(a => a !== answer));
    };

    const handleStart = () => {
        setPhase('playing');
        setCurrentItemIndex(0);
        setIsPlayingAudio(true); // Start audio for first item
    };

    const handleAudioEnded = () => {
        setIsPlayingAudio(false);
    };

    useEffect(() => {
        let timer: any;
        if (phase === 'playing') {
            if (currentItemIndex < gameItems.length - 1) {
                // Not the last image yet - continue auto-advancing
                setIsPlayingAudio(true);

                timer = setTimeout(() => {
                    setCurrentItemIndex((prev) => prev + 1);
                }, 5000); // 5 seconds per image
            } else if (currentItemIndex === gameItems.length - 1) {
                // This is the last image - play audio and then show buttons
                setIsPlayingAudio(true);

                timer = setTimeout(() => {
                    setPhase('lastImageWithButtons');
                }, 5000); // Wait 5 seconds then show buttons
            }
        }
        return () => clearTimeout(timer);
    }, [phase, currentItemIndex, gameItems.length]);

    const handleRepeat = () => {
        setCollectedAnswers([]);
        handleStart();
    };

    const handleSubmit = () => {
        onComplete(collectedAnswers.join(', '));
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

                    <TextField
                        fullWidth
                        placeholder="Enter Answers"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={toggleListening} edge="end">
                                        {isListening ? <MicIcon color="primary" /> : <MicOffIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Collected Answers (Chips/Buttons) */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', minHeight: '100px' }}>
                        {collectedAnswers.map((answer, idx) => (
                            <Chip
                                key={idx}
                                label={answer}
                                onDelete={() => handleRemoveAnswer(answer)}
                                sx={{
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    borderRadius: '4px',
                                    '& .MuiChip-deleteIcon': {
                                        color: 'white',
                                        '&:hover': { color: '#e0e0e0' }
                                    }
                                }}
                            />
                        ))}
                    </Box>

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
