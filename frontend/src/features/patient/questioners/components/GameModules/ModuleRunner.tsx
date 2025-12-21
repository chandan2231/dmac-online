import { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import GameApi, { type Module, type SessionData } from '../../../../../services/gameApi';
import CustomLoader from '../../../../../components/loader';
import ImageFlash from './ImageFlash';
import VisualSpatial from './VisualSpatial';
import AudioStoryRecall from './AudioStoryRecall';
import ConnectTheDots from './ConnectTheDots';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';
import GenericModal from '../../../../../components/modal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../../router/router';

interface ModuleRunnerProps {
    userId: number; // Actually userId might come from auth context inside here or passed down
    languageCode: string;
    onAllModulesComplete: () => void;
}

const ModuleRunner = ({ userId, languageCode, onAllModulesComplete }: ModuleRunnerProps) => {
    const { languageConstants } = useLanguageConstantContext();
    const navigate = useNavigate();

    // Get error message translations
    const t = {
        noModulesFound: getLanguageText(languageConstants, 'game_no_modules_found'),
        fetchError: getLanguageText(languageConstants, 'game_fetch_error'),
        sessionError: getLanguageText(languageConstants, 'game_session_error'),
        completionTitle: getLanguageText(languageConstants, 'game_completion_title'),
        completionMessage: getLanguageText(languageConstants, 'game_completion_message'),
        homeButton: getLanguageText(languageConstants, 'game_home_button')
    };

    const [modules, setModules] = useState<Module[]>([]);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCompletion, setShowCompletion] = useState(false);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await GameApi.getModules();
                const sorted = (res.modules || []).sort((a, b) => a.order_index - b.order_index);
                setModules(sorted);
                if (sorted.length > 0) {
                    startModuleSession(sorted[0].id);
                } else {
                    console.warn("No active game modules found.");
                    setError(t.noModulesFound);
                    onAllModulesComplete();
                }
            } catch (error) {
                console.error("Failed to fetch modules", error);
                setError(t.fetchError);
            }
        };
        fetchModules();
    }, []);

    const startModuleSession = async (moduleId: number) => {
        setLoading(true);
        setError(null);
        try {
            console.log(`[ModuleRunner] Starting session for module ${moduleId}`);
            const sess = await GameApi.startSession(moduleId, userId, languageCode);
            console.log(`[ModuleRunner] Session started:`, sess);
            setSession(sess);
        } catch (error) {
            console.error("Failed to start session", error);
            setError(t.sessionError);
        } finally {
            setLoading(false);
        }
    };

    const handleModuleSubmit = async (payload: any) => {
        if (!session) return;
        setLoading(true);
        try {
            const res = await GameApi.submitSession(session.module.id, session.session_id, payload);

            if (res.next_module_id) {
                await startModuleSession(res.next_module_id);
                const nextIdx = modules.findIndex(m => m.id === res.next_module_id);
                if (nextIdx !== -1) setCurrentModuleIndex(nextIdx);
            } else {
                // All modules completed - show completion screen
                setShowCompletion(true);
                // Re-enable language selector
                onAllModulesComplete();
            }
        } catch (error) {
            console.error("Submit failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageFlashComplete = (answerText: string) => {
        if (!session?.questions?.[0]) return;
        const payload = {
            question_id: session.questions[0].question_id,
            language_code: languageCode,
            answer_text: answerText
        };
        console.log('Submitting ImageFlash payload to API:', payload);
        handleModuleSubmit(payload);
    };

    const handleVisualSpatialComplete = (answers: { question_id: number, selected_option_key: string }[]) => {
        handleModuleSubmit({
            answers
        });
    };

    const handleAudioStoryComplete = (answers: any[]) => {
        handleModuleSubmit({
            answers
        });
    };

    const handleConnectDotsComplete = (payload: any) => {
        handleModuleSubmit(payload);
    };

    const handleGoHome = () => {
        navigate(ROUTES.HOME);
    };



    if (error) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="error" variant="h6">{error}</Typography>
            </Box>
        );
    }

    if (loading || !session) {
        return <CustomLoader />;
    }

    const moduleCode = session.module.code;

    const handleDevSkip = () => {
        console.log('[ModuleRunner] Skip button clicked');
        if (!session) return;
        const code = session.module.code;
        console.log(`[ModuleRunner] Skipping module: ${code}`);

        if (code === 'IMAGE_FLASH') {
            handleImageFlashComplete('skipped');
        } else if (code === 'VISUAL_SPATIAL') {
            // Construct dummy answers for all rounds
            const rounds = session.questions || [];
            const dummyAnswers = rounds.map(round => ({
                question_id: round.question_id,
                // Pick the first option key, or a fallback string if options missing
                selected_option_key: round.options?.[0]?.option_key || 'skipped_option'
            }));
            console.log('[ModuleRunner] Skipping VisualSpatial with payload:', dummyAnswers);
            handleVisualSpatialComplete(dummyAnswers);
        } else if (code === 'AUDIO_STORY') {
            // Construct dummy answers for stories
            const stories = session.questions || [];
            const dummyAnswers = stories.map(story => ({
                question_id: story.question_id,
                answer_text: 'skipped via dev button'
            }));
            console.log('[ModuleRunner] Skipping AudioStory with payload:', dummyAnswers);
            handleAudioStoryComplete(dummyAnswers);
        } else if (code === 'CONNECT_DOTS') {
            // Fake completions
            const payload = {
                question_id: session.questions?.[0]?.question_id,
                answer_text: "L,5,M,6,N,7,O,8,P,9,Q,10,R,11", // Valid sequence
                time_taken: 10
            }
            handleConnectDotsComplete(payload);
        }
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            {/* Remove this block when deploying to production */}
            <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 99999 }}>
                <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={handleDevSkip}
                >
                    Skip (Dev)
                </Button>
            </Box>

            {/* Completion Modal */}
            <GenericModal
                isOpen={showCompletion}
                onClose={() => { }}
                title={t.completionTitle}
                hideCancelButton={true}
                submitButtonText={t.homeButton}
                onSubmit={handleGoHome}
            >
                <Typography sx={{ fontSize: '1.2rem', textAlign: 'center', color: '#4caf50', fontWeight: 500 }}>
                    {t.completionMessage}
                </Typography>
            </GenericModal>

            {!showCompletion && moduleCode === 'IMAGE_FLASH' && (
                <ImageFlash session={session} onComplete={handleImageFlashComplete} languageCode={languageCode} />
            )}
            {!showCompletion && moduleCode === 'VISUAL_SPATIAL' && (
                <VisualSpatial session={session} onComplete={handleVisualSpatialComplete} languageCode={languageCode} />
            )}
            {!showCompletion && moduleCode === 'AUDIO_STORY' && (
                <AudioStoryRecall session={session} onComplete={handleAudioStoryComplete} languageCode={languageCode} />
            )}
            {!showCompletion && moduleCode === 'CONNECT_DOTS' && (
                <ConnectTheDots session={session} onComplete={handleConnectDotsComplete} />
            )}
        </Box>
    );
};

export default ModuleRunner;
