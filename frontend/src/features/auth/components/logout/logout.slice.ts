import { createSlice } from '@reduxjs/toolkit';

export interface ILogoutState {
  isLogoutModalOpen: boolean;
}

const initialState: ILogoutState = {
  isLogoutModalOpen: false,
};

const logoutSlice = createSlice({
  name: 'logout',
  initialState,
  reducers: {
    openLogoutModal: state => {
      state.isLogoutModalOpen = true;
    },
    closeLogoutModal: state => {
      state.isLogoutModalOpen = false;
    },
    toggleLogoutModal: state => {
      state.isLogoutModalOpen = !state.isLogoutModalOpen;
    },
  },
});

export const { openLogoutModal, closeLogoutModal, toggleLogoutModal } =
  logoutSlice.actions;

export default logoutSlice.reducer;
