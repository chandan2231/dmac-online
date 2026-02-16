import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import type { Module, SessionData } from '../../../../../services/gameApi';
import ScreeningGameApi from '../../../../../services/screeningGameApi';
import CustomLoader from '../../../../../components/loader';

// Reuse existing game module components
import ImageFlash from '../../../questioners/components/GameModules/ImageFlash';
import VisualSpatial from '../../../questioners/components/GameModules/VisualSpatial';
import AudioStoryRecall from '../../../questioners/components/GameModules/AudioStoryRecall';
import AudioWordsRecall from '../../../questioners/components/GameModules/AudioWordsRecall';
import ConnectTheDots from '../../../questioners/components/GameModules/ConnectTheDots';
import ExecutiveQuestions from '../../../questioners/components/GameModules/ExecutiveQuestions';
import NumberRecall from '../../../questioners/components/GameModules/NumberRecall';
import DrawingRecall from '../../../questioners/components/GameModules/DrawingRecall';
import ColorRecall from '../../../questioners/components/GameModules/ColorRecall';
import GroupMatching from '../../../questioners/components/GameModules/GroupMatching';
import DisinhibitionSqTri from '../../../questioners/components/GameModules/DisinhibitionSqTri';
import VisualNumberRecall from '../../../questioners/components/GameModules/VisualNumberRecall';
import LetterDisinhibition from '../../../questioners/components/GameModules/LetterDisinhibition';

import { useLanguageConstantContext } from '../../../../../providers/language-constant-provider';
import { getLanguageText } from '../../../../../utils/functions';
import GenericModal from '../../../../../components/modal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../../router/router';
import { useIdleTimeout } from '../../../../../hooks/useIdleTimeout';
import { useScreeningTestAttempts } from '../../hooks/useScreeningTestAttempts';
import { useQueryClient } from '@tanstack/react-query';

interface ModuleRunnerProps {
  userId: number;
  languageCode: string;
  onAllModulesComplete: () => void;
  lastCompletedModuleId?: number | null;
}

type GenericAnswer = Record<string, unknown>;
type AnswerWithText = GenericAnswer & { answer_text?: string };
type AnswerWithScore = GenericAnswer & { score?: number };

const PROGRESS_KEY = 'dmac_screening_current_module_id';

