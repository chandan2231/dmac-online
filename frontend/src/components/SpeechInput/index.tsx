import React from 'react';
import { TextField, InputAdornment, IconButton, type TextFieldProps, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { keyframes } from '@mui/system';

// Pulsing animation for when listening - creates pink glow ring like image 2
const pulseRed = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.6);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(255, 138, 128, 0.2);
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 0 20px rgba(255, 138, 128, 0);
    transform: scale(1);
  }
`;

// Pulsing animation for listening - creates purple glow ring
const pulsePurple = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(124, 77, 255, 0.6);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(156, 122, 255, 0.2);
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 0 20px rgba(156, 122, 255, 0);
    transform: scale(1);
  }
`;

interface SpeechInputProps extends Omit<TextFieldProps, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    onSpeechResult?: (transcript: string) => void;
    languageCode?: string;
}

const SpeechInput: React.FC<SpeechInputProps> = ({
    value,
    onChange,
    onSpeechResult,
    languageCode = 'en-US',
    placeholder = 'Type or click mic to speak',
    ...textFieldProps
}) => {
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
        languageCode,
        onResult: (result) => {
            if (onSpeechResult) {
                onSpeechResult(result);
            } else {
                onChange(result);
            }
            // resetTranscript is now handled internally by the hook
        }
    });

    // Auto-stop timer after 3 seconds of silence
    const silenceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        // When transcript changes (user is speaking), reset the silence timer
        if (isListening && transcript) {
            // Clear existing timer
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }

            // Set new timer to stop after 3 seconds of silence
            silenceTimerRef.current = setTimeout(() => {
                stopListening();
            }, 3000);
        }

        // Cleanup on unmount
        return () => {
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }
        };
    }, [transcript, isListening, stopListening]);

    const handleMicClick = () => {
        if (isListening) {
            // Stop listening (toggle off)
            stopListening();
        } else {
            // Start listening (toggle on)
            startListening();
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    // Show accumulated value with interim transcript appended while listening
    const displayValue = isListening && transcript
        ? (value ? `${value} ${transcript}` : transcript)
        : value;

    return (
        <TextField
            {...textFieldProps}
            value={displayValue}
            onChange={handleTextChange}
            placeholder={placeholder}
            multiline
            minRows={1}
            maxRows={4}
            slotProps={{
                input: {
                    ...textFieldProps.slotProps?.input,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleMicClick}
                                edge="end"
                                sx={{
                                    background: isListening
                                        ? '#f44336'  // Solid red when listening
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple gradient when idle
                                    color: 'white',
                                    width: 40,
                                    height: 40,
                                    marginRight: '-8px',
                                    transition: 'all 0.3s ease',
                                    animation: isListening ? `${pulseRed} 1.5s ease-in-out infinite` : 'none',
                                    '&:hover': {
                                        background: isListening
                                            ? '#e53935'  // Darker red on hover when listening
                                            : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                        transform: 'scale(1.05)',
                                        boxShadow: isListening
                                            ? '0 0 20px rgba(244, 67, 54, 0.6)'
                                            : '0 4px 15px rgba(102, 126, 234, 0.4)',
                                    },
                                }}
                            >
                                <MicIcon sx={{ fontSize: 22 }} />
                            </IconButton>
                        </InputAdornment>
                    ),
                }
            }}
        />
    );
};

export default SpeechInput;

