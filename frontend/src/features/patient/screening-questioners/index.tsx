import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import AppAppBar from '../../landing-page/components/AppBar';
import AppFooter from '../../landing-page/components/AppFooter';
import Disclaimer from '../questioners/components/Disclaimer';
import FalsePositive from '../questioners/components/FalsePositive';
import PreTest from './components/PreTest';
import Questions from './components/Questioners';
import ModuleRunner from './components/GameModules/ModuleRunner';
import GenericModal from '../../../components/modal';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../router/router';
import { getScreeningUserId, isScreeningUserVerified } from './storage';
import { useScreeningTestAttempts } from './hooks/useScreeningTestAttempts';
import ScreeningRegistrationModal from './components/ScreeningRegistrationModal';

const loadState = (key: string) => {
  const saved = localStorage.getItem(`dmac_screening_flow_${key}`);
  return saved ? JSON.parse(saved) : false;
};

const ScreeningQuestioners = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = getScreeningUserId();
  const isVerified = isScreeningUserVerified();
  const languageCode = 'en';

  const [isQuestionerClosed, setIsQuestionerClosed] = useState(() => loadState('isQuestionerClosed'));
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(() => loadState('isDisclaimerAccepted'));
  const [falsePositive, setFalsePositive] = useState(() => loadState('falsePositive'));
  const [isPreTestCompleted, setIsPreTestCompleted] = useState(() => loadState('isPreTestCompleted'));

  const [showExitWarning, setShowExitWarning] = useState(false);

  const [lastHandledRestartFromIdle, setLastHandledRestartFromIdle] = useState<number | null>(null);

  useEffect(() => {
    const state = location.state as { restartFromIdle?: number } | null;
    const restartTs = state?.restartFromIdle;
    if (!restartTs) return;
    if (lastHandledRestartFromIdle === restartTs) return;

    setLastHandledRestartFromIdle(restartTs);
    setShowExitWarning(false);
    setIsQuestionerClosed(false);
    setIsDisclaimerAccepted(false);
    setFalsePositive(false);
    setIsPreTestCompleted(false);
  }, [location.state, lastHandledRestartFromIdle]);

  const { data: attemptStatus, isLoading: isLoadingAttempts } = useScreeningTestAttempts(
    isVerified ? userId : 0,
    languageCode
  );

  // Once the screening assessment flow is entered, disable header/footer interactions
  // to prevent navigation away mid-test.
  const isAssessmentInProgress = Boolean(isVerified && !attemptStatus?.isCompleted);

  const handleAllModulesComplete = () => {
    // no-op for now
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPreTestCompleted && falsePositive) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isPreTestCompleted, falsePositive]);

  useEffect(() => {
    if (isPreTestCompleted) {
      window.history.pushState(null, document.title, window.location.href);
      const handlePopState = () => {
        setShowExitWarning(true);
        window.history.pushState(null, document.title, window.location.href);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isPreTestCompleted]);

  useEffect(() => {
    localStorage.setItem('dmac_screening_flow_isQuestionerClosed', JSON.stringify(isQuestionerClosed));
  }, [isQuestionerClosed]);

  useEffect(() => {
    localStorage.setItem('dmac_screening_flow_isDisclaimerAccepted', JSON.stringify(isDisclaimerAccepted));
  }, [isDisclaimerAccepted]);

  useEffect(() => {
    localStorage.setItem('dmac_screening_flow_falsePositive', JSON.stringify(falsePositive));
  }, [falsePositive]);

  useEffect(() => {
    localStorage.setItem('dmac_screening_flow_isPreTestCompleted', JSON.stringify(isPreTestCompleted));
  }, [isPreTestCompleted]);

  const handleStay = () => {
    setShowExitWarning(false);
  };

  const handleExit = () => {
    setShowExitWarning(false);
    navigate(ROUTES.HOME);
  };

  if (!isVerified) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppAppBar />
        <ScreeningRegistrationModal isOpen />

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Please verify your email to access the assessment.
          </Typography>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <AppFooter />
        </Box>
      </Box>
    );
  }

  if (isLoadingAttempts) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        Loading...
      </Box>
    );
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
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            bgcolor: '#e8f5e9',
            color: '#2e7d32',
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            fontWeight: 'medium',
            fontSize: '1.25rem',
            boxShadow:
              '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}
        >
          {attemptStatus.completionMessage ||
            'The Digital Memory and Cognitive Assessment has been successfully completed. Your cognitive assessment report, including recommendations, will be emailed to you within 48 hours.'}
        </Box>
        <Box sx={{ mt: 4 }}>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Home
          </button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        aria-hidden={isAssessmentInProgress ? 'true' : undefined}
        sx={{
          pointerEvents: isAssessmentInProgress ? 'none' : 'auto',
          opacity: isAssessmentInProgress ? 0.55 : 1,
          filter: isAssessmentInProgress ? 'grayscale(1)' : 'none',
          userSelect: isAssessmentInProgress ? 'none' : 'auto',
        }}
      >
        <AppAppBar />
      </Box>
      <Box
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
      {!isDisclaimerAccepted ? <Disclaimer setIsDisclaimerAccepted={setIsDisclaimerAccepted} /> : null}

      {isDisclaimerAccepted && !falsePositive ? <FalsePositive setFalsePositive={setFalsePositive} /> : null}

      {isDisclaimerAccepted && falsePositive && !isPreTestCompleted ? (
        <PreTest
          setPreTestCompleted={setIsPreTestCompleted}
          userId={userId}
          languageCode={languageCode}
          attemptStatus={attemptStatus}
          isLoadingAttempts={isLoadingAttempts}
        />
      ) : null}

      {isDisclaimerAccepted && falsePositive && isPreTestCompleted && !isQuestionerClosed ? (
        <Questions setIsQuestionerClosed={setIsQuestionerClosed} userId={userId} languageCode={languageCode} />
      ) : null}

      {isDisclaimerAccepted && falsePositive && isPreTestCompleted && isQuestionerClosed ? (
        <ModuleRunner
          userId={userId}
          languageCode={languageCode}
          onAllModulesComplete={handleAllModulesComplete}
          lastCompletedModuleId={attemptStatus?.lastModuleCompleted?.id}
        />
      ) : null}

      <GenericModal
        isOpen={showExitWarning}
        onClose={handleStay}
        title="Warning"
        submitButtonText="Exit"
        cancelButtonText="Stay"
        onSubmit={handleExit}
        onCancel={handleStay}
      >
        <Typography sx={{ fontSize: '1.2rem', textAlign: 'center', mb: 2 }}>
          {attemptStatus && attemptStatus.count < attemptStatus.max_attempts ? (
            <span>
              Warning! You are on attempt <strong>{attemptStatus.count}</strong> of{' '}
              <strong>{attemptStatus.max_attempts}</strong>. If you exit now, this attempt will be forfeited.
              You will have <strong>{attemptStatus.max_attempts - attemptStatus.count}</strong> attempts remaining.
              Are you sure you want to exit?
            </span>
          ) : (
            <span>
              Warning! You are on your <strong>FINAL</strong> attempt (
              <strong>{attemptStatus?.count || 3}</strong> of <strong>{attemptStatus?.max_attempts || 3}</strong>). If you
              exit now, you will <strong>NOT</strong> be able to retake the test. Are you sure you want to exit?
            </span>
          )}
        </Typography>
      </GenericModal>
      </Box>
      <Box
        aria-hidden={isAssessmentInProgress ? 'true' : undefined}
        sx={{
          mt: 'auto',
          pointerEvents: isAssessmentInProgress ? 'none' : 'auto',
          opacity: isAssessmentInProgress ? 0.55 : 1,
          filter: isAssessmentInProgress ? 'grayscale(1)' : 'none',
          userSelect: isAssessmentInProgress ? 'none' : 'auto',
        }}
      >
        <AppFooter />
      </Box>
    </Box>
  );
};

export default ScreeningQuestioners;
