import * as Yup from 'yup';
import { useMemo, useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import CustomLoader from '../../../../components/loader';
import { TabHeaderLayout } from '../../../../components/tab-header';
import MorenButton from '../../../../components/button';
import GenericModal from '../../../../components/modal';
import ModernInput from '../../../../components/input';
import ModernSelect, { type IOption } from '../../../../components/select';
import ModernSwitch from '../../../../components/switch';
import { GenericTable } from '../../../../components/table';
import { COUNTRIES_LIST } from '../../../../utils/constants';
import { useToast } from '../../../../providers/toast-provider';

import type {
  IChangePartnerPasswordPayload,
  ICreatePartnerPayload,
  IPartner,
  IUpdatePartnerPayload,
} from '../../partners.interface';
import PartnerService from '../../partners.service';
import { QUERY_KEYS_FOR_PARTNERS, useGetPartnersList } from '../../hooks/useGetPartnersList';

const changePasswordSchema = Yup.object({
  password: Yup.string().required('Password is required').min(6, 'Min 6 characters'),
});
type ChangePasswordFormValues = Yup.InferType<typeof changePasswordSchema>;

const editPartnerSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  mobile: Yup.string().required('Phone is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  address: Yup.string().required('Address is required'),
  zipcode: Yup.string().required('Zipcode is required'),
  allowed_users: Yup.number()
    .typeError('Allowed users must be a number')
    .integer('Must be an integer')
    .min(0, 'Must be 0 or more')
    .required('Allowed users is required'),
});
type EditPartnerFormValues = Yup.InferType<typeof editPartnerSchema>;

const createPartnerSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  mobile: Yup.string().required('Phone is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  address: Yup.string().required('Address is required'),
  zipcode: Yup.string().required('Zipcode is required'),
  allowed_users: Yup.number()
    .typeError('Allowed users must be a number')
    .integer('Must be an integer')
    .min(0, 'Must be 0 or more')
    .required('Allowed users is required'),
});

type CreatePartnerFormValues = Yup.InferType<typeof createPartnerSchema>;

