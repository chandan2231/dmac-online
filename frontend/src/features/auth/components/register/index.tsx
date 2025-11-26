import * as Yup from 'yup';
import { get } from 'lodash';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
import { convertLanguagesListToOptions } from '../../../../utils/functions.ts';
import { ROUTES } from '../../../../router/router.ts';
import { getUserEnvironmentInfo } from '../../../../utils/functions.ts';
import MorenCard from '../../../../components/card/index.tsx';
import ModernInput from '../../../../components/input/index.tsx';
import MorenButton from '../../../../components/button/index.tsx';
import AuthService from '../../auth.service.ts';
import CustomLoader from '../../../../components/loader/index.tsx';

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

const Register = () => {
  const { data: listingResponse } = useLanguageList();
  const navigate = useNavigate();
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
      provinceTitle: stateTitle,
      province_id: stateValue,
      timeZone,
      otherInfo: {
        ...userEnvironmentInfo,
      },
    };

    const { isSuccess, message } = await AuthService.registerUser(payload);

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
    <MorenCard
      title="Register"
      description="Enter your details to create an account"
      maxWidth={580}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Box flex={1}>
            <ModernInput
              label="Name"
              placeholder="Enter your name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Box>

          <Box flex={1}>
            <ModernInput
              label="Mobile"
              placeholder="Enter your mobile number"
              {...register('mobile')}
              error={!!errors.mobile}
              helperText={errors.mobile?.message}
            />
          </Box>
        </Box>

        <ModernInput
          label="Email"
          placeholder="Enter your email"
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Box flex={1}>
            <ModernInput
              label="Password"
              placeholder="Enter your password"
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </Box>

          <Box flex={1}>
            <ModernInput
              label="Confirm Password"
              placeholder="Confirm your password"
              type="password"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </Box>
        </Box>

        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Box flex={1}>
            <ModernSelect
              value={selectedCountry}
              onChange={option => {
                setValue('country', option);
                setValue('state', { label: '', value: '' });
              }}
              placeholder="Select your country"
              options={COUNTRIES_LIST}
              error={!!errors.country}
              helperText={errors.country?.value?.message}
              searchable={true}
            />
          </Box>

          <Box flex={1}>
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
          </Box>
        </Box>

        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Box flex={1}>
            <ModernInput
              label="Area"
              placeholder="Enter your area"
              {...register('area')}
              error={!!errors.area}
              helperText={errors.area?.message}
            />
          </Box>

          <Box flex={1}>
            <ModernInput
              label="Zip Code"
              placeholder="Enter your zip code"
              {...register('zipCode')}
              error={!!errors.zipCode}
              helperText={errors.zipCode?.message}
            />
          </Box>
        </Box>

        <ModernSelect
          value={selectedLanguage}
          onChange={option => setValue('language', option)}
          placeholder="Choose your language"
          options={convertLanguagesListToOptions(
            get(listingResponse, ['data'], []) || []
          )}
          error={!!errors.language}
          helperText={errors.language?.value?.message}
        />

        <MorenButton type="submit" variant="contained" disabled={loading}>
          Register
        </MorenButton>
      </Box>

      <Box mt={2} textAlign="center" display="flex" flexDirection="row" gap={1}>
        <MorenButton
          variant="text"
          onClick={() => handleNavigation(ROUTES.LOGIN)}
        >
          Do you have an account? Login
        </MorenButton>
      </Box>
    </MorenCard>
  );
};

export default Register;
