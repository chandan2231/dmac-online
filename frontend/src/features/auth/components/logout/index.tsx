import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { useDispatch } from 'react-redux';
import { closeLogoutModal, openLogoutModal } from './logout.slice';
import { logout } from '../../auth.slice';
import { purgeLocalStorage } from '../../../../utils/functions';
import LogoutIcon from '@mui/icons-material/Logout';
import GenericModal from '../../../../components/modal';

export default function LogoutFeature() {
  const dispatch = useDispatch();
  const { isLogoutModalOpen } = useSelector((state: RootState) => state.logout);

  const handleLogout = () => {
    console.log('User logged out');
    dispatch(logout());
    purgeLocalStorage();
    dispatch(closeLogoutModal());
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