const PartnersListing = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: partnersResponse, isLoading } = useGetPartnersList();

  const partners = useMemo<IPartner[]>(() => {
    if (!partnersResponse?.success) return [];
    return partnersResponse.data || [];
  }, [partnersResponse]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<IPartner | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = useState<number | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<IOption | null>(null);
  const [selectedState, setSelectedState] = useState<IOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePartnerFormValues>({
    resolver: yupResolver(createPartnerSchema),
    defaultValues: {
      name: '',
      mobile: '',
      email: '',
      country: '',
      state: '',
      address: '',
      zipcode: '',
      allowed_users: 0,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(changePasswordSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setEditValue,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditPartnerFormValues>({
    resolver: yupResolver(editPartnerSchema),
    defaultValues: {
      name: '',
      mobile: '',
      email: '',
      country: '',
      state: '',
      address: '',
      zipcode: '',
      allowed_users: 0,
    },
  });

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    partner: IPartner
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(partner.id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  const openViewDetails = (partner: IPartner) => {
    setSelectedPartner(partner);
    setIsViewModalOpen(true);
  };

  const openChangePassword = (partner: IPartner) => {
    setSelectedPartner(partner);
    setIsPasswordModalOpen(true);
  };

  const closeChangePassword = () => {
    setIsPasswordModalOpen(false);
    setSelectedPartner(null);
    resetPassword();
  };

  const openEditPartner = (partner: IPartner) => {
    setSelectedPartner(partner);

    resetEdit({
      name: partner.name ?? '',
      email: partner.email ?? '',
      mobile: String(partner.phone ?? ''),
      address: String(partner.address ?? ''),
      country: String(partner.country ?? ''),
      state: String(partner.province_id ?? ''),
      zipcode: String(partner.zipcode ?? ''),
      allowed_users: Number(partner.allowed_users ?? 0),
    });

    const countryOpt = COUNTRIES_LIST.find(c => c.label === partner.country);
    setSelectedCountry(countryOpt || null);

    const stateOpt = COUNTRIES_LIST.find(c => c.label === partner.country)?.states.find(
      s => s.value === partner.province_id
    );
    setSelectedState(stateOpt || null);

    setIsEditModalOpen(true);
  };

  const closeEditPartner = () => {
    setIsEditModalOpen(false);
    setSelectedPartner(null);
    resetEdit();
    setSelectedCountry(null);
    setSelectedState(null);
  };

  const columns: GridColDef<IPartner>[] = [
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
      {
        field: 'phone',
        headerName: 'Phone',
        flex: 1,
        minWidth: 140,
        valueGetter: (_value, row) => String(row?.phone ?? ''),
      },
      {
        field: 'address',
        headerName: 'Address',
        flex: 1,
        minWidth: 220,
        valueGetter: (_value, row) => String(row?.address ?? ''),
      },
      {
        field: 'allowed_users',
        headerName: 'Allowed Users',
        flex: 0.6,
        minWidth: 120,
      },
      {
        field: 'active_users',
        headerName: 'Active Users',
        flex: 0.6,
        minWidth: 120,
      },
      {
        field: 'remaining_users',
        headerName: 'Remaining Users',
        flex: 0.7,
        minWidth: 140,
      },
      {
        field: 'created_date',
        headerName: 'Added Date',
        flex: 0.7,
        minWidth: 140,
        valueGetter: (_value, row) => String(row?.created_date ?? ''),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.9,
        minWidth: 180,
        sortable: false,
        renderCell: (params: GridRenderCellParams<IPartner>) => {
          const isActive = Number(params.row?.status) === 1;
          return (
            <Box display="flex" alignItems="center" height="100%">
              <ModernSwitch
                checked={isActive}
                onChange={async () => {
                  try {
                    const nextStatus = isActive ? 0 : 1;
                    const result = await PartnerService.changePartnerStatus(
                      Number(params.row.id),
                      nextStatus
                    );
                    if (result.success) {
                      showToast('Partner status updated.', 'success');
                      queryClient.invalidateQueries({
                        queryKey: [QUERY_KEYS_FOR_PARTNERS.GET_PARTNERS_LIST],
                      });
                    } else {
                      showToast(result.message, 'error');
                    }
                  } catch {
                    showToast('Failed to update status.', 'error');
                  }
                }}
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
        renderCell: (params: GridRenderCellParams<IPartner>) => {
          const open = Boolean(anchorEl) && menuRowId === params.row.id;

          return (
            <>
              <IconButton
                aria-label="actions"
                size="small"
                onClick={e => handleOpenMenu(e, params.row)}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    openViewDetails(params.row);
                  }}
                >
                  View Details
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    openEditPartner(params.row);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    openChangePassword(params.row);
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

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    reset();
    setSelectedCountry(null);
    setSelectedState(null);
  };

  const onSubmitChangePassword: SubmitHandler<ChangePasswordFormValues> = async values => {
    if (!selectedPartner) return;
    setIsSubmitting(true);

    const payload: IChangePartnerPasswordPayload = {
      id: selectedPartner.id,
      password: values.password,
    };

    const result = await PartnerService.changePartnerPassword(payload);
    if (result.success) {
      showToast('Password updated successfully', 'success');
      closeChangePassword();
    } else {
      showToast(result.message, 'error');
    }

    setIsSubmitting(false);
  };

  const onSubmitEditPartner: SubmitHandler<EditPartnerFormValues> = async values => {
    if (!selectedPartner) return;
    setIsSubmitting(true);

    const timeZone =
      COUNTRIES_LIST.find(country => country.value === selectedCountry?.value)
        ?.states.find(state => state.value === values.state)?.timeZone || '';

    const payload: IUpdatePartnerPayload = {
      id: selectedPartner.id,
      ...values,
      time_zone: timeZone,
      provinceValue: selectedState?.value || '',
      provinceTitle: selectedState?.label || '',
    };

    const result = await PartnerService.updatePartner(payload);
    if (result.success) {
      showToast('Partner updated successfully', 'success');
      closeEditPartner();
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS_FOR_PARTNERS.GET_PARTNERS_LIST],
      });
    } else {
      showToast(result.message, 'error');
    }

    setIsSubmitting(false);
  };

  const onSubmitCreatePartner: SubmitHandler<CreatePartnerFormValues> = async (
    values
  ) => {
    setIsSubmitting(true);

    const timeZone =
      COUNTRIES_LIST.find(country => country.value === selectedCountry?.value)
        ?.states.find(state => state.value === values.state)?.timeZone || '';

    const payload: ICreatePartnerPayload = {
      ...values,
      time_zone: timeZone,
      provinceValue: selectedState?.value || '',
      provinceTitle: selectedState?.label || '',
    };

    const result = await PartnerService.createPartner(payload);
    if (result.success) {
      showToast('Partner created successfully. Email sent.', 'success');
      handleCloseCreateModal();
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS_FOR_PARTNERS.GET_PARTNERS_LIST],
      });
    } else {
      showToast(result.message, 'error');
    }

    setIsSubmitting(false);
  };

  if (isLoading || isSubmitting) return <CustomLoader />;

  return (
    <Box display="flex" flexDirection="column" width="100%" height="100%" p={2}>
      <TabHeaderLayout
        leftNode={
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Partners list
          </Typography>
        }
        rightNode={
          <MorenButton
            variant="text"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={handleOpenCreateModal}
          >
            Add Partner's
          </MorenButton>
        }
      />

      <Box sx={{ mt: 2 }}>
        <GenericTable rows={partners} columns={columns} rowIdKey="id" />
      </Box>

      <GenericModal
        isOpen={createModalOpen}
        onClose={handleCloseCreateModal}
        title="Add Partner"
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitCreatePartner)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <ModernInput
              label="Name"
              placeholder="Enter name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <ModernInput
              label="Email"
              placeholder="Enter email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <ModernInput
              label="Phone"
              placeholder="Enter phone"
              {...register('mobile')}
              error={!!errors.mobile}
              helperText={errors.mobile?.message}
            />
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
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
                  COUNTRIES_LIST.find(c => c.value === selectedCountry?.value)
                    ?.states || []
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

          <ModernInput
            label="Address"
            placeholder="Enter address"
            {...register('address')}
            error={!!errors.address}
            helperText={errors.address?.message}
          />

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <ModernInput
              label="Zipcode"
              placeholder="Enter zipcode"
              {...register('zipcode')}
              error={!!errors.zipcode}
              helperText={errors.zipcode?.message}
            />
            <ModernInput
              label="Allowed Users"
              placeholder="Enter allowed users"
              inputMode="numeric"
              {...register('allowed_users')}
              error={!!errors.allowed_users}
              helperText={errors.allowed_users?.message}
            />
          </Box>

          <MorenButton type="submit" variant="contained">
            Create Partner
          </MorenButton>
        </Box>
      </GenericModal>

      {/* View Details */}
      <GenericModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPartner(null);
        }}
        title={`Partner Details${selectedPartner ? ` - ${selectedPartner.name}` : ''}`}
        hideSubmitButton
        cancelButtonText="Close"
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedPartner(null);
        }}
      >
        {selectedPartner && (
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
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Name:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.name}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Email:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.email}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Phone:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.phone ?? ''}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Country:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.country ?? ''}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  State:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.province_title ?? ''}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Time Zone:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.time_zone ?? ''}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Address:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.address ?? ''}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Allowed Users:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.allowed_users ?? 0}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Active Users:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.active_users ?? 0}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Remaining Users:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.remaining_users ?? 0}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Status:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {Number(selectedPartner.status) === 1 ? 'Active' : 'Inactive'}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Added Date:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.created_date ?? ''}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </GenericModal>

      {/* Change Password */}
      <GenericModal
        isOpen={isPasswordModalOpen}
        onClose={closeChangePassword}
        title={`Change Password${selectedPartner ? ` - ${selectedPartner.name}` : ''}`}
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

          <MorenButton type="submit" variant="contained" sx={{ alignSelf: 'flex-end', mt: 2 }}>
            Update Password
          </MorenButton>
        </Box>
      </GenericModal>

      {/* Edit Partner */}
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={closeEditPartner}
        title={`Edit Partner${selectedPartner ? ` - ${selectedPartner.name}` : ''}`}
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmitEdit(onSubmitEditPartner)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <ModernInput
              label="Name"
              {...registerEdit('name')}
              error={!!editErrors.name}
              helperText={editErrors.name?.message}
            />
            <ModernInput
              label="Phone"
              {...registerEdit('mobile')}
              error={!!editErrors.mobile}
              helperText={editErrors.mobile?.message}
            />
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <ModernInput
              label="Email"
              {...registerEdit('email')}
              error={!!editErrors.email}
              helperText={editErrors.email?.message}
            />
            <ModernInput
              label="Zipcode"
              {...registerEdit('zipcode')}
              error={!!editErrors.zipcode}
              helperText={editErrors.zipcode?.message}
            />
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="Country"
                options={COUNTRIES_LIST}
                value={selectedCountry}
                onChange={opt => {
                  setSelectedCountry(opt);
                  setSelectedState(null);
                  setEditValue('country', opt.label, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {editErrors.country && (
                <Typography color="error">{editErrors.country.message}</Typography>
              )}
            </Box>

            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="State"
                options={
                  COUNTRIES_LIST.find(c => c.value === selectedCountry?.value)
                    ?.states || []
                }
                value={selectedState}
                onChange={opt => {
                  setSelectedState(opt);
                  setEditValue('state', opt.value, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {editErrors.state && (
                <Typography color="error">{editErrors.state.message}</Typography>
              )}
            </Box>
          </Box>

          <ModernInput
            label="Address"
            {...registerEdit('address')}
            error={!!editErrors.address}
            helperText={editErrors.address?.message}
          />

          <ModernInput
            label="Allowed Users"
            inputMode="numeric"
            {...registerEdit('allowed_users')}
            error={!!editErrors.allowed_users}
            helperText={editErrors.allowed_users?.message}
          />

          <MorenButton type="submit" variant="contained">
            Update Partner
          </MorenButton>
        </Box>
      </GenericModal>
    </Box>
  );
};

export default PartnersListing;
