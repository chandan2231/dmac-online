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

  const [showExitWarning, setShowExitWarning] = useState(false);
  const { data: attemptStatus } = useTestAttempts();
  const navigate = useNavigate();

  const handleAllModulesComplete = () => {
    // Handle completion, maybe navigate home?
    // Once complete, we can stop warning (though status update might handle navigation)
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPreTestCompleted && falsePositive) { // falsePositive is actually Instructions screen, so if PreTest done = test started
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isPreTestCompleted, falsePositive]);

  // History Trap for Back Button
  useEffect(() => {
    // Only trap if test has started
    if (isPreTestCompleted) {
      // Logic:
      // 1. Push a state to history so "Back" doesn't actually leave the page.
      // 2. Listen for 'popstate' (Back button).
      // 3. Show warning and handle response.

      // Push dummy state to create a history buffer
      window.history.pushState(null, document.title, window.location.href);

      const handlePopState = () => {
        // Prevent default navigation is tricky with popstate, but by pushing state we are already "safe"
        // as we land on the previous entry which is the same page.

        // Show warning
        setShowExitWarning(true);

        // Push state AGAIN to re-arm the trap immediately, so if they click cancel/stay, they are still trapped.
        // If they choose to exit, we will manually navigate away.
        window.history.pushState(null, document.title, window.location.href);
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isPreTestCompleted]);

  const handleStay = () => {
    setShowExitWarning(false);
  };

  const handleExit = () => {
    setShowExitWarning(false);
    // Explicitly navigate to home or allow normal back behavior (but history is messy now, so explicit nav is safer)
    // Also clearing persistence might be handled by PreTest on new start, or we can clear here if needed.
    // For now, just navigate home.
    navigate(ROUTES.HOME);
  };

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
