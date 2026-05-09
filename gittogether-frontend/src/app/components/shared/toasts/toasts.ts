import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           [class]="'toast-item ' + toast.type">
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
        </div>
        <div class="toast-content">
          <div class="toast-message">{{ toast.message }}</div>
          <button *ngIf="toast.actionLabel" 
                  (click)="handleAction(toast, $event)" 
                  class="toast-action-btn">
            {{ toast.actionLabel }}
          </button>
        </div>
        <div class="toast-close" (click)="remove(toast.id)">×</div>
      </div>
    </div>
  `,
  styleUrls: ['./toasts.css']
})
export class ToastsComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
      this.cdr.detectChanges();
    });
  }

  handleAction(toast: Toast, event: Event) {
    event.stopPropagation(); // Evitamos que el click llegue al padre
    if (toast.action) {
      toast.action();
    }
    this.remove(toast.id);
  }

  remove(id: number) {
    this.toastService.remove(id);
  }
}
