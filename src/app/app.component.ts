import { Component, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="sidenav.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <span>Beschäftigungstherapie-Verwaltung</span>
    </mat-toolbar>

    <mat-sidenav-container (click)="onContainerClick($event)">
      <mat-sidenav #sidenav="matSidenav" mode="over">
        <mat-nav-list>
          <a mat-list-item routerLink="/employees" routerLinkActive="active">
            <mat-icon>people</mat-icon>
            <span>Mitarbeiter</span>
          </a>
          <a mat-list-item routerLink="/patients" routerLinkActive="active">
            <mat-icon>person</mat-icon>
            <span>Patienten</span>
          </a>
          <a mat-list-item routerLink="/therapies" routerLinkActive="active">
            <mat-icon>medical_services</mat-icon>
            <span>Therapien</span>
          </a>
          <a mat-list-item routerLink="/schedule" routerLinkActive="active">
            <mat-icon>calendar_today</mat-icon>
            <span>Tagesplan</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    mat-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }

    mat-toolbar span {
      margin-left: 8px;
    }

    mat-sidenav-container {
      flex: 1;
      margin-top: 64px; /* Toolbar height */
    }

    mat-sidenav {
      width: 250px;
      padding-top: 20px;
    }

    .content {
      padding: 20px;
    }

    mat-nav-list a {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .active {
      background-color: rgba(0, 0, 0, 0.1);
    }
  `]
})
export class AppComponent {
  title = 'btplan';
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.sidenav.mode === 'over') {
        this.sidenav.close();
      }
    });
  }

  onContainerClick(event: MouseEvent): void {
    // Schließe das Menü nur, wenn außerhalb des Menüs geklickt wurde
    const clickedElement = event.target as HTMLElement;
    if (!clickedElement.closest('mat-sidenav')) {
      this.sidenav.close();
    }
  }
}
