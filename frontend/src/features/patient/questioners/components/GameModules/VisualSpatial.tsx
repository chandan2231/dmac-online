import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import GenericModal from '../../../../../components/modal';
import type { SessionData } from '../../../../../services/gameApi';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';

// Static image imports
import cube_first from '../../../../../assets/visualSpatial/cube_first.webp';
import cube_second from '../../../../../assets/visualSpatial/cube_second.webp';
import cube_third from '../../../../../assets/visualSpatial/cube_third.webp';
import cube_fourth from '../../../../../assets/visualSpatial/cube_fourth.webp';

import star_first from '../../../../../assets/visualSpatial/star_first.webp';
import star_second from '../../../../../assets/visualSpatial/star_second.webp';
import star_third from '../../../../../assets/visualSpatial/star_third.webp';
import star_fourth from '../../../../../assets/visualSpatial/star_fourth.webp';

import vpic_first from '../../../../../assets/visualSpatial/vpic_first.webp';
import vpic_second from '../../../../../assets/visualSpatial/vpic_second.webp';
import vpic_third from '../../../../../assets/visualSpatial/vpic_third.webp';
import vpic_fourth from '../../../../../assets/visualSpatial/vpic_fourth.webp';

import dis01 from '../../../../../assets/visualSpatial/dis01.webp';
import dis02 from '../../../../../assets/visualSpatial/dis02.webp';
import dis03 from '../../../../../assets/visualSpatial/dis03.webp';
import dis04 from '../../../../../assets/visualSpatial/dis04.webp';
import dis11 from '../../../../../assets/visualSpatial/dis11.webp';
import dis12 from '../../../../../assets/visualSpatial/dis12.webp';
import dis13 from '../../../../../assets/visualSpatial/dis13.webp';
import dis14 from '../../../../../assets/visualSpatial/dis14.webp';

import dis21 from '../../../../../assets/visualSpatial/dis21.webp';
import dis22 from '../../../../../assets/visualSpatial/dis22.webp';
import dis23 from '../../../../../assets/visualSpatial/dis23.webp';
import dis24 from '../../../../../assets/visualSpatial/dis24.webp';

import dis31 from '../../../../../assets/visualSpatial/dis31.webp';
import dis32 from '../../../../../assets/visualSpatial/dis32.webp';
import dis33 from '../../../../../assets/visualSpatial/dis33.webp';
import dis34 from '../../../../../assets/visualSpatial/dis34.webp';

import image_new1 from '../../../../../assets/visualSpatial/image_new1.webp';
import image_new2 from '../../../../../assets/visualSpatial/image_new2.webp';
import image_new3 from '../../../../../assets/visualSpatial/image_new3.webp';
import image_new4 from '../../../../../assets/visualSpatial/image_new4.webp';

import cube_option_one from '../../../../../assets/visualSpatial/cube_option_one.webp';
import cube_option_two from '../../../../../assets/visualSpatial/cube_option_two.webp';
import cube_option_three from '../../../../../assets/visualSpatial/cube_option_three.webp';
import cube_option_four from '../../../../../assets/visualSpatial/cube_option_four.webp';

import bee_first from '../../../../../assets/visualSpatial/bee_first.png';
import bee_second from '../../../../../assets/visualSpatial/bee_second.png';
import bee_third from '../../../../../assets/visualSpatial/bee_third.png';
import bee_fourth from '../../../../../assets/visualSpatial/bee_fourth.png';

interface VisualSpatialProps {
    session: SessionData;
    onComplete: (answers: { question_id: number, selected_option_key: string }[]) => void;
    languageCode: string;
}

