import {
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useDispatch } from 'react-redux';
import { closeLanguageModal, openLanguageModal } from './language.slice';
import TranslateIcon from '@mui/icons-material/Translate';
import GenericModal from '../components/modal';

const languages: Record<string, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇺🇸' },
  fr: { label: 'Français', flag: '🇫🇷' },
  es: { label: 'Español', flag: '🇪🇸' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
  it: { label: 'Italiano', flag: '🇮🇹' },
  pt: { label: 'Português', flag: '🇵🇹' },
  zh: { label: '中文', flag: '🇨🇳' },
  ja: { label: '日本語', flag: '🇯🇵' },
  ru: { label: 'Русский', flag: '🇷🇺' },
  ar: { label: 'العربية', flag: '🇸🇦' },
  hi: { label: 'हिन्दी', flag: '🇮🇳' },
};

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
};

export default function LanguageMode() {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const { isLanguageModalOpen } = useSelector(
    (state: RootState) => state.language
  );

  const handleSelect = (langCode: string) => {
    i18n.changeLanguage(langCode);
    dispatch(closeLanguageModal());
  };

  const handleClose = () => {
    dispatch(closeLanguageModal());
  };

  const handleOpen = () => {
    dispatch(openLanguageModal());
  };

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
          {Object.entries(languages).map(([code, { label, flag }]) => (
            <ListItem key={code} sx={styles.listItem} disablePadding>
              <ListItemButton
                selected={currentLang === code}
                onClick={() => handleSelect(code)}
                sx={styles.listItemButton}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      {flag} {label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </GenericModal>
    </>
  );
}
