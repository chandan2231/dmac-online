import '../index.css';
import { Box } from '@mui/material';
import { get } from 'lodash';
import MorenButton from '../../../components/button';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { useGetDisclaimerPageDetails } from '../hooks/useGetDisclaimerPageDetails';
import CustomLoader from '../../../components/loader';
import { useState } from 'react';
import { useGetReadDisclaimer } from '../hooks/useGetReadDisclaimer';
import GenericModal from '../../../components/modal';

type IDisclaimerProps = {
  setIsDisclaimerAccepted: (value: boolean) => void;
};

const Disclaimer = ({ setIsDisclaimerAccepted }: IDisclaimerProps) => {
  const [isReadDisclaimer, setIsReadDisclaimer] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: disclaimerDetails, isPending: isLoadingDisclaimerDetails } =
    useGetDisclaimerPageDetails(get(user, ['languageCode'], 'en'));
  const { data: readDisclaimerData } = useGetReadDisclaimer(
    get(user, ['languageCode'], 'en'),
    isReadDisclaimer
  );

  if (isLoadingDisclaimerDetails) {
    return <CustomLoader />;
  }

  return (
    <Box
      display="flex"
      sx={{
        flexDirection: 'column',
        width: '80%',
      }}
      gap={1}
    >
      {/* Title */}
      <Box sx={{ fontWeight: 'bold', fontSize: '20px' }}>
        {get(disclaimerDetails, ['title'], '')}
      </Box>

      {/* Content */}
      <Box>{get(disclaimerDetails, ['content'], '')}</Box>

      {/* Doctor Info */}
      <Box>{get(disclaimerDetails, ['doctor_info'], '')}</Box>

      {/* Link Text */}
      <Box
        sx={{
          color: 'blue',
          textDecoration: 'none',
          cursor: 'pointer',
          mb: 2,
        }}
        onClick={() => setIsReadDisclaimer(!isReadDisclaimer)}
      >
        {get(disclaimerDetails, ['link_text'], '')}
      </Box>

      <Box>
        <MorenButton
          variant="contained"
          onClick={() => setIsDisclaimerAccepted(true)}
        >
          {get(disclaimerDetails, ['button_text'], '')}
        </MorenButton>
      </Box>

      <GenericModal
        isOpen={isReadDisclaimer}
        renderHtmlContent={get(readDisclaimerData, ['content'], '')}
        onClose={() => setIsReadDisclaimer(false)}
        title={get(readDisclaimerData, ['title'], '')}
      />
    </Box>
  );
};

export default Disclaimer;
