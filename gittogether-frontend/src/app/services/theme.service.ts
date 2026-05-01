import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'gittogether-theme';
  private isDarkTheme = new BehaviorSubject<boolean>(this.loadInitialTheme());
  isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor() {
    this.applyTheme(this.isDarkTheme.value);
  }

  toggleTheme() {
    const newTheme = !this.isDarkTheme.value;
    this.isDarkTheme.next(newTheme);
    localStorage.setItem(this.THEME_KEY, JSON.stringify(newTheme));
    this.applyTheme(newTheme);
  }

  private loadInitialTheme(): boolean {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      try {
        return JSON.parse(savedTheme);
      } catch (e) {
        console.error("Error al cargar tema", e);
        return true;
      }
    }
    return true; // Default to dark theme
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }
}
