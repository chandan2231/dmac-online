import { Box, Typography } from '@mui/material';
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
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 720,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          border: theme => `1px solid ${theme.palette.divider}`,
          p: { xs: 2.5, sm: 4 },
        }}
      >
        <Box display="flex" flexDirection="column" gap={3}>
          <Typography
            sx={{
              fontSize: 20,
              lineHeight: 1.6,
              fontWeight: 700,
              color: 'text.primary',
              textAlign: 'center',
            }}
          >
            {questionText}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
              justifyItems: 'stretch',
            }}
          >
            {options.map((option, index) => {
              const code = String(get(option, ['code'], ''));
              const text = String(get(option, ['text'], ''));
              const isSelected = code === selectedMainOption;

              return (
                <Box
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOptionSelect(code)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOptionSelect(code);
                    }
                  }}
                  sx={theme => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    p: 1.75,
                    borderRadius: 2,
                    cursor: 'pointer',
                    userSelect: 'none',
                    border: `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                    backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : theme.palette.background.paper,
                    outline: 'none',
                    transition: 'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
                    '&:hover': {
                      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                      transform: 'translateY(-1px)',
                    },
                    '&:focus-visible': {
                      boxShadow: `0 0 0 4px rgba(25, 118, 210, 0.25)`,
                    },
                  })}
                >
                  <MorenRadio checked={isSelected} />
                  <Typography sx={{ fontSize: 20, lineHeight: 1.4, color: 'text.primary' }}>
                    {text}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {showFollowUp && (
            <Box display="flex" flexDirection="column" gap={3}>
              <Typography
                sx={{
                  fontSize: 20,
                  lineHeight: 1.6,
                  fontWeight: 700,
                  color: 'text.primary',
                  textAlign: 'center',
                }}
              >
                {followUpText}
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 2,
                }}
              >
                {followUpOption.map((option, index) => {
                  const code = String(get(option, ['code'], ''));
                  const text = String(get(option, ['text'], ''));
                  const isSelected = code === selectedFollowUpOption;

                  return (
                    <Box
                      key={index}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleFollowUpOptionSelect(code)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleFollowUpOptionSelect(code);
                        }
                      }}
                      sx={theme => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        p: 1.75,
                        borderRadius: 2,
                        cursor: 'pointer',
                        userSelect: 'none',
                        border: `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                        backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : theme.palette.background.paper,
                        outline: 'none',
                        transition: 'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
                        '&:hover': {
                          boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                          transform: 'translateY(-1px)',
                        },
                        '&:focus-visible': {
                          boxShadow: `0 0 0 4px rgba(25, 118, 210, 0.25)`,
                        },
                      })}
                    >
                      <MorenRadio checked={isSelected} />
                      <Typography sx={{ fontSize: 20, lineHeight: 1.4, color: 'text.primary' }}>
                        {text}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
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
