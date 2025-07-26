import { createSlice } from '@reduxjs/toolkit';

export interface ILanguageState {
  isLanguageModalOpen: boolean;
}

const initialState: ILanguageState = {
  isLanguageModalOpen: false,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    openLanguageModal: state => {
      state.isLanguageModalOpen = true;
    },
    closeLanguageModal: state => {
      state.isLanguageModalOpen = false;
    },
    toggleLanguageModal: state => {
      state.isLanguageModalOpen = !state.isLanguageModalOpen;
    },
  },
});

export const { openLanguageModal, closeLanguageModal, toggleLanguageModal } =
  languageSlice.actions;

export default languageSlice.reducer;
