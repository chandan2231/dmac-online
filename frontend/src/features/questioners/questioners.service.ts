import HttpService from '../../services/HttpService';

const getDisclaimerPageDetails = async () => {
  try {
    const response = await HttpService.get(
      '/questionar/page/dmac_intro?lang=en'
    );
    return response;
  } catch (error) {
    console.error('Error fetching disclaimer page details:', error);
    throw error;
  }
};

const QuestionersService = {
  getDisclaimerPageDetails,
};

export default QuestionersService;
