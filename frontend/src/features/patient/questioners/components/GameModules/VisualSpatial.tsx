import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import GenericModal from '../../../../../components/modal';
import type { SessionData } from '../../../../../services/gameApi';

// Fixing paths next tool call - for now creating file structure
// Actually I will use the correct relative paths now.
// src/features/patient/questioners/components/GameModules/VisualSpatial.tsx
// ../ -> GameModules
// ../../ -> components
// ../../../ -> questioners
// ../../../../ -> patient
// ../../../../../ -> features
// ../../../../../../ -> src

// Actually let's count again:
// 1. GameModules
// 2. components
// 3. questioners
// 4. patient
// 5. features
// 6. src
// So 6 levels up to get out of src? No.
// To get to `src/components`:
// ../../../../../../components ?? 

// Let's do a reality check.
// `src/features/patient/questioners/components/GameModules/ImageFlash.tsx`
// `src` is parent of `features`.
// `features` is child of `src`.
// `patient` is child of `features`.
// `questioners` is child of `patient`.
// `components` is child of `questioners`.
// `GameModules` is child of `components`.
// `ImageFlash.tsx` is child of `GameModules`.

// Path: src/features/patient/questioners/components/GameModules/ImageFlash.tsx
// .. (GameModules dir)
// ../.. (components dir)
// ../../.. (questioners dir)
// ../../../../.. (patient dir)
// ../../../../../.. (features dir)
// ../../../../../.. (src dir)

// So `../../../../../../components/button` is correct for `src/components/button`.
// And `../../../../../../services/gameApi` is correct for `src/services/gameApi`.

// I will use `../../../../../../` (6 dots sets).

import { styled } from '@mui/material/styles';

interface VisualSpatialProps {
    session: SessionData;
    onComplete: (answers: { question_id: number, selected_option_key: string }[]) => void;
}

const OptionImage = styled('img')({
    width: '100%',
    height: '150px',
    objectFit: 'contain',
    cursor: 'pointer',
    border: '2px solid transparent',
    '&:hover': {
        borderColor: '#1976d2'
    }
});

const VisualSpatial = ({ session, onComplete }: VisualSpatialProps) => {
    const [phase, setPhase] = useState<'instruction' | 'target' | 'selection'>('instruction');
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [answers, setAnswers] = useState<{ question_id: number, selected_option_key: string }[]>([]);

    const rounds = session.rounds || [];

    const startRound = () => {
        setPhase('target');
        // Show target for 3 seconds
        setTimeout(() => {
            setPhase('selection');
        }, 3000);
    };

    const handleStart = () => {
        setCurrentRoundIndex(0);
        setAnswers([]);
        startRound();
    };

    useEffect(() => {
        // If we just entered target phase
    }, [phase]);

    const handleSelectOption = (optionKey: string) => {
        const currentRound = rounds[currentRoundIndex];
        const newAnswer = { question_id: currentRound.question_id, selected_option_key: optionKey };
        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);

        if (currentRoundIndex < rounds.length - 1) {
            setCurrentRoundIndex(prev => prev + 1);
            startRound();
        } else {
            // Finished
            onComplete(updatedAnswers);
        }
    };

    const currentRound = rounds[currentRoundIndex];

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }}
                title="Instructions"
                hideCancelButton={true}
                submitButtonText="Start"
                onSubmit={handleStart}
            >
                <Typography>{session.instructions || "Watch the image carefully, then select the matching one."}</Typography>
            </GenericModal>

            {phase === 'target' && currentRound && (
                <Box>
                    <Typography variant="h5" mb={2}>Remember this</Typography>
                    <Box
                        component="img"
                        src={currentRound.target_image_url}
                        sx={{ maxWidth: '80%', maxHeight: '60vh', objectFit: 'contain' }}
                    />
                </Box>
            )}

            {phase === 'selection' && currentRound && (
                <Box sx={{ width: '100%', maxWidth: '600px' }}>
                    <Typography variant="h6" mb={2} textAlign="center">Select the matching image</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                        {currentRound.options.map((opt) => (
                            <Box key={opt.option_key} sx={{ width: 'calc(50% - 16px)', display: 'flex', justifyContent: 'center' }}>
                                <OptionImage
                                    src={opt.image_url}
                                    onClick={() => handleSelectOption(opt.option_key)}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default VisualSpatial;