// Utility to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const VisualSpatial = ({ session, onComplete, languageCode }: VisualSpatialProps) => {
    const { languageConstants } = useLanguageConstantContext();

    // Get translations
    const t = {
        instruction: getLanguageText(languageConstants, 'game_instruction'),
        start: getLanguageText(languageConstants, 'game_start'),
        audioInstruction: getLanguageText(languageConstants, 'game_audio_instruction') || 'Audio Instruction'
    };

    const [phase, setPhase] = useState<'instruction' | 'target' | 'selection'>('instruction');
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [answers, setAnswers] = useState<{ question_id: number, selected_option_key: string }[]>([]);
    const [countdown, setCountdown] = useState(5);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [selectionCountdown, setSelectionCountdown] = useState(30);

    // Configuration: Set to false when images are uploaded to S3
    const USE_STATIC_IMAGES = true;

    // Static image mapping for different rounds
    const STATIC_IMAGE_SETS = [
        {
            target: cube_first,
            options: [cube_first, cube_second, cube_third, cube_fourth]
        },
        {
            target: star_first,
            options: [star_first, star_second, star_third, star_fourth]
        },
        {
            target: vpic_first,
            options: [vpic_first, vpic_second, vpic_third, vpic_fourth]
        },
        {
            target: dis01,
            options: [dis01, dis02, dis03, dis04]
        },
        {
            target: dis11,
            options: [dis11, dis12, dis13, dis14]
        },
        {
            target: dis21,
            options: [dis21, dis22, dis23, dis24]
        },
        {
            target: dis31,
            options: [dis31, dis32, dis33, dis34]
        },
        {
            target: image_new1,
            options: [image_new1, image_new2, image_new3, image_new4]
        },
        {
            target: cube_option_one,
            options: [cube_option_one, cube_option_two, cube_option_three, cube_option_four]
        },
        {
            target: bee_first,
            options: [bee_first, bee_second, bee_third, bee_fourth]
        }
    ];

    // State for processed questions to ensure stable shuffle
    const [processedRounds, setProcessedRounds] = useState<any[]>([]);

    // Map API rounds to use static images and pre-shuffle for stability
    useEffect(() => {
        if (!session.questions) return;

        const rounds = session.questions.map((round: any, index: number) => {
            const roundOptions = round.options ?? [];

            if (USE_STATIC_IMAGES && index < STATIC_IMAGE_SETS.length) {
                const staticSet = STATIC_IMAGE_SETS[index];

                // Find the correct option in API (match by URL to target_image_url)
                const correctOptIndex = roundOptions.findIndex((o: any) => o.image_url === round.target_image_url);

                const mappedOptions = roundOptions.map((opt: any, optIndex: number) => {
                    // Default to static option at this index
                    let staticImage = staticSet.options[optIndex] ?? staticSet.options[0];

                    if (correctOptIndex !== -1) {
                        if (optIndex === correctOptIndex) {
                            staticImage = staticSet.options[0]; // Always map correct one to target image
                        } else if (optIndex === 0) {
                            staticImage = staticSet.options[correctOptIndex] ?? staticSet.options[1]; // Swap
                        }
                    }

                    return {
                        ...opt,
                        image_url: staticImage
                    };
                });

                return {
                    ...round,
                    target_image_url: staticSet.target,
                    options: shuffleArray(mappedOptions)
                };
            }

            // Use API URLs when S3 ready
            return {
                ...round,
                options: shuffleArray(roundOptions)
            };
        });

        setProcessedRounds(rounds);
    }, [session.questions]);

    const startRound = () => {
        setPhase('target');
        setCountdown(5);
        setSelectionCountdown(30);
        setSelectedOption(null);
    };

    // Countdown timer for target phase
    useEffect(() => {
        if (phase === 'target' && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (phase === 'target' && countdown === 0) {
            setTimeout(() => {
                setPhase('selection');
            }, 500);
        }
    }, [phase, countdown]);

    // Countdown timer for selection phase
    useEffect(() => {
        if (phase === 'selection' && selectionCountdown > 0 && !selectedOption) {
            const timer = setTimeout(() => {
                setSelectionCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (phase === 'selection' && selectionCountdown === 0 && !selectedOption) {
            handleSelectOption('TIMEOUT');
        }
    }, [phase, selectionCountdown, selectedOption]);

    const handleStart = () => {
        setCurrentRoundIndex(0);
        setAnswers([]);
        startRound();
    };

    const handleSelectOption = (optionKey: string) => {
        setSelectedOption(optionKey);

        const currentRound = processedRounds[currentRoundIndex];
        const newAnswer = { question_id: currentRound.question_id, selected_option_key: optionKey };
        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);

        // Show selection feedback, then move to next round
        setTimeout(() => {
            if (currentRoundIndex < processedRounds.length - 1) {
                setCurrentRoundIndex(prev => prev + 1);
                startRound();
            } else {
                // Finished all rounds
                onComplete(updatedAnswers);
            }
        }, 800);
    };

    const currentRound = processedRounds[currentRoundIndex];

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            pt: { xs: 4, sm: 6 },
            pb: { xs: 4, sm: 8 },
            px: { xs: 1.5, sm: 3 },
            minHeight: '100vh',
            overflowY: 'auto'
        }}>
            {/* Instruction Modal */}
            <GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }}
                title={`${session.module?.name || ''} ${t.instruction}`}
                hideCancelButton={true}
                submitButtonText={t.start}
                onSubmit={handleStart}
                enableAudio={true}
                audioButtonLabel={t.audioInstruction}
                audioButtonAlignment="center"
                instructionText={session.instructions || ''}
                languageCode={languageCode}
            >
                <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'black', fontWeight: 500 }}>
                    {session.instructions}
                </Typography>
            </GenericModal>

            {/* Target Phase - Show image with countdown */}
            {phase === 'target' && currentRound && (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '800px'
                }}>
                    <Box sx={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                        <Box
                            component="img"
                            src={currentRound.target_image_url}
                            sx={{
                                width: '100%',
                                maxHeight: '55vh',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}
                        />
                    </Box>
                </Box>
            )}

            {/* Selection Phase - Choose matching image */}
            {phase === 'selection' && currentRound && (
                <Box sx={{ width: '100%', maxWidth: '800px' }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: { xs: 1.5, sm: 3 },
                        mt: 2
                    }}>
                        {currentRound.options.map((opt: any) => (
                            <Box
                                key={opt.option_key}
                                onClick={() => !selectedOption && handleSelectOption(opt.option_key)}
                                sx={{
                                    cursor: selectedOption ? 'default' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: selectedOption === opt.option_key
                                        ? '4px solid #4caf50'
                                        : '2px solid #e0e0e0',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: selectedOption === opt.option_key
                                        ? '0 4px 20px rgba(76, 175, 80, 0.4)'
                                        : '0 2px 8px rgba(0,0,0,0.05)',
                                    '&:hover': selectedOption ? {} : {
                                        transform: 'scale(1.02)',
                                        borderColor: '#1976d2',
                                        boxShadow: '0 4px 20px rgba(25, 118, 210, 0.2)'
                                    }
                                }}
                            >
                                <Box
                                    component="img"
                                    src={opt.image_url}
                                    sx={{
                                        width: '100%',
                                        height: { xs: '140px', sm: '250px' },
                                        objectFit: 'contain',
                                        background: '#ffffff',
                                        p: { xs: 1, sm: 2 }
                                    }}
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
