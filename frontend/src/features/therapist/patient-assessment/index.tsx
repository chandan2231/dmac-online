import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Paper,
  Checkbox,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetPatientAssessmentStatus,
  useGetPatientDocuments,
  useGetPatientMedicalHistory,
} from '../hooks/usePatientAssessment';
import CustomLoader from '../../../components/loader';
import { TabHeaderLayout } from '../../../components/tab-header';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MedicalHistoryReadOnly from '../../patient/upload-documents/MedicalHistoryReadOnly';

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

interface Document {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

type YesNo = 'yes' | 'no' | '';
type AlcoholFrequency = 'everyday' | 'weekends' | 'occasional' | '';

type MedicalHistoryPayload = {
  memoryDuration: string;
  attentionProblem: YesNo;
  neurologicalConditions: string[];
  sleepRelatedDisorders: string[];
  psychiatricEmotionalConditions: string[];
  cardiovascularMetabolicDisorders: string[];
  endocrineHormonalDisorders: string[];
  respiratorySystemicConditions: string[];
  medicationRelatedCauses: string[];
  substanceRelatedCauses: string[];
  currentMedicationList: string;
  vitals: {
    systolic: string;
    diastolic: string;
    heartRate: string;
    weightUnit?: string;
    weight?: string;
    heightUnit?: string;
    height?: string;
    bmi?: string;
  };
  socialHabits: {
    exercise: YesNo;
    walking: YesNo;
    sleepMoreThan6Hours: YesNo;
    alcohol: AlcoholFrequency;
    drugAbusePresent: YesNo;
    drugAbusePast: YesNo;
  };
  concerns: string;
};

const parseMaybeJson = (value: unknown): unknown => {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
};

const PatientAssessment = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);

  const patientIdNum = patientId ? parseInt(patientId) : null;

  const { data: status, isLoading: assessmentLoading } =
    useGetPatientAssessmentStatus(patientIdNum);
  const { data: documents, isLoading: documentsLoading } =
    useGetPatientDocuments(patientIdNum);
  const { data: medicalHistory, isLoading: medicalHistoryLoading } =
    useGetPatientMedicalHistory(patientIdNum);

  const medicalHistoryPayload = React.useMemo(() => {
    const parsed = parseMaybeJson(medicalHistory?.data);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Partial<MedicalHistoryPayload>;
  }, [medicalHistory]);

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
    }
  }, [status]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const renderQuestionTab = (
    questions: Question[],
    data: Record<string, string>
  ) => (
    <Box>
      {Object.keys(data).length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No data submitted for this section.
        </Alert>
      )}
      {questions.map(q => (
        <Box key={q.id} sx={{ mb: 3 }}>
          <FormLabel required sx={{ whiteSpace: 'pre-line' }}>
            {q.label}
          </FormLabel>
          <RadioGroup row value={data[q.id] || ''}>
            <FormControlLabel
              value="Yes"
              control={<Radio disabled />}
              label="Yes"
            />
            <FormControlLabel
              value="No"
              control={<Radio disabled />}
              label="No"
            />
          </RadioGroup>
        </Box>
      ))}
    </Box>
  );

  const renderMedicalHistoryTab = () => {
    if (!medicalHistory) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          No medical history submitted.
        </Alert>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {medicalHistory?.created_at && (
          <Typography variant="body2" color="textSecondary">
            Last submitted:{' '}
            {new Date(medicalHistory.created_at).toLocaleString()}
          </Typography>
        )}
        <MedicalHistoryReadOnly payload={medicalHistoryPayload} />
      </Box>
    );
  };

  if (assessmentLoading || documentsLoading || medicalHistoryLoading)
    return <CustomLoader />;

  return (
    <Box sx={{ p: 3, width: '100%', height: '100%', overflowY: 'auto' }}>
      <TabHeaderLayout
        leftNode={
          <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
              }}
            >
              Patient Assessment & Documents
            </Typography>
          </Box>
        }
      />

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
          {renderMedicalHistoryTab()}
        </TabPanel>

        <TabPanel value={value} index={1}>
          {renderQuestionTab(satQuestions, satData)}
        </TabPanel>

        <TabPanel value={value} index={2}>
          {renderQuestionTab(datQuestions, datData)}
        </TabPanel>

        <TabPanel value={value} index={3}>
          {renderQuestionTab(adtQuestions, adtData)}
        </TabPanel>

        <TabPanel value={value} index={4}>
          {!disclaimerAccepted && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No disclaimer submitted.
            </Alert>
          )}
          <FormControlLabel
            control={<Checkbox checked={disclaimerAccepted} disabled />}
            label="I have read and agree to the disclaimer"
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <TextField
              label="Name ; Type electronic signature"
              value={disclaimerSignature}
              fullWidth
              disabled
            />
            <TextField
              label="Date"
              type="date"
              value={disclaimerDate}
              InputLabelProps={{ shrink: true }}
              disabled
            />
          </Box>
        </TabPanel>

        <TabPanel value={value} index={5}>
          {!consentAccepted && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No consent submitted.
            </Alert>
          )}
          <FormControlLabel
            control={<Checkbox checked={consentAccepted} disabled />}
            label="I agree to the terms"
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Participant Information
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Full Name"
              value={consentName}
              fullWidth
              disabled
            />
            <TextField
              label="Signature"
              value={consentSignature}
              fullWidth
              disabled
            />
            <TextField
              label="Date"
              type="date"
              value={consentDate}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled
            />
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            If signing as a legal guardian:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Guardian Name"
              value={guardianName}
              fullWidth
              disabled
            />
            <TextField
              label="Relationship to Participant"
              value={guardianRelation}
              fullWidth
              disabled
            />
            <TextField
              label="Guardian Signature"
              value={guardianSignature}
              fullWidth
              disabled
            />
            <TextField
              label="Date"
              type="date"
              value={guardianDate}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled
            />
          </Box>
        </TabPanel>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Patient Documents
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {documents && documents.length > 0 ? (
            documents.map((doc: Document) => (
              <Box
                key={doc.id}
                sx={{
                  width: {
                    xs: '100%',
                    sm: 'calc(50% - 12px)',
                    md: 'calc(33.33% - 16px)',
                  },
                }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6" noWrap title={doc.file_name}>
                      {doc.file_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <Typography variant="caption" display="block" gutterBottom>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      href={doc.file_url}
                      target="_blank"
                    >
                      View / Download
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))
          ) : (
            <Box sx={{ width: '100%' }}>
              <Alert severity="info">No documents uploaded by patient.</Alert>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PatientAssessment;
