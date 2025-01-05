export interface Patient {
  id: string;
  name?: string;
  surname?: string;
  firstName?: string;
  lastName?: string;
  note?: string;
}

// Hilfsfunktion zum Normalisieren der Namen
export function normalizePatient(patient: Patient): Patient {
  return {
    ...patient,
    firstName: patient.firstName || patient.name,
    lastName: patient.lastName || patient.surname
  };
}
