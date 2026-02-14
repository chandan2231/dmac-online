import { useState, useEffect, useCallback, useRef } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import MorenButton from '../button';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';

interface TextToSpeechProps {
    text: string;
    languageCode: string;
    iconSize?: 'small' | 'medium' | 'large';
    color?: string;
    label?: string;
}

const TextToSpeech = ({ text, languageCode, iconSize = 'medium', color = 'primary', label }: TextToSpeechProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

    // Map language codes to Speech Synthesis language codes
    const getVoiceLang = useCallback((code: string): string => {
        const cleanCode = code.toLowerCase().trim();
        const langMap: Record<string, string> = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'es': 'es-ES',
            'ar': 'ar-XA', // Google Cloud Text-to-Speech Modern Standard Arabic
            'zh': 'zh-CN',
            'uk': 'en-GB'
        };
        return langMap[cleanCode] || (cleanCode.includes('-') ? cleanCode : 'en-US');
    }, []);

    // Voice selection logic optimized for speed by running once
    const findBestVoice = useCallback((voices: SpeechSynthesisVoice[], targetLang: string) => {
        // 1. Exact match
        let selected = voices.find(v => v.lang === targetLang);

        // 2. Base language match
        if (!selected) {
            const baseLang = targetLang.split('-')[0];
            selected = voices.find(v => v.lang.startsWith(baseLang));
        }

        // 3. Fallback for specific languages like Arabic/Hindi
        if (!selected) {
            const lowerTarget = targetLang.toLowerCase();
            selected = voices.find(v => {
                const lowerName = v.name.toLowerCase();
                const lowerVoiceLang = v.lang.toLowerCase();

                // Advanced Arabic Detection for Google Voices
                if (lowerTarget.startsWith('ar')) {
                    return lowerVoiceLang.includes('ar-xa') ||
                        lowerVoiceLang.includes('ar-eg') ||
                        lowerName.includes('ar-xa') ||
                        lowerName.includes('arabic') ||
                        lowerName.includes('العربية');
                }

                if (lowerTarget.startsWith('hi') && (lowerName.includes('hindi') || lowerVoiceLang.startsWith('hi'))) return true;
                return false;
            });
        }

        return selected || null;
    }, []);


    const updateVoice = useCallback(() => {
        if (!window.speechSynthesis) return;
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            const targetLang = getVoiceLang(languageCode);
            voiceRef.current = findBestVoice(voices, targetLang);
        }
    }, [languageCode, getVoiceLang, findBestVoice]);

    useEffect(() => {
        if (!window.speechSynthesis) return;

        // Initial load
        updateVoice();

        // Chrome and others might load voices asynchronously
        window.speechSynthesis.onvoiceschanged = updateVoice;

        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, [updateVoice]);

    const handleSpeak = () => {
        if (!window.speechSynthesis) return;

        // Instant cancel for high responsiveness
        window.speechSynthesis.cancel();

        if (isPlaying) {
            setIsPlaying(false);
            return;
        }

        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const lang = getVoiceLang(languageCode);
        utterance.lang = lang;

        // DEBUG LOGGING
        console.log('[TTS Debug] ----------------------------------------------');
        console.log('[TTS Debug] Requesting lang:', languageCode, 'Mapped to:', lang);
        console.log('[TTS Debug] Text preview:', text.substring(0, 50) + '...');

        // Fallback: If voiceRef is null, try finding voice one last time (e.g. if loaded late)
        if (!voiceRef.current) {
            const voices = window.speechSynthesis.getVoices();
            console.log('[TTS Debug] Late voice check. Found:', voices.length, 'voices');
            if (voices.length > 0) {
                // Log ALL voices to see what we actually have
                console.log('[TTS Debug] ALL VOICES:', voices.map(v => `${v.name} (${v.lang})`));
                voiceRef.current = findBestVoice(voices, lang);
            }
        }

        if (voiceRef.current) {
            console.log('[TTS Debug] ✅ Using voice:', voiceRef.current.name, voiceRef.current.lang);
            utterance.voice = voiceRef.current;
        } else {
            console.warn('[TTS Debug] ⚠️ No specific voice found for:', lang);
            if (languageCode.toLowerCase().startsWith('ar')) {
                console.log('[TTS Debug] Forcing generic "ar" lang fallback for Arabic');
                utterance.lang = 'ar';
            }
        }

        // Production settings for clear speech - adjusted to 0.8 for elderly users
        utterance.rate = 0.8;
        utterance.pitch = 1;

        utterance.onstart = () => {
            console.log('[TTS Debug] Speech event: START');
            setIsPlaying(true);
        };
        utterance.onend = () => {
            console.log('[TTS Debug] Speech event: END');
            setIsPlaying(false);
        };
        utterance.onerror = (event) => {
            console.error('[TTS Debug] Speech event: ERROR', event.error, event);
            // Successive clicks trigger 'interrupted' error which we ignore
            if (event.error !== 'interrupted') {
                setIsPlaying(false);
            }
        };

        console.log('[TTS Debug] Calling window.speechSynthesis.speak()...');
        window.speechSynthesis.speak(utterance);
    };

    // Global cleanup
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const ButtonComponent = label ? (
        <Tooltip title={isPlaying ? "Stop audio" : "Play instruction audio"}>
            <MorenButton
                onClick={handleSpeak}
                variant="outlined"
                startIcon={isPlaying ? <StopIcon /> : <VolumeUpIcon />}
                sx={{
                    color: color === 'primary' ? '#1976d2' : 'inherit',
                    borderColor: color === 'primary' ? '#1976d2' : 'inherit',
                    transition: 'all 0.2s',
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                    padding: '6px 16px', // Slightly smaller padding
                    '& .MuiButton-startIcon': {
                        marginLeft: 0,
                        marginRight: '10px',
                    },
                    '&:hover': {
                        transform: 'scale(1.02)',
                        backgroundColor: color === 'primary' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(255, 255, 255, 0.08)'
                    }
                }}
            >
                {label}
            </MorenButton>
        </Tooltip>
    ) : (
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

    return ButtonComponent;
};

export default TextToSpeech;
