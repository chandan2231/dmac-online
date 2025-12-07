import * as Yup from 'yup';
import dayjs from 'dayjs';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CustomLoader from '../../../../components/loader';
import AdminService from '../../admin.service';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import GenericModal from '../../../../components/modal';
import MorenButton from '../../../../components/button';
import ModernInput from '../../../../components/input';
import ModernSwitch from '../../../../components/switch';
import type { GridColDef } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { Box, Typography, Rating } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { TabHeaderLayout } from '../../../../components/tab-header';
import { GenericTable } from '../../../../components/table';
import ModernSelect, { type IOption } from '../../../../components/select';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { COUNTRIES_LIST } from '../../../../utils/constants';
import { useGetConsultantsListing } from '../../hooks/useGetConsultantsListing';
import type {
  ConsultantState,
  IConsultant,
  ICreateConsultantPayload,
} from '../../admin.interface';
import { get } from 'lodash';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useToast } from '../../../../providers/toast-provider';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useLanguageList } from '../../../../i18n/hooks/useGetLanguages';
import ModernMultiSelect from '../../../../components/multi-select';
import type { ILanguage } from '../../../../i18n/language.interface';
import { useQuery } from '@tanstack/react-query';
import MorenCard from '../../../../components/card';

const FINANCE_MANAGER_LIST = [
  {
    id: 1,
    name: 'John Doe',
  },
  {
    id: 2,
    name: 'Jane Smith',
  },
];

const FINANCE_MANAGER_OPTIONS = FINANCE_MANAGER_LIST.map(fm => ({
  label: fm.name,
  value: String(fm.id),
}));

/* -------------------- SCHEMAS -------------------- */
const changePasswordSchema = Yup.object({
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Min 6 characters'),
});
type ChangePasswordFormValues = Yup.InferType<typeof changePasswordSchema>;

const editConsultantSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  mobile: Yup.string().required('Mobile is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  country: Yup.string().required('Country is required'),
  address: Yup.string().required('Address is required'),
  speciality: Yup.string().required('Speciality is required'),
  license_number: Yup.string().required('License number is required'),
  license_expiration: Yup.string().required('License expiration is required'),
  contracted_rate_per_consult: Yup.string().required('Rate is required'),
  state: Yup.string().required('State is required'),
  finance_manager_id: Yup.string().required('Finance Manager is required'),
  languages: Yup.array()
    .min(1, 'Select at least one language')
    .required('Languages are required'),
  time_zone: Yup.string().required('Time zone is required'),
});
type EditConsultantFormValues = Yup.InferType<typeof editConsultantSchema>;

const createConsultantSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  mobile: Yup.string().required('Mobile is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Min 6 characters')
    .required('Password is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  address: Yup.string().required('Address is required'),
  speciality: Yup.string().required('Speciality is required'),
  license_number: Yup.string().required('License number is required'),
  license_expiration: Yup.string().required('License expiration is required'),
  contracted_rate_per_consult: Yup.string().required('Rate is required'),
  languages: Yup.array()
    .min(1, 'Select at least one language')
    .required('Languages are required'),
  finance_manager_id: Yup.string().required('Finance Manager is required'),
});
type CreateConsultantFormValues = Yup.InferType<typeof createConsultantSchema>;

/* -------------------- REVIEWS COMPONENT -------------------- */
interface IReview {
  id: number;
  patient_name: string;
  rating: number;
  review: string;
  created_at: string;
}

interface ConsultantReviewsProps {
  consultant: IConsultant;
  onBack: () => void;
}

