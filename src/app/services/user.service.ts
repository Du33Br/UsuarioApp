import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Login } from './login.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = '/api/Login';

  constructor(private http: HttpClient, private notification: NzNotificationService) {}

  listar(params?: Record<string, any>): Observable<Login[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const v = params[key];
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(key, String(v));
        }
      });
    }
    return this.http.get<Login[]>(this.apiUrl, { params: httpParams }).pipe(
      catchError(this.handleError('listar'))
    );
  }

  obterPorId(id: number): Observable<Login> {
    return this.http.get<Login>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError('obterPorId'))
    );
  }

  criar(login: Login): Observable<Login> {
    return this.http.post<Login>(this.apiUrl, login).pipe(
      catchError(this.handleError('criar'))
    );
  }

  atualizar(id: number, login: Login): Observable<Login> {
    return this.http.put<Login>(`${this.apiUrl}/${id}`, login).pipe(
      catchError(this.handleError('atualizar'))
    );
  }

  deletar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError('deletar'))
    );
  }

  buscarPorUsuario(user: string): Observable<Login> {
    return this.http.get<Login>(`${this.apiUrl}/user/${encodeURIComponent(user)}`).pipe(
      catchError(this.handleError('buscarPorUsuario'))
    );
  }

  buscarPorUnidade(idUnidade: number): Observable<Login[]> {
    return this.http.get<Login[]>(`${this.apiUrl}/unidade/${idUnidade}`).pipe(
      catchError(this.handleError('buscarPorUnidade'))
    );
  }

  private handleError(operation: string) {
    return (err: any) => {
      const message = err?.error?.message || err?.message || 'Erro desconhecido';
      this.notification.error('Erro', `${operation}: ${message}`);
      return throwError(() => err);
    };
  }
}
