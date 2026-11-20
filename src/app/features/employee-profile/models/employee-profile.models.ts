export type TrainingType = 'COURSE' | 'CERTIFICATION' | 'DEGREE';
export type FileDisposition = 'inline' | 'attachment';
export type TrainingMimeType = 'application/pdf' | 'image/jpeg' | 'image/png';

export interface ContractMetadata {
  name: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedAt: string | null;
}

export interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string | null;
  documentNumber: string | null;
  birthDate: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  companyName: string;
  employeeNumber: string;
  position: string | null;
  department: string | null;
  hireDate: string | null;
  employmentStatus: string | null;
  workArrangement: string | null;
  clientName: string | null;
  projectName: string | null;
  contract: ContractMetadata | null;
}

export interface TrainingResponse {
  id: string;
  type: TrainingType;
  name: string;
  institution: string;
  obtainedAt: string;
  documentName: string | null;
}

export interface TrainingRequest {
  type: TrainingType;
  name: string;
  institution: string;
  obtainedAt: string;
  document: {
    name: string;
    mimeType: TrainingMimeType;
    contentBase64: string;
  };
}

export const TRAINING_TYPES: readonly { value: TrainingType; label: string }[] = [
  { value: 'COURSE', label: 'Curso' },
  { value: 'CERTIFICATION', label: 'Certificación' },
  { value: 'DEGREE', label: 'Título' },
];

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  COURSE: 'Curso',
  CERTIFICATION: 'Certificación',
  DEGREE: 'Título',
};
