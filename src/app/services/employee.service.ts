import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/api/employees`;

  constructor(private http: HttpClient) {}

  getEmployees(sortField?: string, sortOrder: 'asc' | 'desc' = 'asc'): Observable<Employee[]> {
    let params = new HttpParams();
    
    if (sortField) {
      // JSON Server verwendet _sort und _order für Sortierung
      params = params
        .set('_sort', sortField)
        .set('_order', sortOrder);
    }
    
    return this.http.get<Employee[]>(this.apiUrl, { params });
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${employee.id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
