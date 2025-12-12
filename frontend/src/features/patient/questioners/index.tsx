import { Box } from '@mui/material';
import { useState } from 'react';
import Disclaimer from './components/Disclaimer';
import FalsePositive from './components/FalsePositive';
import Questions from './components/Questioners';

import ModuleRunner from './components/GameModules/ModuleRunner'; // Import ModuleRunner
import { useSelector } from 'react-redux'; // Import useSelector
import type { RootState } from '../../../../store'; // Import RootState
import { get } from 'lodash'; // Import get

const Questioners = () => {
  const [isQuestionerClosed, setIsQuestionerClosed] = useState(false);
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);
  const [falsePositive, setFalsePositive] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

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
      {!isQuestionerClosed ? (
        <Questions setIsQuestionerClosed={setIsQuestionerClosed} />
      ) : null}

      {isQuestionerClosed && !isDisclaimerAccepted ? (
        <Disclaimer setIsDisclaimerAccepted={setIsDisclaimerAccepted} />
      ) : null}

      {isQuestionerClosed && isDisclaimerAccepted && !falsePositive ? (
        <FalsePositive setFalsePositive={setFalsePositive} />
      ) : null}

      {isQuestionerClosed && isDisclaimerAccepted && falsePositive ? (
        <ModuleRunner
          userId={Number(get(user, 'id', 0))}
          languageCode={typeof get(user, 'languageCode') === 'string' ? get(user, 'languageCode') : 'en'}
          onAllModulesComplete={() => { /* Handle completion, maybe navigate home? */ }}
        />
      ) : null}
    </Box>
  );
};

export default Questioners;
