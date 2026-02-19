import * as Yup from 'yup';
import { get } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../../../providers/toast-provider/index.tsx';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/index.ts';
import ModernSelect, {
  type IOption,
} from '../../../../components/select/index.tsx';
import { COUNTRIES_LIST } from '../../../../utils/constants.ts';
import { useLanguageList } from '../../../../i18n/hooks/useGetLanguages.ts';
import {
  convertLanguagesListToOptions,
  getUserEnvironmentInfo,
} from '../../../../utils/functions.ts';
import { ROUTES } from '../../../../router/router.ts';
import MorenCard from '../../../../components/card/index.tsx';
import ModernInput from '../../../../components/input/index.tsx';
import MorenButton from '../../../../components/button/index.tsx';
import AuthService from '../../auth.service.ts';
import CustomLoader from '../../../../components/loader/index.tsx';
import Grid from '@mui/material/GridLegacy';

type FormValues = {
  name: string;
  age: number;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
  area: string;
  zipCode: string;
  language: IOption;
  country: IOption;
  state: IOption;
  weight: number;
  weightUnit: string;
  height: number;
  heightUnit: string;
};

const optionShape = Yup.object({
  label: Yup.string().required(),
  value: Yup.string().required('This field is required'),
});

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  age: Yup.number()
    .typeError('Age must be a number')
    .integer('Age must be a whole number')
    .min(10, 'Age must be between 10 and 110')
    .max(110, 'Age must be between 10 and 110')
    .required('Age is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  mobile: Yup.string()
    .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  area: Yup.string().required('Address is required'),
  zipCode: Yup.string()
    .matches(/^\d{5,6}$/, 'Zip Code must be 5 or 6 digits')
    .required('Zip Code is required'),
  language: optionShape,
  country: optionShape,
  state: optionShape,
  weight: Yup.number()
    .typeError('Weight must be a number')
    .required('Weight is required'),
  weightUnit: Yup.string().required('Weight unit is required'),
  height: Yup.number()
    .typeError('Height must be a number')
    .required('Height is required'),
  heightUnit: Yup.string().required('Height unit is required'),
});

