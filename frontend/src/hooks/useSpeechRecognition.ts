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

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.log('Speech recognition error', event);
            savedCallbacks.current.onError?.(
                'Speech recognition error: ' + (event?.error || 'Unknown error')
            );
        };

        recognition.onresult = (event: any) => {
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
            if (nextTranscript) setTranscript(nextTranscript);

            const trimmedFinal = finalText.trim();
            if (trimmedFinal) {
                savedCallbacks.current.onResult?.(trimmedFinal);
                setTranscript('');
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

        recognition.lang = languageCode;

        try {
            recognition.start();
        } catch {
            // Some browsers throw if already started; ignore.
        }
    }, [browserSupportsSpeechRecognition, languageCode, onError]);

    const stopListening = useCallback(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        try {
            recognition.stop();
        } catch {
            // ignore
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
