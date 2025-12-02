import GenericModal from '../../../components/modal';
import { Typography, Rating, Box, CircularProgress } from '@mui/material';
import { useGetExpertReview } from '../hooks/useGetExpertReview';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  consultationId: number | null;
}

const ReviewModal = ({ open, onClose, consultationId }: ReviewModalProps) => {
  const { data: reviewData, isLoading } = useGetExpertReview(consultationId);
  const review = reviewData;

  return (
    <GenericModal
      isOpen={open}
      onClose={onClose}
      title="Consultation Review"
      maxWidth="sm"
      hideSubmitButton
      cancelButtonText="Close"
      onCancel={onClose}
    >
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : review ? (
        <Box>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography component="legend" sx={{ mr: 1 }}>
              Rating:
            </Typography>
            <Rating value={review.rating} readOnly />
          </Box>
          <Typography variant="subtitle1" gutterBottom>
            Feedback:
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {review.review || 'No written feedback provided.'}
          </Typography>
        </Box>
      ) : (
        <Typography color="textSecondary" align="center">
          No review found for this consultation.
        </Typography>
      )}
    </GenericModal>
  );
};

export default ReviewModal;
