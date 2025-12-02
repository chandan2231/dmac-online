import { useState } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import type { RootState } from '../../../store';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useTherapists } from '../hooks/useTherapists';
import { useGetSubscribedProduct } from '../hooks/useGetSubscribedProduct';
import { useGetTherapistConsultations } from '../hooks/useGetTherapistConsultations';
import type { IConsultation } from '../patient.interface';
import CustomLoader from '../../../components/loader';
import PatientService from '../patient.service';
import { useToast } from '../../../providers/toast-provider';
import SubscriptionRequired from '../../../components/subscription-required';
import TherapistConsultationList from './TherapistConsultationList';
import BookTherapistForm from './BookTherapistForm';
import RescheduleModal from './RescheduleModal';
import ReviewModal from '../book-consultation/ReviewModal';

const BookTherapist = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();

  const [view, setView] = useState<'list' | 'book'>('list');

  const { data: consultations = [], isLoading: loadingConsultations } =
    useGetTherapistConsultations(user);

  const isAddDisabled = consultations.some((c: IConsultation) =>
    [0, 1, 2, 3, 4].includes(c.status)
  );

  // Reschedule State
  const [selectedConsultation, setSelectedConsultation] =
    useState<IConsultation | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  // Review State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [viewReviewMode, setViewReviewMode] = useState(false);

  const enableReviews = import.meta.env.VITE_ENABLE_REVIEWS === 'true';

  const { data: therapists } = useTherapists(
    user,
    dayjs().format('YYYY-MM-DD')
  );

  const handleReviewClick = async (consultation: IConsultation) => {
    setSelectedConsultation(consultation);
    const existingReview = await PatientService.getTherapistReview(
      consultation.id
    );
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.review);
      setViewReviewMode(true);
    } else {
      setRating(0);
      setReviewText('');
      setViewReviewMode(false);
    }
    setReviewModalOpen(true);
  };

  const handleReviewClose = () => {
    setReviewModalOpen(false);
    setRating(0);
    setReviewText('');
    setViewReviewMode(false);
    setSelectedConsultation(null);
  };

  const handleReviewSubmit = async (newRating: number, newReview: string) => {
    if (!selectedConsultation) return;

    setReviewSubmitting(true);
    const result = await PatientService.addTherapistReview({
      patient_id: get(user, 'id'),
      therapist_id:
        selectedConsultation.therapist_id || selectedConsultation.consultant_id,
      consultation_id: selectedConsultation.id,
      rating: newRating,
      review: newReview,
    });

    if (result && !result.error) {
      showToast('Review submitted successfully!', 'success');
      handleReviewClose();
    } else {
      showToast(result?.message || 'Failed to submit review.', 'error');
    }
    setReviewSubmitting(false);
  };

  const handleRescheduleClick = (consultation: IConsultation) => {
    setSelectedConsultation(consultation);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleClose = () => {
    setRescheduleModalOpen(false);
    setSelectedConsultation(null);
  };

  const { data: products, isLoading: loadingProducts } =
    useGetSubscribedProduct(user);
  const productId = products && products.length > 0 ? products[0].id : null;

  if (loadingProducts) {
    return <CustomLoader />;
  }

  if (!productId) {
    return (
      <Box p={3} height="100%" width="100%">
        <SubscriptionRequired
          title="Subscription Required"
          description="You need to purchase a subscription to book a therapist or view your history."
        />
      </Box>
    );
  }

  return (
    <>
      {view === 'list' ? (
        <TherapistConsultationList
          consultations={consultations}
          loading={loadingConsultations}
          onAddClick={() => setView('book')}
          isAddDisabled={isAddDisabled}
          onReviewClick={handleReviewClick}
          onRescheduleClick={handleRescheduleClick}
          user={user}
          enableReviews={enableReviews}
        />
      ) : (
        <BookTherapistForm
          user={user}
          onCancel={() => setView('list')}
          onSuccess={() => setView('list')}
          productId={productId}
        />
      )}

      <RescheduleModal
        open={rescheduleModalOpen}
        onClose={handleRescheduleClose}
        consultation={selectedConsultation}
        therapists={therapists || []}
        user={user}
      />

      <ReviewModal
        open={reviewModalOpen}
        onClose={handleReviewClose}
        onSubmit={handleReviewSubmit}
        initialRating={rating}
        initialReview={reviewText}
        viewMode={viewReviewMode}
        submitting={reviewSubmitting}
      />
    </>
  );
};

export default BookTherapist;
