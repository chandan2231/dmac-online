import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import GameApi, { type Module, type SessionData } from '../../../../../services/gameApi';
import CustomLoader from '../../../../../components/loader';
import ImageFlash from './ImageFlash';
import VisualSpatial from './VisualSpatial';
import AudioStoryRecall from './AudioStoryRecall';
import AudioWordsRecall from './AudioWordsRecall';
import ConnectTheDots from './ConnectTheDots';
import ExecutiveQuestions from './ExecutiveQuestions';
import NumberRecall from './NumberRecall';
import DrawingRecall from './DrawingRecall';
import ColorRecall from './ColorRecall';
import GroupMatching from './GroupMatching';
import DisinhibitionSqTri from './DisinhibitionSqTri';
import VisualNumberRecall from './VisualNumberRecall';
import LetterDisinhibition from './LetterDisinhibition';
import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';
import GenericModal from '../../../../../components/modal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../../router/router';
import { useIdleTimeout } from '../../../../../hooks/useIdleTimeout';
import { useTestAttempts } from '../../hooks/useTestAttempts';
import { useQueryClient } from '@tanstack/react-query';

interface ModuleRunnerProps {
    userId: number; // Actually userId might come from auth context inside here or passed down
    languageCode: string;
    onAllModulesComplete: () => void;
    lastCompletedModuleId?: number | null;
}

type GenericAnswer = Record<string, unknown>;
type AnswerWithText = GenericAnswer & { answer_text?: string };
type AnswerWithScore = GenericAnswer & { score?: number };

