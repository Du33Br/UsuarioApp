import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Login {
  id?: number;
  user: string;
  password?: string;
  idUnidade?: number;
  status?: string;
}

export interface LoginAuthRequest {
  user: string;
  password: string;
}

export interface LoginAuthResponse {
  token: string;
  usuario?: any;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = '/api/Login';

  constructor(private http: HttpClient) {}

  listar(): Observable<Login[]> {
    return this.http.get<Login[]>(this.apiUrl);
  }

  obterPorId(id: number): Observable<Login> {
    return this.http.get<Login>(`${this.apiUrl}/${id}`);
  }

  criar(login: Login): Observable<Login> {
    return this.http.post<Login>(this.apiUrl, login);
  }

  atualizar(id: number, login: Login): Observable<Login> {
    return this.http.put<Login>(`${this.apiUrl}/${id}`, login);
  }

  deletar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  buscarPorUsuario(user: string): Observable<Login> {
    return this.http.get<Login>(`${this.apiUrl}/user/${user}`);
  }

  buscarPorUnidade(idUnidade: number): Observable<Login[]> {
    return this.http.get<Login[]>(`${this.apiUrl}/unidade/${idUnidade}`);
  }

  autenticar(credentials: LoginAuthRequest): Observable<LoginAuthResponse> {
    return this.http.post<LoginAuthResponse>(`${this.apiUrl}/auth`, credentials);
  }
}
