import React, { useImperativeHandle, forwardRef } from 'react';
import { TextField, InputAdornment, IconButton, Box, type TextFieldProps } from '@mui/material';
import { useSnackbar } from 'notistack';
import MicIcon from '@mui/icons-material/Mic';
import KeyboardIcon from '@mui/icons-material/Keyboard';
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

export interface SpeechInputHandle {
    startListening: () => void;
    stopListening: () => void;
    isListening: boolean;
}

interface SpeechInputProps extends Omit<TextFieldProps, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    onSpeechResult?: (transcript: string) => void;
    onTranscriptChange?: (transcript: string) => void;
    languageCode?: string;
    enableModeSelection?: boolean;
}

const SpeechInput = forwardRef<SpeechInputHandle, SpeechInputProps>(({
    value,
    onChange,
    onSpeechResult,
    onTranscriptChange,
    languageCode = 'en-US',
    placeholder = '',
    enableModeSelection = false,
    ...textFieldProps
}, ref) => {
    const { enqueueSnackbar } = useSnackbar();
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
        languageCode,
        onError(msg) {
            enqueueSnackbar(`Speech recognition error: ${msg}`, { variant: 'error' });
        },
        onResult: (result) => {
            if (onSpeechResult) {
                onSpeechResult(result);
            } else {
                onChange(result);
            }
        }
    });

    useImperativeHandle(ref, () => ({
        startListening,
        stopListening,
        isListening
    }));

    // State for split mode removed. we want buttons always visible with TextField.
    const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    const shouldAutoFocus = Boolean(textFieldProps.autoFocus ?? enableModeSelection);

    React.useEffect(() => {
        if (!shouldAutoFocus) return;

        const timer = window.setTimeout(() => {
            const el = inputRef.current;
            if (!el) return;
            el.focus();
            try {
                const length = el.value?.length ?? 0;
                // Place cursor at end for convenience
                (el as HTMLInputElement).setSelectionRange?.(length, length);
            } catch {
                // ignore
            }
        }, 0);

        return () => window.clearTimeout(timer);
    }, [shouldAutoFocus]);

    // Auto-stop timer logic (same as before)
    const silenceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (onTranscriptChange) {
            onTranscriptChange(transcript);
        }
        if (isListening && transcript) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
                stopListening();
            }, 3000);
        }
        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };
    }, [transcript, isListening, stopListening, onTranscriptChange]);

    React.useEffect(() => {
        return () => {
            stopListening();
        };
    }, [stopListening]);

    const handleMicClick = () => {
        if (isListening) {
            // Clear the auto-stop timer if user manually stops
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }
            stopListening();
        } else {
            startListening();
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleTypeClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const displayValue = isListening && transcript
        ? (value ? `${value} ${transcript}` : transcript)
        : value;

    // --- RENDER LOGIC ---

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

            <TextField
                {...textFieldProps}
                autoFocus={shouldAutoFocus}
                inputRef={inputRef}
                value={displayValue}
                onChange={handleTextChange}
                placeholder={placeholder}
                multiline
                minRows={1}
                maxRows={4}
                slotProps={textFieldProps.slotProps}
                InputProps={{
                    style: { fontSize: '1.3rem' },
                    ...textFieldProps.InputProps,
                    // If mode selection is enabled, we hide the internal persistent mic icon
                    // because we have the big "Speak" button below.
                    endAdornment: !enableModeSelection ? (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleMicClick}
                                edge="end"
                                sx={{
                                    background: isListening
                                        ? '#f44336'
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    width: 40,
                                    height: 40,
                                    marginRight: '-8px',
                                    transition: 'all 0.3s ease',
                                    animation: isListening ? `${pulseRed} 1.5s ease-in-out infinite` : 'none',
                                    '&:hover': {
                                        background: isListening
                                            ? '#e53935'
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
                    ) : null
                }}
            />

            {/* Buttons Row - Forced horizontal for parity */}
            {enableModeSelection && (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '16px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%'
                }}>
                    <IconButton
                        onClick={handleMicClick}
                        sx={{
                            borderRadius: '10px',
                            padding: { xs: '8px 16px', sm: '14px 25px' },
                            background: isListening ? '#f44336' : '#274765',
                            color: 'white',
                            display: 'flex',
                            flexDirection: { xs: 'row', sm: 'column' },
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: { xs: 1.5, sm: 1 },
                            flex: { xs: 1, sm: 'none' },
                            width: { xs: 'auto', sm: '140px' },
                            height: { xs: '68px', sm: 'auto' },
                            '&:hover': { background: isListening ? '#d32f2f' : '#1c3550' }
                        }}
                    >
                        <MicIcon sx={{ fontSize: { xs: 24, sm: 36 } }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{isListening ? 'STOP' : 'SPEAK'}</span>
                    </IconButton>

                    <IconButton
                        onClick={handleTypeClick}
                        sx={{
                            borderRadius: '10px',
                            padding: { xs: '8px 16px', sm: '14px 25px' },
                            border: '2px solid #274765',
                            color: '#274765',
                            display: 'flex',
                            flexDirection: { xs: 'row', sm: 'column' },
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: { xs: 1.5, sm: 1 },
                            flex: { xs: 1, sm: 'none' },
                            width: { xs: 'auto', sm: '140px' },
                            height: { xs: '68px', sm: 'auto' },
                            '&:hover': { background: '#f5f5f5' }
                        }}
                    >
                        <KeyboardIcon sx={{ fontSize: { xs: 24, sm: 36 } }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>TYPE</span>
                    </IconButton>
                </Box>
            )}
        </Box>
    );
});


export default SpeechInput;

