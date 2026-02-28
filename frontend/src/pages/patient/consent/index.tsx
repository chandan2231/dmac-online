import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import PatientService from '../../../features/patient/patient.service';
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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLocation, useNavigate } from 'react-router-dom';
import { FORM_1_TITLE, RM_DISCLAIMER_BLOCKS } from './rmDisclaimerPrivacy';
import type { ConsentContentBlock } from './rmDisclaimerPrivacy';
import {
  FORM_2_TITLE,
  RM_RESEARCH_CONSENT_BLOCKS,
} from './rmResearchConsentAuthorization';

const FORM_3_TITLE = 'Parental Consent for Cognitive Baseline Screening';

const RM_YOUTH_CONSENT_BLOCKS: ConsentContentBlock[] = [
  { type: 'section', text: 'PAGE ATHLETIC PROGRAM VERSION (Youth Sports / Schools / Clubs)' },
  { type: 'p', text: 'Parental Consent for Cognitive Baseline Screening' },
  { type: 'p', text: 'RM360 – Cognitive Screening Repository Program (C-SARP)' },
  { type: 'p', text: 'Athlete Name:   Sport:  Age: ' },
  { type: 'section', text: 'Purpose' },
  {
    type: 'p',
    text: 'RM360 provides a baseline cognitive screening to support athlete brain health and safety. Baseline results may be compared with future screenings after a concussion or head injury to help guide return-to-play decisions. This program is not a medical diagnosis and does not replace clinical care.',
  },
  { type: 'section', text: 'Screening Description' },
  { type: 'p', text: 'Digital cognitive screening assessing memory, attention, reaction time, and processing speed' },
  { type: 'p', text: 'Completed once as a baseline; may be repeated if needed' },
  { type: 'p', text: 'Takes approximately 60 minutes' },
  { type: 'section', text: 'Data Storage & Use' },
  { type: 'p', text: 'Results stored securely in the RM360 Cognitive Screening Repository' },
  { type: 'p', text: 'De-identified data may be used for research and safety improvement' },
  { type: 'p', text: 'Results may be shared with parents/guardians and, with permission, healthcare providers or athletic staff' },
  { type: 'section', text: 'Risks & Benefits' },
  { type: 'p', text: 'Minimal risk (mental fatigue or frustration)' },
  { type: 'p', text: 'Potential benefit: improved concussion management and athlete safety' },
  { type: 'section', text: 'Voluntary Participation' },
  { type: 'p', text: 'Participation is voluntary and not required for team membership unless stated by the organization.' },
  { type: 'section', text: 'Parent/Guardian Authorization' },
  { type: 'p', text: 'I authorize my child’s participation in RM360 Cognitive Screening.' },
  
];
import { useToast } from '../../../providers/toast-provider';
const VISIBLE_FORMS_COUNT = 2;

