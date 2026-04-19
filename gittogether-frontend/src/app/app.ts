import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsComponent } from './components/shared/toasts/toasts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastsComponent], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { 
  title = 'gittogether-frontend';
}