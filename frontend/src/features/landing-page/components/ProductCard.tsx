import './ProductCard.css';
import { useNavigate } from 'react-router-dom';
import type { IProduct } from '../../admin/admin.interface';
import { Button } from '@mui/material';
import { ROUTES } from '../../../router/router';

const ProductCard = ({ ...args }: IProduct) => {
  const {
    product_name,
    product_description,
    product_amount,
    subscription_list,
  } = args;
  const navigate = useNavigate();

  const handleRegisterClick = (args: IProduct) => {
    navigate(ROUTES.PATIENT_REGISTRATION, { state: { ...args } });
  };

  return (
    <div className="plan">
      <div className="inner">
        <span className="pricing">
          <span>${product_amount}</span>
        </span>
        <p className="title">{product_name}</p>
        <p className="info">{product_description}</p>
        <ul className="features">
          {subscription_list.split(',').map((feature, index) => (
            <li key={index}>
              <span className="icon">
                <svg
                  height="24"
                  width="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0 0h24v24H0z" fill="none"></path>
                  <path
                    fill="currentColor"
                    d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                  ></path>
                </svg>
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="action">
          <Button variant="contained" onClick={() => handleRegisterClick(args)}>
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
