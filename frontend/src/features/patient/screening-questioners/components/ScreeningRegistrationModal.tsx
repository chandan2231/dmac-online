import { useMemo, useState } from 'react';
import { Alert, Box, TextField, Typography } from '@mui/material';
import GenericModal from '../../../../components/modal';
import ScreeningAuthApi from '../../../../services/screeningAuthApi';
import { setScreeningUser } from '../storage';

type Props = {
  isOpen: boolean;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isWholeNumber = (value: string) => /^\d+$/.test(value);

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
      const res = await ScreeningAuthApi.register({
        name: name.trim(),
        email: email.trim(),
        age: ageNumber as number,
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
        setServerMessage(
          'You have successfully registered. Please verify your email to access the assessment.'
        );
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
          <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
            After submitting, you’ll receive an email verification link. You must verify to continue.
          </Typography>
        )}
      </Box>
    </GenericModal>
  );
};

export default ScreeningRegistrationModal;