const ModuleRunner = ({ userId, languageCode, onAllModulesComplete, lastCompletedModuleId }: ModuleRunnerProps) => {
    const { languageConstants } = useLanguageConstantContext();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: attemptStatus } = useTestAttempts(languageCode);

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

    // Load initial index from localStorage
    const [, setCurrentModuleIndex] = useState(() => {
        // We store ID, but state uses index. We'll need to resolve this once modules are loaded.
        // For now, start at 0, and effect will adjust if needed.
        return 0;
    });
    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCompletion, setShowCompletion] = useState(false);

    const [idleModalOpen, setIdleModalOpen] = useState(false);
    const [idleMinutes, setIdleMinutes] = useState(0);

    const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
    const IDLE_STORAGE_KEY = 'dmac_last_activity_ts';
    const PROGRESS_KEY = 'dmac_current_module_id';
    // When set: ignore backend lastCompletedModuleId and start from PROGRESS_KEY/first module.
    // Cleared once Module 1 is completed in the new attempt.
    const FORCE_RESTART_KEY = 'dmac_force_restart_from_beginning';
    // When set: create a fresh Module 1 session exactly once (resume=false) to count a new attempt.
    const FORCE_NEW_SESSION_KEY = 'dmac_force_restart_needs_new_session';

    const attemptsBanner = useMemo(() => {
        if (!attemptStatus) return null;
        const remaining = Math.max(0, (attemptStatus.max_attempts ?? 3) - (attemptStatus.count ?? 0));
        const isFinal = remaining === 0;
        return { remaining, isFinal };
    }, [attemptStatus]);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await GameApi.getModules();
                const sorted = (res.modules || []).sort((a, b) => a.order_index - b.order_index);
                setModules(sorted);

                const lastActiveRaw = localStorage.getItem(IDLE_STORAGE_KEY);
                const lastActiveTs = lastActiveRaw ? Number(lastActiveRaw) : 0;
                const idleMs = lastActiveTs ? Date.now() - lastActiveTs : 0;
                const isTimeExpired = Boolean(lastActiveTs) && idleMs > IDLE_TIMEOUT_MS;
                const forceRestart = Boolean(localStorage.getItem(FORCE_RESTART_KEY));
                const needsNewSession = Boolean(localStorage.getItem(FORCE_NEW_SESSION_KEY));
                const shouldIgnoreBackendResume = Boolean(forceRestart);

                // Only show the idle modal when the user was truly idle > 10 min.
                if (isTimeExpired) {
                    const minutes = Math.max(0, Math.ceil(idleMs / 60000));
                    setIdleMinutes(minutes);
                    setIdleModalOpen(true);
                    localStorage.removeItem(PROGRESS_KEY);
                    // Require a full restart from module 1, and create a fresh module-1 session once user clicks Restart.
                    localStorage.setItem(FORCE_RESTART_KEY, String(Date.now()));
                    localStorage.setItem(FORCE_NEW_SESSION_KEY, String(Date.now()));
                    return;
                }

                // Determine start module
                const savedId = localStorage.getItem(PROGRESS_KEY);
                let startId = sorted.length > 0 ? sorted[0].id : 0;
                let startIndex = 0;

                // Priority 1: backend last completed module (only when not in a forced restart attempt)
                if (!shouldIgnoreBackendResume && lastCompletedModuleId) {
                    const lastIndex = sorted.findIndex(m => m.id === lastCompletedModuleId);
                    if (lastIndex !== -1) {
                        // Ensure we don't go out of bounds
                        if (lastIndex < sorted.length - 1) {
                            startIndex = lastIndex + 1;
                            startId = sorted[startIndex].id;
                        } else {
                            // All modules completed
                            // This case usually handled by parent (isCompleted check), but safe to handle here
                            onAllModulesComplete();
                            return;
                        }
                    }
                }
                // Priority 2: localStorage (only if backend info not available or start from beginning)
                else if (savedId) {
                    const foundIndex = sorted.findIndex(m => m.id === Number(savedId));
                    if (foundIndex !== -1) {
                        startId = Number(savedId);
                        startIndex = foundIndex;
                    }
                }

                setCurrentModuleIndex(startIndex);

                if (sorted.length > 0) {
                    // Avoid double-counting attempts: only create a fresh session when explicitly requested.
                    await startModuleSession(startId, !needsNewSession);

                    // Persist current module to support refresh-resume even before first submit.
                    if (!savedId && startId) {
                        localStorage.setItem(PROGRESS_KEY, String(startId));
                    }

                    // One-shot: after creating the new session, stop forcing resume=false.
                    if (needsNewSession) {
                        localStorage.removeItem(FORCE_NEW_SESSION_KEY);
                    }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastCompletedModuleId]);

    const { setActiveNow } = useIdleTimeout({
        storageKey: IDLE_STORAGE_KEY,
        enabled: !showCompletion && !idleModalOpen,
        timeoutMs: IDLE_TIMEOUT_MS,
        onIdle: (idleMs) => {
            const minutes = Math.max(0, Math.ceil(idleMs / 60000));
            setIdleMinutes(minutes);
            setIdleModalOpen(true);
            localStorage.removeItem(PROGRESS_KEY);
            localStorage.setItem(FORCE_RESTART_KEY, String(Date.now()));
            localStorage.setItem(FORCE_NEW_SESSION_KEY, String(Date.now()));
        },
    });

    const startModuleSession = async (moduleId: number, resume: boolean = true) => {
        setLoading(true);
        setError(null);
        try {
            console.log(`[ModuleRunner] Starting session for module ${moduleId}`);
            // Resume exiting session (created in PreTest) for Module 1, or generally allow resume
            // To support attempt tracking via PreTest, we MUST resume if a session exists.
            const sess = await GameApi.startSession(moduleId, userId, languageCode, resume);
            console.log(`[ModuleRunner] Session started:`, sess);
            setSession(sess);
        } catch (error) {
            console.error("Failed to start session", error);
            setError(t.sessionError);
        } finally {
            setLoading(false);
        }
    };

    const restartFromBeginningDueToIdle = async () => {
        const canRestart =
            attemptStatus ? attemptStatus.count < attemptStatus.max_attempts : true;

        setIdleModalOpen(false);

        if (!canRestart) {
            // Do not block navigation on network/API calls.
            void GameApi.abandonInProgressSessions().catch(e => {
                console.error('[ModuleRunner] Failed to abandon sessions after idle (final attempt)', e);
            });

            localStorage.removeItem(PROGRESS_KEY);
            localStorage.removeItem(FORCE_RESTART_KEY);
            localStorage.removeItem(FORCE_NEW_SESSION_KEY);
            setLoading(false);
            navigate(ROUTES.HOME);
            return;
        }

        // Reset local state immediately so UI doesn't get stuck.
        setLoading(false);
        setError(null);

        // Reset idle timer immediately on Restart
        setActiveNow();

        // Restart should take the user back to the beginning of the assessment flow.
        // We force a new attempt on the PreTest screen (ignore backend resume).
        localStorage.removeItem(PROGRESS_KEY);
        localStorage.setItem(FORCE_RESTART_KEY, String(Date.now()));
        localStorage.removeItem(FORCE_NEW_SESSION_KEY);

        // Reset the "Questioners" flow state so it starts from Disclaimer (same entry path).
        localStorage.removeItem('dmac_flow_isQuestionerClosed');
        localStorage.removeItem('dmac_flow_isDisclaimerAccepted');
        localStorage.removeItem('dmac_flow_falsePositive');
        localStorage.removeItem('dmac_flow_isPreTestCompleted');

        // Best-effort cleanup: do not block redirect.
        void GameApi.abandonInProgressSessions().catch(e => {
            console.error('[ModuleRunner] Failed to abandon sessions after idle', e);
        });
        void queryClient.invalidateQueries({ queryKey: ['test-attempts', languageCode] });

        navigate(ROUTES.QUESTIONERS, { replace: true });
    };

    const handleModuleSubmit = async (payload: GenericAnswer) => {
        if (!session) return;
        setLoading(true);
        try {
            const res = await GameApi.submitSession(session.module.id, session.session_id, payload);

            if (res.next_module_id) {
                const firstModuleId = modules[0]?.id;
                if (firstModuleId && session.module.id === firstModuleId) {
                    // Now that Module 1 is completed in this attempt, backend resume becomes safe again.
                    localStorage.removeItem(FORCE_RESTART_KEY);
                }
                // Save progress
                localStorage.setItem(PROGRESS_KEY, String(res.next_module_id));

                await startModuleSession(res.next_module_id);
                const nextIdx = modules.findIndex(m => m.id === res.next_module_id);
                if (nextIdx !== -1) setCurrentModuleIndex(nextIdx);
            } else {
                // All modules completed - show completion screen
                setShowCompletion(true);
                // Re-enable language selector
                localStorage.removeItem(PROGRESS_KEY); // Clear progress on complete
                localStorage.removeItem(FORCE_RESTART_KEY);
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

    const handleAudioStoryComplete = (answers: GenericAnswer[]) => {
        handleModuleSubmit({
            answers
        });
    };

    const handleAudioWordsComplete = (answers: GenericAnswer[]) => {
        handleModuleSubmit({
            answers
        });
    };

    const handleConnectDotsComplete = (payload: GenericAnswer) => {
        handleModuleSubmit(payload);
    };

    const handleExecutiveComplete = (answers: GenericAnswer[]) => {
        handleModuleSubmit({
            answers
        });
    };

    const handleNumberRecallComplete = (answers: GenericAnswer[]) => {
        handleModuleSubmit({
            answers
        });
    };

    const handleDrawingRecallComplete = (payload: GenericAnswer) => {
        handleModuleSubmit(payload);
    };

    const handleColorRecallComplete = (answers: GenericAnswer[]) => {
        handleModuleSubmit({
            answers
        });
    };

    const handleGroupMatchingComplete = (answers: AnswerWithText[]) => {
        // Parse scores from text "Score: 1" and sum them up
        const total = answers.reduce((acc, curr) => {
            const match = (curr.answer_text || '').match(/Score:\s*(\d+)/);
            return acc + (match ? parseInt(match[1], 10) : 0);
        }, 0);

        handleModuleSubmit({
            answers,
            score: total
        });
    };

    const handleDisinhibitionSqTriComplete = (answers: AnswerWithScore[]) => {
        handleModuleSubmit({
            answers,
            // Pass score explicitly if it's in the answers array object or let backend handle it 
            // The component sends [{ question_id, answer_text, score }]
            score: answers[0]?.score
        });
    };

    const handleLetterDisinhibitionComplete = (answers: GenericAnswer[]) => {
        handleModuleSubmit({
            answers
            // score removed, calculated in backend
        });
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

    if (idleModalOpen && !session) {
        return (
            <Box sx={{ width: '100%', height: '100%' }}>
                <GenericModal
                    isOpen={idleModalOpen}
                    onClose={() => { }}
                    disableClose={true}
                    hideCloseIcon={true}
                    hideCancelButton={true}
                    title="Idle Timeout"
                    submitButtonText={
                        attemptStatus && attemptStatus.count >= attemptStatus.max_attempts
                            ? 'Go Home'
                            : 'Restart'
                    }
                    onSubmit={restartFromBeginningDueToIdle}
                >
                    {attemptStatus && attemptStatus.count >= attemptStatus.max_attempts ? (
                        <Typography sx={{ fontSize: '1.1rem', textAlign: 'center' }}>
                            You were idle for <strong>{idleMinutes}</strong> minutes.
                            <br />
                            You have reached the maximum number of attempts and cannot restart the test.
                        </Typography>
                    ) : (
                        <Typography sx={{ fontSize: '1.1rem', textAlign: 'center' }}>
                            You were idle for <strong>{idleMinutes}</strong> minutes.
                            <br />
                            You will be redirected to the beginning of the game and your attempt will be increased by 1.
                        </Typography>
                    )}
                    {attemptsBanner?.isFinal ? (
                        <Typography sx={{ mt: 2, fontSize: '1rem', textAlign: 'center', color: '#c62828', fontWeight: 600 }}>
                            This is your final attempt. If you are idle again, you won’t be able to retake the test.
                        </Typography>
                    ) : null}
                </GenericModal>
                <CustomLoader />
            </Box>
        );
    }

    if (loading || !session) {
        return <CustomLoader />;
    }

    const moduleCode = session.module.code;

    // const handleDevSkip = () => {
    //     console.log('[ModuleRunner] Skip button clicked');
    //     if (!session) return;
    //     const code = session.module.code;
    //     console.log(`[ModuleRunner] Skipping module: ${code}`);

    //     if (code === 'IMAGE_FLASH') {
    //         handleImageFlashComplete('skipped');
    //     } else if (code === 'VISUAL_PICTURE_RECALL') {
    //         handleImageFlashComplete('skipped');
    //     } else if (code === 'VISUAL_SPATIAL') {
    //         // Construct dummy answers for all rounds
    //         const rounds = session.questions || [];
    //         const dummyAnswers = rounds.map(round => ({
    //             question_id: round.question_id,
    //             // Pick the first option key, or a fallback string if options missing
    //             selected_option_key: round.options?.[0]?.option_key || 'skipped_option'
    //         }));
    //         console.log('[ModuleRunner] Skipping VisualSpatial with payload:', dummyAnswers);
    //         handleVisualSpatialComplete(dummyAnswers);
    //     } else if (code === 'AUDIO_STORY') {
    //         // Construct dummy answers for stories
    //         const stories = session.questions || [];
    //         const dummyAnswers = stories.map(story => ({
    //             question_id: story.question_id,
    //             answer_text: 'skipped via dev button'
    //         }));
    //         console.log('[ModuleRunner] Skipping AudioStory with payload:', dummyAnswers);
    //         handleAudioStoryComplete(dummyAnswers);
    //     }
    //     else if (code === 'AUDIO_STORY_2') {
    //         // Construct dummy answers for stories
    //         const stories = session.questions || [];
    //         const dummyAnswers = stories.map(story => ({
    //             question_id: story.question_id,
    //             answer_text: 'skipped via dev button'
    //         }));
    //         console.log('[ModuleRunner] Skipping AudioStory with payload:', dummyAnswers);
    //         handleAudioStoryComplete(dummyAnswers);
    //     }
    //     else if (code === 'AUDIO_STORY_1_RECALL' || code === 'AUDIO_STORY_2_RECALL') {
    //         // Construct dummy answers for stories - same as audio story
    //         const stories = session.questions || [];
    //         const dummyAnswers = stories.map(story => ({
    //             question_id: story.question_id,
    //             answer_text: 'skipped via dev button'
    //         }));
    //         console.log('[ModuleRunner] Skipping AudioStoryRecall with payload:', dummyAnswers);
    //         handleAudioStoryComplete(dummyAnswers);
    //     }
    //     else if (code === 'AUDIO_WORDS') {
    //         // Construct dummy answers
    //         const questions = session.questions || [];
    //         const dummyAnswers = questions.map(q => ({
    //             question_id: q.question_id,
    //             answer_text: 'skipped via dev button',
    //             language_code: languageCode
    //         }));
    //         console.log('[ModuleRunner] Skipping AudioWords with payload:', dummyAnswers);
    //         handleAudioWordsComplete(dummyAnswers);
    //     } else if (code === 'AUDIO_WORDS_RECALL') {
    //         const questions = session.questions || [];
    //         const dummyAnswers = questions.map(q => ({
    //             question_id: q.question_id,
    //             answer_text: 'skipped via dev button',
    //             language_code: languageCode
    //         }));
    //         handleAudioWordsComplete(dummyAnswers);
    //     } else if (code === 'CONNECT_DOTS') {
    //         // Fake completions
    //         const payload = {
    //             question_id: session.questions?.[0]?.question_id,
    //             answer_text: "L,5,M,6,N,7,O,8,P,9,Q,10,R,11", // Valid sequence
    //             time_taken: 10
    //         }
    //         handleConnectDotsComplete(payload);
    //     } else if (code === 'EXECUTIVE' || code === 'SEMANTIC') {
    //         const questions = session.questions || [];
    //         const dummyAnswers = questions.map(q => ({
    //             question_id: q.question_id,
    //             answer_text: 'skipped via dev button',
    //             language_code: languageCode
    //         }));
    //         console.log('[ModuleRunner] Skipping Executive/Semantic with payload:', dummyAnswers);
    //         handleExecutiveComplete(dummyAnswers);
    //     } else if (code === 'NUMBER_RECALL') {
    //         const questions = session.questions || [];
    //         const dummyAnswers = questions.map(q => ({
    //             question_id: q.question_id,
    //             answer_text: '123'
    //         }));
    //         console.log('[ModuleRunner] Skipping NumberRecall with payload:', dummyAnswers);
    //         handleNumberRecallComplete(dummyAnswers);
    //     } else if (code === 'REVERSE_NUMBER_RECALL') {
    //         const questions = session.questions || [];
    //         const dummyAnswers = questions.map(q => ({
    //             question_id: q.question_id,
    //             answer_text: '321'
    //         }));
    //         console.log('[ModuleRunner] Skipping ReverseNumberRecall with payload:', dummyAnswers);
    //         handleNumberRecallComplete(dummyAnswers);
    //     } else if (code === 'COLOR_RECALL') {
    //         const dummyAnswers = [{
    //             question_id: session.questions?.[0]?.question_id,
    //             answer_text: 'red, blue, green',
    //             language_code: languageCode
    //         }];
    //         handleNumberRecallComplete(dummyAnswers);
    //     } else if (code === 'DRAWING_RECALL') {
    //         const payload = {
    //             question_id: session.questions?.[0]?.question_id,
    //             answer_text: JSON.stringify([]),
    //             canvas_data: 'skipped',
    //             language_code: languageCode
    //         };
    //         console.log('[ModuleRunner] Skipping DrawingRecall with payload:', payload);
    //         handleDrawingRecallComplete(payload);
    //     } else if (code === 'GROUP_MATCHING') {
    //         console.log('[ModuleRunner] Skipping GroupMatching');
    //         const dummyAnswers = (session.questions || []).map(q => ({
    //             question_id: q.question_id,
    //             answer_text: 'Skipped - Score 0'
    //         }));
    //         handleGroupMatchingComplete(dummyAnswers);
    //     } else if (code === 'DISINHIBITION_SQ_TRI') {
    //         const dummyAnswers = [{
    //             question_id: session.questions?.[0]?.question_id,
    //             answer_text: 'Skipped - Score 0',
    //             score: 0
    //         }];
    //         handleDisinhibitionSqTriComplete(dummyAnswers);
    //     } else if (code === 'VISUAL_NUMBER_RECALL') {
    //         const questions = session.questions || [];
    //         const dummyAnswers = questions.map(q => ({
    //             question_id: q.question_id,
    //             answer_text: '123'
    //         }));
    //         console.log('[ModuleRunner] Skipping VisualNumberRecall with payload:', dummyAnswers);
    //         handleNumberRecallComplete(dummyAnswers);
    //     } else if (code === 'LETTER_DISINHIBITION') {
    //         const dummyAnswers = [{
    //             question_id: session.questions?.[0]?.question_id,
    //             answer_text: 'Skipped - Score 0',
    //             score: 0
    //         }];
    //         console.log('[ModuleRunner] Skipping LetterDisinhibition');
    //         handleLetterDisinhibitionComplete(dummyAnswers);
    //     }
    // };

    const handleDownloadPdf = async () => {
        try {
            const blob = await GameApi.getReportPdf();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DMAC_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Failed to download PDF", error);
            // Optionally set error or show toast if available
        }
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <GenericModal
                isOpen={idleModalOpen}
                onClose={() => { }}
                disableClose={true}
                hideCloseIcon={true}
                hideCancelButton={true}
                title="Idle Timeout"
                submitButtonText={
                    attemptStatus && attemptStatus.count >= attemptStatus.max_attempts
                        ? 'Go Home'
                        : 'Restart'
                }
                onSubmit={restartFromBeginningDueToIdle}
            >
                {attemptStatus && attemptStatus.count >= attemptStatus.max_attempts ? (
                    <Typography sx={{ fontSize: '1.1rem', textAlign: 'center' }}>
                        You were idle for <strong>{idleMinutes}</strong> minutes.
                        <br />
                        You have reached the maximum number of attempts and cannot restart the test.
                    </Typography>
                ) : (
                    <Typography sx={{ fontSize: '1.1rem', textAlign: 'center' }}>
                        You were idle for <strong>{idleMinutes}</strong> minutes.
                        <br />
                        You will be redirected to the beginning of the game and your attempt will be increased by 1.
                    </Typography>
                )}
                {attemptsBanner?.isFinal ? (
                    <Typography sx={{ mt: 2, fontSize: '1rem', textAlign: 'center', color: '#c62828', fontWeight: 600 }}>
                        This is your final attempt. If you are idle again, you won’t be able to retake the test.
                    </Typography>
                ) : null}
            </GenericModal>

            {/* Remove this block when deploying to production */}
            {/* <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 99999 }}>
                <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={handleDevSkip}
                >
                    Skip (Dev)
                </Button>
            </Box> */}

            {/* Completion Modal */}
            <GenericModal
                isOpen={showCompletion}
                onClose={() => { }}
                title={t.completionTitle}
                hideCancelButton={true}
                submitButtonText={t.homeButton}
                onSubmit={handleGoHome}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: '1.2rem', textAlign: 'center', color: '#4caf50', fontWeight: 500 }}>
                        {t.completionMessage}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleDownloadPdf}>
                        Download PDF Report
                    </Button>
                </Box>
            </GenericModal>

            {attemptsBanner ? (
                <Box
                    sx={{
                        width: '100%',
                        mb: 1,
                        px: { xs: 1.5, sm: 2 },
                        py: 1,
                        borderRadius: 1,
                        bgcolor: attemptsBanner.isFinal ? '#ffebee' : '#fff8e1',
                        color: attemptsBanner.isFinal ? '#c62828' : '#8a6d3b',
                        textAlign: 'center',
                        fontWeight: 700,
                    }}
                >
                    Attempts remaining: {attemptsBanner.remaining} / {attemptStatus?.max_attempts}
                </Box>
            ) : null}

            {!showCompletion && moduleCode === 'IMAGE_FLASH' && (
                <ImageFlash session={session} onComplete={handleImageFlashComplete} languageCode={languageCode} />
            )}
            {!showCompletion && moduleCode === 'VISUAL_SPATIAL' && (
                <VisualSpatial session={session} onComplete={handleVisualSpatialComplete} languageCode={languageCode} />
            )}
            {!showCompletion && (moduleCode === 'AUDIO_STORY' || moduleCode === 'AUDIO_STORY_2') && (
                <AudioStoryRecall session={session} onComplete={handleAudioStoryComplete} languageCode={languageCode} />
            )}
            {!showCompletion && (moduleCode === 'AUDIO_STORY_1_RECALL' || moduleCode === 'AUDIO_STORY_2_RECALL') && (
                <AudioStoryRecall session={session} onComplete={handleAudioStoryComplete} languageCode={languageCode} isRecallOnly={true} />
            )}
            {!showCompletion && moduleCode === 'AUDIO_WORDS' && (
                <AudioWordsRecall session={session} onComplete={handleAudioWordsComplete} languageCode={languageCode} />
            )}
            {!showCompletion && moduleCode === 'CONNECT_DOTS' && (
                <ConnectTheDots session={session} onComplete={handleConnectDotsComplete} />
            )}
            {!showCompletion && (moduleCode === 'EXECUTIVE' || moduleCode === 'SEMANTIC') && (
                <ExecutiveQuestions session={session} onComplete={handleExecutiveComplete} languageCode={languageCode} />
            )}
            {!showCompletion && (moduleCode === 'NUMBER_RECALL' || moduleCode === 'REVERSE_NUMBER_RECALL') && (
                <NumberRecall session={session} onComplete={handleNumberRecallComplete} languageCode={languageCode} />
            )}
            {!showCompletion && moduleCode === 'DRAWING_RECALL' && (
                <DrawingRecall session={session} onComplete={handleDrawingRecallComplete} languageCode={languageCode} />
            )}
            {!showCompletion && moduleCode === 'COLOR_RECALL' && (
                <ColorRecall session={session} onComplete={handleColorRecallComplete} languageCode={languageCode} />
            )}
            {!showCompletion && moduleCode === 'VISUAL_PICTURE_RECALL' && (
                <ImageFlash session={session} onComplete={handleImageFlashComplete} languageCode={languageCode} isRecallOnly={true} />
            )}
            {!showCompletion && moduleCode === 'GROUP_MATCHING' && (
                <GroupMatching session={session} onComplete={handleGroupMatchingComplete} languageCode={languageCode} />
            )}
            {!showCompletion && moduleCode === 'AUDIO_WORDS_RECALL' && (
                <AudioWordsRecall session={session} onComplete={handleAudioWordsComplete} languageCode={languageCode} isRecallOnly={true} />
            )}
            {!showCompletion && moduleCode === 'DISINHIBITION_SQ_TRI' && (
                <DisinhibitionSqTri session={session} onComplete={handleDisinhibitionSqTriComplete} languageCode={languageCode} />
            )}
            {!showCompletion && moduleCode === 'VISUAL_NUMBER_RECALL' && (
                <VisualNumberRecall session={session} onComplete={handleNumberRecallComplete} languageCode={languageCode} />
            )}
            {!showCompletion && moduleCode === 'LETTER_DISINHIBITION' && (
                <LetterDisinhibition session={session} onComplete={handleLetterDisinhibitionComplete} languageCode={languageCode} />
            )}
        </Box>
    );
};

export default ModuleRunner;
