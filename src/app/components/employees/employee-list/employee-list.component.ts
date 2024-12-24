import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Employee } from '../../../models/employee';
import { EmployeeService } from '../../../services/employee.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { EmployeeDialogComponent } from '../employee-dialog/employee-dialog.component';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  displayedColumns: string[] = ['name', 'surname', 'note', 'actions'];

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe(employees => {
      this.employees = employees;
    });
  }

  deleteEmployee(id: number): void {
    if (confirm('Möchten Sie diesen Mitarbeiter wirklich löschen?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Fehler beim Löschen des Mitarbeiters:', error);
          alert('Fehler beim Löschen des Mitarbeiters');
        }
      });
    }
  }

  editEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      data: { employee: employee }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.employeeService.updateEmployee(result).subscribe({
          next: () => {
            this.loadEmployees();
          },
          error: (error) => {
            console.error('Fehler beim Aktualisieren des Mitarbeiters:', error);
            alert('Fehler beim Aktualisieren des Mitarbeiters');
          }
        });
      }
    });
  }

  addEmployee(): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      data: { employee: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.employeeService.addEmployee(result).subscribe({
          next: () => {
            this.loadEmployees();
          },
          error: (error) => {
            console.error('Fehler beim Hinzufügen des Mitarbeiters:', error);
            alert('Fehler beim Hinzufügen des Mitarbeiters');
          }
        });
      }
    });
  }
}