const ConsultantReviews = ({ consultant, onBack }: ConsultantReviewsProps) => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['adminExpertReviews', consultant.id],
    queryFn: async () => {
      const result = await AdminService.getExpertReviews(consultant.id);
      if (result.success) {
        return result.data as IReview[];
      }
      return [];
    },
    enabled: !!consultant.id,
  });

  const [filteredReviews, setFilteredReviews] = useState<IReview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (reviews) {
      if (searchQuery) {
        const filtered = reviews.filter((review: IReview) =>
          review.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredReviews(filtered);
      } else {
        setFilteredReviews(reviews);
      }
    }
  }, [searchQuery, reviews]);

  const handleCardClick = (review: IReview) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  if (isLoading) {
    return <CustomLoader />;
  }

  return (
    <Box sx={{ p: 3, width: '100%', height: '100%' }}>
      <TabHeaderLayout
        leftNode={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
              }}
            >
              Reviews - {consultant.name}
            </Typography>
          </Box>
        }
        rightNode={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <ModernInput
              label="Filter by Patient Name"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              sx={{
                minWidth: 250,
              }}
            />
            <MorenButton variant="contained" onClick={onBack}>
              Back
            </MorenButton>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {filteredReviews.map(review => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={review.id}>
            <Box
              onClick={() => handleCardClick(review)}
              sx={{ cursor: 'pointer', height: '100%' }}
            >
              <MorenCard title={review.patient_name} minHeight={200}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={review.rating} readOnly />
                  <Typography
                    variant="body2"
                    sx={{ ml: 1, color: 'text.secondary' }}
                  >
                    {new Date(review.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{}}>
                  {review.review.length > 100
                    ? `${review.review.substring(0, 100)}...`
                    : review.review}
                </Typography>
              </MorenCard>
            </Box>
          </Grid>
        ))}
        {filteredReviews.length === 0 && (
          <Grid item xs={12}>
            <Typography>No reviews found.</Typography>
          </Grid>
        )}
      </Grid>

      <GenericModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Review by ${selectedReview?.patient_name}`}
        hideSubmitButton
        cancelButtonText="Close"
        onCancel={handleCloseModal}
      >
        {selectedReview && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={selectedReview.rating} readOnly />
              <Typography
                variant="body2"
                sx={{ ml: 1, color: 'text.secondary' }}
              >
                {new Date(selectedReview.created_at).toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedReview.review}
            </Typography>
          </Box>
        )}
      </GenericModal>
    </Box>
  );
};

/* -------------------- USER TABLE -------------------- */
function ConsultantTable({
  onViewReviews,
}: {
  onViewReviews: (consultant: IConsultant) => void;
}) {
  const { data, isLoading, refetch } = useGetConsultantsListing();
  const { data: listingResponse } = useLanguageList({
    USER_TYPE: 'EXPERT',
  });
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] =
    useState<IConsultant | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<IOption | null>(null);
  const [selectedState, setSelectedState] = useState<IOption | null>(null);
  const [selectedFinanceManager, setSelectedFinanceManager] =
    useState<IOption | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = useState<number | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const { showToast } = useToast();

  /* Password Form */
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(changePasswordSchema),
  });

  /* Edit Consultant Form */
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditConsultantFormValues>({
    resolver: yupResolver(editConsultantSchema),
  });

  /* Handlers */
  const handleOpenPasswordModal = (user: IConsultant) => {
    setSelectedConsultant(user);
    setIsPasswordModalOpen(true);
  };
  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedConsultant(null);
    resetPassword();
  };

  const handleOpenEditModal = (consultant: ConsultantState) => {
    setSelectedConsultant(consultant);

    const selectedLangIds = consultant.language
      ? consultant.language.split(',').map(l => l.trim())
      : [];

    reset({
      name: consultant.name,
      email: consultant.email,
      mobile: consultant.mobile,
      address: consultant.address,
      speciality: consultant.speciality,
      license_number: consultant.license_number,
      license_expiration: consultant.license_expiration,
      contracted_rate_per_consult: consultant.contracted_rate_per_consult,
      country: consultant.country,
      state: consultant.province_id,
      finance_manager_id: String(get(consultant, 'finance_manager_id', '')),
      languages: selectedLangIds,
      time_zone: consultant.time_zone,
    });

    const countryOpt = COUNTRIES_LIST.find(c => c.label === consultant.country);
    setSelectedCountry(countryOpt || null);

    const stateOpt = COUNTRIES_LIST.find(
      c => c.label === consultant.country
    )?.states.find(s => s.value === consultant.province_id);

    setSelectedState(stateOpt || null);

    const fmOpt = FINANCE_MANAGER_OPTIONS.find(
      fm => fm.value === String(get(consultant, 'finance_manager_id', ''))
    );
    setSelectedFinanceManager(fmOpt || null);

    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedConsultant(null);
    reset();
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedFinanceManager(null);
  };

  const handleUpdateStatus = async (id: number, status: number) => {
    setIsLoadingStatus(true);
    const result = await AdminService.updateConsultantStatus(id, status);
    if (result.success) {
      await refetch();
    } else {
      console.error('Status update failed:', result.message);
    }
    setIsLoadingStatus(false);
  };

  const onSubmitChangePassword: SubmitHandler<
    ChangePasswordFormValues
  > = async values => {
    if (!selectedConsultant) return;
    setIsLoadingStatus(true);

    const result = await AdminService.updateConsultantPassword({
      id: selectedConsultant.id,
      password: values.password,
    });

    if (result.success) {
      setIsPasswordModalOpen(false);
      setSelectedConsultant(null);
      resetPassword();
      showToast('Password updated successfully', 'success');
    } else {
      showToast(result.message, 'error');
    }
    setIsLoadingStatus(false);
  };

  const onSubmitEditConsultant: SubmitHandler<
    EditConsultantFormValues
  > = async values => {
    if (!selectedConsultant) return;
    setIsLoadingStatus(true);

    const timeZone =
      COUNTRIES_LIST.find(
        country => country.value === selectedCountry?.value
      )?.states.find(state => state.value === values.state)?.timeZone || '';

    const languages = values.languages.join(',');

    const payload = {
      ...values,
      languages,
      time_zone: timeZone,
      provinceValue: selectedState?.value || '',
      provinceTitle: selectedState?.label || '',
    };

    // exclude `state` before sending to API
    const { state: _state, ...sanitizedPayload } = payload;
    console.log('sanitizedPayload', _state, sanitizedPayload);

    const result = await AdminService.updateConsultant({
      id: selectedConsultant.id,
      ...sanitizedPayload,
    });

    if (result.success) {
      showToast('Consultant updated successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedConsultant(null);
      reset();
      await refetch();
    } else {
      showToast(result.message, 'error');
    }
    setIsLoadingStatus(false);
  };

  const handleOpenViewModal = (consultant: ConsultantState) => {
    setSelectedConsultant(consultant);
    setIsViewMode(true);
  };

  const columns: GridColDef<IConsultant>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'mobile', headerName: 'Mobile', width: 140 },
    { field: 'created_date', headerName: 'Created Date', width: 140 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: params => {
        const isActive = params.row.status === 1;
        return (
          <Box display="flex" alignItems="center" height="100%">
            <ModernSwitch
              checked={isActive}
              onChange={() =>
                handleUpdateStatus(params.row.id, isActive ? 0 : 1)
              }
              trackColor={isActive ? '#4caf50' : '#ccc'}
            />
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: params => {
        const open = Boolean(anchorEl) && menuRowId === params.row.id;

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorEl(event.currentTarget);
          setMenuRowId(params.row.id);
        };

        const handleClose = () => {
          setAnchorEl(null);
          setMenuRowId(null);
        };

        return (
          <>
            <IconButton aria-label="actions" onClick={handleClick} size="small">
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleOpenViewModal(params.row as ConsultantState);
                }}
              >
                View Details
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  onViewReviews(params.row);
                }}
              >
                View Ratings
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleOpenEditModal(params.row as ConsultantState);
                }}
              >
                Edit
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleOpenPasswordModal(params.row);
                }}
              >
                Change Password
              </MenuItem>
            </Menu>
          </>
        );
      },
    },
  ];

  if (isLoading || isLoadingStatus) return <CustomLoader />;

  return (
    <>
      <GenericTable
        rows={get(data, 'data', []) as IConsultant[]}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
      />

      {/* Password Modal */}
      <GenericModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        title={`Change Password${selectedConsultant ? ` - ${selectedConsultant.name}` : ''}`}
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmitPassword(onSubmitChangePassword)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModernInput
            label="New Password"
            placeholder="Enter new password"
            type="password"
            {...registerPassword('password')}
            error={!!passwordErrors.password}
            helperText={passwordErrors.password?.message}
          />

          <MorenButton
            type="submit"
            variant="contained"
            sx={{ alignSelf: 'flex-end', mt: 2 }}
          >
            Update Password
          </MorenButton>
        </Box>
      </GenericModal>

      {/* Edit Modal */}
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title={`Edit Consultant${selectedConsultant ? ` - ${selectedConsultant.name}` : ''}`}
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitEditConsultant)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Box display="flex" flexDirection="row" gap={2}>
            <ModernInput
              label="Name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <ModernInput
              label="Mobile"
              {...register('mobile')}
              error={!!errors.mobile}
              helperText={errors.mobile?.message}
            />
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="Country"
                options={COUNTRIES_LIST}
                value={selectedCountry}
                onChange={opt => {
                  setSelectedCountry(opt);
                  setSelectedState(null);
                  setValue('country', opt.label, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {errors.country && (
                <Typography color="error">{errors.country.message}</Typography>
              )}
            </Box>

            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="State"
                options={
                  COUNTRIES_LIST.find(
                    country => country.value === selectedCountry?.value
                  )?.states || []
                }
                value={selectedState}
                onChange={opt => {
                  setSelectedState(opt);
                  setValue('state', opt.value, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {errors.state && (
                <Typography color="error">{errors.state.message}</Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <ModernInput
              label="Address"
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
            <ModernInput
              label="Speciality"
              {...register('speciality')}
              error={!!errors.speciality}
              helperText={errors.speciality?.message}
            />
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <ModernInput
              label="License Number"
              {...register('license_number')}
              error={!!errors.license_number}
              helperText={errors.license_number?.message}
              sx={{ flex: '1' }}
            />

            <Box sx={{ flex: '1' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  control={control}
                  name="license_expiration"
                  render={({ field }) => (
                    <DatePicker
                      label="License Expiration"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={date =>
                        setValue(
                          'license_expiration',
                          date ? date.format('YYYY-MM-DD') : '',
                          { shouldValidate: true }
                        )
                      }
                      slotProps={{
                        textField: {
                          error: !!errors.license_expiration,
                          helperText: errors.license_expiration?.message,
                        },
                      }}
                      sx={{ width: '100%' }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <Box display="flex" flexDirection="column" flex={1}>
              <Controller
                control={control}
                name="languages"
                render={({ field: { value, onChange } }) => {
                  const options =
                    get(listingResponse, 'data.languages', []).map(
                      (lang: ILanguage) => ({
                        label: lang.language,
                        value: String(lang.id),
                      })
                    ) || [];
                  return (
                    <ModernMultiSelect
                      label="Languages"
                      options={options}
                      value={value || []}
                      onChange={(selectedValues: string[]) => {
                        onChange(selectedValues);
                      }}
                      placeholder="Select languages"
                      fullWidth
                      searchable
                      error={!!errors.languages}
                      helperText={errors.languages?.message as string}
                    />
                  );
                }}
              />
            </Box>

            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="Finance Manager"
                options={FINANCE_MANAGER_OPTIONS}
                value={selectedFinanceManager}
                onChange={opt => {
                  setSelectedFinanceManager(opt);
                  setValue('finance_manager_id', opt.value, {
                    shouldValidate: true,
                  });
                }}
                fullWidth
                searchable
              />
              {errors.finance_manager_id && (
                <Typography color="error">
                  {errors.finance_manager_id.message}
                </Typography>
              )}
            </Box>
          </Box>

          <ModernInput
            label="Rate per Consult"
            {...register('contracted_rate_per_consult')}
            error={!!errors.contracted_rate_per_consult}
            helperText={errors.contracted_rate_per_consult?.message}
          />

          <MorenButton
            type="submit"
            variant="contained"
            sx={{ alignSelf: 'flex-end', mt: 2 }}
          >
            Update Consultant
          </MorenButton>
        </Box>
      </GenericModal>

      {/* View Modal */}
      <GenericModal
        isOpen={isViewMode}
        onClose={() => {
          setIsViewMode(false);
          setSelectedConsultant(null);
        }}
        title={`Consultant Details${
          selectedConsultant ? ` - ${get(selectedConsultant, 'name', '')}` : ''
        }`}
        hideCancelButton
      >
        {selectedConsultant && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box
              display="flex"
              flexDirection="row"
              p={2}
              border="1px solid #e0e0e0"
              borderRadius="8px"
              bgcolor="#fafafa"
              width="100%"
              flexWrap="wrap"
              rowGap={1}
            >
              {/* Name */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Name:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'name', '')}
                </Typography>
              </Box>

              {/* Email */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Email:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'email', '')}
                </Typography>
              </Box>

              {/* Mobile */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Mobile:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'mobile', '')}
                </Typography>
              </Box>

              {/* Country */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Country:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'country', '')}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  State:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'province_title', '')}
                </Typography>
              </Box>

              {/* Time Zone */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Time Zone:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'time_zone', '')}
                </Typography>
              </Box>

              {/* Address */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Address:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'address', '')}
                </Typography>
              </Box>

              {/* Speciality */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Speciality:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'speciality', '')}
                </Typography>
              </Box>

              {/* License Number */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  License Number:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'license_number', '')}
                </Typography>
              </Box>

              {/* License Expiration */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  License Expiration:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'license_expiration', '')}
                </Typography>
              </Box>

              {/* Rate per Consult */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Rate per Consult:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'contracted_rate_per_consult', '')}
                </Typography>
              </Box>

              {/* Status */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Status:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'status', 0) === 1
                    ? 'Active'
                    : 'Inactive'}
                </Typography>
              </Box>

              {/* Created Date */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Created Date:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'created_date', '')}
                </Typography>
              </Box>

              {/* Languages */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Languages:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'language_name', '')}
                </Typography>
              </Box>

              {/* Finance Manager */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Finance Manager:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedConsultant, 'finance_manager', '')}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </GenericModal>
    </>
  );
}

/* -------------------- CONSULTANTS LISTING -------------------- */
const ConsultantsListing = () => {
  const [createConsultantModalOpen, setCreateConsultantModalOpen] =
    useState(false);
  const [selectedConsultantForReviews, setSelectedConsultantForReviews] =
    useState<IConsultant | null>(null);
  const { data: listingResponse } = useLanguageList({
    USER_TYPE: 'EXPERT',
  });
  const [selectedCountry, setSelectedCountry] = useState<IOption | null>(null);
  const [selectedState, setSelectedState] = useState<IOption | null>(null);
  const [selectedFinanceManager, setSelectedFinanceManager] =
    useState<IOption | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createConsultantSchema),
    defaultValues: { state: '', languages: [] },
  });

  const handleOpenCreateConsultantModal = () =>
    setCreateConsultantModalOpen(true);
  const handleCloseCreateConsultantModal = () => {
    setCreateConsultantModalOpen(false);
    reset();
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedFinanceManager(null);
  };

  const onSubmitCreateConsultant: SubmitHandler<
    CreateConsultantFormValues
  > = async values => {
    setIsLoadingStatus(true);

    const timeZone =
      COUNTRIES_LIST.find(
        country => country.value === selectedCountry?.value
      )?.states.find(state => state.value === values.state)?.timeZone || '';

    const languages = values.languages.join(',');

    const payload = {
      ...values,
      languages,
      time_zone: timeZone,
      provinceValue: selectedState?.value || '',
      provinceTitle: selectedState?.label || '',
    };

    // exclude `state` before sending to API
    const { state: _state, ...sanitizedPayload } = payload;
    console.log('sanitizedPayload', _state, sanitizedPayload);

    const result = await AdminService.createConsultant({
      ...(sanitizedPayload as Omit<ICreateConsultantPayload, 'role'>),
    });

    if (result.success) {
      setCreateConsultantModalOpen(false);
      setSelectedCountry(null);
      setSelectedState(null);
      reset();
    } else {
      showToast(result.message, 'error');
    }
    setIsLoadingStatus(false);
  };

  if (isLoadingStatus) return <CustomLoader />;

  if (selectedConsultantForReviews) {
    return (
      <ConsultantReviews
        consultant={selectedConsultantForReviews}
        onBack={() => setSelectedConsultantForReviews(null)}
      />
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      height="100%"
      p={2}
      gap={1}
    >
      <TabHeaderLayout
        leftNode={
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
            }}
          >
            Experts List
          </Typography>
        }
        rightNode={
          <MorenButton
            variant="text"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={handleOpenCreateConsultantModal}
          >
            Add New Expert
          </MorenButton>
        }
      />

      <ConsultantTable onViewReviews={setSelectedConsultantForReviews} />

      {/* Create Consultant Modal */}
      <GenericModal
        isOpen={createConsultantModalOpen}
        onClose={handleCloseCreateConsultantModal}
        title="Create New Consultant"
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitCreateConsultant)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Box display="flex" flexDirection="row" gap={2}>
            <ModernInput
              label="Name"
              placeholder="Enter name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <ModernInput
              label="Mobile"
              placeholder="Enter mobile"
              {...register('mobile')}
              error={!!errors.mobile}
              helperText={errors.mobile?.message}
            />
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <ModernInput
              label="Email"
              placeholder="Enter email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <ModernInput
              label="Password"
              type="password"
              placeholder="Enter password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="Country"
                options={COUNTRIES_LIST}
                value={selectedCountry}
                onChange={opt => {
                  setSelectedCountry(opt);
                  setSelectedState(null);
                  setValue('country', opt.label, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {errors.country && (
                <Typography color="error">{errors.country.message}</Typography>
              )}
            </Box>

            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="State"
                options={
                  COUNTRIES_LIST.find(
                    country => country.value === selectedCountry?.value
                  )?.states || []
                }
                value={selectedState}
                onChange={opt => {
                  setSelectedState(opt);
                  setValue('state', opt.value, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {errors.state && (
                <Typography color="error">{errors.state.message}</Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <ModernInput
              label="Address"
              placeholder="Enter address"
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
            <ModernInput
              label="Speciality"
              placeholder="Enter speciality"
              {...register('speciality')}
              error={!!errors.speciality}
              helperText={errors.speciality?.message}
            />
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <ModernInput
              label="License Number"
              placeholder="Enter license number"
              {...register('license_number')}
              error={!!errors.license_number}
              helperText={errors.license_number?.message}
              sx={{ flex: '1' }}
            />

            <Box sx={{ flex: '1' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  control={control}
                  name="license_expiration"
                  render={({ field }) => (
                    <DatePicker
                      label="License Expiration"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={date =>
                        setValue(
                          'license_expiration',
                          date ? date.format('YYYY-MM-DD') : '',
                          { shouldValidate: true }
                        )
                      }
                      slotProps={{
                        textField: {
                          error: !!errors.license_expiration,
                          helperText: errors.license_expiration?.message,
                        },
                      }}
                      sx={{ width: '100%' }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <Box display="flex" flexDirection="column" flex={1}>
              <Controller
                control={control}
                name="languages"
                render={({ field: { value, onChange } }) => {
                  const options =
                    get(listingResponse, 'data.languages', []).map(
                      (lang: ILanguage) => ({
                        label: lang.language,
                        value: String(lang.id),
                      })
                    ) || [];
                  return (
                    <ModernMultiSelect
                      label="Languages"
                      options={options}
                      value={value || []}
                      onChange={(selectedValues: string[]) => {
                        onChange(selectedValues);
                      }}
                      placeholder="Select languages"
                      fullWidth
                      searchable
                      error={!!errors.languages}
                      helperText={errors.languages?.message as string}
                    />
                  );
                }}
              />
            </Box>

            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="Finance Manager"
                options={FINANCE_MANAGER_OPTIONS}
                value={selectedFinanceManager}
                onChange={opt => {
                  setSelectedFinanceManager(opt);
                  setValue('finance_manager_id', opt.value, {
                    shouldValidate: true,
                  });
                }}
                fullWidth
                searchable
              />
              {errors.finance_manager_id && (
                <Typography color="error">
                  {errors.finance_manager_id.message}
                </Typography>
              )}
            </Box>
          </Box>

          <ModernInput
            label="Rate per Consult"
            placeholder="Enter rate"
            {...register('contracted_rate_per_consult')}
            error={!!errors.contracted_rate_per_consult}
            helperText={errors.contracted_rate_per_consult?.message}
          />

          <MorenButton
            type="submit"
            variant="contained"
            sx={{ alignSelf: 'flex-end', mt: 2 }}
          >
            Create Consultant
          </MorenButton>
        </Box>
      </GenericModal>
    </Box>
  );
};

export default ConsultantsListing;
