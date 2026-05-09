import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
  actionLabel?: string;
  action?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new Subject<Toast[]>();
  private counter = 0;

  toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration: number = 3000, actionLabel?: string, action?: () => void) {
    const id = this.counter++;
    const toast: Toast = { message, type, id, actionLabel, action };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    // Si tiene acción, le damos más tiempo para que el usuario pueda pulsar (10 segundos)
    const finalDuration = action ? 10000 : duration;

    if (finalDuration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, finalDuration);
    }
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
  info(msg: string, actionLabel?: string, action?: () => void) { 
    this.show(msg, 'info', 3000, actionLabel, action); 
  }
  warning(msg: string) { this.show(msg, 'warning'); }
}
