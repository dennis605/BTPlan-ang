import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sort-header',
  template: `
    <div class="sort-header" (click)="toggleSort()">
      {{ label }}
      <span class="sort-icon" *ngIf="currentSort === field">
        {{ currentOrder === 'asc' ? '↑' : '↓' }}
      </span>
    </div>
  `,
  styles: [`
    .sort-header {
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .sort-header:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    .sort-icon {
      font-size: 0.8em;
    }
  `]
})
export class SortHeaderComponent {
  @Input() label: string = '';
  @Input() field: string = '';
  @Input() currentSort: string | null = null;
  @Input() currentOrder: 'asc' | 'desc' = 'asc';
  @Output() sort = new EventEmitter<{ field: string, order: 'asc' | 'desc' }>();

  toggleSort() {
    const newOrder = this.currentSort === this.field && this.currentOrder === 'asc' ? 'desc' : 'asc';
    this.sort.emit({ field: this.field, order: newOrder });
  }
}
