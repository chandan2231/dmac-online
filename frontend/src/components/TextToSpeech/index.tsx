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
        // Normalize code to lower case
        const cleanCode = code.toLowerCase().trim();
        const langMap: Record<string, string> = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'es': 'es-ES',
            'ar': 'ar-SA',
            'zh': 'zh-CN',
            'uk': 'en-GB' // Example for potential fallback
        };
        // Return mapped code, or if it's already a full code like 'ar-SA', return it, else default to 'en-US'
        return langMap[cleanCode] || (cleanCode.includes('-') ? cleanCode : 'en-US');
    };

    // Load voices on mount (needed for some browsers)
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                console.log('[TextToSpeech] Voices loaded:', voices.length);
            }
        };

        if (window.speechSynthesis) {
            // Load voices immediately
            loadVoices();
            // Some browsers need this event listener
            window.speechSynthesis.onvoiceschanged = () => {
                loadVoices();
            };
        }
    }, []);

    const handleSpeak = () => {
        // Always cancel pending speech first to clear queue/wake up engine
        window.speechSynthesis.cancel();

        if (isPlaying) {
            // If was playing, we just stopped it above. update state.
            setIsPlaying(false);
            return;
        }

        if (!text || !window.speechSynthesis) {
            console.warn('Speech synthesis not supported or no text provided');
            alert('Text-to-speech is not supported in your browser');
            return;
        }

        // Get the target language (e.g., 'ar-SA' or 'en-US')
        let targetLang = getVoiceLang(languageCode);

        // Specific fix: If input code is just 'ar', ensure we aim for Arabic
        if (languageCode.toLowerCase() === 'ar') {
            targetLang = 'ar-SA';
        }

        // Get all available voices
        const voices = window.speechSynthesis.getVoices();

        // Debugging logs
        console.group('[TextToSpeech Debug]');
        console.log('Language Code Prop:', languageCode);
        console.log('Target Lang:', targetLang);
        console.log('Available Voices Count:', voices.length);

        // improved voice selection logic
        let selectedVoice: SpeechSynthesisVoice | undefined;

        // 1. Try exact match on full lang code (e.g. 'ar-SA' === 'ar-SA')
        selectedVoice = voices.find(voice => voice.lang === targetLang);
        if (selectedVoice) console.log('Match Strategy 1 (Exact):', selectedVoice.name);

        // 2. Try match on base language (e.g. 'ar' in 'ar-EG')
        if (!selectedVoice) {
            const baseLang = targetLang.split('-')[0]; // 'ar'
            selectedVoice = voices.find(voice => voice.lang.startsWith(baseLang));
            if (selectedVoice) console.log('Match Strategy 2 (Base Lang):', selectedVoice.name);
        }

        // 3. Fallback: Search for language name in voice name (e.g. "Google Ar..." or "Arabic")
        if (!selectedVoice && targetLang.startsWith('ar')) {
            selectedVoice = voices.find(voice =>
                voice.name.toLowerCase().includes('google ar') ||
                voice.name.toLowerCase().includes('arabic') ||
                voice.lang.includes('ar-')
            );
            if (selectedVoice) console.log('Match Strategy 3 (Name Search):', selectedVoice.name);
        }

        // 4. Verification: If we still picked a voice that doesn't start with 'ar', and we wanted 'ar', warn user
        if (targetLang.startsWith('ar') && selectedVoice && !selectedVoice.lang.startsWith('ar')) {
            console.warn('[TextToSpeech] Warning: Wanted Arabic but got non-Arabic voice:', selectedVoice.lang);
            // Should we force undefined to let browser try its own fallback? 
            // continued...
        }

        if (!selectedVoice) {
            console.warn(`[TextToSpeech] No specific voice found for ${targetLang}, relying on browser default for lang.`);
        } else {
            console.log(`[TextToSpeech] Final Selected Voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        }
        console.groupEnd();

        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang; // Important: set this even if voice is null

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // Adjust properties for better Arabic playback if needed
        utterance.rate = 0.85; // Slightly slower
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
