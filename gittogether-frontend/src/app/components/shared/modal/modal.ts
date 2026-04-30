import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService, ModalConfig, ModalInput } from '../../../services/modal.service';
import { Subscription } from 'rxjs';
import { ForoService } from '../../services/foro.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class ModalComponent implements OnInit, OnDestroy {
  config: ModalConfig | null = null;
  private sub: Subscription | null = null;

  // Tag editor state
  tagQuery: string = '';
  suggestions: any[] = [];

  constructor(private modalService: ModalService, private foroService: ForoService) {}

  ngOnInit(): void {
    this.sub = this.modalService.modal$.subscribe(config => {
      this.config = config;
      this.tagQuery = '';
      this.suggestions = [];
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  // Variable para evitar que el modal se cierre al seleccionar texto y soltar fuera
  private startedOnOverlay = false;

  onMouseDown(event: MouseEvent) {
    // Verificamos si el clic empezó en el fondo (overlay) y no en el contenedor
    this.startedOnOverlay = (event.target === event.currentTarget);
  }

  onMouseUp(event: MouseEvent) {
    // Verificamos si hay texto seleccionado en la pantalla
    const selection = window.getSelection()?.toString();
    
    // Solo cerramos si:
    // 1. El clic empezó Y terminó en el fondo
    // 2. NO hay texto seleccionado (evita cierres al copiar)
    if (this.startedOnOverlay && event.target === event.currentTarget && (!selection || selection.length === 0)) {
      this.onCancel();
    }
    this.startedOnOverlay = false;
  }

  onConfirm() {
    if (this.config && this.config.resolve) {
      if (this.config.type === 'form') {
        const result: any = {};
        this.config.inputs?.forEach(input => {
          result[input.name] = input.value;
        });
        this.config.resolve(result);
      } else {
        this.config.resolve(true);
      }
    }
    this.modalService.close();
  }

  onCancel() {
    if (this.config && this.config.resolve) {
      this.config.resolve(null);
    }
    this.modalService.close();
  }

  // Tag management
  onTagInput(event: any) {
    const query = this.tagQuery.trim();
    if (query.length >= 1) {
      this.foroService.searchTags(query).subscribe(tags => {
        this.suggestions = tags.filter(t => {
          // No sugerir tags que ya están seleccionados
          const input = this.config?.inputs?.find(i => i.type === 'tags');
          return !input?.value?.includes(t.nombre);
        });
      });
    } else {
      this.suggestions = [];
    }
  }

  addTag(input: ModalInput, tagName: string) {
    if (!input.value) input.value = [];
    if (!input.value.includes(tagName)) {
      input.value.push(tagName);
    }
    this.tagQuery = '';
    this.suggestions = [];
  }

  addCustomTag(input: ModalInput) {
    const tagName = this.tagQuery.trim();
    if (tagName) {
      this.addTag(input, tagName);
    }
  }

  removeTag(input: ModalInput, tagName: string) {
    input.value = input.value.filter((t: string) => t !== tagName);
  }
}
