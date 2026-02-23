import { useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import GenericModal from '../../../../components/modal';
import ScreeningAuthApi from '../../../../services/screeningAuthApi';
import { getUserEnvironmentInfo } from '../../../../utils/functions';
import { setScreeningUser } from '../storage';

type Props = {
  isOpen: boolean;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isWholeNumber = (value: string) => /^\d+$/.test(value);

const SUCCESS_BODY =
  'You have successfully registered for the Self-Administered Digital Memory and Cognitive Assessment (SDMAC).\n\nPlease check your email to start the assessment.';

const ScreeningRegistrationModal = ({ isOpen }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const ageNumber = useMemo(() => {
    if (!age.trim() || !isWholeNumber(age.trim())) return null;
    return Number(age.trim());
  }, [age]);

  const isAgeValid = useMemo(() => {
    return ageNumber !== null && Number.isInteger(ageNumber) && ageNumber >= 14 && ageNumber <= 100;
  }, [ageNumber]);

  const isValid = useMemo(() => {
    return (
      name.trim().length > 1 &&
      emailRegex.test(email.trim()) &&
      isAgeValid
    );
  }, [name, email, isAgeValid]);

  const handleSubmit = async () => {
    if (!isValid || isSubmitting || isRegistered) return;
    setIsSubmitting(true);
    setServerMessage(null);

    try {
      const { userEnvironmentInfo } = await getUserEnvironmentInfo();

      const res = await ScreeningAuthApi.register({
        name: name.trim(),
        email: email.trim(),
        age: ageNumber as number,
        patient_meta: {
          ...userEnvironmentInfo,
        },
      });

      if (res.isSuccess) {
        if (res.userId) {
          setScreeningUser({
            id: Number(res.userId),
            name: name.trim(),
            email: email.trim(),
            verified: false,
          });
        }
        setIsRegistered(true);
        setServerMessage(null);
      } else {
        setServerMessage(res.message || 'Registration failed. Please try again.');
      }
    } catch {
      setServerMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={() => {}}
      title="Enter Your Details"
      titleSx={{
        fontSize: 24,
        fontWeight: 800,
        textAlign: 'center',
      }}
      submitButtonText={isSubmitting ? 'Submitting...' : 'Submit'}
      onSubmit={isRegistered ? undefined : handleSubmit}
      hideCancelButton
      hideCloseIcon
      disableClose
      hideSubmitButton={isRegistered}
      submitDisabled={!isValid || isSubmitting || isRegistered}
      maxWidth="sm"
      fullWidth
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
        {!isRegistered && (
          <>
            <TextField
              label="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              required
              disabled={isSubmitting}
            />
            <TextField
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              required
              disabled={isSubmitting}
            />
            <TextField
              label="Age"
              type="number"
              value={age}
              onChange={e => {
                const next = e.target.value;
                if (next === '') {
                  setAge('');
                  return;
                }
                if (!/^\d+$/.test(next)) return;
                setAge(next);
              }}
              fullWidth
              required
              disabled={isSubmitting}
              inputProps={{ min: 14, max: 100, step: 1 }}
              error={Boolean(age) && !isAgeValid}
              helperText={
                Boolean(age) && !isAgeValid
                  ? 'Age must be a whole number between 14 and 100.'
                  : 'Enter your age (14–100).'
              }
            />
          </>
        )}

        {isRegistered ? (
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              // Color-blind friendly (blue) with strong contrast for older users.
              borderColor: 'rgba(21, 101, 192, 0.35)',
              bgcolor: 'rgba(21, 101, 192, 0.06)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: 'rgba(21, 101, 192, 0.12)',
                    display: 'grid',
                    placeItems: 'center',
                    flex: '0 0 auto',
                    mt: '2px',
                  }}
                >
                  <MarkEmailReadOutlinedIcon sx={{ color: '#1565C0', fontSize: 26 }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#111',
                      mb: 1,
                    }}
                  >
                    Registration successful
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 650,
                      color: '#111',
                      whiteSpace: 'pre-line',
                      lineHeight: 1.5,
                    }}
                  >
                    {SUCCESS_BODY}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {serverMessage && (
          <Alert
            severity={isRegistered ? 'success' : 'info'}
            sx={{
              '& .MuiAlert-message': {
                fontSize: 18,
                color: 'black',
              },
            }}
          >
            {serverMessage}
          </Alert>
        )}

        {!isRegistered && (
          <Typography
            sx={{ mt: 1, fontSize: 16, fontWeight: 600, color: '#111' }}
            variant="body2"
          >
            After registration, you will receive an email. Please check your inbox and follow the instructions to start the assessment.
          </Typography>
        )}
      </Box>
    </GenericModal>
  );
};

export default ScreeningRegistrationModal;
