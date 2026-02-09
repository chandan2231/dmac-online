import '../index.css';
import { Box } from '@mui/material';
import { get } from 'lodash';
import MorenButton from '../../../../components/button';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { useGetDisclaimerPageDetails } from '../hooks/useGetDisclaimerPageDetails';
import CustomLoader from '../../../../components/loader';
import { useState } from 'react';
import { useGetReadDisclaimer } from '../hooks/useGetReadDisclaimer';
import GenericModal from '../../../../components/modal';

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
        width: { xs: '90%', md: '80%' },
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}
      gap={3}
    >
      {/* Title */}
      <Box sx={{ fontWeight: 'bold', fontSize: '1.75rem', color: '#2c3e50' }}>
        {get(disclaimerDetails, ['title'], '')}
      </Box>

      {/* Content */}
      <Box sx={{ textAlign: 'left', lineHeight: 1.6, fontSize: '1.05rem', color: '#333' }}>
        {get(disclaimerDetails, ['content'], '')}
      </Box>

      {/* Doctor Info */}
      <Box sx={{
        whiteSpace: 'pre-wrap',
        fontWeight: 600,
        fontSize: '1rem',
        color: '#000',
        mt: 2
      }}>
        {get(disclaimerDetails, ['doctor_info'], '')}
      </Box>

      {/* Link Text */}
      <Box
        sx={{
          color: 'text.primary',
          textDecoration: 'underline',
          cursor: 'pointer',
          fontWeight: 500,
          '&:hover': { opacity: 0.8 }
        }}
        onClick={() => setIsReadDisclaimer(!isReadDisclaimer)}
      >
        {get(disclaimerDetails, ['link_text'], '')}
      </Box>

      <Box width="100%">
        <MorenButton
          variant="contained"
          onClick={() => setIsDisclaimerAccepted(true)}
          sx={{
            width: '100%',
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 700,
            borderRadius: 2
          }}
        >
          {get(disclaimerDetails, ['button_text'], '')}
        </MorenButton>
      </Box>

      <GenericModal
        isOpen={isReadDisclaimer}
        renderHtmlContent={get(readDisclaimerData, ['content'], '')}
        onClose={() => setIsReadDisclaimer(false)}
        title={get(readDisclaimerData, ['title'], '')}
      >
        {null}
      </GenericModal>
    </Box>
  );
};

export default Disclaimer;
