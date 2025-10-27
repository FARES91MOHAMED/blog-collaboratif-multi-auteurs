import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private base = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  getComments(articleId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/${articleId}`);
  }

   addComment(articleId: string, content: string): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http
      .post<any>(`${environment.apiUrl}/articles/${articleId}/comments`, { content }, { headers })
      .pipe(
        switchMap((created) => {
                   if (created?.author?.name) return of(created);
                  return this.http.get<any>(`${this.base}/${articleId}`);
        })
      );
  }
}
