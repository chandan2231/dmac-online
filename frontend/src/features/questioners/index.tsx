import { Box } from '@mui/material';
import { useState } from 'react';
import Disclaimer from './components/Disclaimer';

const Questioners = () => {
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        padding: 2,
      }}
    >
      {!isDisclaimerAccepted ? (
        <Disclaimer setIsDisclaimerAccepted={setIsDisclaimerAccepted} />
      ) : null}
    </Box>
  );
};

export default Questioners;
