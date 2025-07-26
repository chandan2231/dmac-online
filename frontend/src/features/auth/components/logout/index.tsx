import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { useDispatch } from 'react-redux';
import { closeLogoutModal, openLogoutModal } from './logout.slice';
import LogoutIcon from '@mui/icons-material/Logout';
import GenericModal from '../../../../components/modal';

export default function LogoutFeature() {
  const dispatch = useDispatch();
  const { isLogoutModalOpen } = useSelector((state: RootState) => state.logout);

  const handleLogout = () => {
    console.log('User logged out');
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
        title="Confirm Logout"
        hideSubmitButton
        cancelButtonText="No"
        submitButtonText="Yes"
        onSubmit={handleLogout}
      >
        Are you sure you want to logout?
      </GenericModal>
    </>
  );
}
