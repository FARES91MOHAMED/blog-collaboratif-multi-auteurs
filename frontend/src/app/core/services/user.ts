import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  update(id: string, payload: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, payload);
  }

  create(payload: Partial<User>): Observable<User> {
    return this.http.post<User>(this.base, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
