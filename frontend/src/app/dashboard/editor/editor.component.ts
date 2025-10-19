import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('auth_token'); // ou 'token' selon ton projet
    this.router.navigate(['/login']);
  }
}
