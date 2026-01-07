import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MorenButton from '../../../../../components/button';
import GenericModal from '../../../../../components/modal';
import type { SessionData } from '../../../../../services/gameApi';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';

// Static image imports
import cube_first from '../../../../../assets/visualSpatial/cube_first.webp';
import cube_second from '../../../../../assets/visualSpatial/cube_second.webp';
import cube_third from '../../../../../assets/visualSpatial/cube_third.webp';
import cube_fourth from '../../../../../assets/visualSpatial/cube_fourth.webp';
import cube_option_one from '../../../../../assets/visualSpatial/cube_option_one.webp';
import cube_option_two from '../../../../../assets/visualSpatial/cube_option_two.webp';
import cube_option_three from '../../../../../assets/visualSpatial/cube_option_three.webp';
import cube_option_four from '../../../../../assets/visualSpatial/cube_option_four.webp';

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

interface VisualSpatialProps {
    session: SessionData;
    onComplete: (answers: { question_id: number, selected_option_key: string }[]) => void;
    languageCode: string;
}

const VisualSpatial = ({ session, onComplete, languageCode }: VisualSpatialProps) => {
    const { languageConstants } = useLanguageConstantContext();

    // Get translations
    const t = {
        instruction: getLanguageText(languageConstants, 'game_instruction'),
        start: getLanguageText(languageConstants, 'game_start')
    };

    const [phase, setPhase] = useState<'instruction' | 'target' | 'selection'>('instruction');
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [answers, setAnswers] = useState<{ question_id: number, selected_option_key: string }[]>([]);
    const [countdown, setCountdown] = useState(3);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Configuration: Set to false when images are uploaded to S3
    const USE_STATIC_IMAGES = true;

    // Static image mapping for different rounds
    const STATIC_IMAGE_SETS = [
        {
            target: cube_first,
            options: [cube_option_one, cube_option_two, cube_option_three, cube_option_four]
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
        }
    ];

    // Map API rounds to use static images if configured
    const processedRounds = (session.questions || []).map((round, index) => {
        if (USE_STATIC_IMAGES && index < STATIC_IMAGE_SETS.length) {
            const staticSet = STATIC_IMAGE_SETS[index];
            return {
                ...round,
                target_image_url: staticSet.target,
                options: round.options.map((opt, optIndex) => ({
                    ...opt,
                    image_url: staticSet.options[optIndex] || staticSet.options[0]
                }))
            };
        }
        // Use API URLs when S3 ready
        return round;
    });

    const startRound = () => {
        setPhase('target');
        setCountdown(2);
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
    const totalRounds = processedRounds.length;

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3
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
                    {/* <Typography variant="h5" sx={{ mb: 2, color: '#666', fontWeight: 600 }}>
                        Remember this image
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 3, color: '#999' }}>
                        Round {currentRoundIndex + 1} of {totalRounds}
                    </Typography> */}

                    <Box sx={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                        <Box
                            component="img"
                            src={currentRound.target_image_url}
                            sx={{
                                width: '100%',
                                maxHeight: '60vh',
                                objectFit: 'contain',
                                border: '3px solid #1976d2',
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}
                        />
                        {countdown > 0 && (
                            <Box sx={{
                                position: 'absolute',
                                top: 20,
                                right: 20,
                                background: '#f44336',
                                color: 'white',
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 15px rgba(244, 67, 54, 0.4)'
                            }}>
                                {countdown}
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            {/* Selection Phase - Choose matching image */}
            {phase === 'selection' && currentRound && (
                <Box sx={{ width: '100%', maxWidth: '800px' }}>
                    {/* <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', color: '#666', fontWeight: 600 }}>
                        Select the matching image
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: '#999' }}>
                        Round {currentRoundIndex + 1} of {totalRounds}
                    </Typography> */}

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 3,
                        mt: 2
                    }}>
                        {currentRound.options.map((opt) => (
                            <Box
                                key={opt.option_key}
                                onClick={() => !selectedOption && handleSelectOption(opt.option_key)}
                                sx={{
                                    cursor: selectedOption ? 'default' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: selectedOption === opt.option_key
                                        ? '4px solid #4caf50'
                                        : '2px solid transparent',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: selectedOption === opt.option_key
                                        ? '0 4px 20px rgba(76, 175, 80, 0.4)'
                                        : '0 2px 8px rgba(0,0,0,0.1)',
                                    '&:hover': selectedOption ? {} : {
                                        transform: 'scale(1.05)',
                                        borderColor: '#1976d2',
                                        boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)'
                                    }
                                }}
                            >
                                <Box
                                    component="img"
                                    src={opt.image_url}
                                    sx={{
                                        width: '100%',
                                        height: '250px',
                                        objectFit: 'contain',
                                        background: '#ffffff',
                                        p: 2
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
