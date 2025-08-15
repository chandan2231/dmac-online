import { Box } from '@mui/material';
import { useState } from 'react';
import Disclaimer from './components/Disclaimer';
import FalsePositive from './components/FalsePositive';
import Questions from './components/Questioners';

const Questioners = () => {
  const [isQuestionerClosed, setIsQuestionerClosed] = useState(false);
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);
  const [falsePositive, setFalsePositive] = useState(false);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        padding: 2,
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
    </Box>
  );
};

export default Questioners;
