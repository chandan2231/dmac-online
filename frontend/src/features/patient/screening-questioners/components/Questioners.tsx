import { Box } from '@mui/material';
import { useGetQuestions } from '../../questioners/hooks/useGetQuestions';
import ScreeningQuestionersService from '../questioners.service';
import { useState } from 'react';
import { get } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { getLanguageText } from '../../../../utils/functions';
import { useLanguageConstantContext } from '../../../../providers/language-constant-provider';
import CustomLoader from '../../../../components/loader';
import GenericModal from '../../../../components/modal';
import MorenRadio from '../../../../components/radio-input';
import { ROUTES } from '../../../../router/router';

type IQuestionsProps = {
  setIsQuestionerClosed: (value: boolean) => void;
  userId: number;
  languageCode?: string;
};

const Questions = ({ setIsQuestionerClosed, userId, languageCode = 'en' }: IQuestionsProps) => {
  const navigate = useNavigate();
  const { languageConstants } = useLanguageConstantContext();
  const [currentSequenceNumber, setCurrentSequenceNumber] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedMainOption, setSelectedMainOption] = useState<string | null>(null);
  const [selectedFollowUpOption, setSelectedFollowUpOption] = useState<string | null>(null);
  const cancelButtonText = getLanguageText(languageConstants, 'cancel');
  const continueButtonText = getLanguageText(languageConstants, 'start');

  const { data: questionsDetails, isPending: isLoadingQuestionsDetails } = useGetQuestions(
    currentSequenceNumber,
    languageCode
  );

  const mainQuestion = get(questionsDetails, 'main_question', {});
  const questionText = get(mainQuestion, 'text', '');
  const options = get(mainQuestion, 'options', []);
  const alertMessage = get(mainQuestion, 'alert', null);
  const triggerOption = get(mainQuestion, 'trigger_option', null);
  const hasAlert = alertMessage !== null;
  const isLastQuestion = get(questionsDetails, 'next_sequence', null) === null;

  const followUps = get(questionsDetails, 'follow_ups', []);
  const firstFollowUp = get(followUps, [0], {});
  const hasFollowUps = followUps.length > 0;
  const followUpText = get(firstFollowUp, 'text', '');
  const followUpOption = get(firstFollowUp, 'options', []);
  const followUpAlertMessage = get(firstFollowUp, 'alert', null);
  const triggerOptionForFollowUp = get(firstFollowUp, 'trigger_option', null);
  const hasFollowUpAlert = followUpAlertMessage !== null;

  const handleResetState = () => {
    setCurrentSequenceNumber(prev => prev + 1);
    setIsModalOpen(false);
    setShowFollowUp(false);
    setIsAlertModalOpen(false);
    setSelectedMainOption(null);
    setSelectedFollowUpOption(null);
  };

  const handleOptionSelect = (optionCode: string) => {
    if (isLastQuestion && optionCode !== triggerOption) {
      setIsQuestionerClosed(true);
    }

    if (!isLastQuestion && optionCode !== triggerOption) {
      handleResetState();
    }

    if (optionCode === triggerOption) {
      if (hasAlert) {
        setIsModalOpen(true);
      }
      if (hasFollowUps) {
        setShowFollowUp(true);
        setSelectedMainOption(optionCode);
      }
    } else {
      const data = {
        userId,
        questionId: Number(get(mainQuestion, 'id', 0)),
        mainAnswer: optionCode,
        followUpAnswer: null,
      };
      ScreeningQuestionersService.saveAnswer(data);
    }
  };

  const handleOnSubmit = () => {
    const data = {
      userId,
      questionId: Number(get(mainQuestion, 'id', 0)),
      mainAnswer: String(selectedMainOption || triggerOption),
      followUpAnswer: null,
    };
    ScreeningQuestionersService.saveAnswer(data);

    if (isLastQuestion) {
      setIsQuestionerClosed(true);
    }
    if (!isLastQuestion) {
      handleResetState();
    }
  };

  const handleFollowUpOptionSelect = (optionCode: string) => {
    if (isLastQuestion && optionCode !== triggerOption) {
      setIsQuestionerClosed(true);
    }

    if (!isLastQuestion && optionCode !== triggerOptionForFollowUp) {
      handleResetState();
    }

    const data = {
      userId,
      questionId: Number(get(mainQuestion, 'id', 0)),
      mainAnswer: String(selectedMainOption),
      followUpAnswer: optionCode,
    };
    ScreeningQuestionersService.saveAnswer(data);

    if (optionCode === triggerOptionForFollowUp) {
      if (hasFollowUpAlert) {
        setIsAlertModalOpen(true);
      }
      if (!hasFollowUpAlert) {
        handleResetState();
      }
    }
  };

  const handleOnSubmitFollowUp = () => {
    if (isLastQuestion) {
      setIsQuestionerClosed(true);
    }
    if (!isLastQuestion) {
      handleResetState();
    }
  };

  const handleNavigateToHome = () => {
    navigate(ROUTES.HOME);
  };

  if (isLoadingQuestionsDetails) {
    return <CustomLoader />;
  }

  return (
    <Box>
      <Box display="flex" flexDirection={'column'} gap={1}>
        <Box width={'400px'}>{questionText}</Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {options.map((option, index) => (
            <Box
              key={index}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => handleOptionSelect(get(option, ['code'], ''))}
            >
              <MorenRadio checked={get(option, ['code'], '') === selectedMainOption} />
              {get(option, ['text'], '')}
            </Box>
          ))}
        </Box>

        {showFollowUp && (
          <Box display="flex" flexDirection={'column'} gap={1}>
            <Box width={'400px'}>{followUpText}</Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {followUpOption.map((option, index) => (
                <Box
                  key={index}
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => handleFollowUpOptionSelect(get(option, ['code'], ''))}
                >
                  <MorenRadio checked={get(option, ['code'], '') === selectedFollowUpOption} />
                  {get(option, ['text'], '')}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <GenericModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={String(alertMessage || '')}
        onCancel={() => handleNavigateToHome()}
        cancelButtonText={cancelButtonText}
        submitButtonText={continueButtonText}
        onSubmit={() => handleOnSubmit()}
      >
        <></>
      </GenericModal>

      <GenericModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={String(followUpAlertMessage || '')}
        onCancel={() => handleNavigateToHome()}
        cancelButtonText={cancelButtonText}
        submitButtonText={continueButtonText}
        onSubmit={() => handleOnSubmitFollowUp()}
      >
        <></>
      </GenericModal>
    </Box>
  );
};

export default Questions;
