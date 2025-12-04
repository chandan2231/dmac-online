import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Rating } from '@mui/material';
import type { IAuthState } from '../../auth/auth.interface';
import { useGetExpertReviews } from '../hooks/useGetExpertReviews';
import { TabHeaderLayout } from '../../../components/tab-header';
import Grid from '@mui/material/GridLegacy';
import MorenCard from '../../../components/card';
import GenericModal from '../../../components/modal';
import ModernInput from '../../../components/input';
import CustomLoader from '../../../components/loader';

interface Review {
  id: number;
  patient_id: number;
  expert_id: number;
  consultation_id: number;
  rating: number;
  review: string;
  created_at: string;
  patient_name: string;
}

const Reviews = () => {
  const { user } = useSelector((state: { auth: IAuthState }) => state.auth);
  const { data: reviews = [], isLoading } = useGetExpertReviews(user?.id);
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
    <Box sx={{ p: 3, width: '100%', height: '100%' }}>
      <TabHeaderLayout
        leftNode={
          <Box sx={{ display: 'flex', flex: 1 }}>
            <Typography variant="h6">Reviews</Typography>
          </Box>
        }
        rightNode={
          <ModernInput
            label="Filter by Patient Name"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search..."
          />
        }
      />

      <Grid container spacing={3}>
        {filteredReviews.map(review => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={review.id}>
            <Box
              onClick={() => handleCardClick(review)}
              sx={{ cursor: 'pointer', height: '100%' }}
            >
              <MorenCard title={review.patient_name} minHeight={200}>
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
          </Grid>
        ))}
        {filteredReviews.length === 0 && (
          <Grid item xs={12}>
            <Typography>No reviews found.</Typography>
          </Grid>
        )}
      </Grid>

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
