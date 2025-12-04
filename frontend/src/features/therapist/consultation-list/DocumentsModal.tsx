import GenericModal from '../../../components/modal';
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Link,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import { useGetPatientDocuments } from '../hooks/useGetPatientDocuments';
import dayjs from 'dayjs';
import { get } from 'lodash';

interface IDocument {
  id: number;
  file_name: string;
  file_url: string;
  created_at: string;
}

interface DocumentsModalProps {
  open: boolean;
  onClose: () => void;
  patientId: number | null;
  patientName: string;
}

const DocumentsModal = ({
  open,
  onClose,
  patientId,
  patientName,
}: DocumentsModalProps) => {
  const { data: documentsResponse, isLoading } =
    useGetPatientDocuments(patientId);
  const documents = get(documentsResponse, 'data', []) as IDocument[];

  return (
    <GenericModal
      isOpen={open}
      onClose={onClose}
      title={`Documents - ${patientName}`}
      maxWidth="md"
      hideSubmitButton
      cancelButtonText="Close"
      onCancel={onClose}
    >
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : documents.length > 0 ? (
        <List>
          {documents.map(doc => (
            <ListItem
              key={doc.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="download"
                  component={Link}
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText
                primary={doc.file_name}
                secondary={dayjs(doc.created_at).format('MMM D, YYYY HH:mm')}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="textSecondary" align="center" p={2}>
          No documents found for this patient.
        </Typography>
      )}
    </GenericModal>
  );
};

export default DocumentsModal;
