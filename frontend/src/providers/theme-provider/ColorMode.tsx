import { useThemeContext, type ThemeName } from './ThemeContext';
import {
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Tooltip,
} from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import GenericModal from '../../components/modal';

interface IListItem {
  label: string;
  value: ThemeName;
  emoji: string;
}

const LIST_ITEM: IListItem[] = [
  {
    label: 'Light',
    value: 'light',
    emoji: '🌞',
  },
  {
    label: 'Dark',
    value: 'dark',
    emoji: '🌙',
  },
];

const styles = {
  listItemButton: {
    borderRadius: '8px',
    '&:hover': {
      borderRadius: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
  },
};

export default function ColorMode() {
  const { themeName, isThemeModalOpen, setIsThemeModalOpen, setThemeName } =
    useThemeContext();

  const handleSelect = (value: ThemeName) => {
    setThemeName(value);
    setIsThemeModalOpen(false);
  };

  return (
    <>
      <Tooltip title="Change Theme">
        <IconButton
          onClick={() => setIsThemeModalOpen(true)}
          aria-label="change theme"
          color="inherit"
        >
          <ColorLensIcon />
        </IconButton>
      </Tooltip>

      <GenericModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        title="Select Theme"
        hideSubmitButton
        cancelButtonText="Close"
      >
        <List>
          {LIST_ITEM.map(item => {
            const { label, value } = item;
            return (
              <ListItemButton
                key={value}
                onClick={() => handleSelect(value)}
                sx={{
                  ...styles.listItemButton,
                  backgroundColor:
                    themeName === value ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                }}
              >
                <ListItemText primary={label} />
                <span style={{ marginLeft: 'auto' }}>{item.emoji}</span>
              </ListItemButton>
            );
          })}
        </List>
      </GenericModal>
    </>
  );
}
