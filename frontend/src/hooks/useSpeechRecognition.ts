import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseSpeechRecognitionOptions {
    languageCode?: string;
    onResult?: (text: string) => void;
    onError?: (msg: string) => void;
}

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

export const useSpeechRecognition = (
    options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {

    const { languageCode = 'en-US', onResult, onError } = options;

    const RecognitionCtor = useMemo(() => {
        return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    }, []);

    const recognitionRef = useRef<any>(null);
    const isStartingRef = useRef(false);
    const isListeningRef = useRef(false); // Track listening state synchronously for event handlers
    const transcriptRef = useRef(''); // Track transcript synchronously for stop saving
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);

    const browserSupportsSpeechRecognition = Boolean(RecognitionCtor);

    const savedCallbacks = useRef({ onResult, onError });
    useEffect(() => {
        savedCallbacks.current = { onResult, onError };
    }, [onResult, onError]);

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            onError?.('Speech Recognition not supported in this browser');
            return;
        }

        const recognition = new RecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = languageCode;

        recognition.onstart = () => {
            isStartingRef.current = false;
            isListeningRef.current = true;
            setIsListening(true);
        };
        recognition.onend = () => {
            isStartingRef.current = false;
            isListeningRef.current = false;
            setIsListening(false);
        };
        recognition.onerror = (event: any) => {
            // Don't log or report 'aborted' errors - these are expected from our cleanup
            if (event?.error === 'aborted') {
                // Reset flags when error occurs
                isStartingRef.current = false;
                isListeningRef.current = false;
                setIsListening(false);
                return;
            }

            console.log('Speech recognition error', event);

            // Reset flags when error occurs  
            isStartingRef.current = false;
            isListeningRef.current = false;
            setIsListening(false);

            savedCallbacks.current.onError?.(
                'Speech recognition error: ' + (event?.error || 'Unknown error')
            );
        };

        recognition.onresult = (event: any) => {
            // Safety check: use refs for immediate state access
            // This prevents "ghost typing" after clicking stop but allows valid speech
            if (!isListeningRef.current && !isStartingRef.current) {
                return;
            }

            let interimText = '';
            let finalText = '';

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const result = event.results[i];
                const text = result?.[0]?.transcript ?? '';
                if (result?.isFinal) {
                    finalText += text;
                } else {
                    interimText += text;
                }
            }

            const nextTranscript = (interimText || finalText).trim();
            if (nextTranscript) {
                setTranscript(nextTranscript);
                transcriptRef.current = nextTranscript;
            }

            const trimmedFinal = finalText.trim();
            if (trimmedFinal) {
                savedCallbacks.current.onResult?.(trimmedFinal);
                setTranscript('');
                transcriptRef.current = '';
            }
        };

        recognitionRef.current = recognition;

        return () => {
            try {
                recognition.stop();
            } catch {
                // ignore
            }
            recognitionRef.current = null;
        };
    }, [RecognitionCtor, browserSupportsSpeechRecognition, languageCode, onError, onResult]);

    const startListening = useCallback(() => {
        if (!browserSupportsSpeechRecognition) {
            onError?.('Speech Recognition not supported');
            return;
        }

        const recognition = recognitionRef.current;
        if (!recognition) {
            onError?.('Speech Recognition not initialized');
            return;
        }

        // Prevent double-start
        if (isStartingRef.current) {
            console.log('Recognition already starting');
            return;
        }

        // Always abort before starting to ensure clean state
        try {
            recognition.abort();
        } catch {
            // ignore - recognition might not be running
        }

        recognition.lang = languageCode;
        isStartingRef.current = true;

        // Small delay to let browser fully reset after abort
        setTimeout(() => {
            try {
                recognition.start();
            } catch (e) {
                console.warn('Error starting recognition:', e);
                isStartingRef.current = false;
                isListeningRef.current = false;
                setIsListening(false);
            }
        }, 50);
    }, [browserSupportsSpeechRecognition, languageCode, onError]);

    const stopListening = useCallback(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        // Save any pending transcript before clearing
        if (transcriptRef.current) {
            savedCallbacks.current.onResult?.(transcriptRef.current);
        }

        // Immediately update state to reflect stopping
        isListeningRef.current = false;
        setIsListening(false);
        setTranscript('');
        transcriptRef.current = '';

        try {
            recognition.stop();
        } catch (e) {
            console.warn('Error stopping recognition, trying abort:', e);
            // If stop() fails, try abort() as a more forceful method
            try {
                recognition.abort();
            } catch {
                // ignore
            }
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
    };
};
