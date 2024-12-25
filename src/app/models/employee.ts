export interface Employee {
  id?: number;
  name?: string;
  surname?: string;
  firstName?: string;
  lastName?: string;
  note?: string;
}

// Hilfsfunktion zum Normalisieren der Namen
export function normalizeEmployee(employee: Employee): Employee {
  return {
    ...employee,
    firstName: employee.firstName || employee.name,
    lastName: employee.lastName || employee.surname
  };
}
