import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Employee } from '../../../models/employee';
import { EmployeeService } from '../../../services/employee.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort, MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { EmployeeDialogComponent } from '../employee-dialog/employee-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styles: [`
    .container {
      padding: 20px;
    }
    .action-buttons {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }
    table {
      width: 100%;
    }
    .mat-column-select {
      width: 48px;
      padding-right: 8px;
    }
    .mat-column-actions {
      width: 100px;
      text-align: center;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatDialogModule,
    MatCheckboxModule,
    MatTooltipModule
  ]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  displayedColumns: string[] = ['select', 'name', 'surname', 'note', 'actions'];
  selection = new SelectionModel<Employee>(true, []);
  
  @ViewChild(MatSort) sort!: MatSort;

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
      this.selection.clear();
    });
  }

  /** Ob alle Zeilen ausgewählt sind */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.employees.length;
    return numSelected === numRows;
  }

  /** Auswahl aller Zeilen umschalten */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.employees.forEach(row => this.selection.select(row));
  }

  /** Text für die Checkbox in der Header-Zeile */
  checkboxLabel(row?: Employee): string {
    if (!row) {
      return `${this.isAllSelected() ? 'Alle abwählen' : 'Alle auswählen'}`;
    }
    return `${this.selection.isSelected(row) ? 'Abwählen' : 'Auswählen'}`;
  }

  /** Ausgewählte Mitarbeiter löschen */
  deleteSelected() {
    if (this.selection.selected.length === 0) return;

    const message = this.selection.selected.length === 1
      ? 'Möchten Sie diesen Mitarbeiter wirklich löschen?'
      : `Möchten Sie diese ${this.selection.selected.length} Mitarbeiter wirklich löschen?`;

    if (confirm(message)) {
      // Nur Mitarbeiter mit gültiger ID löschen
      const deleteObservables = this.selection.selected
        .filter(employee => employee.id !== undefined)
        .map(employee => this.employeeService.deleteEmployee(employee.id!));

      if (deleteObservables.length > 0) {
        forkJoin(deleteObservables).subscribe({
          next: () => {
            this.loadEmployees();
          },
          error: (error) => {
            console.error('Fehler beim Löschen der Mitarbeiter:', error);
            alert('Fehler beim Löschen der Mitarbeiter');
          }
        });
      }
    }
  }

  onSort(event: Sort) {
    if (!event.active || event.direction === '') {
      this.loadEmployees();
      return;
    }

    this.employeeService.getEmployees(event.active, event.direction as 'asc' | 'desc')
      .subscribe(employees => {
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
