import { useMemo, useState } from 'react';
import { Alert, Box, TextField, Typography } from '@mui/material';
import GenericModal from '../../../../components/modal';
import ScreeningAuthApi from '../../../../services/screeningAuthApi';

type Props = {
  isOpen: boolean;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ScreeningRegistrationModal = ({ isOpen }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const isValid = useMemo(() => {
    return (
      name.trim().length > 1 &&
      emailRegex.test(email.trim()) &&
      Boolean(dob)
    );
  }, [name, email, dob]);

  const handleSubmit = async () => {
    if (!isValid || isSubmitting || isRegistered) return;
    setIsSubmitting(true);
    setServerMessage(null);

    try {
      const res = await ScreeningAuthApi.register({
        name: name.trim(),
        email: email.trim(),
        dob,
      });

      if (res.isSuccess) {
        setIsRegistered(true);
        setServerMessage(
          'You have successfully registered. Please verify your email to access the assessment.'
        );
      } else {
        setServerMessage(res.message || 'Registration failed. Please try again.');
      }
    } catch (e) {
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
      submitButtonText={isSubmitting ? 'Submitting...' : 'Submit'}
      onSubmit={handleSubmit}
      hideCancelButton
      hideCloseIcon
      disableClose
      submitDisabled={!isValid || isSubmitting || isRegistered}
      maxWidth="sm"
      fullWidth
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              fullWidth
              required
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
          </>
        )}

        {serverMessage && (
          <Alert severity={isRegistered ? 'success' : 'info'}>
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
