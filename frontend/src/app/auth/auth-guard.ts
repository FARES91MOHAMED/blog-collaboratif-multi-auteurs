import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role?: string;
  exp?: number;
}

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  if (!token) {
    console.warn('Aucun token trouvé → redirection vers /login');
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.warn('Token expiré → redirection vers /login');
      localStorage.removeItem('auth_token');
      router.navigate(['/login'], { replaceUrl: true });
      return false;
    }

    return true; // ✅ accès autorisé

  } catch (error) {
    console.error('Erreur de décodage du token:', error);
    localStorage.removeItem('auth_token');
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
};
