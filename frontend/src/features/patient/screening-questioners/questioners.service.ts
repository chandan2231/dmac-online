import HttpService from '../../../services/HttpService';

export type SaveAnswerPayload = {
  userId: number;
  questionId: number;
  mainAnswer: string;
  followUpAnswer: string | null;
};

const saveAnswer = async (payload: SaveAnswerPayload) => {
  const res = await HttpService.post('/screening-questionar/answer', payload);
  return res.data;
};

const ScreeningQuestionersService = {
  saveAnswer,
};

export default ScreeningQuestionersService;
