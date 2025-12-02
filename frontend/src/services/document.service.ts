import HttpService from './HttpService';

const uploadDocument = (formData: FormData) => {
  return HttpService.getAxiosClient().post(
    '/patient/upload-document',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

const getUserDocuments = () => {
  return HttpService.getAxiosClient().get('/patient/documents');
};

const deleteDocument = (id: number) => {
  return HttpService.getAxiosClient().delete(`/patient/documents/${id}`);
};

const DocumentService = {
  uploadDocument,
  getUserDocuments,
  deleteDocument,
};

export default DocumentService;
