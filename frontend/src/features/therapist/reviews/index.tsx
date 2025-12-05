import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Rating, TextField } from '@mui/material';
import type { IAuthState } from '../../auth/auth.interface';
import { useTherapistReviews } from '../hooks/useTherapistReviews';
import { TabHeaderLayout } from '../../../components/tab-header';
import MorenCard from '../../../components/card';
import GenericModal from '../../../components/modal';
import CustomLoader from '../../../components/loader';

interface Review {
  id: number;
  patient_id: number;
  therapist_id: number;
  consultation_id: number;
  rating: number;
  review: string;
  created_at: string;
  patient_name: string;
}

const Reviews = () => {
  const { user } = useSelector((state: { auth: IAuthState }) => state.auth);
  const { data: reviews = [], isLoading } = useTherapistReviews(user?.id);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (reviews) {
      if (searchQuery) {
        const filtered = reviews.filter((review: Review) =>
          review.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredReviews(filtered);
      } else {
        setFilteredReviews(reviews);
      }
    }
  }, [searchQuery, reviews]);

  const handleCardClick = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  if (isLoading) {
    return <CustomLoader />;
  }

  return (
    <Box p={3} height="100%" width="100%">
      <TabHeaderLayout
        leftNode={
          <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
              }}
            >
              Rating and Reviews
            </Typography>
          </Box>
        }
        rightNode={
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              label="Filter by Patient Name"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              variant="outlined"
              size="small"
              sx={{
                maxHeight: 40,
              }}
            />
          </Box>
        }
      />

      <Box display="flex" flexWrap="wrap" gap={3}>
        {filteredReviews.map(review => (
          <Box
            key={review.id}
            sx={{
              width: {
                xs: '100%',
                sm: 'calc(50% - 12px)',
                md: 'calc(33.33% - 16px)',
                lg: 'calc(25% - 18px)',
              },
              cursor: 'pointer',
            }}
            onClick={() => handleCardClick(review)}
          >
            <MorenCard
              title={review.patient_name}
              minHeight={200}
              cardStyles={{
                margin: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={review.rating} readOnly />
                <Typography
                  variant="body2"
                  sx={{ ml: 1, color: 'text.secondary' }}
                >
                  {new Date(review.created_at).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{}}>
                {review.review.length > 100
                  ? `${review.review.substring(0, 100)}...`
                  : review.review}
              </Typography>
            </MorenCard>
          </Box>
        ))}
        {filteredReviews.length === 0 && (
          <Box width="100%">
            <Typography>No reviews found.</Typography>
          </Box>
        )}
      </Box>

      <GenericModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Review by ${selectedReview?.patient_name}`}
        hideSubmitButton
        cancelButtonText="Close"
        onCancel={handleCloseModal}
      >
        {selectedReview && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={selectedReview.rating} readOnly />
              <Typography
                variant="body2"
                sx={{ ml: 1, color: 'text.secondary' }}
              >
                {new Date(selectedReview.created_at).toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedReview.review}
            </Typography>
          </Box>
        )}
      </GenericModal>
    </Box>
  );
};

export default Reviews;
