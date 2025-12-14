import { useQuery } from '@tanstack/react-query';
import AdminService from '../admin.service';

export const PATIENT_ASSESSMENT_QUERY_KEYS = {
  GET_PATIENT_ASSESSMENT_STATUS: 'GET_PATIENT_ASSESSMENT_STATUS',
  GET_PATIENT_DOCUMENTS: 'GET_PATIENT_DOCUMENTS',
  GET_PATIENT_MEDICAL_HISTORY: 'GET_PATIENT_MEDICAL_HISTORY',
};

export const useGetPatientAssessmentStatus = (patientId: number | null) => {
  return useQuery({
    queryKey: [
      PATIENT_ASSESSMENT_QUERY_KEYS.GET_PATIENT_ASSESSMENT_STATUS,
      patientId,
    ],
    queryFn: () =>
      patientId ? AdminService.getPatientAssessmentStatus(patientId) : null,
    enabled: !!patientId,
  });
};

export const useGetPatientDocuments = (patientId: number | null) => {
  return useQuery({
    queryKey: [PATIENT_ASSESSMENT_QUERY_KEYS.GET_PATIENT_DOCUMENTS, patientId],
    queryFn: () =>
      patientId ? AdminService.getPatientDocuments(patientId) : null,
    enabled: !!patientId,
    select: response => response?.data || [],
  });
};

export const useGetPatientMedicalHistory = (patientId: number | null) => {
  return useQuery({
    queryKey: [
      PATIENT_ASSESSMENT_QUERY_KEYS.GET_PATIENT_MEDICAL_HISTORY,
      patientId,
    ],
    queryFn: () =>
      patientId ? AdminService.getPatientMedicalHistory(patientId) : null,
    enabled: !!patientId,
    select: response => response?.data || null,
  });
};
