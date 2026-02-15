import React from 'react';
import CustomLoader from '../../../components/loader';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useSnackbar } from 'notistack';
import {
  useGetUserDocuments,
  useUploadDocument,
  useDeleteDocument,
} from '../hooks/useDocuments';
import { TabHeaderLayout } from '../../../components/tab-header';
import AssessmentForm from './AssessmentForm';
import {
  useGetAssessmentStatus,
  ASSESSMENT_QUERY_KEYS,
} from '../hooks/useAssessment';
import { useQueryClient } from '@tanstack/react-query';

interface Document {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

const UploadDocuments = () => {
  const { data: documents = [], isLoading: loading } = useGetUserDocuments();
  const { data: assessmentStatus, isLoading: assessmentLoading } =
    useGetAssessmentStatus();
  const queryClient = useQueryClient();

  const { mutateAsync: uploadDocument, isPending: uploading } =
    useUploadDocument();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  const { enqueueSnackbar } = useSnackbar();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('File size exceeds 5MB', { variant: 'warning' });
      return;
    }

    // 🔥 Updated: max document limit from 5 → 10
    if (documents.length >= 10) {
      enqueueSnackbar('Maximum 10 documents allowed', { variant: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadDocument(formData);
      enqueueSnackbar('Document uploaded successfully', { variant: 'success' });
    } catch (error: unknown) {
      console.error('Error uploading document', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Error uploading document';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      event.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(id);
      enqueueSnackbar('Document deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting document', error);
      enqueueSnackbar('Error deleting document', { variant: 'error' });
    }
  };

  if (loading || assessmentLoading) return <CustomLoader />;

  const isAssessmentComplete =
    assessmentStatus &&
    assessmentStatus.cat &&
    assessmentStatus.sat &&
    assessmentStatus.dat &&
    assessmentStatus.adt &&
    assessmentStatus.consent;

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <TabHeaderLayout
        leftNode={
          <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
              }}
            >
              Patient Assessment & Documents
            </Typography>
          </Box>
        }
        rightNode={null}
      />

      <AssessmentForm
        onComplete={() => {
          queryClient.invalidateQueries({
            queryKey: [ASSESSMENT_QUERY_KEYS.GET_ASSESSMENT_STATUS],
          });
        }}
        showLastTab={isAssessmentComplete}
        tab={
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              My Documents
            </Typography>
            <Box sx={{ mb: 4 }}>
              {/* 🔥 Updated: UI text for new limit */}
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Upload up to 10 documents (PDF, Image, Doc). Max 5MB each.
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Documents Uploaded: {documents.length} / 10
              </Typography>

              {/* 🔥 Updated: show upload button until 10 */}
              {documents.length < 10 && (
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading}
                >
                  {uploading ? (
                    <span key="upload-documents-uploading">Uploading...</span>
                  ) : (
                    <span key="upload-documents-upload">Upload Document</span>
                  )}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {documents.map((doc: Document) => (
                <Box
                  key={doc.id}
                  sx={{
                    width: {
                      xs: '100%',
                      sm: 'calc(50% - 12px)',
                      md: 'calc(33.33% - 16px)',
                    },
                  }}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="h6" noWrap title={doc.file_name}>
                        {doc.file_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        {new Date(doc.created_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        href={doc.file_url}
                        target="_blank"
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(doc.id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              ))}

              {documents.length === 0 && (
                <Box sx={{ width: '100%' }}>
                  <Alert severity="info">No documents uploaded yet.</Alert>
                </Box>
              )}
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default UploadDocuments;
