import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { get } from 'lodash';
import { useGetPreTestPageDetails } from '../hooks/useGetPreTestDetails';
import { Box } from '@mui/material';
import CustomLoader from '../../../../components/loader';
import MorenButton from '../../../../components/button';

import { useTestAttempts } from '../hooks/useTestAttempts';
import GameApi from '../../../../services/gameApi';

type IPreTestProps = {
    setPreTestCompleted: (value: boolean) => void;
};

const PreTest = ({ setPreTestCompleted }: IPreTestProps) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const languageCode = get(user, ['languageCode'], 'en');
    const {
        data: preTestDetails,
        isPending: isLoadingPreTestDetails,
    } = useGetPreTestPageDetails(languageCode);

    const { data: attemptStatus, isLoading: isLoadingAttempts } = useTestAttempts(languageCode);

    const handleStart = async () => {
        if (!attemptStatus?.allowed || attemptStatus?.isCompleted) return;

        try {
            const userId = Number(get(user, 'id', 0));

            // CHECK FOR RESUME capability
            // If the user has completed at least one module (and not finished all), 
            // we should resume, not restart.
            if (attemptStatus?.lastModuleCompleted && !attemptStatus.isCompleted) {
                // Resume flow: Just allow the ModuleRunner to mount.
                // ModuleRunner will detect lastCompletedModuleId via props and resume.
                setPreTestCompleted(true);
                return;
            }

            // NEW ATTEMPT Flow
            // Force new session for Module 1 (Image Flash) to count attempt
            // The module ID for Image Flash is 1 (based on previous queries)

            // Clear any previous game progress
            localStorage.removeItem('dmac_current_module_id');

            // Make sure we don't resume stale in-progress sessions from prior attempts.
            await GameApi.abandonInProgressSessions();

            await GameApi.startSession(1, userId, languageCode, false); // resume = false
            setPreTestCompleted(true);
        } catch (error) {
            console.error("Failed to start session", error);
            // toast.error("Failed to start test. Please try again.");
            alert("Failed to start test. Please try again.");
        }
    };

    if (isLoadingPreTestDetails || isLoadingAttempts) {
        return <CustomLoader />;
    }

    if (attemptStatus?.isCompleted) {
        return (
            <Box
                display="flex"
                sx={{
                    flexDirection: 'column',
                    width: { xs: '95%', sm: '90%', md: '80%' },
                    maxWidth: '800px',
                    margin: '0 auto',
                    py: { xs: 5, md: 10 },
                    alignItems: 'center'
                }}
            >
                <Box sx={{
                    bgcolor: '#e8f5e9',
                    color: '#2e7d32',
                    p: 4,
                    borderRadius: 2,
                    textAlign: 'center',
                    fontWeight: 'medium',
                    fontSize: '1.25rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}>
                    {attemptStatus.completionMessage || "The Digital Memory and Cognitive Assessment has been successfully completed. Your cognitive assessment report, including recommendations, will be emailed to you within 48 hours."}
                </Box>
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            sx={{
                flexDirection: 'column',
                width: { xs: '95%', sm: '90%', md: '80%' },
                maxWidth: '1000px', // Limit maximum width for large screens
                margin: '0 auto', // Center the container
                py: { xs: 3, md: 5 }, // Adjust padding top and bottom based on screen size
            }}
            gap={2}
        >
            {attemptStatus && !attemptStatus.allowed && (
                <Box sx={{
                    bgcolor: '#ffebee',
                    color: '#c62828',
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>
                    You have used all {attemptStatus.max_attempts} attempts. You cannot take the test again.
                </Box>
            )}

            {/* Title */}
            <Box sx={{ fontWeight: 'bold', fontSize: '20px', textAlign: 'center', mb: 4 }}>
                {get(preTestDetails, ['title'], '')}
            </Box>

            {/* Content */}
            <Box
                dangerouslySetInnerHTML={{ __html: get(preTestDetails, ['content'], '') }}
                sx={{
                    textAlign: 'center',
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    px: 2,
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#888',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#555',
                    },
                    '& ol': {
                        display: 'inline-block', // Helps if list is centered
                        textAlign: 'left', // Keep list items left aligned relative to themselves
                        pl: 2,
                        listStyleType: 'decimal',
                        mb: 2,
                    },
                    '& ul': {
                        display: 'inline-block',
                        textAlign: 'left',
                        pl: 2,
                        listStyleType: 'disc',
                        mb: 2,
                    },
                    '& li': {
                        mb: 1,
                        lineHeight: 1.6,
                    },
                    '& p': {
                        mb: 2,
                        fontSize: '18px',
                    },
                }}
            />

            {/* Doctor Info */}
            <Box sx={{ textAlign: 'center' }}>{get(preTestDetails, ['doctor_info'], '')}</Box>

            {/* Link Text */}
            <Box sx={{ textAlign: 'center' }}>{get(preTestDetails, ['link_text'], '')}</Box>

            <Box sx={{ width: '100%', mt: 4, display: 'flex', justifyContent: 'center' }}>
                <MorenButton
                    variant="contained"
                    onClick={handleStart}
                    disabled={attemptStatus && !attemptStatus.allowed}
                    sx={{
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: '200px',
                        borderRadius: '25px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        py: 1.5,
                    }}
                >
                    {get(preTestDetails, ['button_text'], '')}
                </MorenButton>
            </Box>
        </Box>
    );
};

export default PreTest;
