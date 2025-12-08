import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Paper,
  Modal,
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
  useGetAssessmentStatus,
  useSubmitAssessmentTab,
} from '../hooks/useAssessment';
import CustomLoader from '../../../components/loader';

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

const genericFields = [
  { name: 'q1', label: 'Question 1 (Input)', type: 'text', required: true },
  {
    name: 'q2',
    label: 'Question 2 (Checkbox)',
    type: 'checkbox',
    required: false,
  },
  {
    name: 'q3',
    label: 'Question 3 (Radio)',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    name: 'q4',
    label: 'Question 4 (Textarea)',
    type: 'textarea',
    required: true,
  },
];

interface FormData {
  [key: string]: string | boolean;
}

const AssessmentForm = ({ onComplete }: { onComplete: () => void }) => {
  const [value, setValue] = useState(0);
  const { data: status, isLoading } = useGetAssessmentStatus();
  const { mutateAsync: submitTab, isPending: submitting } =
    useSubmitAssessmentTab();
  const { enqueueSnackbar } = useSnackbar();

  // Form states for each tab
  const [adlData, setAdlData] = useState<FormData>({});
  const [fallRiskData, setFallRiskData] = useState<FormData>({});
  const [depressionData, setDepressionData] = useState<FormData>({});
  const [sleepData, setSleepData] = useState<FormData>({});
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status) {
      // Check if all tabs are completed
      if (
        status.adl &&
        status.fall_risk &&
        status.depression &&
        status.sleep &&
        status.consent
      ) {
        onComplete();
      }
    }
  }, [status, onComplete]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleInputChange = (
    tab: string,
    field: string,
    value: string | boolean
  ) => {
    const setters: Record<
      string,
      React.Dispatch<React.SetStateAction<FormData>>
    > = {
      adl: setAdlData,
      fall_risk: setFallRiskData,
      depression: setDepressionData,
      sleep: setSleepData,
    };
    const currentData = {
      adl: adlData,
      fall_risk: fallRiskData,
      depression: depressionData,
      sleep: sleepData,
    }[tab as keyof typeof setters];

    if (setters[tab]) {
      setters[tab]({ ...currentData, [field]: value });
    }

    // Clear error
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateTab = (_tab: string, data: FormData) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    genericFields.forEach(field => {
      if (field.required && !data[field.name]) {
        newErrors[field.name] = 'This field is required';
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      // Scroll to first error
      const firstError = Object.keys(newErrors)[0];
      const element = document.getElementById(firstError);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      enqueueSnackbar('Please fill all mandatory fields', { variant: 'error' });
    }

    return isValid;
  };

  const handleSubmit = async (tab: string) => {
    let data: FormData | { accepted: boolean } = {};
    if (tab === 'adl') data = adlData;
    else if (tab === 'fall_risk') data = fallRiskData;
    else if (tab === 'depression') data = depressionData;
    else if (tab === 'sleep') data = sleepData;
    else if (tab === 'consent') data = { accepted: consentAccepted };

    if (tab !== 'consent' && !validateTab(tab, data as FormData)) return;

    try {
      await submitTab({ tab, data });
      enqueueSnackbar(
        `${tab.replace('_', ' ').toUpperCase()} submitted successfully`,
        { variant: 'success' }
      );

      // Move to next tab if not last
      if (value < 4) setValue(value + 1);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error submitting form', { variant: 'error' });
    }
  };

  const renderGenericForm = (tabName: string, data: FormData) => (
    <Box>
      {genericFields.map(field => (
        <Box key={field.name} sx={{ mb: 3 }} id={field.name}>
          <FormLabel required={field.required}>{field.label}</FormLabel>
          {field.type === 'text' && (
            <TextField
              fullWidth
              value={data[field.name] || ''}
              onChange={e =>
                handleInputChange(tabName, field.name, e.target.value)
              }
              error={!!errors[field.name]}
              helperText={errors[field.name]}
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
          {field.type === 'textarea' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={data[field.name] || ''}
              onChange={e =>
                handleInputChange(tabName, field.name, e.target.value)
              }
              error={!!errors[field.name]}
              helperText={errors[field.name]}
              variant="outlined"
              sx={{ mt: 1 }}
            />
          )}
          {field.type === 'checkbox' && (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!data[field.name]}
                    onChange={e =>
                      handleInputChange(tabName, field.name, e.target.checked)
                    }
                  />
                }
                label="Check this box"
              />
              {errors[field.name] && (
                <Typography color="error" variant="caption">
                  {errors[field.name]}
                </Typography>
              )}
            </Box>
          )}
          {field.type === 'radio' && (
            <FormControl
              component="fieldset"
              fullWidth
              error={!!errors[field.name]}
              sx={{ mt: 1 }}
            >
              <RadioGroup
                row
                value={data[field.name] || ''}
                onChange={e =>
                  handleInputChange(tabName, field.name, e.target.value)
                }
              >
                {field.options?.map(opt => (
                  <FormControlLabel
                    key={opt}
                    value={opt}
                    control={<Radio />}
                    label={opt}
                  />
                ))}
              </RadioGroup>
              {errors[field.name] && (
                <Typography color="error" variant="caption">
                  {errors[field.name]}
                </Typography>
              )}
            </FormControl>
          )}
        </Box>
      ))}
      <Button
        variant="contained"
        color="primary"
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
        aria-label="assessment tabs"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="ADL" />
        <Tab label="Fall Risk" />
        <Tab label="Depression" />
        <Tab label="Sleep" />
        <Tab label="Consent" />
      </Tabs>
      <TabPanel value={value} index={0}>
        {renderGenericForm('adl', adlData)}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {renderGenericForm('fall_risk', fallRiskData)}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {renderGenericForm('depression', depressionData)}
      </TabPanel>
      <TabPanel value={value} index={3}>
        {renderGenericForm('sleep', sleepData)}
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Consent Form
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={consentAccepted}
                onChange={e => {
                  setConsentAccepted(e.target.checked);
                  if (e.target.checked) setOpenModal(true);
                }}
              />
            }
            label="I have read and agree to the disclaimer"
          />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmit('consent')}
              disabled={!consentAccepted || submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </Box>
        </Box>
      </TabPanel>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="disclaimer-modal-title"
        aria-describedby="disclaimer-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="disclaimer-modal-title" variant="h6" component="h2">
            Disclaimer
          </Typography>
          <Typography id="disclaimer-modal-description" sx={{ mt: 2 }}>
            This is a generic disclaimer. Please read carefully before
            proceeding. By checking the box, you agree to the terms and
            conditions.
          </Typography>
          <Button
            onClick={() => setOpenModal(false)}
            sx={{ mt: 2 }}
            variant="contained"
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Paper>
  );
};

export default AssessmentForm;
