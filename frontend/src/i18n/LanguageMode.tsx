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
import type { ILanguage, IUpdateLanguageDetails } from './language.interface';
import { useToast } from '../providers/toast-provider';
import { updateLanguageDetails } from '../features/auth/auth.slice';
import { setLocalStorageItem } from '../utils/functions';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';
import TranslateIcon from '@mui/icons-material/Translate';
import GenericModal from '../components/modal';
import LanguageService from './language.service';

export default function LanguageMode() {
  const { showToast } = useToast();
  const dispatch = useDispatch();
  // const { i18n } = useTranslation();
  // const currentLang = i18n.language;
  const { isLanguageModalOpen, isLanguageSelectorDisabled } = useSelector(
    (state: RootState) => state.language
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: listingResponse } = useLanguageList({
    enable: isLanguageModalOpen,
    USER_TYPE: get(user, ['role'], null),
  });

  const handleSelect = async (langCode: ILanguage) => {
    // i18n.changeLanguage(langCode);
    const changeLanguagePayload = {
      language: Number(get(langCode, ['id'], '')),
      id: Number(get(user, ['id'], '')),
    };
    // dispatch(closeLanguageModal());
    try {
      const response = await LanguageService.changeLanguage({
        ...changeLanguagePayload,
      });
      showToast(
        get(response, ['msg'], 'Language Changed Successfully'),
        response.isSuccess ? 'success' : 'error'
      );
      if (response.isSuccess) {
        dispatch(closeLanguageModal());
        const updatedLanguageDetails = {
          language: get(langCode, ['id'], ''),
          languageCode: get(langCode, ['code'], ''),
        } as IUpdateLanguageDetails;
        dispatch(updateLanguageDetails(updatedLanguageDetails));
        setLocalStorageItem(
          LOCAL_STORAGE_KEYS.LANGUAGE_CONSTANTS,
          JSON.stringify(null)
        );
      }
    } catch (error) {
      console.error('Error changing language:', error);
      showToast('Failed to change language', 'error');
    }
  };

  const handleClose = () => {
    dispatch(closeLanguageModal());
  };

  const handleOpen = () => {
    if (!isLanguageSelectorDisabled) {
      dispatch(openLanguageModal());
    }
  };

  return (
    <>
      <Tooltip title={isLanguageSelectorDisabled ? "Language locked during assessment" : "Change Language"}>
        <span>
          <IconButton
            onClick={() => handleOpen()}
            aria-label="change language"
            color="inherit"
            disabled={isLanguageSelectorDisabled}
          >
            <TranslateIcon />
          </IconButton>
        </span>
      </Tooltip>

      <GenericModal
        isOpen={isLanguageModalOpen}
        onClose={() => handleClose()}
        title="Select Language"
        hideSubmitButton
        cancelButtonText="Close"
      >
        <List
          sx={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            padding: 0,
          }}
        >
          {(get(listingResponse, ['data', 'languages'], []) as ILanguage[]).map(
            (language, index) => {
              const currentLang = String(get(user, ['language'], ''));
              const languageId = String(get(language, ['id'], ''));
              const selectedLang = currentLang === languageId;
              return (
                <ListItem
                  key={index}
                  sx={{ boxSizing: 'border-box' }}
                  disablePadding
                >
                  <ListItemButton
                    selected={selectedLang}
                    onClick={() => handleSelect(language)}
                    sx={theme => ({
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      },
                      ...(selectedLang && {
                        backgroundColor: `${theme.palette.primary.main} !important`,
                        color: theme.palette.common.white,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }),
                    })}
                  >
                    {get(language, ['language'], '')}
                  </ListItemButton>
                </ListItem>
              );
            }
          )}
        </List>
      </GenericModal>
    </>
  );
}
