import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  submit(): void {
    this.error = null;

    if (this.form.invalid) {
      this.error = 'Veuillez corriger les erreurs du formulaire.';
      return;
    }

    this.loading = true;
    const { email, password } = this.form.value;

    this.auth.login(email, password).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Login successful', response);

        if (response?.accessToken) {
          localStorage.setItem('auth_token', response.accessToken);
          console.log('Token stocké:', response.accessToken);

          // 🔍 Décodage du token pour trouver le rôle
          try {
            const decoded: any = jwtDecode(response.accessToken);
            const role = decoded?.role?.toLowerCase();
            console.log('Rôle décodé:', role);

            const roleMap: Record<string, string> = {
              'admin': '/dashboard/admin',
              'editeur': '/dashboard/editor',
              'redacteur': '/dashboard/writer',
              'lecteur': '/dashboard/reader'
            };

            const redirectUrl = roleMap[role] || '/login';
            console.log('Redirection vers:', redirectUrl);

            this.router.navigate([redirectUrl], { replaceUrl: true });
          } catch (err) {
            console.error('Erreur lors du décodage du token:', err);
            this.router.navigate(['/login']);
          }

        } else {
          this.error = 'Token non reçu du serveur.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Échec de la connexion.';
      }
    });
  }
}
