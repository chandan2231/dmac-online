import { useLocation } from 'react-router-dom';

const PatientPayment = () => {
  const location = useLocation();
  console.log('Current location:', location);

  //   {
  //     "isSuccess": true,
  //     "message": "Email verified successfully",
  //     "user": {
  //         "id": 13,
  //         "name": "Snehlata singh",
  //         "email": "chandanprakash2231@gmail.com",
  //         "mobile": "0000000000",
  //         "role": "USER"
  //     },
  //     "product": {
  //         "product_id": "4",
  //         "product_name": "DMAC Online Test and LICCA Subscription supervised 6 Session",
  //         "product_description": "DMAC Online Test and LICCA Subscription supervised 6 Session",
  //         "product_amount": "4"
  //     }
  // }
  return <div>Patient Payment Page</div>;
};

export default PatientPayment;
