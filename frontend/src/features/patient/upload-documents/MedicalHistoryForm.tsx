import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useSnackbar } from 'notistack';
import CustomLoader from '../../../components/loader';
import {
  useGetLatestMedicalHistory,
  useSubmitMedicalHistory,
} from '../hooks/useMedicalHistory';

type SpeechRecognitionAlternativeLike = { transcript: string };
type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionAlternativeLike>;
type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type YesNo = 'yes' | 'no' | '';

type AlcoholFrequency = 'everyday' | 'weekends' | 'occasional' | '';

type WeightUnit = 'kg' | 'lb' | '';
type HeightUnit = 'cm' | 'ft' | 'in' | '';

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
    weightUnit: WeightUnit;
    weight: string;
    heightUnit: HeightUnit;
    height: string;
    bmi?: string;
  };
  socialHabits: {
    exercise: YesNo;
    walking: YesNo;
    sleepMoreThan6Hours: YesNo;
    alcohol: AlcoholFrequency;
    drugAbusePresent: YesNo;
    drugAbusePast: YesNo;
    tobacco: YesNo;
    familyHistoryMembers: string[];
    dementia: YesNo;
    stroke: YesNo;
    lupus: YesNo;
  };
  concerns: string;
};

type ErrorState = {
  memoryDuration: boolean;
  attentionProblem: boolean;
  neurologicalConditions: boolean;
  sleepRelatedDisorders: boolean;
  psychiatricEmotionalConditions: boolean;
  cardiovascularMetabolicDisorders: boolean;
  endocrineHormonalDisorders: boolean;
  respiratorySystemicConditions: boolean;
  medicationRelatedCauses: boolean;
  substanceRelatedCauses: boolean;
  currentMedicationList: boolean;
  vitalsSystolic: boolean;
  vitalsDiastolic: boolean;
  vitalsHeartRate: boolean;
  vitalsWeightUnit: boolean;
  vitalsWeight: boolean;
  vitalsHeightUnit: boolean;
  vitalsHeight: boolean;
  socialExercise: boolean;
  socialWalking: boolean;
  socialSleepMoreThan6Hours: boolean;
  socialAlcohol: boolean;
  socialDrugAbusePresent: boolean;
  socialDrugAbusePast: boolean;
  socialTobacco: boolean;
  socialFamilyHistoryMembers: boolean;
  socialDementia: boolean;
  socialStroke: boolean;
  socialLupus: boolean;
  concerns: boolean;
};

const DEFAULT_PAYLOAD: MedicalHistoryPayload = {
  memoryDuration: '',
  attentionProblem: '',
  neurologicalConditions: [],
  sleepRelatedDisorders: [],
  psychiatricEmotionalConditions: [],
  cardiovascularMetabolicDisorders: [],
  endocrineHormonalDisorders: [],
  respiratorySystemicConditions: [],
  medicationRelatedCauses: [],
  substanceRelatedCauses: [],
  currentMedicationList: '',
  vitals: {
    systolic: '',
    diastolic: '',
    heartRate: '',
    weightUnit: '',
    weight: '',
    heightUnit: '',
    height: '',
  },
  socialHabits: {
    exercise: '',
    walking: '',
    sleepMoreThan6Hours: '',
    alcohol: '',
    drugAbusePresent: '',
    drugAbusePast: '',
    tobacco: '',
    familyHistoryMembers: [],
    dementia: '',
    stroke: '',
    lupus: '',
  },
  concerns: '',
};

