import { Box } from '@mui/material';
import { useGetQuestions } from '../hooks/useGetQuestions';
import QuestionersService from '../questioners.service';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { get } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { getLanguageText } from '../../../../utils/functions';
import { useLanguageConstantContext } from '../../../../providers/language-constant-provider';
import CustomLoader from '../../../../components/loader';
import GenericModal from '../../../../components/modal';
import MorenRadio from '../../../../components/radio-input';
import { ROUTES } from '../../../../router/router';
// import ModuleRunner from './GameModules/ModuleRunner'; 
// Reverted to original behavior (or simply remove import)

type IQuestionsProps = {
  setIsQuestionerClosed: (value: boolean) => void;
};

const Questions = ({ setIsQuestionerClosed }: IQuestionsProps) => {
  const navigate = useNavigate();
  const { languageConstants } = useLanguageConstantContext();
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentSequenceNumber, setCurrentSequenceNumber] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedMainOption, setSelectedMainOption] = useState<string | null>(
    null
  );
  const [selectedFollowUpOption, setSelectedFollowUpOption] = useState<
    string | null
  >(null);
  const cancelButtonText = getLanguageText(languageConstants, 'cancel');
  const continueButtonText = getLanguageText(languageConstants, 'start');
  const userLang = get(user, 'languageCode');
  const safeLanguageCode = typeof userLang === 'string' ? userLang : 'en';

  const { data: questionsDetails, isPending: isLoadingQuestionsDetails } =
    useGetQuestions(currentSequenceNumber, safeLanguageCode);

  // Extract Main Question values for clarity
  const mainQuestion = get(questionsDetails, 'main_question', {});
  const questionText = get(mainQuestion, 'text', '');
  const options = get(mainQuestion, 'options', []);
  const alertMessage = get(mainQuestion, 'alert', null);
  const triggerOption = get(mainQuestion, 'trigger_option', null);
  const hasAlert = alertMessage !== null;
  const isLastQuestion = get(questionsDetails, 'next_sequence', null) === null;

  // Extract Follow-up Question values
  const followUps = get(questionsDetails, 'follow_ups', []);
  const firstFollowUp = get(followUps, [0], {}); // safer than conditional checks
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

  // Logic helpers
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
      // Save answer immediately for non-trigger options if not last question or if it is last question
      const data = {
        userId: Number(get(user, 'id', 0)),
        questionId: Number(get(mainQuestion, 'id', 0)),
        mainAnswer: optionCode,
        followUpAnswer: null
      }
      QuestionersService.saveAnswer(data);
    }
  };

  const handleOnSubmit = () => {
    // This is called when the modal (alert) is confirmed
    const data = {
      userId: Number(get(user, 'id', 0)),
      questionId: Number(get(mainQuestion, 'id', 0)),
      mainAnswer: String(selectedMainOption || triggerOption), // Use selected or trigger if that's what we have
      followUpAnswer: null
    }
    QuestionersService.saveAnswer(data);

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

    // Save follow up answer
    const data = {
      userId: Number(get(user, 'id', 0)),
      questionId: Number(get(mainQuestion, 'id', 0)),
      mainAnswer: String(selectedMainOption),
      followUpAnswer: optionCode
    }
    QuestionersService.saveAnswer(data);


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
    // This is called when the *follow-up* alert is confirmed
    // The answer is likely already saved in handleFollowUpOptionSelect if we want to save on selection
    // But if we want to confirm, we might assume it is saved. 
    // However, if the logic is to save ON selection, we did that. 
    // Re-saving or ensuring it is saved is fine.

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

  // Removed ModuleRunner hijack to allow survey to flow naturally
  // if (showGame) { ... }

  return (
    <Box>
      <Box display="flex" flexDirection={'column'} gap={1}>
        {/* Text */}
        <Box width={'400px'}>{questionText}</Box>

        {/* Options */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {options.map((option, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => handleOptionSelect(get(option, ['code'], ''))}
            >
              <MorenRadio
                checked={get(option, ['code'], '') === selectedMainOption}
              />
              {get(option, ['text'], '')}
            </Box>
          ))}
        </Box>

        {/* Follow UP */}
        {showFollowUp && (
          <Box display="flex" flexDirection={'column'} gap={1}>
            <Box width={'400px'}>{followUpText}</Box>

            {/* Options */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {followUpOption.map((option, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    handleFollowUpOptionSelect(get(option, ['code'], ''))
                  }
                >
                  <MorenRadio
                    checked={
                      get(option, ['code'], '') === selectedFollowUpOption
                    }
                  />
                  {get(option, ['text'], '')}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Modal Alert For Main Question */}
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

      {/* Alert Modal */}
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
