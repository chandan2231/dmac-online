import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Divider,
  TextField,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { RootState } from '../../../store';
import PatientService from '../patient.service';
import { QUERY_KEYS_FOR_PATIENT } from '../patient.interface';
import CustomLoader from '../../../components/loader';
import GenericModal from '../../../components/modal';
import { useToast } from '../../../providers/toast-provider';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface IProfileData {
  name: string;
  mobile: string;
  country: string;
  state: string;
  zip_code: string;
  language: string;
  time_zone: string;
  email?: string;
  role?: string;
}

const Profile = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: [QUERY_KEYS_FOR_PATIENT.GET_PROFILE, user?.id],
    queryFn: () => PatientService.getProfile(user),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (data: IProfileData) =>
      PatientService.updateProfile(user, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS_FOR_PATIENT.GET_PROFILE, user?.id],
      });
      showToast('Profile updated successfully', 'success');
      setIsEditModalOpen(false);
    },
    onError: () => {
      showToast('Failed to update profile', 'error');
    },
  });

  const formik = useFormik({
    initialValues: {
      name: profile?.name || '',
      mobile: profile?.mobile || '',
      country: profile?.country || '',
      state: profile?.state || '',
      zip_code: profile?.zip_code || '',
      language: profile?.language || '',
      time_zone: profile?.time_zone || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
    }),
    onSubmit: values => {
      updateMutation.mutate(values as IProfileData);
    },
  });

  if (isLoading) {
    return <CustomLoader />;
  }

  return (
    <Box maxWidth="lg" width="100%" height="100%" sx={{ mt: 0.5 }}>
      <Paper sx={{ overflow: 'hidden', height: '100%' }}>
        <Box
          sx={{
            height: 150,
            bgcolor: 'primary.main',
            position: 'relative',
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              border: '4px solid white',
              position: 'absolute',
              bottom: -60,
              left: 30,
              bgcolor: 'secondary.main',
              fontSize: 48,
            }}
          >
            {profile?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
        <Box pt={8} pb={3} px={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {profile?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profile?.role || 'Patient'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" flexWrap="wrap" gap={3} height="100%">
            <Box flex={1} minWidth={300}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <EmailIcon color="action" />
                  <Typography>{profile?.email}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <PhoneIcon color="action" />
                  <Typography>{profile?.mobile}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <LanguageIcon color="action" />
                  <Typography>{profile?.language}</Typography>
                </Box>
              </Stack>
            </Box>
            <Box flex={1} minWidth={300}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <LocationOnIcon color="action" />
                  <Typography>
                    {profile?.state}, {profile?.country} {profile?.zip_code}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <AccessTimeIcon color="action" />
                  <Typography>{profile?.time_zone}</Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Paper>

      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        maxWidth="sm"
        onSubmit={formik.handleSubmit}
        submitButtonText={
          updateMutation.isPending ? 'Updating...' : 'Save Changes'
        }
        cancelButtonText="Cancel"
        submitDisabled={updateMutation.isPending}
      >
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && (formik.errors.name as string)}
          />
        </Box>
      </GenericModal>
    </Box>
  );
};

export default Profile;
