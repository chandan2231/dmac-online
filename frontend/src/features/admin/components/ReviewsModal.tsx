import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Rating,
  Avatar,
  CircularProgress,
} from '@mui/material';
import dayjs from 'dayjs';
import GenericModal from '../../../components/modal';
import AdminService from '../admin.service';

interface IReview {
  id: number;
  patient_name: string;
  rating: number;
  review: string;
  created_at: string;
}

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  userType: 'EXPERT' | 'THERAPIST';
  userName: string;
}

const ReviewsModal = ({
  isOpen,
  onClose,
  userId,
  userType,
  userName,
}: ReviewsModalProps) => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const fetchReviews = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    let result;
    if (userType === 'EXPERT') {
      result = await AdminService.getExpertReviews(userId);
    } else {
      result = await AdminService.getTherapistReviews(userId);
    }

    if (result.success && Array.isArray(result.data)) {
      setReviews(result.data);
      const total = result.data.reduce(
        (acc: number, curr: IReview) => acc + curr.rating,
        0
      );
      setAverageRating(result.data.length ? total / result.data.length : 0);
    } else {
      setReviews([]);
      setAverageRating(0);
    }
    setLoading(false);
  }, [userId, userType]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchReviews();
    }
  }, [isOpen, userId, fetchReviews]);

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reviews - ${userName}`}
      hideCancelButton
      maxWidth="md"
    >
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Typography variant="h6">Average Rating:</Typography>
            <Rating value={averageRating} readOnly precision={0.5} />
            <Typography variant="body2" color="textSecondary">
              ({reviews.length} reviews)
            </Typography>
          </Box>

          {reviews.length > 0 ? (
            reviews.map(review => (
              <Box
                key={review.id}
                p={2}
                border="1px solid #e0e0e0"
                borderRadius="8px"
                bgcolor="#fafafa"
              >
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {review.patient_name.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {review.patient_name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {dayjs(review.created_at).format('MMM D, YYYY h:mm A')}
                  </Typography>
                </Box>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" mt={1}>
                  {review.review}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body1" align="center" color="textSecondary">
              No reviews available.
            </Typography>
          )}
        </Box>
      )}
    </GenericModal>
  );
};

export default ReviewsModal;
