import { Box } from '@mui/material';
import { get } from 'lodash';
import MorenButton from '../../../components/button';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { useGetDisclaimerPageDetails } from '../hooks/useGetDisclaimerPageDetails';
import CustomLoader from '../../../components/loader';

type IDisclaimerProps = {
  setIsDisclaimerAccepted: (value: boolean) => void;
};

const Disclaimer = ({ setIsDisclaimerAccepted }: IDisclaimerProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: disclaimerDetails, isPending: isLoadingDisclaimerDetails } =
    useGetDisclaimerPageDetails(get(user, ['languageCode'], 'en'));

  if (isLoadingDisclaimerDetails) {
    return <CustomLoader />;
  }

  return (
    <Box
      display="flex"
      sx={{
        flexDirection: 'column',
      }}
      gap={1}
    >
      {/* Title */}
      <Box>{get(disclaimerDetails, ['title'], '')}</Box>

      {/* Content */}
      <Box>{get(disclaimerDetails, ['content'], '')}</Box>

      {/* Doctor Info */}
      <Box>{get(disclaimerDetails, ['doctor_info'], '')}</Box>

      {/* Link Text */}
      <Box>{get(disclaimerDetails, ['link_text'], '')}</Box>

      <Box>
        <MorenButton
          showGlanceEffect
          variant="contained"
          onClick={() => setIsDisclaimerAccepted(true)}
        >
          {get(disclaimerDetails, ['button_text'], '')}
        </MorenButton>
      </Box>
    </Box>
  );
};

export default Disclaimer;
