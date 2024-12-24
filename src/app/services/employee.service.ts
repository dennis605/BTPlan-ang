import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Employee } from '../models/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [];
  private employeesSubject = new BehaviorSubject<Employee[]>([]);

  constructor() {
    // Initial dummy data
    this.addEmployee({
      id: 1,
      name: 'Max',
      surname: 'Mustermann',
      note: 'Therapeut'
    });
  }

  getEmployees(): Observable<Employee[]> {
    return this.employeesSubject.asObservable();
  }

  getEmployee(id: number): Observable<Employee | undefined> {
    return of(this.employees.find(emp => emp.id === id));
  }

  addEmployee(employee: Employee): void {
    // Generate ID if not provided
    if (!employee.id) {
      employee.id = this.employees.length + 1;
    }
    this.employees.push(employee);
    this.employeesSubject.next([...this.employees]);
  }

  updateEmployee(employee: Employee): void {
    const index = this.employees.findIndex(emp => emp.id === employee.id);
    if (index !== -1) {
      this.employees[index] = employee;
      this.employeesSubject.next([...this.employees]);
    }
  }

  deleteEmployee(id: number): void {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      this.employees.splice(index, 1);
      this.employeesSubject.next([...this.employees]);
    }
  }
}
