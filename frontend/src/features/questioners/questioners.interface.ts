export const QUERY_KEYS_FOR_QUESTIONERS = {
  GET_DISCLAIMER_PAGE_DETAILS: 'getDisclaimerPageDetails',
  GET_FALSE_POSITIVE_PAGE_DETAILS: 'getFalsePositivePageDetails',
  GET_QUESTIONERS: 'getQuestioners',
} as const;

export interface IDisclaimerInfo {
  title: string;
  content: string;
  doctor_info: string;
  link_text: string;
  button_text: string;
}

export interface IFalsePositiveInfo {
  title: string;
  content: string;
  doctor_info: string | null;
  link_text: string | null;
  button_text: string;
}

interface IQuestionOption {
  code: string;
  text: string;
}

interface IQuestion {
  id: number;
  text: string;
  options: IQuestionOption[];
  alert: string | null;
  trigger_option: string | null;
}

export interface IQuestionDetails {
  sequence_no: number;
  next_sequence: number | null;
  main_question: IQuestion;
  follow_ups: IQuestion[] | []
}
