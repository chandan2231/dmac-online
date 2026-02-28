import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FORM_1_TITLE,
  RM_DISCLAIMER_BLOCKS,
} from '../../../../pages/patient/consent/rmDisclaimerPrivacy';
import {
  FORM_2_TITLE,
  RM_RESEARCH_CONSENT_BLOCKS,
} from '../../../../pages/patient/consent/rmResearchConsentAuthorization';
import PartnerPortalService from '../../partnerPortal.service';
import { ROUTES } from '../../../../router/router';

const VISIBLE_FORMS_COUNT = 2;

const forms = [
  { id: 1, label: FORM_1_TITLE },
  { id: 2, label: FORM_2_TITLE },
];

export default function PartnerConsent() {
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
      Promise.resolve(PartnerPortalService.fetchConsentSignatures()).then(data => {
        setDraftSignatures(data);
        setSavedSignatures(data);

        const firstIncomplete = data
          .slice(0, VISIBLE_FORMS_COUNT)
          .findIndex((sig: string) => !(sig ?? '').trim());
        setExpandedIndex(firstIncomplete === -1 ? 0 : firstIncomplete);
      });
    }
  }, [user?.id]);

  const allFilled = savedSignatures
    .slice(0, VISIBLE_FORMS_COUNT)
    .every(sig => !!(sig ?? '').trim());

  // Sync consent status to localStorage for sidebar
  useEffect(() => {
    localStorage.setItem('partnerConsentFilled', allFilled ? 'true' : 'false');
    window.dispatchEvent(new Event('consentStatusChanged'));
  }, [allFilled]);

  // Listen for sidebar modal trigger
  useEffect(() => {
    const handler = () => setShowModal(true);
    window.addEventListener('showConsentModal', handler);
    return () => window.removeEventListener('showConsentModal', handler);
  }, []);

  // Block navigation if not all forms are filled
  useEffect(() => {
    if (!allFilled && location.pathname !== ROUTES.PARTNER_CONSENT) {
      setShowModal(true);
      navigate(ROUTES.PARTNER_CONSENT, { replace: true });
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

      const result = await PartnerPortalService.saveConsentSignatures(nextSaved);

      if (
        typeof result === 'object' &&
        result !== null &&
        'success' in result &&
        (result as { success?: boolean }).success === false
      ) {
        return;
      }

      setSavedSignatures(nextSaved);
      setDraftSignatures(nextSaved);

      if (idx < forms.length - 1) {
        setExpandedIndex(idx + 1);
      } else {
        // If this was the last visible form (second consent), redirect to partner users
        navigate(ROUTES.PARTNER_USERS);
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

  const renderConsentDocument = (
    title: string,
    blocks: typeof RM_DISCLAIMER_BLOCKS
  ) => (
    <Box
      sx={{
        border: theme => `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: { xs: 1.5, sm: 2 },
        bgcolor: 'background.paper',
        mb: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
        {title}
      </Typography>

      <Stack spacing={1.25}>
        {blocks.map((block, i) => {
          if (block.type === 'subtitle') {
            return (
              <Typography key={i} variant="subtitle2" color="text.secondary">
                {block.text}
              </Typography>
            );
          }

          if (block.type === 'section') {
            return (
              <>
                <Divider key={`d-${i}`} sx={{ my: 0.75 }} />
                <Typography key={i} variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {block.text}
                </Typography>
              </>
            );
          }

          if (block.type === 'subsection') {
            return (
              <Typography key={i} variant="body2" sx={{ fontWeight: 800 }}>
                {block.text}
              </Typography>
            );
          }

          if (block.type === 'p') {
            return (
              <Typography key={i} variant="body2" sx={{ lineHeight: 1.65 }}>
                {block.text}
              </Typography>
            );
          }

          if (block.type === 'bullets') {
            return (
              <List key={i} dense sx={{ py: 0, my: -0.5 }}>
                {block.items.map((item, j) => (
                  <ListItem key={j} sx={{ py: 0.25 }}>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { lineHeight: 1.55 },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            );
          }

          return null;
        })}
      </Stack>
    </Box>
  );

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        mx: 'auto',
        width: '100%',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 800 }} mb={2}>
        Consent Forms
      </Typography>

      {forms.map((form, idx) => (
        <Accordion
          key={form.id}
          expanded={expandedIndex === idx}
          onChange={(_, isExpanded) => {
            const allowed = idx === 0 || !!(savedSignatures[idx - 1] ?? '').trim();
            if (!allowed) return;
            setExpandedIndex(isExpanded ? idx : -1);
          }}
          disabled={idx !== 0 && !(savedSignatures[idx - 1] ?? '').trim()}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ flex: 1, fontWeight: 700 }}>{form.label}</Typography>
            {savedSignatures[idx] ? (
              <Chip label="filled" color="success" size="small" sx={{ ml: 2 }} />
            ) : (
              <Chip label="not filled" color="error" size="small" sx={{ ml: 2 }} />
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 1.5 }}>
            {idx === 0
              ? renderConsentDocument(FORM_1_TITLE, RM_DISCLAIMER_BLOCKS)
              : idx === 1
                ? renderConsentDocument(FORM_2_TITLE, RM_RESEARCH_CONSENT_BLOCKS)
                : null}

            <TextField
              label="Electronic Signature"
              value={draftSignatures[idx]}
              onChange={e => handleSignatureChange(idx, e.target.value)}
              fullWidth
              size="small"
              sx={{ mb: 1.5 }}
            />

            <Button
              variant="contained"
              onClick={() => handleSubmitForm(idx)}
              disabled={submitting[idx]}
              sx={{ minWidth: 160 }}
            >
              {submitting[idx] ? 'Saving...' : 'Save'}
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog open={showModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Consent Required</DialogTitle>
        <DialogContent>
          <Typography>Please fill all consent forms before accessing other tabs.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
