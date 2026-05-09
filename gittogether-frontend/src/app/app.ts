import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsComponent } from './components/shared/toasts/toasts';
import { ModalComponent } from './components/shared/modal/modal';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastsComponent, ModalComponent], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { 
  title = 'Git Together';
}