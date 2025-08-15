import { useSelector } from 'react-redux';
import { useGetDisclaimerPageDetails } from './hooks/useGetDisclaimerPageDetails';
import type { RootState } from '../../store';
import { get } from 'lodash';

const Questioners = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data } = useGetDisclaimerPageDetails(
    get(user, ['languageCode'], 'en')
  );

  console.log('Disclaimer Page Details:', data);

  return <>here we go</>;
};

export default Questioners;
