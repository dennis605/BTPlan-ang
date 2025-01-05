import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Employee } from '../models/employee';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly collection = 'employees';

  constructor(private electronService: ElectronService) {}

  getEmployees(): Observable<Employee[]> {
    return this.electronService.getAll<Employee>(this.collection);
  }

  getEmployee(id: string): Observable<Employee | null> {
    return this.electronService.getAll<Employee>(this.collection)
      .pipe(
        map(employees => employees.find(emp => emp.id === id) || null)
      );
  }

  addEmployee(employee: Employee): Observable<Employee> {
    // Generiere eine neue ID für neue Mitarbeiter
    const employeeToAdd: Employee = {
      ...employee,
      id: employee.id || crypto.randomUUID()
    };
    return this.electronService.add<Employee>(this.collection, employeeToAdd);
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    const id = employee.id;
    return this.electronService.update<Employee>(this.collection, id, employee);
  }

  deleteEmployee(id: string): Observable<string> {
    return this.electronService.delete(this.collection, id);
  }
}
