import { useSelector } from 'react-redux';
import type { ISlotsData } from '../../expert.interface';
import type { RootState } from '../../../../store';

const CalendarListing = ({ slotsData }: { slotsData: ISlotsData }) => {
  console.log('Slots Data:', slotsData);
  const { user } = useSelector((state: RootState) => state.auth);
  return <div>Calendar Listing</div>;
};

export default CalendarListing;
