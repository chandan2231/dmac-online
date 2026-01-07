import { Box } from '@mui/material';
import { useState } from 'react';
import Disclaimer from './components/Disclaimer';
import FalsePositive from './components/FalsePositive';
import PreTest from './components/PreTest';
import Questions from './components/Questioners';

import ModuleRunner from './components/GameModules/ModuleRunner';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { get } from 'lodash';


const Questioners = () => {

  const [isQuestionerClosed, setIsQuestionerClosed] = useState(false);
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);
  const [falsePositive, setFalsePositive] = useState(false);
  const [isPreTestCompleted, setIsPreTestCompleted] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleAllModulesComplete = () => {
    // Handle completion, maybe navigate home?
  };

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
    </Box>
  );
};

export default Questioners;
