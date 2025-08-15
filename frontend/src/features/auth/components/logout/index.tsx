import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { useDispatch } from 'react-redux';
import { closeLogoutModal, openLogoutModal } from './logout.slice';
import { logout } from '../../auth.slice';
import { purgeLocalStorage } from '../../../../utils/functions';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../auth.interface';
import LogoutIcon from '@mui/icons-material/Logout';
import GenericModal from '../../../../components/modal';

export default function LogoutFeature() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLogoutModalOpen } = useSelector((state: RootState) => state.logout);

  const handleLogout = () => {
    dispatch(closeLogoutModal());
    purgeLocalStorage();
    dispatch(logout());

    // Navigate to the Login page
    navigate(ROUTES.LOGIN);
  };

  const handleOpenModal = () => {
    dispatch(openLogoutModal());
  };

  const handleCloseModal = () => {
    dispatch(closeLogoutModal());
  };

  return (
    <>
      <Tooltip title="Logout">
        <IconButton
          onClick={() => handleOpenModal()}
          aria-label="logout"
          color="inherit"
        >
          <LogoutIcon />
        </IconButton>
      </Tooltip>

      <GenericModal
        isOpen={isLogoutModalOpen}
        onClose={() => handleCloseModal()}
        onSubmit={() => handleLogout()}
        title="Confirm Logout"
        cancelButtonText="No"
        submitButtonText="Yes"
      >
        Are you sure you want to logout?
      </GenericModal>
    </>
  );
}
