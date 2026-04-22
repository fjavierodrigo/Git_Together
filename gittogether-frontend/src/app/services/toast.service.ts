import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new Subject<Toast[]>();
  private counter = 0;

  toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration: number = 300) {
    const id = this.counter++;
    const toast: Toast = { message, type, id };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
  info(msg: string) { this.show(msg, 'info'); }
  warning(msg: string) { this.show(msg, 'warning'); }
}
