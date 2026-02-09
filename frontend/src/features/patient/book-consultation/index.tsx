import { useState } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import type { RootState } from '../../../store';
import { Box } from '@mui/material';
import { useExperts } from '../hooks/useExperts';
import { useGetSubscribedProduct } from '../hooks/useGetSubscribedProduct';
import { useGetConsultations } from '../hooks/useGetConsultations';
import type { IConsultation } from '../patient.interface';
import CustomLoader from '../../../components/loader';
import PatientService from '../patient.service';
import { useToast } from '../../../providers/toast-provider';
import SubscriptionRequired from '../../../components/subscription-required';
import ConsultationList from './ConsultationList';
import BookConsultationForm from './BookConsultationForm';
import ReviewModal from './ReviewModal';
import RescheduleModal from './RescheduleModal';

const BookConsultation = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: experts, isLoading } = useExperts(user);
  const { showToast } = useToast();

  const [view, setView] = useState<'list' | 'book'>('list');
  const {
    data: consultations = [],
    isLoading: loadingConsultations,
    refetch,
  } = useGetConsultations(user);

  const isAddDisabled = consultations.some((c: IConsultation) =>
    [0, 1, 2, 3, 4].includes(c.status)
  );

  // Reschedule State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  // Review State
  const [selectedConsultation, setSelectedConsultation] =
    useState<IConsultation | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [viewReviewMode, setViewReviewMode] = useState(false);

  const handleRescheduleClick = (consultation: IConsultation) => {
    setSelectedConsultation(consultation);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleClose = () => {
    setRescheduleModalOpen(false);
    setSelectedConsultation(null);
  };

  const handleReviewClick = async (consultation: IConsultation) => {
    setSelectedConsultation(consultation);
    const existingReview = await PatientService.getExpertReview(
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
    const result = await PatientService.addExpertReview({
      patient_id: get(user, 'id'),
      expert_id:
        selectedConsultation.expert_id || selectedConsultation.consultant_id,
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

  const { data: products, isLoading: loadingProducts } =
    useGetSubscribedProduct(user);
  const productId = products && products.length > 0 ? products[0].id : null;

  const productPackageSubscriptionListString =
    products && products.length > 0 ? products[0].subscription_list : null;

  if (isLoading || loadingProducts) {
    return <CustomLoader />;
  }

  if (
    !productPackageSubscriptionListString ||
    !productPackageSubscriptionListString.includes('Expert Consultation')
  ) {
    return (
      <Box p={3} height="100%" width="100%">
        <SubscriptionRequired
          title="Subscription Required"
          description="You need to purchase a subscription to book a consultation or view your history."
        />
      </Box>
    );
  }

  return (
    <>
      {view === 'list' ? (
        <ConsultationList
          consultations={consultations}
          loading={loadingConsultations}
          onAddClick={() => setView('book')}
          isAddDisabled={isAddDisabled}
          onReviewClick={handleReviewClick}
          onRescheduleClick={handleRescheduleClick}
          user={user}
          enableReviews={true}
        />
      ) : (
        <BookConsultationForm
          experts={experts}
          user={user}
          onCancel={() => setView('list')}
          onSuccess={() => {
            setView('list');
            showToast('Consultation booked successfully!', 'success');
            // refetch consultations could be triggered here if needed
            refetch();
          }}
          productId={productId}
        />
      )}

      <RescheduleModal
        open={rescheduleModalOpen}
        onClose={handleRescheduleClose}
        consultation={selectedConsultation}
        experts={experts || []}
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

export default BookConsultation;
