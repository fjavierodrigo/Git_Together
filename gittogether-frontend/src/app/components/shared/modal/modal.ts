import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService, ModalConfig, ModalInput } from '../../../services/modal.service';
import { Subscription } from 'rxjs';
import { ForoService } from '../../services/foro.service';
import { ToastService } from '../../../services/toast.service';

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

  // Configuración de validación de archivos (50MB)
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024;
  private readonly ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'txt', 'zip', 'rar', '7z'];

  constructor(
    private modalService: ModalService, 
    private foroService: ForoService,
    private toastService: ToastService
  ) {}

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

  // --- Lógica de Markdown ---
  cursorPos: number = 0;

  updateCursorPosition(event: any) {
    this.cursorPos = event.target.selectionStart;
  }

  insertMarkdown(input: any, type: string) {
    const text = input.value || '';
    let start = this.cursorPos;
    let end = this.cursorPos;
    
    // Intentar obtener la selección real si es posible
    const textarea = document.getElementById(input.name) as HTMLTextAreaElement;
    if (textarea) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
    }

    const selectedText = text.substring(start, end);
    let newText = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        newText = `**${selectedText || 'texto'}**`;
        cursorOffset = selectedText ? newText.length : 2;
        break;
      case 'italic':
        newText = `*${selectedText || 'texto'}*`;
        cursorOffset = selectedText ? newText.length : 1;
        break;
      case 'h1':
        newText = `\n# ${selectedText || 'Título'}\n`;
        cursorOffset = newText.length;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'elemento'}`;
        cursorOffset = newText.length;
        break;
      case 'code':
        newText = `\`${selectedText || 'código'}\``;
        cursorOffset = selectedText ? newText.length : 1;
        break;
      case 'link':
        newText = `[${selectedText || 'enlace'}](url)`;
        cursorOffset = selectedText ? newText.length : 1;
        break;
    }

    input.value = text.substring(0, start) + newText + text.substring(end);
    
    // Devolver el foco y posicionar el cursor
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPos = start + cursorOffset;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 0);
  }

  // File management
  onFilesSelected(input: ModalInput, event: any) {
    if (event.target.files && event.target.files.length > 0) {
      if (!input.value) input.value = [];
      const files = Array.from(event.target.files) as File[];
      const validos: File[] = [];

      files.forEach(file => {
        const error = this.validarArchivo(file);
        if (error) {
          this.toastService.error(`${file.name}: ${error}`);
        } else {
          validos.push(file);
        }
      });

      if (validos.length > 0) {
        input.value = [...input.value, ...validos];
      }
      
      // Reset input so the same files can be selected again if removed
      event.target.value = '';
    }
  }

  private validarArchivo(file: File): string | null {
    if (!file || file.size === 0) {
      return "El archivo está vacío.";
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return "Supera el límite de 50MB.";
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.ALLOWED_EXTENSIONS.includes(extension)) {
      return "Extensión no permitida.";
    }

    return null;
  }

  removeFile(input: ModalInput, index: number) {
    if (input.value && input.value.length > index) {
      input.value.splice(index, 1);
    }
  }
}
