import { get } from 'lodash';
import type { IAssessmentInfo } from './questioners.interface';
import HttpService from '../../services/HttpService';

const getDisclaimerPageDetails = async (
  languageCode: string
): Promise<IAssessmentInfo | null> => {
  try {
    const response = await HttpService.get(
      `/questionar/page/dmac_intro?lang=${languageCode}`
    );
    return get(response, ['data'], null) as IAssessmentInfo;
  } catch (error) {
    console.error('Error fetching disclaimer page details:', error);
    return null;
  }
};

const QuestionersService = {
  getDisclaimerPageDetails,
};

export default QuestionersService;
