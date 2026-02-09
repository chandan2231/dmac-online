import { createSlice } from '@reduxjs/toolkit';

export interface ILanguageState {
  isLanguageModalOpen: boolean;
  isLanguageSelectorDisabled: boolean;
}

const initialState: ILanguageState = {
  isLanguageModalOpen: false,
  isLanguageSelectorDisabled: false,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    openLanguageModal: state => {
      state.isLanguageModalOpen = true;
    },
    closeLanguageModal: (state) => {
      state.isLanguageModalOpen = false;
    },
    disableLanguageSelector: (state) => {
      state.isLanguageSelectorDisabled = true;
    },
    enableLanguageSelector: (state) => {
      state.isLanguageSelectorDisabled = false;
    },
    toggleLanguageModal: state => {
      state.isLanguageModalOpen = !state.isLanguageModalOpen;
    },
  },
});

export const { openLanguageModal, closeLanguageModal, toggleLanguageModal, disableLanguageSelector, enableLanguageSelector } =
  languageSlice.actions;

export default languageSlice.reducer;
