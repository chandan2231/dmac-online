import { Box } from '@mui/material';
import { useGetQuestions } from '../hooks/useGetQuestions';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { get } from 'lodash';
import CustomLoader from '../../../components/loader';
import MorenButton from '../../../components/button';
import GenericModal from '../../../components/modal';

type IQuestionsProps = {
  setIsQuestionerClosed: (value: boolean) => void;
};

const YES_CODE = 'yes';

const Questions = ({ setIsQuestionerClosed }: IQuestionsProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentSequenceNumber, setCurrentSequenceNumber] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const { data: questionsDetails, isPending: isLoadingQuestionsDetails } =
    useGetQuestions(currentSequenceNumber, get(user, 'languageCode', 'en'));

  // Extract values for clarity
  const mainQuestion = get(questionsDetails, 'main_question', {});
  const options = get(mainQuestion, 'options', []);
  const questionText = get(mainQuestion, 'text', '');
  const alertMessage = get(mainQuestion, 'alert', null);
  const hasAlert = alertMessage !== null;
  const isLastQuestion = get(questionsDetails, 'next_sequence', null) === null;

  // Logic helpers
  const goToNextStep = () => {
    if (!isLastQuestion) {
      setCurrentSequenceNumber(prev => prev + 1);
    } else {
      if (!hasAlert) {
        setIsQuestionerClosed(true);
      }
      setIsAlertModalOpen(true);
    }
  };

  const advanceOrClose = (isYes: boolean) => {
    if (isYes) {
      goToNextStep();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSubmitForModal = () => {
    goToNextStep();
    setIsModalOpen(false);
  };

  if (isLoadingQuestionsDetails) {
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
      {/* Text */}
      {questionText}

      {/* Options */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {options.map((option, index) => (
          <Box key={index}>
            <MorenButton
              showGlanceEffect
              variant="contained"
              sx={{ minWidth: '100px' }}
              onClick={() => advanceOrClose(option.code === YES_CODE)}
            >
              {get(option, 'text', '')}
            </MorenButton>
          </Box>
        ))}
      </Box>

      {/* Modal */}
      <GenericModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Action"
        subTitle="Are you sure you want to proceed? This action might affect your records."
        submitButtonText="Yes, Proceed"
        onSubmit={handleSubmitForModal}
      />

      {/* Alert Modal */}
      <GenericModal
        isOpen={isAlertModalOpen}
        onClose={() => {
          // If user on last question and clicks cancel, close the alert modal
          if (isLastQuestion) {
            setIsAlertModalOpen(false);
            setIsQuestionerClosed(true);
            return;
          }

          setIsAlertModalOpen(false);
        }}
        title={String(alertMessage || '')}
        hideCancelButton
        submitButtonText="Proceed"
        onSubmit={() => {
          setIsAlertModalOpen(false);
          setIsQuestionerClosed(true);
        }}
      />
    </Box>
  );
};

export default Questions;
