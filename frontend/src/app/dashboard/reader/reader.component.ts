import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-reader',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.scss']
})
export class ReaderComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('auth_token'); // ou 'token' selon ton projet
    this.router.navigate(['/login']);
  }
}