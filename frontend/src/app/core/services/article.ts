import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Article } from '../../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private base = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>(this.base);
  }

  getById(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.base}/${id}`);
  }

  create(payload: Partial<Article>): Observable<Article> {
    return this.http.post<Article>(this.base, payload);
  }

  update(id: string, payload: Partial<Article>): Observable<Article> {
    return this.http.put<Article>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}

