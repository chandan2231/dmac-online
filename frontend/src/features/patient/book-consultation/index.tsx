import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { Box, Typography } from '@mui/material';
import { useExperts } from '../hooks/useExperts';
import type { IExpert } from '../patient.interface';
import CustomLoader from '../../../components/loader';
import MorenCard from '../../../components/card';

const BookConsultation = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: experts, isLoading } = useExperts(user);

  if (isLoading) {
    return <CustomLoader />;
  }

  return (
    <Box p={3} height="100%" width="100%">
      <Typography variant="h4" gutterBottom>
        Book Consultation
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {experts?.map((expert: IExpert) => (
          <Box key={expert.id} sx={{ flex: '1 1 300px' }}>
            <MorenCard title={expert.name} description={`Role: ${expert.role}`}>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Email: {expert.email}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Country: {expert.country}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Languages: {expert.language_names}
                </Typography>
              </Box>
            </MorenCard>
          </Box>
        ))}
        {(!experts || experts.length === 0) && (
          <Box sx={{ width: '100%' }}>
            <Typography>No experts found.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BookConsultation;
