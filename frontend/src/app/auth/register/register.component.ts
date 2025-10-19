import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Ajout de ReactiveFormsModule
  templateUrl: './register.component.html',
  styleUrl: './register.scss'
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Création du formulaire une fois le FormBuilder injecté
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(1)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', [Validators.required]]
      },
      { validators: this.passwordsMatch }
    );
  }

  // Validator personnalisé pour la confirmation du mot de passe
  private passwordsMatch(group: FormGroup): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('passwordConfirm')?.value;
    return pass === confirm ? null : { notMatch: true };
  }

  // Soumission du formulaire
  submit(): void {
    this.error = null;

    if (this.form.invalid) {
      this.error = 'Veuillez corriger les erreurs du formulaire.';
      return;
    }

    this.loading = true;
    const { name, email, password } = this.form.value;

    this.auth.register(name, email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || "Échec de l'inscription.";
      }
    });
  }
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}