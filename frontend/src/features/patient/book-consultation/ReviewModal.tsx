import { Box, Typography, Rating, TextField } from '@mui/material';
import GenericModal from '../../../components/modal';
import { useState, useEffect } from 'react';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
  initialRating?: number;
  initialReview?: string;
  viewMode?: boolean;
  submitting?: boolean;
}

const ReviewModal = ({
  open,
  onClose,
  onSubmit,
  initialRating = 0,
  initialReview = '',
  viewMode = false,
  submitting = false,
}: ReviewModalProps) => {
  const [rating, setRating] = useState<number | null>(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (open) {
      setRating(initialRating);
      setReviewText(initialReview);
    }
  }, [open, initialRating, initialReview]);

  const handleSubmit = () => {
    if (rating) {
      onSubmit(rating, reviewText);
    }
  };

  return (
    <GenericModal
      isOpen={open}
      onClose={onClose}
      title={viewMode ? 'View Review' : 'Rate Consultation'}
      maxWidth="xl"
      onSubmit={handleSubmit}
      submitButtonText={submitting ? 'Submitting...' : 'Submit'}
      cancelButtonText="Close"
      submitDisabled={submitting || viewMode}
      hideSubmitButton={viewMode}
    >
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography component="legend">Rating:</Typography>
          <Rating
            name="simple-controlled"
            value={rating}
            onChange={(_, newValue) => {
              if (!viewMode) setRating(newValue);
            }}
            readOnly={viewMode}
          />
        </Box>
        <TextField
          label="Review"
          multiline
          rows={4}
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          disabled={viewMode}
          fullWidth
        />
      </Box>
    </GenericModal>
  );
};

export default ReviewModal;