export default function ConsentPage() {
  const [draftSignatures, setDraftSignatures] = useState<string[]>(['', '', '']);
  const [savedSignatures, setSavedSignatures] = useState<string[]>(['', '', '']);
  const [submitting, setSubmitting] = useState<boolean[]>([false, false, false]);
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean[]>([false, false, false]);
  const [isMinor, setIsMinor] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useSelector((state: RootState) => state.auth.user);
  const showTermsAck = user?.role === 'USER';

  // Fetch profile and signatures on mount
  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        const profile = await PatientService.getProfile(user as any);
        console.log('Fetched profile:', profile);
        setProfileData(profile ?? null);
        const age = profile?.age ?? profile?.data?.age ?? null;
        const minor = typeof age === 'number' ? age < 18 : false;
        setIsMinor(minor);

        const sigs = await PatientService.fetchConsentSignatures(Number(user.id));
        setDraftSignatures(sigs);
        setSavedSignatures(sigs);

        const visibleCount = minor ? 3 : VISIBLE_FORMS_COUNT;
        const firstIncomplete = sigs.slice(0, visibleCount).findIndex((sig: string) => !(sig ?? '').trim());
        setExpandedIndex(firstIncomplete === -1 ? 0 : firstIncomplete);
      } catch (err) {
        console.error('Error fetching profile or signatures', err);
      }
    })();
  }, [user?.id]);

  const visibleFormsCount = isMinor ? 3 : VISIBLE_FORMS_COUNT;

  const forms = isMinor
    ? [
        { id: 1, label: FORM_1_TITLE },
        { id: 2, label: FORM_2_TITLE },
        { id: 3, label: FORM_3_TITLE },
      ]
    : [
        { id: 1, label: FORM_1_TITLE },
        { id: 2, label: FORM_2_TITLE },
      ];

  const allFilled = savedSignatures.slice(0, visibleFormsCount).every(sig => !!(sig ?? '').trim());

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

    if (showTermsAck && !termsAccepted[idx]) {
      // Block DB submission until checkbox is checked.
      // Show a toast message for at least 10 seconds.
      showToast(
        'Please read the terms and conditions carefully and acknowledge them by ticking the checkbox before submitting your electronic signature.',
        'warning',
        10_000
      );
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

      // Ensure array has 3 entries before sending to backend
      const payload = [nextSaved[0] ?? '', nextSaved[1] ?? '', nextSaved[2] ?? ''];

      const result = await PatientService.saveConsentSignatures(Number(user.id), payload);

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

      const filledAfterSave = nextSaved.slice(0, visibleFormsCount).every(sig => !!(sig ?? '').trim());

      // After the final required consent is submitted, redirect to SDMAC.
      if (idx === visibleFormsCount - 1 && filledAfterSave) {
        navigate('/questioners', { replace: true });
        return;
      }

      // Auto-open the next form in sequence (if present)
      const formsCount = isMinor ? 3 : 2;
      if (idx < formsCount - 1) {
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

  const renderForm1Disclaimer = () =>
    renderConsentDocument(FORM_1_TITLE, RM_DISCLAIMER_BLOCKS);

  const renderConsentDocument = (
    title: string,
    blocks: ConsentContentBlock[]
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
            const text = String(block.text ?? '');
            if (text.startsWith('Athlete Name:')) {
              const m = text.match(/Athlete Name:\s*(.*?)\s+Sport:\s*(.*?)\s+Age:\s*(.*)/);
              if (m) {
                const [, nameVal, sportVal, ageVal] = m;
                return (
                  <Typography key={i} variant="body2" sx={{ lineHeight: 1.65 }}>
                    {'Athlete Name: '}
                    <Box component="span" sx={{ fontWeight: 700 }}>{nameVal}</Box>
                    {'  Sport: '}
                    <Box component="span" sx={{ fontWeight: 700 }}>{sportVal}</Box>
                    {'  Age: '}
                    <Box component="span" sx={{ fontWeight: 700 }}>{ageVal}</Box>
                    
                  </Typography>
                );
              }
            }

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
      <Typography 
        variant="h5" 
        sx={{ fontWeight: 800 }} 
        mb={2}
      >
        Consent Forms
      </Typography>
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
            <Typography sx={{ flex: 1, fontWeight: 700 }}>{form.label}</Typography>
            {savedSignatures[idx] ? (
              <Chip label="filled" color="success" size="small" sx={{ ml: 2 }} />
            ) : (
              <Chip label="not filled" color="error" size="small" sx={{ ml: 2 }} />
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 1.5 }}>
            {idx === 0 ? (
              renderForm1Disclaimer()
            ) : idx === 1 ? (
              renderConsentDocument(FORM_2_TITLE, RM_RESEARCH_CONSENT_BLOCKS)
            ) : idx === 2 ? (
              // Inject dynamic athlete details into the youth consent blocks
              renderConsentDocument(
                FORM_3_TITLE,
                RM_YOUTH_CONSENT_BLOCKS.map(b => {
                  if (b.type === 'p' && (b.text ?? '').startsWith('Athlete Name:')) {
                    const name = profileData?.name ?? '';
                    const sport = profileData?.sports ?? profileData?.sports ?? '';
                    const age = profileData?.age ?? '';
                    return { ...b, text: `Athlete Name: ${name}  Sport: ${sport}  Age: ${age}` };
                  }
                  return b;
                })
              )
            ) : null}

            {showTermsAck ? (
              <>
                <FormControlLabel
                  sx={{ mt: 1, mb: 1 }}
                  control={
                    <Checkbox
                      checked={!!termsAccepted[idx]}
                      onChange={e => {
                        const checked = e.target.checked;
                        setTermsAccepted(prev => {
                          const next = [...prev];
                          next[idx] = checked;
                          return next;
                        });
                      }}
                    />
                  }
                  label={
                    'I confirm that I have read the terms and conditions carefully before providing my electronic signature.'
                  }
                />
              </>
            ) : null}

            <TextField
              label="Electronic Signature"
              value={draftSignatures[idx]}
              onChange={e => handleSignatureChange(idx, e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ mt: 1, mb: 2 }}
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
