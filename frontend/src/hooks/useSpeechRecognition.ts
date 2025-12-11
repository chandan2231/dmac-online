import { useEffect } from "react";
import SpeechRecognition, {
    useSpeechRecognition as useReactSpeechRecognition,
} from "react-speech-recognition";

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

    const { languageCode = "en-US", onResult, onError } = options;

    // Use react-speech-recognition's hook
    const {
        transcript,
        interimTranscript,
        finalTranscript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useReactSpeechRecognition();

    // Check browser support
    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            onError?.("Speech Recognition not supported in this browser");
        }
    }, [browserSupportsSpeechRecognition, onError]);

    // Handle final transcript
    useEffect(() => {
        if (finalTranscript) {
            const trimmed = finalTranscript.trim();
            if (trimmed) {
                onResult?.(trimmed);
                resetTranscript();
            }
        }
    }, [finalTranscript, onResult, resetTranscript]);

    const startListening = () => {
        if (!browserSupportsSpeechRecognition) {
            onError?.("Speech Recognition not supported");
            return;
        }

        try {
            SpeechRecognition.startListening({
                continuous: true,
                language: languageCode,
                interimResults: true,
            });
        } catch (err) {
            onError?.("Failed to start Speech Recognition");
        }
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
    };

    // Return interim transcript if available, otherwise final transcript
    const displayTranscript = interimTranscript || transcript;

    return {
        isListening: listening,
        transcript: displayTranscript,
        startListening,
        stopListening,
        resetTranscript,
    };
};
