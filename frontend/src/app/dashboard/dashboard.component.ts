import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], // Ajoutez les modules nécessaires
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {}