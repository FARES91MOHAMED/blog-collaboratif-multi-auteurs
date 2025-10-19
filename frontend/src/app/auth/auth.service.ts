import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id?: string;
    email?: string;
    role?: string;
    [key: string]: any;
  };
}

interface JwtPayload {
  id?: string;
  email?: string;
  role?: string;
  exp?: number;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<JwtPayload | null>(this.getUserFromToken());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        if (res?.accessToken) {
          localStorage.setItem(this.tokenKey, res.accessToken);
          this.userSubject.next(this.getUserFromToken());
          console.log('Token stocké par AuthService:', res.accessToken);
        } else {
          console.warn('Aucun accessToken dans la réponse:', res);
        }
      })
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { name, email, password }).pipe(
      tap((res) => {
        if (res?.accessToken) {
          localStorage.setItem(this.tokenKey, res.accessToken);
          this.userSubject.next(this.getUserFromToken());
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const user = this.getUserFromToken();
    return user?.role || null;
  }

  private getUserFromToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded;
    } catch (error) {
      console.error('Erreur de décodage du token:', error);
      localStorage.removeItem(this.tokenKey);
      return null;
    }
  }
}