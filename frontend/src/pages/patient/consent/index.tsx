import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import PatientService from '../../../features/patient/patient.service';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLocation, useNavigate } from 'react-router-dom';


const forms = [
  { id: 1, label: 'Form 1' },
  { id: 2, label: 'Form 2' },
  { id: 3, label: 'Form 3' },
];

export default function ConsentPage() {
  const [draftSignatures, setDraftSignatures] = useState<string[]>(['', '', '']);
  const [savedSignatures, setSavedSignatures] = useState<string[]>(['', '', '']);
  const [submitting, setSubmitting] = useState<boolean[]>([false, false, false]);
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // Fetch signatures on mount
  useEffect(() => {
    if (user?.id) {
      Promise.resolve(
        PatientService.fetchConsentSignatures(Number(user.id))
      ).then(data => {
        setDraftSignatures(data);
        setSavedSignatures(data);

        // Start at the first incomplete form; otherwise keep Form 1 on top
        const firstIncomplete = data.findIndex((sig: string) => !(sig ?? '').trim());
        setExpandedIndex(firstIncomplete === -1 ? 0 : firstIncomplete);
      });
    }
  }, [user?.id]);

  const allFilled = savedSignatures.every(sig => !!sig);

  // Sync consent status to localStorage for sidebar
  useEffect(() => {
    localStorage.setItem('consentFilled', allFilled ? 'true' : 'false');
    window.dispatchEvent(new Event('consentStatusChanged'));
  }, [allFilled]);

  // Listen for sidebar modal trigger
  useEffect(() => {
    const handler = () => setShowModal(true);
    window.addEventListener('showConsentModal', handler);
    return () => window.removeEventListener('showConsentModal', handler);
  }, []);

  // ConsentGuard: block navigation if not all forms are filled
  useEffect(() => {
    if (!allFilled && location.pathname !== '/consent') {
      setShowModal(true);
      navigate('/consent', { replace: true });
    }
  }, [allFilled, location.pathname, navigate]);

  const handleSignatureChange = (idx: number, value: string) => {
    setDraftSignatures(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleSubmitForm = async (idx: number) => {
    if (!user?.id) return;

    const signatureValue = (draftSignatures[idx] ?? '').trim();
    if (!signatureValue) {
      setShowModal(true);
      return;
    }

    setSubmitting(prev => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });

    try {
      const nextSaved = [...savedSignatures];
      nextSaved[idx] = signatureValue;

      const result = await PatientService.saveConsentSignatures(
        Number(user.id),
        nextSaved
      );

      if (
        typeof result === 'object' &&
        result !== null &&
        'success' in result &&
        (result as { success?: boolean }).success === false
      ) {
        return;
      }

      setSavedSignatures(nextSaved);
      // keep draft in sync after successful save
      setDraftSignatures(nextSaved);

      // Auto-open the next form in sequence
      if (idx < forms.length - 1) {
        setExpandedIndex(idx + 1);
      }
    } finally {
      setSubmitting(prev => {
        const next = [...prev];
        next[idx] = false;
        return next;
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Consent Forms</Typography>
      {forms.map((form, idx) => (
        <Accordion
          key={form.id}
          expanded={expandedIndex === idx}
          onChange={(_, isExpanded) => {
            // Only allow opening in sequence: Form N requires Form N-1 saved
            const allowed = idx === 0 || !!(savedSignatures[idx - 1] ?? '').trim();
            if (!allowed) return;
            setExpandedIndex(isExpanded ? idx : -1);
          }}
          disabled={idx !== 0 && !(savedSignatures[idx - 1] ?? '').trim()}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ flex: 1 }}>{form.label}</Typography>
            {savedSignatures[idx] ? (
              <Chip label="filled" color="success" size="small" sx={{ ml: 2 }} />
            ) : (
              <Chip label="not filled" color="error" size="small" sx={{ ml: 2 }} />
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Typography mb={2}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
            </Typography>
            <Typography mb={2}>
              Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum facilisis porta. Sed nec diam eu diam mattis viverra. Nulla fringilla, orci ac euismod semper, magna diam porttitor mauris, quis sollicitudin sapien justo in libero.
            </Typography>
            <Typography mb={2}>
              Fusce placerat enim et odio molestie sagittis. Etiam faucibus cursus urna. Ut tellus. Nulla ut erat id mauris vulputate elementum. Nullam varius.
            </Typography>
            <Typography mb={2}>
              Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna.
            </Typography>
            <TextField
              label="Electronic Signature"
              value={draftSignatures[idx]}
              onChange={e => handleSignatureChange(idx, e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              onClick={() => handleSubmitForm(idx)}
              disabled={submitting[idx] || !(draftSignatures[idx] ?? '').trim()}
            >
              {submitting[idx] ? 'Submitting...' : 'Submit'}
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}
      <Dialog open={showModal} onClose={handleCloseModal}>
        <DialogTitle>Consent Required</DialogTitle>
        <DialogContent>
          <Typography>Please fill all consent forms before accessing other tabs.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
