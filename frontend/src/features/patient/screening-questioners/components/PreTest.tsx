import { Box } from '@mui/material';
import { get } from 'lodash';
import CustomLoader from '../../../../components/loader';
import MorenButton from '../../../../components/button';

import { useGetPreTestPageDetails } from '../../questioners/hooks/useGetPreTestDetails';
import ScreeningGameApi from '../../../../services/screeningGameApi';

type AttemptStatusLike = {
  allowed: boolean;
  isCompleted?: boolean;
  max_attempts: number;
  completionMessage?: string;
  lastModuleCompleted?: { id: number } | null;
};

type Props = {
  setPreTestCompleted: (value: boolean) => void;
  userId: number;
  languageCode: string;
  attemptStatus?: AttemptStatusLike;
  isLoadingAttempts: boolean;
};

const PROGRESS_KEY = 'dmac_screening_current_module_id';
const FORCE_RESTART_KEY = 'dmac_screening_force_restart_from_beginning';
const FORCE_NEW_SESSION_KEY = 'dmac_screening_force_restart_needs_new_session';

const PreTest = ({
  setPreTestCompleted,
  userId,
  languageCode,
  attemptStatus,
  isLoadingAttempts,
}: Props) => {
  const { data: preTestDetails, isPending: isLoadingPreTestDetails } =
    useGetPreTestPageDetails(languageCode);

  const handleStart = async () => {
    if (!attemptStatus?.allowed || attemptStatus?.isCompleted) return;

    try {
      const forceRestart = Boolean(localStorage.getItem(FORCE_RESTART_KEY));
      const savedProgress = localStorage.getItem(PROGRESS_KEY);

      // If a forced-restart attempt is already in progress, do not create another Module 1 session.
      if (forceRestart && savedProgress) {
        setPreTestCompleted(true);
        return;
      }

      if (!forceRestart && attemptStatus?.lastModuleCompleted && !attemptStatus.isCompleted) {
        setPreTestCompleted(true);
        return;
      }

      localStorage.removeItem(PROGRESS_KEY);

      // Reset idle timer for the new run
      localStorage.setItem('dmac_screening_last_activity_ts', String(Date.now()));

      // One-shot override: ensure ModuleRunner starts from module 1 (ignore DB lastModuleCompleted).
      localStorage.setItem(FORCE_RESTART_KEY, String(Date.now()));
      // PreTest creates the Module 1 session itself; ModuleRunner should resume it (not create another).
      localStorage.removeItem(FORCE_NEW_SESSION_KEY);
      // Persist module 1 so refresh can resume even before first submit.
      localStorage.setItem(PROGRESS_KEY, '1');

      // Make sure we don't resume stale in-progress sessions from prior attempts.
      await ScreeningGameApi.abandonInProgressSessions(userId);

      await ScreeningGameApi.startSession(1, userId, languageCode, false);
      setPreTestCompleted(true);
    } catch (error) {
      console.error('Failed to start session', error);
      alert('Failed to start test. Please try again.');
    }
  };

  if (isLoadingPreTestDetails || isLoadingAttempts) {
    return <CustomLoader />;
  }

  if (attemptStatus?.isCompleted) {
    return (
      <Box
        display="flex"
        sx={{
          flexDirection: 'column',
          width: { xs: '95%', sm: '90%', md: '80%' },
          maxWidth: '800px',
          margin: '0 auto',
          py: { xs: 5, md: 10 },
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            bgcolor: '#e8f5e9',
            color: '#2e7d32',
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            fontWeight: 'medium',
            fontSize: '1.25rem',
            boxShadow:
              '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}
        >
          {attemptStatus.completionMessage ||
            'The Digital Memory and Cognitive Assessment has been successfully completed. Your cognitive assessment report, including recommendations, will be emailed to you within 48 hours.'}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      sx={{
        flexDirection: 'column',
        width: { xs: '95%', sm: '90%', md: '80%' },
        maxWidth: '1000px',
        margin: '0 auto',
        py: { xs: 3, md: 5 },
      }}
      gap={2}
    >
      {attemptStatus && !attemptStatus.allowed && (
        <Box
          sx={{
            bgcolor: '#ffebee',
            color: '#c62828',
            p: 2,
            borderRadius: 1,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          You have used all {attemptStatus.max_attempts} attempts. You cannot take the test again.
        </Box>
      )}

      <Box sx={{ fontWeight: 'bold', fontSize: '20px', textAlign: 'center', mb: 4 }}>
        {get(preTestDetails, ['title'], '')}
      </Box>

      <Box
        dangerouslySetInnerHTML={{ __html: get(preTestDetails, ['content'], '') }}
        sx={{
          textAlign: 'center',
          maxHeight: '60vh',
          overflowY: 'auto',
          px: 2,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#555' },
          '& ol': {
            display: 'inline-block',
            textAlign: 'left',
            pl: 2,
            listStyleType: 'decimal',
            mb: 2,
          },
          '& ul': {
            display: 'inline-block',
            textAlign: 'left',
            pl: 2,
            listStyleType: 'disc',
            mb: 2,
          },
          '& li': { mb: 1, lineHeight: 1.6 },
          '& p': { mb: 2, fontSize: '18px' },
        }}
      />

      <Box sx={{ textAlign: 'center' }}>{get(preTestDetails, ['doctor_info'], '')}</Box>
      <Box sx={{ textAlign: 'center' }}>{get(preTestDetails, ['link_text'], '')}</Box>

      <Box sx={{ width: '100%', mt: 4, display: 'flex', justifyContent: 'center' }}>
        <MorenButton
          variant="contained"
          onClick={handleStart}
          disabled={attemptStatus && !attemptStatus.allowed}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minWidth: '200px',
            borderRadius: '25px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            py: 1.5,
          }}
        >
          {get(preTestDetails, ['button_text'], '')}
        </MorenButton>
      </Box>
    </Box>
  );
};

export default PreTest;
