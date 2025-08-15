export const QUERY_KEYS_FOR_QUESTIONERS = {
  GET_DISCLAIMER_PAGE_DETAILS: 'getDisclaimerPageDetails',
} as const;

export interface IAssessmentInfo {
  title: string;
  content: string;
  doctor_info: string;
  link_text: string;
  button_text: string;
}
