import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { get } from 'lodash';
import { useGetFalsePositivePageDetails } from '../hooks/useGetFalsePositiveDetails';
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

  if (isLoadingFalsePositiveDetails) {
    return <CustomLoader />;
  }

  return (
    <Box
      display="flex"
      sx={{
        flexDirection: 'column',
        width: '80%',
        margin: '0 auto', // Center the container
        py: 5, // Add padding top and bottom
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
        sx={{ pl: { xs: 2, md: 5 } }}
      />

      {/* Doctor Info */}
      <Box sx={{ textAlign: 'center' }}>{get(falsePositiveDetails, ['doctor_info'], '')}</Box>

      {/* Link Text */}
      <Box sx={{ textAlign: 'center' }}>{get(falsePositiveDetails, ['link_text'], '')}</Box>

      <Box>
        <MorenButton variant="contained" onClick={() => setFalsePositive(true)}>
          {get(falsePositiveDetails, ['button_text'], '')}
        </MorenButton>
      </Box>
    </Box>
  );
};

export default FalsePositive;
