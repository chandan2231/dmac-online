import { useEffect, useState } from 'react';
import {
  Box,
  GlobalStyles,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import SearchIcon from '@mui/icons-material/Search';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    googleTranslateElementInit: () => void;
  }
}

interface Language {
  code: string;
  name: string;
}

export default function GoogleTranslateWidget() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentLang, setCurrentLang] = useState('English');

  useEffect(() => {
    // Define the initialization function globally
    window.googleTranslateElementInit = () => {
      if (
        window.google &&
        window.google.translate &&
        document.getElementById('google_translate_element')
      ) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            // Use default layout to get the <select> element
            layout: undefined,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Check if the script is already loaded
    if (window.google && window.google.translate) {
      const element = document.getElementById('google_translate_element');
      if (element && element.innerHTML === '') {
        window.googleTranslateElementInit();
      }
    } else {
      // Load the script if it's not already loaded
      const scriptId = 'google-translate-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src =
          '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    // Poll for the Google Translate select element to be populated
    const intervalId = setInterval(() => {
      const select = document.querySelector(
        '.goog-te-combo'
      ) as HTMLSelectElement;
      if (select && select.options.length > 0) {
        const langs: Language[] = [];
        const languageNames = new Intl.DisplayNames(['en'], {
          type: 'language',
        });

        for (let i = 0; i < select.options.length; i++) {
          const option = select.options[i];
          if (option.value) {
            let name = option.text;
            try {
              // Try to get the English name using Intl.DisplayNames
              const englishName = languageNames.of(option.value);
              if (englishName) {
                name = englishName;
              }
            } catch {
              // Fallback to the default text if code is not supported
            }
            langs.push({ code: option.value, name });
          }
        }
        setLanguages(langs);
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchText('');
  };

  const handleLanguageSelect = (langCode: string, langName: string) => {
    const select = document.querySelector(
      '.goog-te-combo'
    ) as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
      setCurrentLang(langName);
    }
    handleClose();
  };

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <GlobalStyles
        styles={{
          '.skiptranslate': {
            display: 'none !important',
          },

          // Hide the top bar that Google Translate adds
          '.goog-te-banner-frame': {
            display: 'none !important',
          },
          // Fix the body top offset caused by the hidden top bar
          body: {
            top: '0px !important',
          },
          // Hide the original Google Translate widget
          '#google_translate_element': {
            display: 'none !important',
          },
          // Hide the tooltip that appears on hover
          '.goog-tooltip': {
            display: 'none !important',
          },
          '.goog-tooltip:hover': {
            display: 'none !important',
          },
          '.goog-text-highlight': {
            backgroundColor: 'transparent !important',
            boxShadow: 'none !important',
          },
        }}
      />

      {/* Hidden container for the Google Widget */}
      <div id="google_translate_element"></div>

      {/* Custom UI */}
      <IconButton
        onClick={handleOpen}
        color="inherit"
        aria-label="change language"
        title="Change Language"
      >
        <TranslateIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 300,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search language..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {filteredLanguages.length > 0 ? (
          filteredLanguages.map(lang => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code, lang.name)}
              selected={lang.name === currentLang}
            >
              <Typography variant="body2">{lang.name}</Typography>
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No languages found
            </Typography>
          </Box>
        )}
      </Menu>
    </Box>
  );
}
