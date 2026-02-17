import LanguageService from '../../../i18n/language.service';
import { setLocalStorageItem } from '../../../utils/functions';
import { LOCAL_STORAGE_KEYS } from '../../../utils/constants';

const IDLE_STORAGE_KEY = 'dmac_screening_last_activity_ts';
const PROGRESS_KEY = 'dmac_screening_current_module_id';
const FORCE_RESTART_KEY = 'dmac_screening_force_restart_from_beginning';
const FORCE_NEW_SESSION_KEY = 'dmac_screening_force_restart_needs_new_session';

export const prepareScreeningAfterEmailVerified = async (languageCode = 'en') => {
  // Fresh start after email approval (or after learning the user is verified on refresh)
  try {
    localStorage.setItem(IDLE_STORAGE_KEY, String(Date.now()));
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(FORCE_RESTART_KEY);
    localStorage.removeItem(FORCE_NEW_SESSION_KEY);
  } catch {
    // ignore
  }

  // Ensure language constants exist for the game modules
  try {
    const langRes = await LanguageService.fetchLanguageContants(languageCode);
    if (langRes?.isSuccess) {
      setLocalStorageItem(LOCAL_STORAGE_KEYS.LANGUAGE_CONSTANTS, JSON.stringify(langRes.data));
    }
  } catch {
    // non-blocking
  }
};