const ModuleRunner = ({ userId, languageCode, onAllModulesComplete, lastCompletedModuleId }: ModuleRunnerProps) => {
  const { languageConstants } = useLanguageConstantContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: attemptStatus } = useScreeningTestAttempts(userId, languageCode);

  const t = {
    noModulesFound: getLanguageText(languageConstants, 'game_no_modules_found'),
    fetchError: getLanguageText(languageConstants, 'game_fetch_error'),
    sessionError: getLanguageText(languageConstants, 'game_session_error'),
    completionTitle: getLanguageText(languageConstants, 'game_completion_title'),
    completionMessage: getLanguageText(languageConstants, 'game_completion_message'),
    homeButton: getLanguageText(languageConstants, 'game_home_button')
  };

  const [modules, setModules] = useState<Module[]>([]);
  const [, setCurrentModuleIndex] = useState(0);
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const [idleModalOpen, setIdleModalOpen] = useState(false);
  const [idleMinutes, setIdleMinutes] = useState(0);

  const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
  const IDLE_STORAGE_KEY = 'dmac_screening_last_activity_ts';
  const FORCE_RESTART_KEY = 'dmac_screening_force_restart_from_beginning';
  const FORCE_NEW_SESSION_KEY = 'dmac_screening_force_restart_needs_new_session';

  const attemptsBanner = useMemo(() => {
    if (!attemptStatus) return null;
    const remaining = Math.max(0, (attemptStatus.max_attempts ?? 3) - (attemptStatus.count ?? 0));
    const isFinal = remaining === 0;
    return { remaining, isFinal };
  }, [attemptStatus]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await ScreeningGameApi.getModules();
        const sorted = (res.modules || []).sort((a, b) => a.order_index - b.order_index);
        setModules(sorted);

        const lastActiveRaw = localStorage.getItem(IDLE_STORAGE_KEY);
        const lastActiveTs = lastActiveRaw ? Number(lastActiveRaw) : 0;
        const idleMs = lastActiveTs ? Date.now() - lastActiveTs : 0;
        const forceRestart = Boolean(localStorage.getItem(FORCE_RESTART_KEY));
        const needsNewSession = Boolean(localStorage.getItem(FORCE_NEW_SESSION_KEY));
        const isTimeExpired = Boolean(lastActiveTs) && idleMs > IDLE_TIMEOUT_MS;
        const shouldIgnoreBackendResume = Boolean(forceRestart);

        if (isTimeExpired) {
          const minutes = Math.max(0, Math.ceil(idleMs / 60000));
          setIdleMinutes(minutes);
          setIdleModalOpen(true);
          localStorage.removeItem(PROGRESS_KEY);
          localStorage.setItem(FORCE_RESTART_KEY, String(Date.now()));
          localStorage.setItem(FORCE_NEW_SESSION_KEY, String(Date.now()));
          return;
        }

        const savedId = localStorage.getItem(PROGRESS_KEY);
        let startId = sorted.length > 0 ? sorted[0].id : 0;
        let startIndex = 0;

        if (!shouldIgnoreBackendResume && lastCompletedModuleId) {
          const lastIndex = sorted.findIndex(m => m.id === lastCompletedModuleId);
          if (lastIndex !== -1) {
            if (lastIndex < sorted.length - 1) {
              startIndex = lastIndex + 1;
              startId = sorted[startIndex].id;
            } else {
              onAllModulesComplete();
              return;
            }
          }
        } else if (savedId) {
          const foundIndex = sorted.findIndex(m => m.id === Number(savedId));
          if (foundIndex !== -1) {
            startId = Number(savedId);
            startIndex = foundIndex;
          }
        }

        setCurrentModuleIndex(startIndex);

        if (sorted.length > 0) {
          await startModuleSession(startId, !needsNewSession);
          if (!savedId && startId) {
            localStorage.setItem(PROGRESS_KEY, String(startId));
          }
          if (needsNewSession) {
            localStorage.removeItem(FORCE_NEW_SESSION_KEY);
          }
        } else {
          setError(t.noModulesFound);
          onAllModulesComplete();
        }
      } catch {
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
      const sess = await ScreeningGameApi.startSession(moduleId, userId, languageCode, resume);
      setSession(sess);
    } catch (e) {
      const msg =
        (e as any)?.response?.data?.message ||
        (e as any)?.response?.data?.error ||
        t.sessionError;
      setError(String(msg));
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
      void ScreeningGameApi.abandonInProgressSessions(userId).catch(e => {
        console.error(
          '[Screening ModuleRunner] Failed to abandon sessions after idle (final attempt)',
          e
        );
      });

      localStorage.removeItem(PROGRESS_KEY);
      setLoading(false);
      navigate(ROUTES.HOME);
      return;
    }

    // Reset local state immediately so UI doesn't get stuck.
    setLoading(false);
    setError(null);

    // Reset idle timer immediately on Restart
    setActiveNow();

    // Restart should take the user back to the beginning of the screening assessment flow
    // (same link as after email verification).
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.setItem(FORCE_RESTART_KEY, String(Date.now()));
    localStorage.removeItem(FORCE_NEW_SESSION_KEY);

    // Reset screening flow state (Disclaimer -> FalsePositive -> PreTest -> Questions -> Modules)
    localStorage.removeItem('dmac_screening_flow_isQuestionerClosed');
    localStorage.removeItem('dmac_screening_flow_isDisclaimerAccepted');
    localStorage.removeItem('dmac_screening_flow_falsePositive');
    localStorage.removeItem('dmac_screening_flow_isPreTestCompleted');

    // Best-effort cleanup: do not block redirect.
    void ScreeningGameApi.abandonInProgressSessions(userId).catch(e => {
      console.error('[Screening ModuleRunner] Failed to restart after idle', e);
    });
    void queryClient.invalidateQueries({
      queryKey: ['screening-test-attempts', userId, languageCode],
    });

    navigate(ROUTES.SCREENING_QUESTIONERS, {
      replace: true,
      state: { restartFromIdle: Date.now() },
    });
  };

  const handleModuleSubmit = async (payload: GenericAnswer) => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await ScreeningGameApi.submitSession(session.module.id, session.session_id, payload);

      if (res.next_module_id) {
        const firstModuleId = modules[0]?.id;
        if (firstModuleId && session.module.id === firstModuleId) {
          localStorage.removeItem(FORCE_RESTART_KEY);
        }
        localStorage.setItem(PROGRESS_KEY, String(res.next_module_id));
        await startModuleSession(res.next_module_id);
        const nextIdx = modules.findIndex(m => m.id === res.next_module_id);
        if (nextIdx !== -1) setCurrentModuleIndex(nextIdx);
      } else {
        setShowCompletion(true);
        localStorage.removeItem(PROGRESS_KEY);
        localStorage.removeItem(FORCE_RESTART_KEY);
        onAllModulesComplete();
      }
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
    handleModuleSubmit(payload);
  };

  const handleVisualSpatialComplete = (answers: { question_id: number, selected_option_key: string }[]) => {
    handleModuleSubmit({ answers });
  };

  const handleAudioStoryComplete = (answers: GenericAnswer[]) => {
    handleModuleSubmit({ answers });
  };

  const handleAudioWordsComplete = (answers: GenericAnswer[]) => {
    handleModuleSubmit({ answers });
  };

  const handleConnectDotsComplete = (payload: GenericAnswer) => {
    handleModuleSubmit(payload);
  };

  const handleExecutiveComplete = (answers: GenericAnswer[]) => {
    handleModuleSubmit({ answers });
  };

  const handleNumberRecallComplete = (answers: GenericAnswer[]) => {
    handleModuleSubmit({ answers });
  };

  const handleDrawingRecallComplete = (payload: GenericAnswer) => {
    handleModuleSubmit(payload);
  };

  const handleColorRecallComplete = (answers: GenericAnswer[]) => {
    handleModuleSubmit({ answers });
  };

  const handleGroupMatchingComplete = (answers: AnswerWithText[]) => {
    const total = answers.reduce((acc, curr) => {
      const match = (curr.answer_text || '').match(/Score:\s*(\d+)/);
      return acc + (match ? parseInt(match[1], 10) : 0);
    }, 0);

    handleModuleSubmit({ answers, score: total });
  };

  const handleDisinhibitionSqTriComplete = (answers: AnswerWithScore[]) => {
    handleModuleSubmit({
      answers
    });
  };

  const handleLetterDisinhibitionComplete = (answers: GenericAnswer[]) => {
    handleModuleSubmit({ answers });
  };

  const handleGoHome = () => {
    navigate(ROUTES.HOME);
  };

  if (error) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
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

  //   const handleDevSkip = () => {
  //     if (!session) return;
  //     const code = session.module.code;

  //     if (code === 'IMAGE_FLASH' || code === 'VISUAL_PICTURE_RECALL') {
  //       handleImageFlashComplete('skipped');
  //     } else if (code === 'VISUAL_SPATIAL') {
  //       const rounds = session.questions || [];
  //       const dummyAnswers = rounds.map(round => ({
  //         question_id: round.question_id,
  //         selected_option_key: round.options?.[0]?.option_key || 'skipped_option'
  //       }));
  //       handleVisualSpatialComplete(dummyAnswers);
  //     } else if (code === 'AUDIO_STORY' || code === 'AUDIO_STORY_2' || code === 'AUDIO_STORY_1_RECALL' || code === 'AUDIO_STORY_2_RECALL') {
  //       const stories = session.questions || [];
  //       const dummyAnswers = stories.map(story => ({
  //         question_id: story.question_id,
  //         answer_text: 'skipped via dev button'
  //       }));
  //       handleAudioStoryComplete(dummyAnswers);
  //     } else if (code === 'AUDIO_WORDS' || code === 'AUDIO_WORDS_RECALL') {
  //       const questions = session.questions || [];
  //       const dummyAnswers = questions.map(q => ({
  //         question_id: q.question_id,
  //         answer_text: 'skipped via dev button',
  //         language_code: languageCode
  //       }));
  //       handleAudioWordsComplete(dummyAnswers);
  //     } else if (code === 'CONNECT_DOTS') {
  //       handleConnectDotsComplete({
  //         question_id: session.questions?.[0]?.question_id,
  //         answer_text: 'L,5,M,6,N,7,O,8,P,9,Q,10,R,11',
  //         time_taken: 10
  //       });
  //     } else if (code === 'EXECUTIVE' || code === 'SEMANTIC') {
  //       const questions = session.questions || [];
  //       const dummyAnswers = questions.map(q => ({
  //         question_id: q.question_id,
  //         answer_text: 'skipped via dev button',
  //         language_code: languageCode
  //       }));
  //       handleExecutiveComplete(dummyAnswers);
  //     } else if (code === 'NUMBER_RECALL' || code === 'VISUAL_NUMBER_RECALL') {
  //       const questions = session.questions || [];
  //       const dummyAnswers = questions.map(q => ({
  //         question_id: q.question_id,
  //         answer_text: '123'
  //       }));
  //       handleNumberRecallComplete(dummyAnswers);
  //     } else if (code === 'REVERSE_NUMBER_RECALL') {
  //       const questions = session.questions || [];
  //       const dummyAnswers = questions.map(q => ({
  //         question_id: q.question_id,
  //         answer_text: '321'
  //       }));
  //       handleNumberRecallComplete(dummyAnswers);
  //     } else if (code === 'COLOR_RECALL') {
  //       const dummyAnswers = [{
  //         question_id: session.questions?.[0]?.question_id,
  //         answer_text: 'red, blue, green',
  //         language_code: languageCode
  //       }];
  //       handleNumberRecallComplete(dummyAnswers);
  //     } else if (code === 'DRAWING_RECALL') {
  //       handleDrawingRecallComplete({
  //         question_id: session.questions?.[0]?.question_id,
  //         answer_text: JSON.stringify([]),
  //         canvas_data: 'skipped',
  //         language_code: languageCode
  //       });
  //     } else if (code === 'GROUP_MATCHING') {
  //       const dummyAnswers = (session.questions || []).map(q => ({
  //         question_id: q.question_id,
  //         answer_text: 'Skipped - Score 0'
  //       }));
  //       handleGroupMatchingComplete(dummyAnswers);
  //     } else if (code === 'DISINHIBITION_SQ_TRI') {
  //       handleDisinhibitionSqTriComplete([{
  //         question_id: session.questions?.[0]?.question_id,
  //         answer_text: 'Skipped - Score 0',
  //         score: 0
  //       }]);
  //     } else if (code === 'LETTER_DISINHIBITION') {
  //       handleLetterDisinhibitionComplete([{
  //         question_id: session.questions?.[0]?.question_id,
  //         answer_text: 'Skipped - Score 0',
  //         score: 0
  //       }]);
  //     }
  //   };

  const handleDownloadPdf = async () => {
    try {
      const blob = await ScreeningGameApi.getReportPdf(userId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DMAC_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error('Failed to download PDF', e);
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

      {/* <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 99999 }}>
        <Button variant="contained" color="error" size="small" onClick={handleDevSkip}>
          Skip (Dev)
        </Button>
      </Box> */}

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
