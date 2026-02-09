import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import Disclaimer from './components/Disclaimer';
import FalsePositive from './components/FalsePositive';
import PreTest from './components/PreTest';
import Questions from './components/Questioners';

import ModuleRunner from './components/GameModules/ModuleRunner';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { get } from 'lodash';
import { useTestAttempts } from './hooks/useTestAttempts';
import GenericModal from '../../../components/modal';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../router/router';


const Questioners = () => {

  // Load initial state from localStorage or default to false
  const loadState = (key: string) => {
    const saved = localStorage.getItem(`dmac_flow_${key}`);
    return saved ? JSON.parse(saved) : false;
  };

  const [isQuestionerClosed, setIsQuestionerClosed] = useState(() => loadState('isQuestionerClosed'));
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(() => loadState('isDisclaimerAccepted'));
  const [falsePositive, setFalsePositive] = useState(() => loadState('falsePositive'));
  const [isPreTestCompleted, setIsPreTestCompleted] = useState(() => loadState('isPreTestCompleted'));
  const { user } = useSelector((state: RootState) => state.auth);
  const languageCode = get(user, 'languageCode', 'en');

  const [showExitWarning, setShowExitWarning] = useState(false);
  const { data: attemptStatus, isLoading: isLoadingAttempts } = useTestAttempts(languageCode);
  const navigate = useNavigate();

  const handleAllModulesComplete = () => {
    // Handle completion
  };

  // --- Hooks (Must be before any return) ---

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

  // History Trap for Back Button
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

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('dmac_flow_isQuestionerClosed', JSON.stringify(isQuestionerClosed));
  }, [isQuestionerClosed]);

  useEffect(() => {
    localStorage.setItem('dmac_flow_isDisclaimerAccepted', JSON.stringify(isDisclaimerAccepted));
  }, [isDisclaimerAccepted]);

  useEffect(() => {
    localStorage.setItem('dmac_flow_falsePositive', JSON.stringify(falsePositive));
  }, [falsePositive]);

  useEffect(() => {
    localStorage.setItem('dmac_flow_isPreTestCompleted', JSON.stringify(isPreTestCompleted));
  }, [isPreTestCompleted]);


  const handleStay = () => {
    setShowExitWarning(false);
  };

  const handleExit = () => {
    setShowExitWarning(false);
    navigate(ROUTES.HOME);
  };

  // --- Conditional Renders ---

  if (isLoadingAttempts) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>;
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
          justifyContent: 'center'
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
              borderRadius: '4px'
            }}
          >
            Home
          </button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 1. Intro Screen (Disclaimer) */}
      {!isDisclaimerAccepted ? (
        <Disclaimer setIsDisclaimerAccepted={setIsDisclaimerAccepted} />
      ) : null}

      {/* 2. Instructions Screen (False Positive / Instructions) */}
      {isDisclaimerAccepted && !falsePositive ? (
        <FalsePositive setFalsePositive={setFalsePositive} />
      ) : null}

      {/* 3. Pre-Test Screen */}
      {isDisclaimerAccepted && falsePositive && !isPreTestCompleted ? (
        <PreTest setPreTestCompleted={setIsPreTestCompleted} />
      ) : null}

      {/* 4. Questionnaire (Questions) */}
      {isDisclaimerAccepted &&
        falsePositive &&
        isPreTestCompleted &&
        !isQuestionerClosed ? (
        <Questions setIsQuestionerClosed={setIsQuestionerClosed} />
      ) : null}

      {/* 5. Game Modules */}
      {isDisclaimerAccepted &&
        falsePositive &&
        isPreTestCompleted &&
        isQuestionerClosed ? (
        <ModuleRunner
          userId={Number(get(user, 'id', 0))}
          languageCode={(get(user, 'languageCode') as string) || 'en'}
          onAllModulesComplete={handleAllModulesComplete}
          lastCompletedModuleId={attemptStatus?.lastModuleCompleted?.id}
        />
      ) : null}

      {/* Exit Warning Modal */}
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
              Warning! You are on attempt <strong>{attemptStatus.count}</strong> of <strong>{attemptStatus.max_attempts}</strong>.
              If you exit now, this attempt will be forfeited. You will have <strong>{attemptStatus.max_attempts - attemptStatus.count}</strong> attempts remaining.
              Are you sure you want to exit?
            </span>
          ) : (
            <span>
              Warning! You are on your <strong>FINAL</strong> attempt (<strong>{attemptStatus?.count || 3}</strong> of <strong>{attemptStatus?.max_attempts || 3}</strong>).
              If you exit now, you will <strong>NOT</strong> be able to retake the test.
              Are you sure you want to exit?
            </span>
          )}
        </Typography>
      </GenericModal>
    </Box>
  );
};

export default Questioners;
