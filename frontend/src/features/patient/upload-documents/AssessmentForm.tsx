import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Paper,
  CircularProgress,
  Checkbox,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
  useGetAssessmentStatus,
  useSubmitAssessmentTab,
} from '../hooks/useAssessment';
import CustomLoader from '../../../components/loader';
import MedicalHistoryForm from './MedicalHistoryForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const satQuestions = [
  {
    id: 'q1',
    label:
      '1. Snoring\nHave you been told that you snore at night, or does your snoring wake you up from sleep?',
  },
  { id: 'q2', label: '2. Gasping for air\nDo you wake up gasping for breath?' },
  {
    id: 'q3',
    label:
      '3. Non-restorative sleep\nDo you wake up feeling tired or experience unrefreshing sleep?',
  },
  {
    id: 'q4',
    label:
      '4. Daytime sleepiness\nDo you feel tired, excessively sleepy, or have low energy during the day?',
  },
  {
    id: 'q5',
    label:
      '5. Heart or reflux symptoms\nDo you experience heart palpitations, irregular heartbeat, or gastric reflux?',
  },
  {
    id: 'q6',
    label:
      '6. Dozing off unintentionally\nDo you doze off while sitting, watching TV, or sitting in a car (not driving)?',
  },
  {
    id: 'q7',
    label:
      '7. Pain symptoms\nDo you frequently have headaches, neck pain, or back pain?',
  },
  {
    id: 'q8',
    label:
      '8. Memory or organization difficulties\nDo you have trouble remembering things, writing information down, or making lists?',
  },
  {
    id: 'q9',
    label:
      '9. Hypertension\nHave you been diagnosed with hypertension (high blood pressure)?',
  },
];

const datQuestions = [
  {
    id: 'q1',
    label:
      '1. Loss of interest or pleasure\nHave you had little interest or pleasure in doing things?',
  },
  {
    id: 'q2',
    label:
      '2. Feeling down or hopeless\nHave you felt down, depressed, or hopeless?',
  },
  {
    id: 'q3',
    label:
      '3. Sleep difficulties\nDo you have trouble falling asleep, staying asleep, or do you sleep too much?',
  },
  {
    id: 'q4',
    label:
      '4. Low energy\nDo you feel tired, have low energy, or lack motivation to do anything?',
  },
  {
    id: 'q5',
    label:
      '5. Appetite changes\nHave you experienced poor appetite or overeating?',
  },
  {
    id: 'q6',
    label:
      '6. Negative self‑thoughts\nDo you feel bad about yourself, feel like a failure, or believe you have let yourself or your family down?',
  },
  {
    id: 'q7',
    label:
      '7. Difficulty concentrating\nDo you have trouble concentrating on things, such as reading or watching television?',
  },
  {
    id: 'q8',
    label:
      '8. Changes in movement or activity\nHave you been moving or speaking noticeably more slowly than usual? Or the opposite—feeling fidgety or restless and moving around more than normal?',
  },
  {
    id: 'q9',
    label:
      '9. Self‑harm thoughts\nHave you had thoughts that you would be better off dead or thoughts of hurting yourself in any way?',
  },
];

const adtQuestions = [
  {
    id: 'q1',
    label:
      '1. Feeling nervous or anxious\nDo you often feel nervous, anxious, on edge, or hypervigilant?',
  },
  {
    id: 'q2',
    label:
      '2. Panic symptoms\nDo you experience panic attacks, hyperventilation, difficulty breathing, or heart palpitations?',
  },
  {
    id: 'q3',
    label:
      '3. Excessive worrying\nDo you worry too much about different things or feel unable to stop worrying?',
  },
  {
    id: 'q4',
    label:
      '4. Difficulty relaxing or sleeping\nDo you have trouble relaxing, falling asleep, or "shutting down" your thoughts at night?',
  },
  {
    id: 'q5',
    label:
      '5. Restlessness\nDo you feel so restless that it is hard to sit still?',
  },
  {
    id: 'q6',
    label:
      '6. Irritability\nDo you become easily annoyed, irritable, or agitated over small things?',
  },
  {
    id: 'q7',
    label:
      '7. Fear of something bad happening\nDo you feel afraid, as if something awful might happen?',
  },
  {
    id: 'q8',
    label:
      '8. Trouble concentrating\nDo you have difficulty concentrating or remembering conversations?',
  },
  {
    id: 'q9',
    label:
      '9. Tremors or shaking\nDo you experience tremors or shaking in your fingers?',
  },
];

