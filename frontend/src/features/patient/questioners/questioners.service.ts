import { get } from 'lodash';
import type {
  IAgreementData,
  IDisclaimerInfo,
  IFalsePositiveInfo,
  IQuestionDetails,
} from './questioners.interface';
import HttpService from '../../../services/HttpService';

const getQuestions = async (
  sequenceNumber: number,
  languageCode: string
): Promise<IQuestionDetails | null> => {
  try {
    const response = await HttpService.get(
      `/questionar/${sequenceNumber}?lang=${languageCode}`
    );
    return get(response, ['data'], null) as IQuestionDetails;
  } catch (error) {
    console.error('Error fetching questioners:', error);
    return null;
  }
};

const getDisclaimerPageDetails = async (
  languageCode: string
): Promise<IDisclaimerInfo | null> => {
  try {
    const response = await HttpService.get(
      `/questionar/page/dmac_intro?lang=${languageCode}`
    );
    return get(response, ['data'], null) as IDisclaimerInfo;
  } catch (error) {
    console.error('Error fetching disclaimer page details:', error);
    return null;
  }
};

const getFalsePositivePageDetails = async (
  languageCode: string
): Promise<IFalsePositiveInfo | null> => {
  try {
    const response = await HttpService.get(
      `/questionar/page/dmac_false_positive?lang=${languageCode}`
    );
    return get(response, ['data'], null) as IFalsePositiveInfo;
  } catch (error) {
    console.error('Error fetching disclaimer page details:', error);
    return null;
  }
};

const getReadDisclaimer = async (
  languageCode: string
): Promise<IAgreementData | null> => {
  try {
    const response = await HttpService.get(
      `/questionar/page/agreement_disclaimer?lang=${languageCode}`
    );
    return get(response, ['data'], null);
  } catch (error) {
    console.error('Error fetching disclaimer page details:', error);
    return null;
  }
};

const QuestionersService = {
  getQuestions,
  getDisclaimerPageDetails,
  getFalsePositivePageDetails,
  getReadDisclaimer,
};

export default QuestionersService;
