import { useMemo } from 'react';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';

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

type MedicalHistoryReadOnlyInput = Partial<{
  memoryDuration: unknown;
  attentionProblem: unknown;
  neurologicalConditions: unknown;
  sleepRelatedDisorders: unknown;
  psychiatricEmotionalConditions: unknown;
  cardiovascularMetabolicDisorders: unknown;
  endocrineHormonalDisorders: unknown;
  respiratorySystemicConditions: unknown;
  medicationRelatedCauses: unknown;
  substanceRelatedCauses: unknown;
  currentMedicationList: unknown;
  vitals: unknown;
  socialHabits: unknown;
  concerns: unknown;
}>;

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

const CheckboxGroupReadOnly = ({
  title,
  options,
  values,
}: {
  title: string;
  options: string[];
  values: string[];
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <FormLabel sx={{ fontWeight: 600 }}>{title}</FormLabel>
      <FormGroup sx={{ mt: 1 }}>
        {options.map(opt => (
          <FormControlLabel
            key={opt}
            disabled
            control={<Checkbox checked={values.includes(opt)} disabled />}
            label={opt}
          />
        ))}
      </FormGroup>
    </Box>
  );
};

const YesNoRadioGroupReadOnly = ({
  label,
  value,
}: {
  label: string;
  value: YesNo;
}) => {
  return (
    <FormControl sx={{ mt: 3, display: 'block' }}>
      <FormLabel sx={{ fontWeight: 600 }}>{label}</FormLabel>
      <RadioGroup row value={value}>
        <FormControlLabel
          value="yes"
          control={<Radio disabled />}
          label="Yes"
        />
        <FormControlLabel value="no" control={<Radio disabled />} label="No" />
      </RadioGroup>
    </FormControl>
  );
};