interface Question {
  id: string;
  label: string;
}

interface AnswerPayload {
  label: string;
  answer: string;
}

const AssessmentForm = ({ onComplete }: { onComplete: () => void }) => {
  const [value, setValue] = useState(0);
  const { data: status, isLoading } = useGetAssessmentStatus();
  const { mutateAsync: submitTab, isPending: submitting } =
    useSubmitAssessmentTab();
  const { enqueueSnackbar } = useSnackbar();

  const [satData, setSatData] = useState<Record<string, string>>({});
  const [datData, setDatData] = useState<Record<string, string>>({});
  const [adtData, setAdtData] = useState<Record<string, string>>({});

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [disclaimerSignature, setDisclaimerSignature] = useState('');
  const [disclaimerDate, setDisclaimerDate] = useState('');

  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentName, setConsentName] = useState('');
  const [consentSignature, setConsentSignature] = useState('');
  const [consentDate, setConsentDate] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('');
  const [guardianSignature, setGuardianSignature] = useState('');
  const [guardianDate, setGuardianDate] = useState('');

  useEffect(() => {
    if (status) {
      if (status.sat) {
        const parsed =
          typeof status.sat === 'string' ? JSON.parse(status.sat) : status.sat;
        const map: Record<string, string> = {};
        if (Array.isArray(parsed)) {
          parsed.forEach((item: AnswerPayload, index: number) => {
            map[`q${index + 1}`] = item.answer;
          });
        }
        setSatData(map);
      }
      if (status.dat) {
        const parsed =
          typeof status.dat === 'string' ? JSON.parse(status.dat) : status.dat;
        const map: Record<string, string> = {};
        if (Array.isArray(parsed)) {
          parsed.forEach((item: AnswerPayload, index: number) => {
            map[`q${index + 1}`] = item.answer;
          });
        }
        setDatData(map);
      }
      if (status.adt) {
        const parsed =
          typeof status.adt === 'string' ? JSON.parse(status.adt) : status.adt;
        const map: Record<string, string> = {};
        if (Array.isArray(parsed)) {
          parsed.forEach((item: AnswerPayload, index: number) => {
            map[`q${index + 1}`] = item.answer;
          });
        }
        setAdtData(map);
      }
      if (status.disclaimer) {
        const parsed =
          typeof status.disclaimer === 'string'
            ? JSON.parse(status.disclaimer)
            : status.disclaimer;
        setDisclaimerAccepted(true);
        setDisclaimerSignature(parsed.signature || '');
        setDisclaimerDate(parsed.date || '');
      }
      if (status.consent) {
        const parsed =
          typeof status.consent === 'string'
            ? JSON.parse(status.consent)
            : status.consent;
        setConsentAccepted(true);
        setConsentName(parsed.name || '');
        setConsentSignature(parsed.signature || '');
        setConsentDate(parsed.date || '');
        setGuardianName(parsed.guardianName || '');
        setGuardianRelation(parsed.guardianRelation || '');
        setGuardianSignature(parsed.guardianSignature || '');
        setGuardianDate(parsed.guardianDate || '');
      }

      if (
        status.sat &&
        status.dat &&
        status.adt &&
        status.disclaimer &&
        status.consent
      ) {
        onComplete();
      }
    }
  }, [status, onComplete]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleQuestionChange = (tab: string, qId: string, val: string) => {
    if (tab === 'sat') setSatData(prev => ({ ...prev, [qId]: val }));
    if (tab === 'dat') setDatData(prev => ({ ...prev, [qId]: val }));
    if (tab === 'adt') setAdtData(prev => ({ ...prev, [qId]: val }));
  };

  const validateQuestions = (
    questions: Question[],
    data: Record<string, string>
  ) => {
    for (const q of questions) {
      if (!data[q.id]) return false;
    }
    return true;
  };

  const handleSubmit = async (tab: string) => {
    let payload: unknown = null;

    if (tab === 'sat') {
      if (!validateQuestions(satQuestions, satData)) {
        enqueueSnackbar('Please answer all questions', { variant: 'error' });
        return;
      }
      payload = satQuestions.map(q => ({
        label: q.label,
        answer: satData[q.id],
      }));
    } else if (tab === 'dat') {
      if (!validateQuestions(datQuestions, datData)) {
        enqueueSnackbar('Please answer all questions', { variant: 'error' });
        return;
      }
      payload = datQuestions.map(q => ({
        label: q.label,
        answer: datData[q.id],
      }));
    } else if (tab === 'adt') {
      if (!validateQuestions(adtQuestions, adtData)) {
        enqueueSnackbar('Please answer all questions', { variant: 'error' });
        return;
      }
      payload = adtQuestions.map(q => ({
        label: q.label,
        answer: adtData[q.id],
      }));
    } else if (tab === 'disclaimer') {
      if (!disclaimerAccepted || !disclaimerSignature || !disclaimerDate) {
        enqueueSnackbar('Please accept and sign the disclaimer', {
          variant: 'error',
        });
        return;
      }
      payload = { signature: disclaimerSignature, date: disclaimerDate };
    } else if (tab === 'consent') {
      if (
        !consentAccepted ||
        !consentName ||
        !consentSignature ||
        !consentDate
      ) {
        enqueueSnackbar('Please fill all required fields', {
          variant: 'error',
        });
        return;
      }
      payload = {
        name: consentName,
        signature: consentSignature,
        date: consentDate,
        guardianName,
        guardianRelation,
        guardianSignature,
        guardianDate,
      };
    }

    try {
      await submitTab({ tab, data: payload });
      enqueueSnackbar('Submitted successfully', { variant: 'success' });
      if (value < 5) setValue(value + 1);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error submitting', { variant: 'error' });
    }
  };

  const renderQuestionTab = (
    questions: Question[],
    data: Record<string, string>,
    tabName: string
  ) => (
    <Box>
      {questions.map(q => (
        <Box key={q.id} sx={{ mb: 3 }}>
          <FormLabel required sx={{ whiteSpace: 'pre-line' }}>
            {q.label}
          </FormLabel>
          <RadioGroup
            row
            value={data[q.id] || ''}
            onChange={e => handleQuestionChange(tabName, q.id, e.target.value)}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </Box>
      ))}
      <Button
        variant="contained"
        onClick={() => handleSubmit(tabName)}
        disabled={submitting}
      >
        {submitting ? <CircularProgress size={24} /> : 'Submit'}
      </Button>
    </Box>
  );

  if (isLoading) return <CustomLoader />;

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Medical History" />
        <Tab label="Sleep Apnea Test" />
        <Tab label="Depression Diagnostic Test" />
        <Tab label="Anxiety Diagnostic Test" />
        <Tab label="Disclaimer" />
        <Tab label="Consent" />
      </Tabs>

      <TabPanel value={value} index={0}>
        <MedicalHistoryForm onSubmitted={() => setValue(1)} />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Typography variant="h6" gutterBottom>
          Sleep Apnea Test (SAT)
        </Typography>
        <Typography variant="body2" gutterBottom>
          Please read each question carefully and indicate whether the statement
          applies to you.
        </Typography>
        {renderQuestionTab(satQuestions, satData, 'sat')}
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Typography variant="h6" gutterBottom>
          Depression Diagnostic Test (DAT)
        </Typography>
        <Typography variant="body2" gutterBottom>
          Please read each question carefully and indicate whether the statement
          applies to you.
        </Typography>
        {renderQuestionTab(datQuestions, datData, 'dat')}
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Typography variant="h6" gutterBottom>
          Anxiety diagnostic test (ADT)
        </Typography>
        <Typography variant="body2" gutterBottom>
          Please read each question carefully and indicate whether the statement
          applies to you.
        </Typography>
        {renderQuestionTab(adtQuestions, adtData, 'adt')}
      </TabPanel>

      <TabPanel value={value} index={4}>
        <Box
          sx={{
            maxHeight: '400px',
            overflowY: 'auto',
            mb: 2,
            p: 2,
            border: '1px solid #ccc',
          }}
        >
          <Typography variant="h6">
            Regain Memory 360 – Comprehensive Disclaimer & Privacy Notice
          </Typography>
          <Typography variant="subtitle1">
            (PDF-Ready Professional Version)
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            SECTION 1 — PROGRAM OVERVIEW
          </Typography>
          <Typography paragraph>
            Regain Memory 360 (RM360) is a multidisciplinary directed physical
            optimization and cognitive training online program designed to
            promote neuroplasticity through structured body optimization and
            brain exercises. RM360 online tools assist your licensed physician
            by creating awareness, who can diagnose and treat the underlying
            risk factor for memory loss and cognitive impairment.
          </Typography>
          <Typography paragraph>
            RM360 may incorporate data from third-party sleep or activity
            tracking devices for biometric charting. Cognitive exercises are
            developed after 20 years of research and tried on hundreds of
            patients in the USA in the last 15 years by Dr siuresh Kumar MD,
            Diplomate ABPN-TBIM a triple board certified neurologist practice in
            USA. Brain exercises are selected after Dynamic cognitive test for
            individualized online cognitive training.
          </Typography>
          <Typography paragraph>
            RM360 and associated platforms provide online portals for cognitive
            training. RM360, Regain Memory Inc., regainmemory.org,
            regainmemory360.com, and Suresh Kumar, M.D. assume no responsibility
            for emotional, physical, or financial damages resulting from program
            use.
          </Typography>
          <Typography paragraph>
            RM360 does not guarantee reimbursement or refund, as acceptance
            varies by insurance provider. Documentation is generated only when
            the program is used in the recommended sequence. RM360 and its
            affiliates are not responsible for loss of documentation caused by
            failure to follow usage instructions or for any resulting financial
            losses.
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            SECTION 2 — LICCA, DMAC & RELATED APPLICATIONS
          </Typography>
          <Typography variant="subtitle2">2.1 Purpose and Scope</Typography>
          <Typography paragraph>
            The Life Integrated Computerized Cognitive Application (LICCA) and
            Dynamic Mobile Assessment of Cognition (DMAC) are developed through
            extensive research and comparison with standardized cognitive
            assessments. These tools measure cognitive function to guide and
            assist therapeutic planning to practicing physicians.
          </Typography>

          <Typography variant="subtitle2">
            2.2 Non-Diagnostic Limitation
          </Typography>
          <Typography paragraph>
            DMAC scores do NOT diagnose Alzheimer's disease or any form of
            dementia. Users must consult a qualified provider for formal
            diagnosis of memory disorders, TBI, MTBI, or dementia.
          </Typography>

          <Typography variant="subtitle2">2.3 Research Background</Typography>
          <Typography paragraph>
            RM360 cognitive systems and training tools have been developed at
            the Headache, TBI & Cognitive Institute and presented at
            peer-reviewed neurology and rehabilitation conferences. Early
            controlled research demonstrated 55–65% improvement in cognitive
            domains among acquired brain injury groups (excluding advanced
            dementia). Results may vary in home-based settings.
          </Typography>

          <Typography variant="subtitle2">2.4 Training Requirements</Typography>
          <Typography paragraph>
            Cognitive training via LICCA typically requires 45–60 minutes of
            exercise every other day, along with recommended ACT use. Elderly
            users may require supervision, device support, or motivational
            assistance.
          </Typography>

          <Typography variant="subtitle2">2.5 No Guarantees</Typography>
          <Typography paragraph>
            No guarantee of cognitive improvement is given, as RM360 cannot
            control remote training conditions. Physicians and therapists may
            access training history and scores to guide clinical decisions.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            SECTION 3 — MEDICAL & DIAGNOSTIC DISCLAIMER
          </Typography>
          <Typography paragraph>
            DMAC and related cognitive tools are intended for awareness and
            screening only. All information is provided without warranties of
            any kind, express or implied. Users must not rely on RM360 or DMAC
            scores or website information as a substitute for medical advice. Do
            not delay or discontinue medical care based on information from
            RM360.
          </Typography>
          <Typography paragraph>
            The expert advice given by qualified physicians enrolled in RM360
            are to educate and answer questions and concerns about memory or
            cognitive impairment. They are not implied for treatment, some of
            the diagnostic tests or tools are designed to direct you to your
            physician to seek treatment of underlying treatable medical problems
            contributing to cognitive impairment.
          </Typography>
          <Typography paragraph>
            Support features within the platform may provide incomplete or
            imprecise information due to limitations of online communication.
            RM360 and its affiliated entities do not guarantee accuracy,
            completeness, or timeliness of website content.
          </Typography>
          <Typography paragraph>
            Access to the RM360 website and tools is at the user’s own risk.
            RM360 is not liable for direct, indirect, incidental, special,
            consequential, or punitive damages arising from use of the platform,
            including damage caused by malware or technical errors.
          </Typography>
          <Typography paragraph>
            All RM360 content is for informational purposes only and should not
            be interpreted as medical advice.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            SECTION 4 — HIPAA & PRIVACY COMPLIANCE ADD-ON
          </Typography>
          <Typography variant="subtitle2">4.1 Compliance Statement</Typography>
          <Typography paragraph>
            RM360, Regain Memory LLC or Inc., affiliated websites, and Suresh
            Kumar, M.D. comply with the Health Insurance Portability and
            Accountability Act (HIPAA) and applicable state privacy laws. All
            Protected Health Information (PHI) is stored and handled according
            to HIPAA Privacy, Security, and Breach Notification Rules.
          </Typography>

          <Typography variant="subtitle2">
            4.2 Types of Information Collected
          </Typography>
          <Typography paragraph>
            The platform may collect PHI including: Personal identifiers (name,
            DOB, contact info), Cognitive assessment results, Biometric, sleep,
            or activity data (if submitted), Medical diagnosis-related
            information, System-generated reports and documentation. RM360 does
            not store credit card information.
          </Typography>

          <Typography variant="subtitle2">
            4.3 Data Storage and Protection
          </Typography>
          <Typography paragraph>
            PHI is stored on Amazon Web Services (AWS) encrypted servers fully
            compliant with HIPAA standards. Safeguards include: Encryption of
            PHI in transit and at rest, Role-based access controls, Secure
            authentication, Continuous monitoring and auditing, Regular security
            reviews. Users are responsible for keeping passwords confidential.
          </Typography>

          <Typography variant="subtitle2">4.4 Use of Information</Typography>
          <Typography paragraph>
            PHI may be used for: Cognitive therapy planning, Clinical evaluation
            by your provider, Insurance documentation (no guarantee of
            acceptance), De-identified research and quality improvement. PHI is
            never sold to third parties.
          </Typography>

          <Typography variant="subtitle2">4.5 Disclosure of PHI</Typography>
          <Typography paragraph>
            PHI may be disclosed: To your treating clinician, With your written
            authorization, As required by law, To HIPAA-compliant business
            associates, For internal administrative or security purposes. We
            follow a minimum necessary disclosure standard.
          </Typography>

          <Typography variant="subtitle2">4.6 Your HIPAA Rights</Typography>
          <Typography paragraph>
            You have the right to: Access your records, Request corrections,
            Receive an accounting of disclosures, Request confidential
            communications, Request restrictions on use/disclosure, File a
            privacy complaint without retaliation.
          </Typography>

          <Typography variant="subtitle2">
            4.7 Breach Notification Procedure
          </Typography>
          <Typography paragraph>
            In case of a PHI breach, RM360 will: Conduct a risk assessment,
            Notify affected individuals following HIPAA guidelines, Notify HHS
            when required, Implement corrective actions.
          </Typography>

          <Typography variant="subtitle2">4.8 User Responsibilities</Typography>
          <Typography paragraph>
            Users must: Keep login credentials confidential, Log out after each
            session, Use secure devices and networks, Report suspicious account
            activity.
          </Typography>

          <Typography variant="subtitle2">4.9 Limitations</Typography>
          <Typography paragraph>
            While RM360 follows industry security standards, absolute security
            cannot be guaranteed.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            SECTION 5 — SUBSCRIPTIONS & USER RESPONSIBILITIES
          </Typography>
          <Typography variant="subtitle2">5.1 Subscription Policy</Typography>
          <Typography paragraph>
            All subscription fees paid online are non-refundable. RM360 does not
            store payment card data and does not auto-renew subscriptions.
          </Typography>

          <Typography variant="subtitle2">
            5.2 Security Recommendations
          </Typography>
          <Typography paragraph>
            Users should not share passwords and should log out after each
            training session.
          </Typography>

          <Typography variant="subtitle2">5.3 User Waiver of Claims</Typography>
          <Typography paragraph>
            By clicking ACCEPT, users waive all rights to claims against:
            regainmemory.org, regainmemorycenter.com, retainmemory.com, Regain
            Memory Inc., Suresh Kumar, M.D., Any affiliated companies or
            institutions. This waiver includes any damages or harm arising from
            the use of LICCA, MUST, ACT, PDS, or MCT programs.
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={disclaimerAccepted}
              onChange={e => setDisclaimerAccepted(e.target.checked)}
            />
          }
          label="I have read and agree to the disclaimer"
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <TextField
            label="Name ; Type electronic signature"
            value={disclaimerSignature}
            onChange={e => setDisclaimerSignature(e.target.value)}
            style={{ width: '50%' }}
          />
          <TextField
            label="Date"
            type="date"
            value={disclaimerDate}
            onChange={e => setDisclaimerDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ width: '50%' }}
          />
        </Box>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => handleSubmit('disclaimer')}
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={24} /> : 'ACCEPT'}
        </Button>
      </TabPanel>

      <TabPanel value={value} index={5}>
        <Box
          sx={{
            maxHeight: '400px',
            overflowY: 'auto',
            mb: 2,
            p: 2,
            border: '1px solid #ccc',
          }}
        >
          <Typography variant="h6">
            Consent for Research Study & Authorization to Share Protected Health
            Information
          </Typography>
          <Typography variant="subtitle1">
            RegainMemory.org / RegainMemory360.com
          </Typography>
          <Typography variant="subtitle2">
            Neuro-Headache, TBI & Cognitive Research Institute
          </Typography>
          <Typography variant="body2">
            3010 Legacy Drive, Frisco, TX, LA 75034
          </Typography>
          <Typography variant="body2">
            Email: research@regainmemory360.com
          </Typography>
          <Typography variant="body2">
            Web: regainmemory.org | regainmemory360.com
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            1. Background and Purpose
          </Typography>
          <Typography paragraph>
            LICCA / RegainMemory.org / Neuro-Headache, TBI & Cognitive Research
            Institute / Regain Memory Center is a research-based clinical
            program led by Dr. Suresh Kumar, who is dedicated to advancing
            medical and cognitive treatment through research. You are being
            asked to participate—or to permit the use of your health
            information—in our research studies. Your decision will not affect
            your clinical care, medical care, or cognitive therapy. Active
            participation requires approximately 3 hours per week. Please take
            your time to decide and ask any questions you may have. All
            cognitive training conducted on RegainMemory.org,
            RegainMemory360.com, and LICCA portals is protected by SSL-secured
            servers, using security comparable to online banking systems.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            2. Background Information
          </Typography>
          <Typography paragraph>
            Mild to Moderate memory loss remains a major clinical challenge.
            Attention deficits in dementia often limit the effectiveness of
            typical cognitive stimulation strategies. Memory loss often presents
            without clear clinical or radiological markers. Advances in
            neuroplasticity and neuroimaging continue to refine our
            understanding of cognitive disorders. Our focus includes cognitive
            decline related to aging, dementia, stroke, and acquired traumatic
            brain injuries. Our mission is to continually improve treatment
            based on patient care and research insights.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            3. Risks and Discomforts
          </Typography>
          <Typography paragraph>
            There are no known risks or discomforts involved in participating in
            this research. Your treatment and cognitive therapy remain
            unchanged. If future experimental treatments are offered, they will
            require a separate consent form.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            4. Benefits
          </Typography>
          <Typography paragraph>
            The information learned from patient care and research helps improve
            clinical outcomes and guide future treatment strategies.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            5. Voluntary Participation
          </Typography>
          <Typography paragraph>
            Participation is voluntary. You may withdraw at any time without
            penalty and without loss of benefits.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            6. Costs and Payments
          </Typography>
          <Typography paragraph>
            There is no cost to you and no reimbursement provided, as all
            services are part of routine care or online cognitive therapy.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            7. Research-Related Injury or Questions
          </Typography>
          <Typography paragraph>
            Study Coordinator: 2143009967. For questions about participant
            rights, contact Regainmemory360.com
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            8. Confidentiality & Authorization to Use/Share Health Information
          </Typography>
          <Typography paragraph>
            If you participate, your medical information may be used for current
            and future research. Federal law protects your privacy. By signing
            this form, you authorize the use and sharing of Protected Health
            Information (PHI) for research. You also authorize
            Regainmemory360.com / Suresh Kumar and its affiliate companies and
            its employees, and contracted data management and companies to
            access your medical information for research and machine learning.
            Your identity will not be disclosed in any publications or
            presentations.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            9. Consent & Authorization
          </Typography>
          <Typography paragraph>
            I have read and understood the information above. The purpose and
            nature of this research study have been explained to me. I
            voluntarily consent—or consent on behalf of my dependent—to
            participate. I understand that I may print a copy of this form for
            my records.
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={consentAccepted}
              onChange={e => setConsentAccepted(e.target.checked)}
            />
          }
          label="I agree to the terms"
        />

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Participant Information
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Full Name"
            value={consentName}
            onChange={e => setConsentName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Signature"
            value={consentSignature}
            onChange={e => setConsentSignature(e.target.value)}
            fullWidth
          />
          <TextField
            label="Date"
            type="date"
            value={consentDate}
            onChange={e => setConsentDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          If signing as a legal guardian:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Guardian Name"
            value={guardianName}
            onChange={e => setGuardianName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Relationship to Participant"
            value={guardianRelation}
            onChange={e => setGuardianRelation(e.target.value)}
            fullWidth
          />
          <TextField
            label="Guardian Signature"
            value={guardianSignature}
            onChange={e => setGuardianSignature(e.target.value)}
            fullWidth
          />
          <TextField
            label="Date"
            type="date"
            value={guardianDate}
            onChange={e => setGuardianDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => handleSubmit('consent')}
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </TabPanel>
    </Paper>
  );
};

export default AssessmentForm;
