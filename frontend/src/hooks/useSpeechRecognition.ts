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
    const isListeningRef = useRef(false);
    const transcriptRef = useRef('');
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);

    const browserSupportsSpeechRecognition = Boolean(RecognitionCtor);

    const savedCallbacks = useRef({ onResult, onError });
    useEffect(() => {
        savedCallbacks.current = { onResult, onError };
    }, [onResult, onError]);

    const setupRecognition = useCallback((recognition: any) => {
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        // Configuration for stability
        recognition.continuous = !isSafari; // Safari is unstable with continuous: true
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
            console.error('[SpeechRecognition] Error event:', event.error, event.message);

            isStartingRef.current = false;
            isListeningRef.current = false;
            setIsListening(false);

            if (event.error === 'aborted') {
                return; // Ignore common 'aborted' / 'no-speech' resets
            }

            savedCallbacks.current.onError?.(event.error || 'Speech recognition error');
        };

        recognition.onresult = (event: any) => {
            if (!isListeningRef.current && !isStartingRef.current) return;

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

            const currentTranscript = (interimText || finalText).trim();
            if (currentTranscript) {
                setTranscript(currentTranscript);
                transcriptRef.current = currentTranscript;
            }

            const trimmedFinal = finalText.trim();
            if (trimmedFinal) {
                savedCallbacks.current.onResult?.(trimmedFinal);
                setTranscript('');
                transcriptRef.current = '';
            }
        };
    }, [languageCode]);

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) return;

        const recognition = new RecognitionCtor();
        setupRecognition(recognition);
        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch { }
                recognitionRef.current = null;
            }
        };
    }, [RecognitionCtor, browserSupportsSpeechRecognition, setupRecognition]);

    const startListening = useCallback(() => {
        if (!browserSupportsSpeechRecognition) {
            onError?.('Speech Recognition not supported');
            return;
        }

        // Prevent double initiation
        if (isStartingRef.current || isListeningRef.current) {
            return;
        }

        let recognition = recognitionRef.current;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        // Safari robustness: Re-create if missing or recreate anyway to ensure fresh context
        if (isSafari || !recognition) {
            if (recognition) { try { recognition.abort(); } catch { } }
            recognition = new RecognitionCtor();
            setupRecognition(recognition);
            recognitionRef.current = recognition;
        }

        isStartingRef.current = true;

        try {
            recognition.start();
        } catch (e) {
            console.error('[SpeechRecognition] Start Exception:', e);
            isStartingRef.current = false;
            setIsListening(false);

            // Recovery for unexpected state
            if (e instanceof Error && e.name === 'InvalidStateError') {
                const retryRec = new RecognitionCtor();
                setupRecognition(retryRec);
                recognitionRef.current = retryRec;
                try { retryRec.start(); } catch { }
            }
        }
    }, [browserSupportsSpeechRecognition, setupRecognition, RecognitionCtor, onError]);

    const stopListening = useCallback(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (transcriptRef.current) {
            savedCallbacks.current.onResult?.(transcriptRef.current);
        }

        const wasListening = isListeningRef.current;
        isListeningRef.current = false;
        setIsListening(false);
        setTranscript('');
        transcriptRef.current = '';

        if (wasListening) {
            try {
                recognition.stop();
            } catch (e) {
                try { recognition.abort(); } catch { }
            }
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        transcriptRef.current = '';
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
    };
};
