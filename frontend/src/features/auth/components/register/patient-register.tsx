import * as Yup from 'yup';
import { get } from 'lodash';
import { Box, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../../../providers/toast-provider/index.tsx';
import { useForm } from 'react-hook-form';
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
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
  area: string;
  zipCode: string;
  language: IOption;
  country: IOption;
  state: IOption;
};

const optionShape = Yup.object({
  label: Yup.string().required(),
  value: Yup.string().required('This field is required'),
});

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
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
  area: Yup.string().required('Area is required'),
  zipCode: Yup.string()
    .matches(/^\d{5,6}$/, 'Zip Code must be 5 or 6 digits')
    .required('Zip Code is required'),
  language: optionShape,
  country: optionShape,
  state: optionShape,
});

const PatientRegister = () => {
  const { data: listingResponse } = useLanguageList({
    USER_TYPE: 'USER',
  });
  const navigate = useNavigate();
  const { state } = useLocation();
  const { showToast } = useToast();
  const { loading } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      language: { label: '', value: '' },
      country: { label: '', value: '' },
      state: { label: '', value: '' },
    },
  });

  const selectedLanguage = watch('language');
  const selectedCountry = watch('country');
  const selectedState = watch('state');

  const handleNavigation = (path: string) => {
    navigate(path);
  };

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

    showToast(message, 'success');
    handleNavigation(ROUTES.HOME);
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <Grid container spacing={4} sx={{ p: 4 }}>
      {/* LEFT SECTION — PRODUCT SUMMARY */}
      <Grid item xs={12} md={4}>
        <MorenCard
          title="Product Summary"
          description="Review your selected product"
          minHeight={'100%'}
        >
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5" fontWeight="bold">
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
            </div>
          </Box>
        </MorenCard>
      </Grid>

      {/* RIGHT SECTION — FORM */}
      <Grid item xs={12} md={8}>
        <MorenCard
          title="Register"
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
                  label="Area"
                  placeholder="Enter your area"
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
  );
};

export default PatientRegister;
