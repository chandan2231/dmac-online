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
        pt: { xs: 2, md: 4 },
        // Fill the available height of the parent layout (which may include a header).
        // Avoid using 100vh/100svh here because it can break scrolling on iOS when nested.
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        pb: 0,
      }}
      gap={2}
    >
      {/* Content (scrolls with the page) */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          px: { xs: 1, sm: 2 },
          pt: { xs: 1, md: 2 },
          pb: 2,
          maxWidth: '100%',
          overflowX: 'hidden',
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
            overflowWrap: 'anywhere',
          },
          '& h3': {
            mt: 0,
            pt: 3,
            mb: 2,
            fontSize: '18px',
            fontWeight: 'bold',
            overflowWrap: 'anywhere',
          },
          '& p': {
            mb: 2,
            overflowWrap: 'anywhere',
          },
          '& hr': {
            my: 3,
            border: '0',
            borderTop: '1px solid #ccc',
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
          },
          // If backend HTML includes tables, allow them to scroll horizontally
          // without creating a page-level horizontal scroll.
          '& table': {
            maxWidth: '100%',
            display: 'block',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          },
          '& *': {
            maxWidth: '100%',
          },
        }}
      >
        {/* Title */}
        <Box sx={{ fontWeight: 'bold', fontSize: '20px', textAlign: 'center', mb: 3 }}>
          {get(falsePositiveDetails, ['title'], '')}
        </Box>

        {/* Content */}
        <Box
          dangerouslySetInnerHTML={{ __html: get(falsePositiveDetails, ['content'], '') }}
          sx={{ px: { xs: 1, md: 1 } }}
        />

        {/* Doctor Info */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          {get(falsePositiveDetails, ['doctor_info'], '')}
        </Box>

        {/* Link Text */}
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          {get(falsePositiveDetails, ['link_text'], '')}
        </Box>
      </Box>

      {/* Bottom actions (always visible) */}
      <Box
        sx={{
          width: '100%',
          px: { xs: 1, sm: 2 },
          py: 2,
          pb: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 -6px 12px rgba(0,0,0,0.06)',
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