const DEFAULT_ERRORS: ErrorState = {
  memoryDuration: false,
  attentionProblem: false,
  neurologicalConditions: false,
  sleepRelatedDisorders: false,
  psychiatricEmotionalConditions: false,
  cardiovascularMetabolicDisorders: false,
  endocrineHormonalDisorders: false,
  respiratorySystemicConditions: false,
  medicationRelatedCauses: false,
  substanceRelatedCauses: false,
  currentMedicationList: false,
  vitalsSystolic: false,
  vitalsDiastolic: false,
  vitalsHeartRate: false,
  vitalsWeightUnit: false,
  vitalsWeight: false,
  vitalsHeightUnit: false,
  vitalsHeight: false,
  socialExercise: false,
  socialWalking: false,
  socialSleepMoreThan6Hours: false,
  socialAlcohol: false,
  socialDrugAbusePresent: false,
  socialDrugAbusePast: false,
  socialTobacco: false,
  socialFamilyHistoryMembers: false,
  socialDementia: false,
  socialStroke: false,
  socialLupus: false,
  concerns: false,
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

const CheckboxGroup = ({
  title,
  options,
  values,
  onChange,
  error,
  helperText,
}: {
  title: string;
  options: string[];
  values: string[];
  onChange: (next: string[]) => void;
  error?: boolean;
  helperText?: string;
}) => {
  return (
    <FormControl error={!!error} sx={{ mt: 3, display: 'block' }}>
      <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
        {title}
      </FormLabel>
      <FormGroup sx={{ mt: 1 }}>
        {options.map(opt => {
          const checked = values.includes(opt);
          return (
            <FormControlLabel
              key={opt}
              control={
                <Checkbox
                  checked={checked}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    const next = isChecked
                      ? [...values, opt]
                      : values.filter(v => v !== opt);
                    onChange(next);
                  }}
                />
              }
              label={opt}
            />
          );
        })}
      </FormGroup>
      {error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

const YesNoRadioGroup = ({
  label,
  value,
  onChange,
  error,
  helperText,
}: {
  label: string;
  value: YesNo;
  onChange: (v: YesNo) => void;
  error?: boolean;
  helperText?: string;
}) => {
  return (
    <FormControl error={!!error} sx={{ mt: 3, display: 'block' }}>
      <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
        {label}
      </FormLabel>
      <RadioGroup
        row
        value={value}
        onChange={e => onChange(e.target.value as YesNo)}
      >
        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
        <FormControlLabel value="no" control={<Radio />} label="No" />
      </RadioGroup>
      {error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

const scrollToElement = (el: HTMLElement | null) => {
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const input = el.querySelector('input, textarea') as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;
  input?.focus?.();
};

const MedicalHistoryForm = ({ onSubmitted }: { onSubmitted?: () => void }) => {
  const { data: latest, isLoading } = useGetLatestMedicalHistory();
  const { mutateAsync: submitMedicalHistory, isPending: submitting } =
    useSubmitMedicalHistory();
  const { enqueueSnackbar } = useSnackbar();

  const speechRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isRecordingMedication, setIsRecordingMedication] = useState(false);

  const memoryDurationRef = useRef<HTMLDivElement | null>(null);
  const attentionProblemRef = useRef<HTMLDivElement | null>(null);

  const neurologicalRef = useRef<HTMLDivElement | null>(null);
  const sleepRef = useRef<HTMLDivElement | null>(null);
  const psychRef = useRef<HTMLDivElement | null>(null);
  const cardioRef = useRef<HTMLDivElement | null>(null);
  const endocrineRef = useRef<HTMLDivElement | null>(null);
  const respiratoryRef = useRef<HTMLDivElement | null>(null);
  const medicationRelatedRef = useRef<HTMLDivElement | null>(null);
  const substanceRelatedRef = useRef<HTMLDivElement | null>(null);
  const currentMedicationRef = useRef<HTMLDivElement | null>(null);
  const vitalsRef = useRef<HTMLDivElement | null>(null);
  const socialRef = useRef<HTMLDivElement | null>(null);
  const concernsRef = useRef<HTMLDivElement | null>(null);

  const [errors, setErrors] = useState<ErrorState>(DEFAULT_ERRORS);

  const latestPayload = useMemo(() => {
    const parsed = parseMaybeJson(latest?.data);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Partial<MedicalHistoryPayload>;
  }, [latest]);

  const [form, setForm] = useState<MedicalHistoryPayload>(DEFAULT_PAYLOAD);

  const getSpeechRecognitionCtor = () => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
  };

  const stopSpeechRecognition = () => {
    try {
      speechRecognitionRef.current?.stop?.();
    } catch {
      // ignore
    } finally {
      speechRecognitionRef.current = null;
      setIsRecordingMedication(false);
    }
  };

  const toggleMedicationSpeechInput = () => {
    if (isRecordingMedication) {
      stopSpeechRecognition();
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      enqueueSnackbar(
        'Speech input is not supported in this browser. Please type instead.',
        { variant: 'error' }
      );
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    speechRecognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const results = event?.results;
      if (!results) return;

      let transcript = '';
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const alt = result?.[0];
        if (alt?.transcript) transcript += alt.transcript;
      }

      const nextText = transcript.trim();
      if (!nextText) return;

      setForm(prev => ({
        ...prev,
        currentMedicationList: prev.currentMedicationList?.trim()
          ? `${prev.currentMedicationList.trim()} ${nextText}`
          : nextText,
      }));
    };

    recognition.onerror = () => {
      enqueueSnackbar('Could not capture speech input. Please try again.', {
        variant: 'error',
      });
      stopSpeechRecognition();
    };

    recognition.onend = () => {
      speechRecognitionRef.current = null;
      setIsRecordingMedication(false);
    };

    try {
      recognition.start();
      setIsRecordingMedication(true);
    } catch {
      enqueueSnackbar('Could not start speech input. Please try again.', {
        variant: 'error',
      });
      stopSpeechRecognition();
    }
  };

  useEffect(() => {
    if (!latestPayload) return;
    setForm(prev => ({
      ...prev,
      ...latestPayload,
      vitals: {
        ...prev.vitals,
        ...(latestPayload.vitals || {}),
      },
      socialHabits: {
        ...prev.socialHabits,
        ...(latestPayload.socialHabits || {}),
      },
    }));
  }, [latestPayload]);

  useEffect(() => {
    return () => {
      try {
        speechRecognitionRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  const memoryDurationOptions = useMemo(
    () => [
      '1-3 month',
      '3-6 months',
      '6-12 months',
      '> 12 months',
      '>24 months',
    ],
    []
  );

  const neurologicalOptions = useMemo(
    () => [
      'Alzheimer’s disease',
      'Vascular dementia',
      'Lewy body dementia',
      'Frontotemporal dementia',
      'Mild Cognitive Impairment (MCI)',
      'Parkinson’s disease',
      'Multiple sclerosis',
      'Epilepsy or seizure disorders',
      'Traumatic brain injury (TBI), concussion, or post-concussive syndrome',
      'Stroke or transient ischemic attacks (TIA)',
      'Brain tumors',
    ],
    []
  );

  const sleepOptions = useMemo(
    () => [
      'Obstructive sleep apnea (OSA)',
      'Chronic insomnia',
      'Restless Leg Syndrome (RLS)',
      'Circadian rhythm disorders',
      'Asthma/COPD',
    ],
    []
  );

  const familyHistoryOptions = useMemo(
    () => ['Father', 'Mother', 'Grandfather/Grandmother', 'Brother/Sister'],
    []
  );

  const psychOptions = useMemo(
    () => [
      'Major depressive disorder',
      'Anxiety disorders',
      'Post-traumatic stress disorder (PTSD)',
      'Chronic stress',
      'Bipolar disorder',
    ],
    []
  );

  const cardioOptions = useMemo(
    () => [
      'Hypertension (high blood pressure)',
      'Diabetes or prediabetes',
      'High cholesterol',
      'Atherosclerosis',
      'Heart disease or arrhythmias',
      'Obesity',
      'Metabolic syndrome',
    ],
    []
  );

  const endocrineOptions = useMemo(
    () => [
      'Thyroid disorders (hypothyroidism or hyperthyroidism)',
      'Adrenal dysfunction',
      'Vitamin B12 deficiency',
      'Vitamin D deficiency',
    ],
    []
  );

  const respiratoryOptions = useMemo(
    () => [
      'Chronic obstructive pulmonary disease (COPD)',
      'Chronic kidney disease',
      'Chronic liver disease',
      'Autoimmune disorders (e.g., lupus, rheumatoid arthritis)',
      'Long-term inflammation',
    ],
    []
  );

  const medicationOptions = useMemo(
    () => [
      'Benzodiazepines',
      'Anticholinergics',
      'Sedatives',
      'Some pain medications / opioids',
      'Certain antihistamines',
      'Some sleep medications',
    ],
    []
  );

  const substanceOptions = useMemo(
    () => [
      'Alcohol use disorder',
      'Recreational drug use',
      'Long-term tobacco use',
    ],
    []
  );

  const handleSubmit = async () => {
    const nextErrors: ErrorState = { ...DEFAULT_ERRORS };
    const firstInvalidRef: {
      current: { el: HTMLElement | null; message: string } | null;
    } = { current: null };

    const setFirstInvalid = (el: HTMLElement | null, message: string): void => {
      if (firstInvalidRef.current) return;
      firstInvalidRef.current = { el, message };
    };

    if (!form.memoryDuration) {
      nextErrors.memoryDuration = true;
      setFirstInvalid(
        memoryDurationRef.current,
        'Please answer Q1 (memory duration)'
      );
    }

    if (!form.attentionProblem) {
      nextErrors.attentionProblem = true;
      setFirstInvalid(
        attentionProblemRef.current,
        'Please answer Q2 (attention problem)'
      );
    }

    if (!form.neurologicalConditions?.length) {
      nextErrors.neurologicalConditions = true;
      setFirstInvalid(
        neurologicalRef.current,
        'Please answer Q3 (neurological conditions)'
      );
    }

    if (!form.sleepRelatedDisorders?.length) {
      nextErrors.sleepRelatedDisorders = true;
      setFirstInvalid(sleepRef.current, 'Please answer Q4 (sleep disorders)');
    }

    if (!form.psychiatricEmotionalConditions?.length) {
      nextErrors.psychiatricEmotionalConditions = true;
      setFirstInvalid(
        psychRef.current,
        'Please answer Q5 (psychiatric & emotional conditions)'
      );
    }

    if (!form.cardiovascularMetabolicDisorders?.length) {
      nextErrors.cardiovascularMetabolicDisorders = true;
      setFirstInvalid(
        cardioRef.current,
        'Please answer Q6 (cardiovascular & metabolic disorders)'
      );
    }

    if (!form.endocrineHormonalDisorders?.length) {
      nextErrors.endocrineHormonalDisorders = true;
      setFirstInvalid(
        endocrineRef.current,
        'Please answer Q7 (endocrine & hormonal disorders)'
      );
    }

    if (!form.respiratorySystemicConditions?.length) {
      nextErrors.respiratorySystemicConditions = true;
      setFirstInvalid(
        respiratoryRef.current,
        'Please answer Q8 (respiratory & systemic conditions)'
      );
    }

    if (!form.medicationRelatedCauses?.length) {
      nextErrors.medicationRelatedCauses = true;
      setFirstInvalid(
        medicationRelatedRef.current,
        'Please answer Q9 (medication-related causes)'
      );
    }

    if (!form.substanceRelatedCauses?.length) {
      nextErrors.substanceRelatedCauses = true;
      setFirstInvalid(
        substanceRelatedRef.current,
        'Please answer Q10 (substance-related causes)'
      );
    }

    if (!form.currentMedicationList?.trim()) {
      nextErrors.currentMedicationList = true;
      setFirstInvalid(
        currentMedicationRef.current,
        'Please answer Q11 (current medication list)'
      );
    }

    if (!form.vitals.systolic?.trim()) nextErrors.vitalsSystolic = true;
    if (!form.vitals.diastolic?.trim()) nextErrors.vitalsDiastolic = true;
    if (!form.vitals.heartRate?.trim()) nextErrors.vitalsHeartRate = true;
    if (!form.vitals.weightUnit) nextErrors.vitalsWeightUnit = true;
    if (!form.vitals.weight?.trim()) nextErrors.vitalsWeight = true;
    if (!form.vitals.heightUnit) nextErrors.vitalsHeightUnit = true;
    if (!form.vitals.height?.trim()) nextErrors.vitalsHeight = true;

    if (
      nextErrors.vitalsSystolic ||
      nextErrors.vitalsDiastolic ||
      nextErrors.vitalsHeartRate ||
      nextErrors.vitalsWeightUnit ||
      nextErrors.vitalsWeight ||
      nextErrors.vitalsHeightUnit ||
      nextErrors.vitalsHeight
    ) {
      setFirstInvalid(vitalsRef.current, 'Please complete Q12 (vital signs)');
    }

    if (!form.socialHabits.exercise) nextErrors.socialExercise = true;
    if (!form.socialHabits.walking) nextErrors.socialWalking = true;
    if (!form.socialHabits.sleepMoreThan6Hours)
      nextErrors.socialSleepMoreThan6Hours = true;
    if (!form.socialHabits.alcohol) nextErrors.socialAlcohol = true;
    if (!form.socialHabits.drugAbusePresent)
      nextErrors.socialDrugAbusePresent = true;
    if (!form.socialHabits.drugAbusePast) nextErrors.socialDrugAbusePast = true;
    if (!form.socialHabits.tobacco) nextErrors.socialTobacco = true;
    if (!form.socialHabits.familyHistoryMembers?.length)
      nextErrors.socialFamilyHistoryMembers = true;
    if (!form.socialHabits.dementia) nextErrors.socialDementia = true;
    if (!form.socialHabits.stroke) nextErrors.socialStroke = true;
    if (!form.socialHabits.lupus) nextErrors.socialLupus = true;

    if (
      nextErrors.socialExercise ||
      nextErrors.socialWalking ||
      nextErrors.socialSleepMoreThan6Hours ||
      nextErrors.socialAlcohol ||
      nextErrors.socialDrugAbusePresent ||
      nextErrors.socialDrugAbusePast ||
      nextErrors.socialTobacco ||
      nextErrors.socialFamilyHistoryMembers ||
      nextErrors.socialDementia ||
      nextErrors.socialStroke ||
      nextErrors.socialLupus
    ) {
      setFirstInvalid(socialRef.current, 'Please complete Q13 (social habits)');
    }

    if (!form.concerns?.trim()) {
      nextErrors.concerns = true;
      setFirstInvalid(
        concernsRef.current,
        'Please enter your questions/concerns'
      );
    }

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setErrors(nextErrors);
      const firstInvalid = firstInvalidRef.current;
      if (firstInvalid) {
        scrollToElement(firstInvalid.el);
        enqueueSnackbar(firstInvalid.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Please complete all required fields', {
          variant: 'error',
        });
      }
      return;
    }

    const vitalsWithoutBmi: MedicalHistoryPayload['vitals'] = {
      ...form.vitals,
    };
    delete (vitalsWithoutBmi as { bmi?: string }).bmi;

    const payload: MedicalHistoryPayload = {
      ...form,
      vitals: vitalsWithoutBmi,
    };

    try {
      await submitMedicalHistory(payload);
      enqueueSnackbar('Medical history submitted successfully', {
        variant: 'success',
      });
      onSubmitted?.();
    } catch (error: unknown) {
      console.error(error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Error submitting medical history';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  if (isLoading) return <CustomLoader />;

  return (
    <Paper sx={{ width: '100%', boxShadow: 'none' }}>
      <Box ref={memoryDurationRef}>
        <FormControl error={errors.memoryDuration} sx={{ mt: 1 }}>
          <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
            Ques 1: Memory loss or cognitive impairment duration
          </FormLabel>
          <RadioGroup
            value={form.memoryDuration}
            onChange={e => {
              setForm(prev => ({ ...prev, memoryDuration: e.target.value }));
              setErrors(prev => ({ ...prev, memoryDuration: false }));
            }}
          >
            {memoryDurationOptions.map(opt => (
              <FormControlLabel
                key={opt}
                value={opt}
                control={<Radio />}
                label={opt}
              />
            ))}
          </RadioGroup>
          {errors.memoryDuration && (
            <FormHelperText>This field is required</FormHelperText>
          )}
        </FormControl>
      </Box>

      <Box ref={attentionProblemRef}>
        <YesNoRadioGroup
          label="Ques 2: Attention problem"
          value={form.attentionProblem}
          onChange={v => {
            setForm(prev => ({ ...prev, attentionProblem: v }));
            setErrors(prev => ({ ...prev, attentionProblem: false }));
          }}
          error={errors.attentionProblem}
          helperText="This field is required"
        />
      </Box>

      <Box ref={neurologicalRef}>
        <CheckboxGroup
          title="Ques 3: Neurological Conditions (select all that apply)"
          options={neurologicalOptions}
          values={form.neurologicalConditions}
          onChange={next => {
            setForm(prev => ({ ...prev, neurologicalConditions: next }));
            setErrors(prev => ({ ...prev, neurologicalConditions: false }));
          }}
          error={errors.neurologicalConditions}
          helperText="This field is required"
        />
      </Box>

      <Box ref={sleepRef}>
        <CheckboxGroup
          title="Ques 4: Sleep-Related Disorders (select all that apply)"
          options={sleepOptions}
          values={form.sleepRelatedDisorders}
          onChange={next => {
            setForm(prev => ({ ...prev, sleepRelatedDisorders: next }));
            setErrors(prev => ({ ...prev, sleepRelatedDisorders: false }));
          }}
          error={errors.sleepRelatedDisorders}
          helperText="This field is required"
        />
      </Box>

      <Box ref={psychRef}>
        <CheckboxGroup
          title="Ques 5: Psychiatric & Emotional Conditions (select all that apply)"
          options={psychOptions}
          values={form.psychiatricEmotionalConditions}
          onChange={next => {
            setForm(prev => ({
              ...prev,
              psychiatricEmotionalConditions: next,
            }));
            setErrors(prev => ({
              ...prev,
              psychiatricEmotionalConditions: false,
            }));
          }}
          error={errors.psychiatricEmotionalConditions}
          helperText="This field is required"
        />
      </Box>

      <Box ref={cardioRef}>
        <CheckboxGroup
          title="Ques 6: Cardiovascular & Metabolic Disorders (select all that apply)"
          options={cardioOptions}
          values={form.cardiovascularMetabolicDisorders}
          onChange={next => {
            setForm(prev => ({
              ...prev,
              cardiovascularMetabolicDisorders: next,
            }));
            setErrors(prev => ({
              ...prev,
              cardiovascularMetabolicDisorders: false,
            }));
          }}
          error={errors.cardiovascularMetabolicDisorders}
          helperText="This field is required"
        />
      </Box>

      <Box ref={endocrineRef}>
        <CheckboxGroup
          title="Ques 7: Endocrine & Hormonal Disorders (select all that apply)"
          options={endocrineOptions}
          values={form.endocrineHormonalDisorders}
          onChange={next => {
            setForm(prev => ({ ...prev, endocrineHormonalDisorders: next }));
            setErrors(prev => ({ ...prev, endocrineHormonalDisorders: false }));
          }}
          error={errors.endocrineHormonalDisorders}
          helperText="This field is required"
        />
      </Box>

      <Box ref={respiratoryRef}>
        <CheckboxGroup
          title="Ques 8: Respiratory & Systemic Conditions (select all that apply)"
          options={respiratoryOptions}
          values={form.respiratorySystemicConditions}
          onChange={next => {
            setForm(prev => ({ ...prev, respiratorySystemicConditions: next }));
            setErrors(prev => ({
              ...prev,
              respiratorySystemicConditions: false,
            }));
          }}
          error={errors.respiratorySystemicConditions}
          helperText="This field is required"
        />
      </Box>

      <Box ref={medicationRelatedRef}>
        <CheckboxGroup
          title="Ques 9: Medication-Related Causes (select all that apply)"
          options={medicationOptions}
          values={form.medicationRelatedCauses}
          onChange={next => {
            setForm(prev => ({ ...prev, medicationRelatedCauses: next }));
            setErrors(prev => ({ ...prev, medicationRelatedCauses: false }));
          }}
          error={errors.medicationRelatedCauses}
          helperText="This field is required"
        />
      </Box>

      <Box ref={substanceRelatedRef}>
        <CheckboxGroup
          title="Ques 10: Substance-Related Causes (select all that apply)"
          options={substanceOptions}
          values={form.substanceRelatedCauses}
          onChange={next => {
            setForm(prev => ({ ...prev, substanceRelatedCauses: next }));
            setErrors(prev => ({ ...prev, substanceRelatedCauses: false }));
          }}
          error={errors.substanceRelatedCauses}
          helperText="This field is required"
        />
      </Box>

      <Box ref={currentMedicationRef} sx={{ mt: 3 }}>
        <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
          Ques 11: Current medication list
        </FormLabel>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={form.currentMedicationList}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              currentMedicationList: e.target.value,
            }))
          }
          error={errors.currentMedicationList}
          helperText={
            errors.currentMedicationList ? 'This field is required' : undefined
          }
          placeholder="Type your current medications"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={toggleMedicationSpeechInput}
                  aria-label={
                    isRecordingMedication
                      ? 'Stop voice input'
                      : 'Start voice input'
                  }
                >
                  {isRecordingMedication ? (
                    <MicOffIcon sx={{ color: 'red' }} />
                  ) : (
                    <MicIcon
                      sx={{ color: theme => theme.palette.primary.main }}
                    />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mt: 1 }}
        />
      </Box>

      <Box ref={vitalsRef} sx={{ mt: 3 }}>
        <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
          Ques 12: Vital sign
        </FormLabel>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            fullWidth
            label="Systolic"
            value={form.vitals.systolic}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                vitals: { ...prev.vitals, systolic: e.target.value },
              }))
            }
            error={errors.vitalsSystolic}
            helperText={errors.vitalsSystolic ? 'Required' : undefined}
          />
          <TextField
            fullWidth
            label="Diastolic"
            value={form.vitals.diastolic}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                vitals: { ...prev.vitals, diastolic: e.target.value },
              }))
            }
            error={errors.vitalsDiastolic}
            helperText={errors.vitalsDiastolic ? 'Required' : undefined}
          />
          <TextField
            fullWidth
            label="Heart rate"
            value={form.vitals.heartRate}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                vitals: { ...prev.vitals, heartRate: e.target.value },
              }))
            }
            error={errors.vitalsHeartRate}
            helperText={errors.vitalsHeartRate ? 'Required' : undefined}
          />

          <FormControl error={errors.vitalsWeightUnit || errors.vitalsWeight}>
            <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
              Weight
            </FormLabel>
            <RadioGroup
              row
              value={form.vitals.weightUnit}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  vitals: {
                    ...prev.vitals,
                    weightUnit: e.target.value as WeightUnit,
                  },
                }))
              }
            >
              <FormControlLabel value="kg" control={<Radio />} label="kg" />
              <FormControlLabel value="lb" control={<Radio />} label="lb" />
            </RadioGroup>
            {errors.vitalsWeightUnit && (
              <FormHelperText>Unit is required</FormHelperText>
            )}
            <TextField
              fullWidth
              label="Weight"
              value={form.vitals.weight}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  vitals: { ...prev.vitals, weight: e.target.value },
                }))
              }
              error={errors.vitalsWeight}
              helperText={errors.vitalsWeight ? 'Required' : undefined}
            />
          </FormControl>

          <FormControl error={errors.vitalsHeightUnit || errors.vitalsHeight}>
            <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
              Height
            </FormLabel>
            <RadioGroup
              row
              value={form.vitals.heightUnit}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  vitals: {
                    ...prev.vitals,
                    heightUnit: e.target.value as HeightUnit,
                  },
                }))
              }
            >
              <FormControlLabel value="cm" control={<Radio />} label="cm" />
              <FormControlLabel value="ft" control={<Radio />} label="ft" />
              <FormControlLabel value="in" control={<Radio />} label="in" />
            </RadioGroup>
            {errors.vitalsHeightUnit && (
              <FormHelperText>Unit is required</FormHelperText>
            )}
            <TextField
              fullWidth
              label="Height"
              value={form.vitals.height}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  vitals: { ...prev.vitals, height: e.target.value },
                }))
              }
              error={errors.vitalsHeight}
              helperText={errors.vitalsHeight ? 'Required' : undefined}
            />
          </FormControl>
        </Box>
      </Box>

      <Box ref={socialRef} sx={{ mt: 3 }}>
        <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
          Ques 13: Social habits
        </FormLabel>

        <YesNoRadioGroup
          label="Exercise"
          value={form.socialHabits.exercise}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              socialHabits: { ...prev.socialHabits, exercise: v },
            }))
          }
          error={errors.socialExercise}
          helperText="This field is required"
        />

        <YesNoRadioGroup
          label="Walking: more than 30 minutes or 3000 steps"
          value={form.socialHabits.walking}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              socialHabits: { ...prev.socialHabits, walking: v },
            }))
          }
          error={errors.socialWalking}
          helperText="This field is required"
        />

        <YesNoRadioGroup
          label="Sleep: More than 6 hours"
          value={form.socialHabits.sleepMoreThan6Hours}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              socialHabits: { ...prev.socialHabits, sleepMoreThan6Hours: v },
            }))
          }
          error={errors.socialSleepMoreThan6Hours}
          helperText="This field is required"
        />

        <FormControl error={errors.socialAlcohol} sx={{ mt: 3 }}>
          <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
            Alcohol
          </FormLabel>
          <RadioGroup
            row
            value={form.socialHabits.alcohol}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                socialHabits: {
                  ...prev.socialHabits,
                  alcohol: e.target.value as AlcoholFrequency,
                },
              }))
            }
          >
            <FormControlLabel
              value="everyday"
              control={<Radio />}
              label="Every day"
            />
            <FormControlLabel
              value="weekends"
              control={<Radio />}
              label="Weekends"
            />
            <FormControlLabel
              value="occasional"
              control={<Radio />}
              label="Occasional"
            />
          </RadioGroup>
          {errors.socialAlcohol && (
            <FormHelperText>This field is required</FormHelperText>
          )}
        </FormControl>

        <YesNoRadioGroup
          label="Drug abuse: Present"
          value={form.socialHabits.drugAbusePresent}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              socialHabits: { ...prev.socialHabits, drugAbusePresent: v },
            }))
          }
          error={errors.socialDrugAbusePresent}
          helperText="This field is required"
        />

        <YesNoRadioGroup
          label="Drug abuse: Past"
          value={form.socialHabits.drugAbusePast}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              socialHabits: { ...prev.socialHabits, drugAbusePast: v },
            }))
          }
          error={errors.socialDrugAbusePast}
          helperText="This field is required"
        />

        <YesNoRadioGroup
          label="Tobacco"
          value={form.socialHabits.tobacco}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              socialHabits: { ...prev.socialHabits, tobacco: v },
            }))
          }
          error={errors.socialTobacco}
          helperText="This field is required"
        />

        <CheckboxGroup
          title="Family History (select all that apply)"
          options={familyHistoryOptions}
          values={form.socialHabits.familyHistoryMembers}
          onChange={next => {
            setForm(prev => ({
              ...prev,
              socialHabits: {
                ...prev.socialHabits,
                familyHistoryMembers: next,
              },
            }));
            setErrors(prev => ({ ...prev, socialFamilyHistoryMembers: false }));
          }}
          error={errors.socialFamilyHistoryMembers}
          helperText="This field is required"
        />

        <YesNoRadioGroup
          label="Dementia"
          value={form.socialHabits.dementia}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              socialHabits: { ...prev.socialHabits, dementia: v },
            }))
          }
          error={errors.socialDementia}
          helperText="This field is required"
        />

        <YesNoRadioGroup
          label="Stroke"
          value={form.socialHabits.stroke}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              socialHabits: { ...prev.socialHabits, stroke: v },
            }))
          }
          error={errors.socialStroke}
          helperText="This field is required"
        />

        <YesNoRadioGroup
          label="Lupus"
          value={form.socialHabits.lupus}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              socialHabits: { ...prev.socialHabits, lupus: v },
            }))
          }
          error={errors.socialLupus}
          helperText="This field is required"
        />
      </Box>

      {/*  */}

      <Box ref={concernsRef} sx={{ mt: 3 }}>
        <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
          Type questions or your concern below
        </FormLabel>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={form.concerns}
          onChange={e =>
            setForm(prev => ({ ...prev, concerns: e.target.value }))
          }
          error={errors.concerns}
          helperText={errors.concerns ? 'This field is required' : undefined}
          sx={{ mt: 1 }}
          placeholder="Type your questions or concerns"
        />
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <CircularProgress size={22} />
          ) : (
            <span key="medical-history-submit">Submit</span>
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default MedicalHistoryForm;
