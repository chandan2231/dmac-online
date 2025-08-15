import { useGetDisclaimerPageDetails } from './hooks/useGetDisclaimerPageDetails';

const Questioners = () => {
  const { data } = useGetDisclaimerPageDetails();
  console.log('Disclaimer Page Details:', data);
  return <>here we go</>;
};

export default Questioners;