const MedicalHistoryReadOnly = ({
  payload,
}: {
  payload: MedicalHistoryReadOnlyInput | null;
}) => {
  const asString = (v: unknown): string => (typeof v === 'string' ? v : '');

  const asStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

  const asYesNo = (v: unknown): YesNo => (v === 'yes' || v === 'no' ? v : '');

  const asAlcoholFrequency = (v: unknown): AlcoholFrequency =>
    v === 'everyday' || v === 'weekends' || v === 'occasional' ? v : '';

  const asWeightUnit = (v: unknown): WeightUnit =>
    v === 'kg' || v === 'lb' ? v : '';

  const asHeightUnit = (v: unknown): HeightUnit =>
    v === 'cm' || v === 'ft' || v === 'in' ? v : '';

  const form = useMemo<MedicalHistoryPayload>(() => {
    if (!payload) return DEFAULT_PAYLOAD;

    const vitalsRaw =
      payload.vitals && typeof payload.vitals === 'object'
        ? (payload.vitals as Record<string, unknown>)
        : {};
    const socialRaw =
      payload.socialHabits && typeof payload.socialHabits === 'object'
        ? (payload.socialHabits as Record<string, unknown>)
        : {};

    return {
      ...DEFAULT_PAYLOAD,
      memoryDuration: asString(payload.memoryDuration),
      attentionProblem: asYesNo(payload.attentionProblem),
      neurologicalConditions: asStringArray(payload.neurologicalConditions),
      sleepRelatedDisorders: asStringArray(payload.sleepRelatedDisorders),
      psychiatricEmotionalConditions: asStringArray(
        payload.psychiatricEmotionalConditions
      ),
      cardiovascularMetabolicDisorders: asStringArray(
        payload.cardiovascularMetabolicDisorders
      ),
      endocrineHormonalDisorders: asStringArray(
        payload.endocrineHormonalDisorders
      ),
      respiratorySystemicConditions: asStringArray(
        payload.respiratorySystemicConditions
      ),
      medicationRelatedCauses: asStringArray(payload.medicationRelatedCauses),
      substanceRelatedCauses: asStringArray(payload.substanceRelatedCauses),
      currentMedicationList: asString(payload.currentMedicationList),
      vitals: {
        ...DEFAULT_PAYLOAD.vitals,
        systolic: asString(vitalsRaw.systolic),
        diastolic: asString(vitalsRaw.diastolic),
        heartRate: asString(vitalsRaw.heartRate),
        weightUnit: asWeightUnit(vitalsRaw.weightUnit),
        weight: asString(vitalsRaw.weight),
        heightUnit: asHeightUnit(vitalsRaw.heightUnit),
        height: asString(vitalsRaw.height),
      },
      socialHabits: {
        ...DEFAULT_PAYLOAD.socialHabits,
        exercise: asYesNo(socialRaw.exercise),
        walking: asYesNo(socialRaw.walking),
        sleepMoreThan6Hours: asYesNo(socialRaw.sleepMoreThan6Hours),
        alcohol: asAlcoholFrequency(socialRaw.alcohol),
        drugAbusePresent: asYesNo(socialRaw.drugAbusePresent),
        drugAbusePast: asYesNo(socialRaw.drugAbusePast),
        tobacco: asYesNo(socialRaw.tobacco),
        familyHistoryMembers: asStringArray(socialRaw.familyHistoryMembers),
        dementia: asYesNo(socialRaw.dementia),
        stroke: asYesNo(socialRaw.stroke),
        lupus: asYesNo(socialRaw.lupus),
      },
      concerns: asString(payload.concerns),
    };
  }, [payload]);

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

  return (
    <Paper sx={{ width: '100%', boxShadow: 'none' }}>
      <FormControl sx={{ mt: 1 }}>
        <FormLabel sx={{ fontWeight: 600 }}>
          Ques 1: Memory loss or cognitive impairment Duration
        </FormLabel>
        <RadioGroup value={form.memoryDuration}>
          {memoryDurationOptions.map(opt => (
            <FormControlLabel
              key={opt}
              value={opt}
              control={<Radio disabled />}
              label={opt}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <YesNoRadioGroupReadOnly
        label="Ques 2: Attention problem"
        value={form.attentionProblem}
      />

      <CheckboxGroupReadOnly
        title="Ques 3: Neurological Conditions (select all that apply)"
        options={neurologicalOptions}
        values={form.neurologicalConditions}
      />

      <CheckboxGroupReadOnly
        title="Ques 4: Sleep-Related Disorders (select all that apply)"
        options={sleepOptions}
        values={form.sleepRelatedDisorders}
      />

      <CheckboxGroupReadOnly
        title="Ques 5: Psychiatric & Emotional Conditions (select all that apply)"
        options={psychOptions}
        values={form.psychiatricEmotionalConditions}
      />

      <CheckboxGroupReadOnly
        title="Ques 6: Cardiovascular & Metabolic Disorders (select all that apply)"
        options={cardioOptions}
        values={form.cardiovascularMetabolicDisorders}
      />

      <CheckboxGroupReadOnly
        title="Ques 7: Endocrine & Hormonal Disorders (select all that apply)"
        options={endocrineOptions}
        values={form.endocrineHormonalDisorders}
      />

      <CheckboxGroupReadOnly
        title="Ques 8: Respiratory & Systemic Conditions (select all that apply)"
        options={respiratoryOptions}
        values={form.respiratorySystemicConditions}
      />

      <CheckboxGroupReadOnly
        title="Ques 9: Medication-Related Causes (select all that apply)"
        options={medicationOptions}
        values={form.medicationRelatedCauses}
      />

      <CheckboxGroupReadOnly
        title="Ques 10: Substance-Related Causes (select all that apply)"
        options={substanceOptions}
        values={form.substanceRelatedCauses}
      />

      <Box sx={{ mt: 3 }}>
        <FormLabel sx={{ fontWeight: 600 }}>
          Ques 11: Current medication list
        </FormLabel>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={form.currentMedicationList}
          disabled
          placeholder="Type your current medications"
          sx={{ mt: 1 }}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <FormLabel sx={{ fontWeight: 600 }}>Ques 12: Vital sign</FormLabel>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Systolic"
            value={form.vitals.systolic}
            disabled
          />
          <TextField
            fullWidth
            label="Diastolic"
            value={form.vitals.diastolic}
            disabled
          />
          <TextField
            fullWidth
            label="Heart rate"
            value={form.vitals.heartRate}
            disabled
          />

          <FormControl>
            <FormLabel sx={{ fontWeight: 600 }}>Weight</FormLabel>
            <RadioGroup row value={form.vitals.weightUnit}>
              <FormControlLabel
                value="kg"
                control={<Radio disabled />}
                label="kg"
              />
              <FormControlLabel
                value="lb"
                control={<Radio disabled />}
                label="lb"
              />
            </RadioGroup>
            <TextField
              fullWidth
              label="Weight"
              value={form.vitals.weight}
              disabled
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={{ fontWeight: 600 }}>Height</FormLabel>
            <RadioGroup row value={form.vitals.heightUnit}>
              <FormControlLabel
                value="cm"
                control={<Radio disabled />}
                label="cm"
              />
              <FormControlLabel
                value="ft"
                control={<Radio disabled />}
                label="ft"
              />
              <FormControlLabel
                value="in"
                control={<Radio disabled />}
                label="in"
              />
            </RadioGroup>
            <TextField
              fullWidth
              label="Height"
              value={form.vitals.height}
              disabled
            />
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <FormLabel sx={{ fontWeight: 600 }}>Ques 13: Social habits</FormLabel>

        <YesNoRadioGroupReadOnly
          label="Exercise"
          value={form.socialHabits.exercise}
        />

        <YesNoRadioGroupReadOnly
          label="Walking: more than 30 minutes or 3000 steps"
          value={form.socialHabits.walking}
        />

        <YesNoRadioGroupReadOnly
          label="Sleep: More than 6 hours"
          value={form.socialHabits.sleepMoreThan6Hours}
        />

        <FormControl sx={{ mt: 3 }}>
          <FormLabel sx={{ fontWeight: 600 }}>Alcohol</FormLabel>
          <RadioGroup row value={form.socialHabits.alcohol}>
            <FormControlLabel
              value="everyday"
              control={<Radio disabled />}
              label="Every day"
            />
            <FormControlLabel
              value="weekends"
              control={<Radio disabled />}
              label="Weekends"
            />
            <FormControlLabel
              value="occasional"
              control={<Radio disabled />}
              label="Occasional"
            />
          </RadioGroup>
        </FormControl>

        <YesNoRadioGroupReadOnly
          label="Drug abuse: Present"
          value={form.socialHabits.drugAbusePresent}
        />

        <YesNoRadioGroupReadOnly
          label="Drug abuse: Past"
          value={form.socialHabits.drugAbusePast}
        />

        <YesNoRadioGroupReadOnly
          label="Tobacco"
          value={form.socialHabits.tobacco}
        />

        <CheckboxGroupReadOnly
          title="Family History (select all that apply)"
          options={familyHistoryOptions}
          values={form.socialHabits.familyHistoryMembers}
        />

        <YesNoRadioGroupReadOnly
          label="Dementia"
          value={form.socialHabits.dementia}
        />

        <YesNoRadioGroupReadOnly
          label="Stroke"
          value={form.socialHabits.stroke}
        />

        <YesNoRadioGroupReadOnly
          label="Lupus"
          value={form.socialHabits.lupus}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <FormLabel sx={{ fontWeight: 600 }}>
          Type questions or your concern below
        </FormLabel>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={form.concerns}
          disabled
          sx={{ mt: 1 }}
          placeholder="Type your questions or concerns"
        />
      </Box>
    </Paper>
  );
};

export default MedicalHistoryReadOnly;