const PatientRegister = () => {
  const { data: listingResponse } = useLanguageList({
    USER_TYPE: 'USER',
  });
  const navigate = useNavigate();
  const { state } = useLocation();
  const { showToast } = useToast();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');

  console.log('Selected Product:', state);

  const renderYesNoValue = (rawValue: unknown) => {
    const v = String(rawValue ?? '').trim().toLowerCase();
    if (v === 'yes' || v === 'true' || v === '1') {
      return <CheckCircleIcon aria-label="Yes" sx={{ color: '#2e7d32' }} />;
    }
    if (v === 'no' || v === 'false' || v === '0') {
      return <CancelIcon aria-label="No" sx={{ color: '#d32f2f' }} />;
    }
    return String(rawValue ?? '');
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      age: undefined as unknown as number,
      language: { label: '', value: '' },
      country: { label: '', value: '' },
      state: { label: '', value: '' },
      weightUnit: 'pound',
      heightUnit: 'inches',
    },
  });

  const selectedLanguage = watch('language');
  const selectedCountry = watch('country');
  const selectedState = watch('state');

  const closeSuccessModal = useCallback(() => {
    setSuccessModalOpen(false);
    navigate(ROUTES.HOME);
  }, [navigate]);

  useEffect(() => {
    if (!successModalOpen) return;
    const t = window.setTimeout(() => {
      closeSuccessModal();
    }, 10_000);
    return () => window.clearTimeout(t);
  }, [successModalOpen, closeSuccessModal]);

  const onSubmit = async (data: FormValues) => {
    const { language, country, state: stateDetails } = data;
    const { value: languageValue } = language;
    const { label: countryTitle, value: countryValue } = country;
    const { label: stateTitle, value: stateValue } = stateDetails;

    const timeZone = COUNTRIES_LIST.find(
      c => c.value === countryValue
    )?.states.find(s => s.value === stateValue)?.timeZone;

    const { userEnvironmentInfo } = await getUserEnvironmentInfo();

    const payload = {
      name: data.name,
      age: data.age,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
      state: data.area,
      zipcode: data.zipCode,
      country: countryTitle,
      language: languageValue,
      product_id: get(state, ['id'], null),
      provinceTitle: stateTitle,
      provinceValue: stateValue,
      weight: data.weight,
      weight_unit: data.weightUnit,
      height: data.height,
      height_unit: data.heightUnit,
      timeZone,
      otherInfo: {
        ...userEnvironmentInfo,
      },
    };

    const { isSuccess, message } =
      await AuthService.patientResgistration(payload);

    if (!isSuccess) {
      return showToast(message, 'error');
    }

    setSuccessModalMessage(message || 'Registration completed successfully.');
    setSuccessModalOpen(true);
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <Box>
      <Dialog
        open={successModalOpen}
        onClose={closeSuccessModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          Verify Your Email
          <IconButton aria-label="Close" onClick={closeSuccessModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
            <Typography
              sx={{
                whiteSpace: 'pre-line',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
            {successModalMessage}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This message will close automatically in 10 seconds.
          </Typography>
        </DialogContent>
        <DialogActions>
          <MorenButton variant="contained" onClick={closeSuccessModal}>
            Close
          </MorenButton>
        </DialogActions>
      </Dialog>

      {/* Heading */}
      <Box textAlign="center" mb={4} mt={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Registration
        </Typography>
      </Box>

      <Grid
        container
        spacing={4}
        sx={{
          mb: 4,
        }}
      >
        {/* LEFT SECTION — PRODUCT SUMMARY */}
        <Grid item xs={12} md={4}>
          <MorenCard
            title="Product Summary"
            description="Review your selected product"
            minHeight={'100%'}
          >
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6" fontWeight="bold">
                {state ? get(state, ['product_name'], '') : ''}
              </Typography>

              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {state ? get(state, ['product_description'], '') : ''}
              </Typography>

              <Box
                mt={2}
                p={2}
                sx={{
                  background: '#eef2ff',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Amount:
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  ${state ? get(state, ['product_amount'], '') : ''}
                </Typography>
              </Box>

              <div className="">
                {Array.isArray(get(state, ['feature'])) &&
                get(state, ['feature']).length ? (
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ bgcolor: 'transparent', boxShadow: 'none' }}
                  >
                    <Table size="small">
                      <TableBody>
                        {(
                          get(state, ['feature'], []) as Array<{
                            title: string;
                            value: string;
                          }>
                        ).map((feature, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ fontWeight: 700 }}>
                              {feature.title}
                            </TableCell>
                            <TableCell>{renderYesNoValue(feature.value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <ul className="">
                    {(get(state, ['subscription_list'], '') as string)
                      .split(',')
                      .map((feature, index) => (
                        <li
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '8px',
                          }}
                        >
                          <span
                            className=""
                            style={{
                              backgroundColor: '#1FCAC5',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                            }}
                          >
                            <svg
                              height="24"
                              width="24"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M0 0h24v24H0z" fill="none"></path>
                              <path
                                fill="currentColor"
                                d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                              ></path>
                            </svg>
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </Box>
          </MorenCard>
        </Grid>

        {/* RIGHT SECTION — FORM */}
        <Grid item xs={12} md={8}>
          <MorenCard
            title=""
            description="Enter your details to create an account"
            minHeight={'100%'}
          >
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              {/* Row: Name + Mobile */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <ModernInput
                    label="Name"
                    placeholder="Enter your name"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ModernInput
                    label="Mobile"
                    placeholder="Enter your mobile number"
                    {...register('mobile')}
                    error={!!errors.mobile}
                    helperText={errors.mobile?.message}
                  />
                </Grid>
              </Grid>

              {/* Row: Weight + Height */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset" error={!!errors.weightUnit}>
                    <FormLabel component="legend">Weight Unit</FormLabel>
                    <Controller
                      rules={{ required: true }}
                      control={control}
                      name="weightUnit"
                      render={({ field }) => (
                        <RadioGroup row {...field}>
                          <FormControlLabel
                            value="kg"
                            control={<Radio />}
                            label="Kg"
                          />
                          <FormControlLabel
                            value="pound"
                            control={<Radio />}
                            label="Pound"
                          />
                        </RadioGroup>
                      )}
                    />
                    {errors.weightUnit && (
                      <Typography variant="caption" color="error">
                        {errors.weightUnit.message}
                      </Typography>
                    )}
                  </FormControl>
                  <ModernInput
                    label="Weight"
                    placeholder="Enter your weight"
                    type="number"
                    {...register('weight')}
                    error={!!errors.weight}
                    helperText={errors.weight?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset" error={!!errors.heightUnit}>
                    <FormLabel component="legend">Height Unit</FormLabel>
                    <Controller
                      rules={{ required: true }}
                      control={control}
                      name="heightUnit"
                      render={({ field }) => (
                        <RadioGroup row {...field}>
                          <FormControlLabel
                            value="cm"
                            control={<Radio />}
                            label="Cm"
                          />
                          <FormControlLabel
                            value="inches"
                            control={<Radio />}
                            label="Inches"
                          />
                        </RadioGroup>
                      )}
                    />
                    {errors.heightUnit && (
                      <Typography variant="caption" color="error">
                        {errors.heightUnit.message}
                      </Typography>
                    )}
                  </FormControl>
                  <ModernInput
                    label="Height"
                    placeholder="Enter your height"
                    type="number"
                    {...register('height')}
                    error={!!errors.height}
                    helperText={errors.height?.message}
                  />
                </Grid>
              </Grid>

              <ModernInput
                label="Age"
                placeholder="Enter your age"
                type="number"
                inputProps={{ min: 10, max: 110, step: 1 }}
                {...register('age', { valueAsNumber: true })}
                error={!!errors.age}
                helperText={errors.age?.message}
              />

              <ModernInput
                label="Email"
                placeholder="Enter your email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              {/* Row: Password + Confirm */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <ModernInput
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ModernInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    type="password"
                    {...register('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <ModernSelect
                    value={selectedCountry}
                    onChange={option => setValue('country', option)}
                    placeholder="Select your country"
                    options={COUNTRIES_LIST}
                    error={!!errors.country}
                    helperText={errors.country?.value?.message}
                    searchable
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ModernSelect
                    value={selectedState}
                    onChange={option => setValue('state', option)}
                    placeholder="Select your state"
                    options={
                      COUNTRIES_LIST.find(
                        country => country.value === selectedCountry?.value
                      )?.states || []
                    }
                    error={!!errors.state}
                    helperText={errors.state?.value?.message}
                    searchable={true}
                  />
                </Grid>
              </Grid>

              {/* Row: Area + Zip Code */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <ModernInput
                    label="Address"
                    placeholder="Enter your address"
                    {...register('area')}
                    error={!!errors.area}
                    helperText={errors.area?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ModernInput
                    label="Zip Code"
                    placeholder="Enter your zip code"
                    {...register('zipCode')}
                    error={!!errors.zipCode}
                    helperText={errors.zipCode?.message}
                  />
                </Grid>
              </Grid>

              <ModernSelect
                value={selectedLanguage}
                onChange={option => setValue('language', option)}
                placeholder="Choose your language"
                options={convertLanguagesListToOptions(
                  get(listingResponse, ['data', 'languages'], []) || []
                )}
                error={!!errors.language}
                helperText={errors.language?.value?.message}
              />

              <MorenButton type="submit" variant="contained" disabled={loading}>
                Register
              </MorenButton>
            </Box>
          </MorenCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientRegister;
