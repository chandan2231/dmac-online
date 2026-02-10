import { useState, useEffect } from 'react';
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

interface ModuleRunnerProps {
    userId: number; // Actually userId might come from auth context inside here or passed down
    languageCode: string;
    onAllModulesComplete: () => void;
    lastCompletedModuleId?: number | null;
}

const ModuleRunner = ({ userId, languageCode, onAllModulesComplete, lastCompletedModuleId }: ModuleRunnerProps) => {
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

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await GameApi.getModules();
                const sorted = (res.modules || []).sort((a, b) => a.order_index - b.order_index);
                setModules(sorted);

                // Determine start module
                const savedId = localStorage.getItem('dmac_current_module_id');
                let startId = sorted.length > 0 ? sorted[0].id : 0;
                let startIndex = 0;

                // Priority 1: Check backend last completed module
                if (lastCompletedModuleId) {
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
                    startModuleSession(startId);
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
    }, [lastCompletedModuleId]);

    const startModuleSession = async (moduleId: number) => {
        setLoading(true);
        setError(null);
        try {
            console.log(`[ModuleRunner] Starting session for module ${moduleId}`);
            // Resume exiting session (created in PreTest) for Module 1, or generally allow resume
            // To support attempt tracking via PreTest, we MUST resume if a session exists.
            const sess = await GameApi.startSession(moduleId, userId, languageCode, true); // resume = true
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
                // Save progress
                localStorage.setItem('dmac_current_module_id', String(res.next_module_id));

                await startModuleSession(res.next_module_id);
                const nextIdx = modules.findIndex(m => m.id === res.next_module_id);
                if (nextIdx !== -1) setCurrentModuleIndex(nextIdx);
            } else {
                // All modules completed - show completion screen
                setShowCompletion(true);
                // Re-enable language selector
                localStorage.removeItem('dmac_current_module_id'); // Clear progress on complete
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

    const handleAudioWordsComplete = (answers: any[]) => {
        handleModuleSubmit({
            answers
        });
    };

    const handleConnectDotsComplete = (payload: any) => {
        handleModuleSubmit(payload);
    };

    const handleExecutiveComplete = (answers: any[]) => {
        handleModuleSubmit({
            answers
        });
    };

    const handleNumberRecallComplete = (answers: any[]) => {
        handleModuleSubmit({
            answers
        });
    };

    const handleDrawingRecallComplete = (payload: any) => {
        handleModuleSubmit(payload);
    };

    const handleColorRecallComplete = (answers: any[]) => {
        handleModuleSubmit({
            answers
        });
    };

    const handleGroupMatchingComplete = (answers: any[]) => {
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

    const handleDisinhibitionSqTriComplete = (answers: any[]) => {
        handleModuleSubmit({
            answers,
            // Pass score explicitly if it's in the answers array object or let backend handle it 
            // The component sends [{ question_id, answer_text, score }]
            score: answers[0]?.score
        });
    };

    const handleLetterDisinhibitionComplete = (answers: any[]) => {
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
