import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { get } from 'lodash';
import { useGetFalsePositivePageDetails } from '../hooks/useGetFalsePositiveDetails';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../router/router';
import { Box } from '@mui/material';
import CustomLoader from '../../../../components/loader';
import MorenButton from '../../../../components/button';

type IFalsePositiveProps = {
  setFalsePositive: (value: boolean) => void;
};

const FalsePositive = ({ setFalsePositive }: IFalsePositiveProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    data: falsePositiveDetails,
    isPending: isLoadingFalsePositiveDetails,
  } = useGetFalsePositivePageDetails(get(user, ['languageCode'], 'en'));
  const navigate = useNavigate();

  if (isLoadingFalsePositiveDetails) {
    return <CustomLoader />;
  }

  return (
    <Box
      display="flex"
      sx={{
        flexDirection: 'column',
        width: { xs: '95%', sm: '90%', md: '80%' },
        maxWidth: '1000px', // Limit maximum width for large screens
        margin: '0 auto', // Center the container
        pt: { xs: 3, md: 5 },
        pb: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
      gap={2}
    >
      {/* Title */}
      <Box sx={{ fontWeight: 'bold', fontSize: '20px', textAlign: 'center', mb: 4 }}>
        {get(falsePositiveDetails, ['title'], '')}
      </Box>

      {/* Content */}
      <Box
        dangerouslySetInnerHTML={{ __html: get(falsePositiveDetails, ['content'], '') }}
        sx={{
          pl: { xs: 2, md: 2 },
          maxHeight: '60vh',
          overflowY: 'auto',
          pr: 1, // Add padding right to avoid text overlap with scrollbar
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
          '& ol': {
            pl: 2,
            listStyleType: 'decimal',
            mb: 2,
          },
          '& ul': {
            pl: 2,
            listStyleType: 'disc',
            mb: 2,
          },
          '& li': {
            mb: 1,
            lineHeight: 1.6,
          },
          '& h3': {
            mt: 0, // Remove top margin for the first element if it's a header
            pt: 3, // Add padding top instead to respect scrolling
            mb: 2,
            fontSize: '18px',
            fontWeight: 'bold',
          },
          '& p': {
            mb: 2,
          },
          '& hr': {
            my: 3,
            border: '0',
            borderTop: '1px solid #ccc',
          },
        }}
      />

      {/* Doctor Info */}
      <Box sx={{ textAlign: 'center' }}>{get(falsePositiveDetails, ['doctor_info'], '')}</Box>

      {/* Link Text */}
      <Box sx={{ textAlign: 'center' }}>{get(falsePositiveDetails, ['link_text'], '')}</Box>

      <Box
        sx={{
          width: '100%',
          mt: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <MorenButton
          variant="contained"
          onClick={() => setFalsePositive(true)}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minWidth: '200px',
            borderRadius: '25px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            py: 1.5,
          }}
        >
          {get(falsePositiveDetails, ['button_text'], '')}
        </MorenButton>

        {get(falsePositiveDetails, ['secondary_button_text']) ? (
          <MorenButton
            variant="outlined"
            onClick={() => navigate(ROUTES.HOME)}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: '200px',
              borderRadius: '25px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              py: 1.5,
            }}
          >
            {get(falsePositiveDetails, ['secondary_button_text'], '')}
          </MorenButton>
        ) : null}
      </Box>
    </Box>
  );
};

export default FalsePositive;
