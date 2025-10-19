import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-writer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './writer.component.html',
  styleUrls: ['./writer.component.scss']
})
export class WriterComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('auth_token'); // ou 'token' selon ton projet
    this.router.navigate(['/login']);
  }
}