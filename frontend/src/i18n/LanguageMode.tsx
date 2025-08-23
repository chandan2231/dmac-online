import {
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
} from '@mui/material';
// import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useDispatch } from 'react-redux';
import { closeLanguageModal, openLanguageModal } from './language.slice';
import { useLanguageList } from './hooks/useGetLanguages';
import { get } from 'lodash';
import type { ILanguage } from './language.interface';
import TranslateIcon from '@mui/icons-material/Translate';
import GenericModal from '../components/modal';
import LanguageService from './language.service';

const styles = {
  list: {
    maxHeight: '400px',
    overflowY: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    padding: 0,
  },
  listItem: {
    boxSizing: 'border-box',
  },
  listItemButton: {
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
  },
  selectedListItemButton: {
    borderRadius: '8px',
    backgroundColor: '#1976d2 !important',
    color: '#fff',
    '&:hover': { backgroundColor: 'primary.dark' },
  },
};

export default function LanguageMode() {
  const dispatch = useDispatch();
  // const { i18n } = useTranslation();
  // const currentLang = i18n.language;
  const { isLanguageModalOpen } = useSelector(
    (state: RootState) => state.language
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: listingResponse } = useLanguageList(isLanguageModalOpen);

  const handleSelect = async (langCode: ILanguage) => {
    // i18n.changeLanguage(langCode);
    const changeLanguagePayload = {
      language: Number(get(langCode, ['id'], '')),
      id: Number(get(user, ['id'], '')),
    };
    await LanguageService.changeLanguage({
      ...changeLanguagePayload,
    });
    // dispatch(closeLanguageModal());
  };

  const handleClose = () => {
    dispatch(closeLanguageModal());
  };

  const handleOpen = () => {
    dispatch(openLanguageModal());
  };

  console.log({ listingResponse });

  return (
    <>
      <Tooltip title="Change Language">
        <IconButton
          onClick={() => handleOpen()}
          aria-label="change language"
          color="inherit"
        >
          <TranslateIcon />
        </IconButton>
      </Tooltip>

      <GenericModal
        isOpen={isLanguageModalOpen}
        onClose={() => handleClose()}
        title="Select Language"
        hideSubmitButton
        cancelButtonText="Close"
      >
        <List sx={styles.list}>
          {get(listingResponse, ['data'], []).map((language, index) => {
            const currentLang = String(get(user, ['language'], ''));
            const languageId = String(get(language, ['id'], ''));
            const selectedLang = currentLang === languageId;
            return (
              <ListItem key={index} sx={styles.listItem} disablePadding>
                <ListItemButton
                  selected={selectedLang}
                  onClick={() => handleSelect(language)}
                  sx={
                    selectedLang
                      ? styles.selectedListItemButton
                      : styles.listItemButton
                  }
                >
                  {get(language, ['language'], '')}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </GenericModal>
    </>
  );
}
