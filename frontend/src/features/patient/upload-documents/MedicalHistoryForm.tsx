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
}: {
  title: string;
  options: string[];
  values: string[];
  onChange: (next: string[]) => void;
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>{title}</FormLabel>
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
    </Box>
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
      <FormLabel sx={{ fontWeight: 600 }}>{label}</FormLabel>
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

  const [errors, setErrors] = useState({
    memoryDuration: false,
    attentionProblem: false,
  });

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
    const nextErrors = {
      memoryDuration: !form.memoryDuration,
      attentionProblem: !form.attentionProblem,
    };

    if (nextErrors.memoryDuration || nextErrors.attentionProblem) {
      setErrors(nextErrors);
      if (nextErrors.memoryDuration) scrollToElement(memoryDurationRef.current);
      else scrollToElement(attentionProblemRef.current);

      enqueueSnackbar('Please select memory loss duration', {
        variant: 'error',
      });
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

      <CheckboxGroup
        title="Ques 3: Neurological Conditions (select all that apply)"
        options={neurologicalOptions}
        values={form.neurologicalConditions}
        onChange={next =>
          setForm(prev => ({ ...prev, neurologicalConditions: next }))
        }
      />

      <CheckboxGroup
        title="Ques 4: Sleep-Related Disorders (select all that apply)"
        options={sleepOptions}
        values={form.sleepRelatedDisorders}
        onChange={next =>
          setForm(prev => ({ ...prev, sleepRelatedDisorders: next }))
        }
      />

      <CheckboxGroup
        title="Ques 5: Psychiatric & Emotional Conditions (select all that apply)"
        options={psychOptions}
        values={form.psychiatricEmotionalConditions}
        onChange={next =>
          setForm(prev => ({ ...prev, psychiatricEmotionalConditions: next }))
        }
      />

      <CheckboxGroup
        title="Ques 6: Cardiovascular & Metabolic Disorders (select all that apply)"
        options={cardioOptions}
        values={form.cardiovascularMetabolicDisorders}
        onChange={next =>
          setForm(prev => ({ ...prev, cardiovascularMetabolicDisorders: next }))
        }
      />

      <CheckboxGroup
        title="Ques 7: Endocrine & Hormonal Disorders (select all that apply)"
        options={endocrineOptions}
        values={form.endocrineHormonalDisorders}
        onChange={next =>
          setForm(prev => ({ ...prev, endocrineHormonalDisorders: next }))
        }
      />

      <CheckboxGroup
        title="Ques 8: Respiratory & Systemic Conditions (select all that apply)"
        options={respiratoryOptions}
        values={form.respiratorySystemicConditions}
        onChange={next =>
          setForm(prev => ({ ...prev, respiratorySystemicConditions: next }))
        }
      />

      <CheckboxGroup
        title="Ques 9: Medication-Related Causes (select all that apply)"
        options={medicationOptions}
        values={form.medicationRelatedCauses}
        onChange={next =>
          setForm(prev => ({ ...prev, medicationRelatedCauses: next }))
        }
      />

      <CheckboxGroup
        title="Ques 10: Substance-Related Causes (select all that apply)"
        options={substanceOptions}
        values={form.substanceRelatedCauses}
        onChange={next =>
          setForm(prev => ({ ...prev, substanceRelatedCauses: next }))
        }
      />

      <Box sx={{ mt: 3 }}>
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

      <Box sx={{ mt: 3 }}>
        <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Ques 12: Vital sign</FormLabel>
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
          />

          <FormControl>
            <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Weight</FormLabel>
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
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Height</FormLabel>
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
            />
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Ques 13: Social habits</FormLabel>

        <YesNoRadioGroup
          label="Exercise"
          value={form.socialHabits.exercise}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              socialHabits: { ...prev.socialHabits, exercise: v },
            }))
          }
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
        />

        <FormControl sx={{ mt: 3 }}>
          <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Alcohol</FormLabel>
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
        />

        <CheckboxGroup
          title="Family History (select all that apply)"
          options={familyHistoryOptions}
          values={form.socialHabits.familyHistoryMembers}
          onChange={next =>
            setForm(prev => ({
              ...prev,
              socialHabits: {
                ...prev.socialHabits,
                familyHistoryMembers: next,
              },
            }))
          }
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
        />
      </Box>

      {/*  */}

      <Box sx={{ mt: 3 }}>
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
          {submitting ? <CircularProgress size={22} /> : 'Submit'}
        </Button>
      </Box>
    </Paper>
  );
};

export default MedicalHistoryForm;
