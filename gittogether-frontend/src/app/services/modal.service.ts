import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalConfig {
  title: string;
  message?: string;
  inputs?: ModalInput[];
  confirmText?: string;
  cancelText?: string;
  type?: 'confirm' | 'form' | 'danger';
  resolve?: (value: any) => void;
}

export interface ModalInput {
  name: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'tags';
  value?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new Subject<ModalConfig | null>();
  modal$ = this.modalSubject.asObservable();

  constructor() {}

  /**
   * Opens a confirmation modal.
   * Returns a promise that resolves to true if confirmed, false otherwise.
   */
  confirm(title: string, message: string, danger: boolean = false): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalSubject.next({
        title,
        message,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        type: danger ? 'danger' : 'confirm',
        resolve
      });
    });
  }

  /**
   * Opens a form modal with inputs.
   * Returns a promise that resolves to an object with input values or null if cancelled.
   */
  prompt(title: string, inputs: ModalInput[]): Promise<any> {
    return new Promise((resolve) => {
      this.modalSubject.next({
        title,
        inputs,
        confirmText: 'Guardar',
        cancelText: 'Cancelar',
        type: 'form',
        resolve
      });
    });
  }

  close() {
    this.modalSubject.next(null);
  }
}
