import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { ProfileResponse, TrainingRequest, TrainingResponse } from '../models/employee-profile.models';

const profile: ProfileResponse = {
  id: 'employee-demo-482',
  firstName: 'Sofía',
  lastName: 'Álvarez',
  documentType: 'DNI',
  documentNumber: '35.482.916',
  birthDate: '1991-03-14',
  email: 'sofia.alvarez@example.com',
  phone: '+54 11 4555-0182',
  address: 'Av. Cabildo 1840, CABA',
  companyName: 'Techforb',
  employeeNumber: '00482',
  position: 'Analista funcional',
  department: 'Consultoría tecnológica',
  hireDate: '2023-04-03',
  employmentStatus: 'Activo',
  workArrangement: 'Híbrida',
  clientName: 'Banco Horizonte',
  projectName: 'Plataforma de atención digital',
  contract: {
    name: 'Contrato laboral - Sofía Álvarez.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 428000,
    uploadedAt: '2023-04-03',
  },
};

let trainings: TrainingResponse[] = [
  { id: 'training-1', type: 'DEGREE', name: 'Licenciatura en Sistemas', institution: 'Universidad de Buenos Aires', obtainedAt: '2020-12-15', documentName: 'Titulo_Sistemas.pdf' },
  { id: 'training-2', type: 'CERTIFICATION', name: 'AWS Certified Cloud Practitioner', institution: 'Amazon Web Services', obtainedAt: '2024-03-12', documentName: 'Certificado_AWS.pdf' },
  { id: 'training-3', type: 'COURSE', name: 'Análisis de datos con Python', institution: 'Universidad Tecnológica Nacional', obtainedAt: '2023-11-20', documentName: 'Curso_Python.pdf' },
  { id: 'training-4', type: 'CERTIFICATION', name: 'Professional Scrum Master I', institution: 'Scrum.org', obtainedAt: '2022-08-18', documentName: 'Certificado_PSMI.pdf' },
  { id: 'training-5', type: 'COURSE', name: 'Diseño de APIs REST', institution: 'Universidad Tecnológica Nacional', obtainedAt: '2022-05-09', documentName: 'Curso_APIs.pdf' },
];

const documents = new Map<string, { mimeType: string; contentBase64: string }>();

function samplePdf(): Blob {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 300] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length 58 >>\nstream\nBT /F1 16 Tf 40 220 Td (Documento de ejemplo del portal) Tj ET\nendstream',
  ];
  let content = '%PDF-1.4\n';
  const offsets: number[] = [0];
  objects.forEach((body, index) => {
    offsets.push(content.length);
    content += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = content.length;
  content += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { content += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  content += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([content], { type: 'application/pdf' });
}

export function getMyProfileMock(): Observable<ProfileResponse> {
  return mockResponse(profile);
}

export function getMyContractMock(): Observable<Blob> {
  return profile.contract ? mockResponse(samplePdf()) : mockError(404, 'No hay un contrato disponible en tu legajo.');
}

export function listMyTrainingsMock(): Observable<TrainingResponse[]> {
  return mockResponse([...trainings]);
}

export function createMyTrainingMock(request: TrainingRequest): Observable<TrainingResponse> {
  if (!request.name.trim() || !request.institution.trim() || !request.obtainedAt || !request.document.contentBase64) {
    return mockError(422, 'Completa los campos obligatorios.');
  }
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(request.document.mimeType)) {
    return mockError(422, 'Adjunta un archivo PDF, JPG o PNG.', { document: ['Adjunta un archivo PDF, JPG o PNG.'] });
  }
  const training: TrainingResponse = {
    id: `training-${Date.now()}`,
    type: request.type,
    name: request.name.trim(),
    institution: request.institution.trim(),
    obtainedAt: request.obtainedAt,
    documentName: request.document.name,
  };
  documents.set(training.id, { mimeType: request.document.mimeType, contentBase64: request.document.contentBase64 });
  trainings = [training, ...trainings];
  return mockResponse(training);
}

export function getMyTrainingDocumentMock(id: string): Observable<Blob> {
  const training = trainings.find((item) => item.id === id);
  if (!training || !training.documentName) return mockError(404, 'El documento no está disponible.');
  const document = documents.get(id);
  if (!document) return mockResponse(samplePdf());
  const bytes = Uint8Array.from(atob(document.contentBase64), (character) => character.charCodeAt(0));
  return mockResponse(new Blob([bytes], { type: document.mimeType }));
}
