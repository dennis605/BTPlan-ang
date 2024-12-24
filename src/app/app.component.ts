import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

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
      <span>Beschäftigungstherapie-Verwaltung</span>
    </mat-toolbar>

    <mat-sidenav-container>
      <mat-sidenav mode="side" opened>
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
}
