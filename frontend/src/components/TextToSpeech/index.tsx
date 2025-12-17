import { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';

interface TextToSpeechProps {
    text: string;
    languageCode: string;
    iconSize?: 'small' | 'medium' | 'large';
    color?: string;
}

const TextToSpeech = ({ text, languageCode, iconSize = 'medium', color = 'primary' }: TextToSpeechProps) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Map language codes to Speech Synthesis language codes
    const getVoiceLang = (code: string): string => {
        const langMap: Record<string, string> = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'es': 'es-ES',
            'ar': 'ar-SA',
            'zh': 'zh-CN'
        };
        return langMap[code] || 'en-US';
    };

    // Load voices on mount (needed for some browsers)
    useEffect(() => {
        if (window.speechSynthesis) {
            // Load voices
            window.speechSynthesis.getVoices();

            // Some browsers need this event listener
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

    const handleSpeak = () => {
        if (isPlaying) {
            // Stop current speech
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        if (!text || !window.speechSynthesis) {
            console.warn('Speech synthesis not supported or no text provided');
            alert('Text-to-speech is not supported in your browser');
            return;
        }

        // Get the target language
        const targetLang = getVoiceLang(languageCode);

        // Get all available voices
        const voices = window.speechSynthesis.getVoices();
        console.log('[TextToSpeech] Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        console.log('[TextToSpeech] Target language:', targetLang, 'from code:', languageCode);

        // Try to find a voice that matches the target language
        let selectedVoice = voices.find(voice => voice.lang.startsWith(targetLang.split('-')[0]));

        if (!selectedVoice) {
            console.warn(`[TextToSpeech] No voice found for ${targetLang}, using default`);
        } else {
            console.log('[TextToSpeech] Selected voice:', selectedVoice.name, selectedVoice.lang);
        }

        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang;
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;

        // Event handlers
        utterance.onstart = () => {
            console.log('[TextToSpeech] Speech started');
            setIsPlaying(true);
        };
        utterance.onend = () => {
            console.log('[TextToSpeech] Speech ended');
            setIsPlaying(false);
        };
        utterance.onerror = (event) => {
            console.error('[TextToSpeech] Speech error:', event);
            setIsPlaying(false);
            if (event.error === 'not-allowed') {
                alert('Please allow audio playback in your browser settings');
            }
        };

        // Speak
        window.speechSynthesis.speak(utterance);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return (
        <Tooltip title={isPlaying ? "Stop audio" : "Play instruction audio"}>
            <IconButton
                onClick={handleSpeak}
                size={iconSize}
                aria-label={isPlaying ? "stop instruction audio" : "play instruction audio"}
                sx={{
                    color: color === 'primary' ? '#1976d2' : 'inherit',
                    transition: 'all 0.2s',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        backgroundColor: color === 'primary' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(255, 255, 255, 0.08)'
                    }
                }}
            >
                {isPlaying ? <StopIcon /> : <VolumeUpIcon />}
            </IconButton>
        </Tooltip>
    );
};

export default TextToSpeech;
