import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginService, LoginAuthRequest, LoginAuthResponse } from './login.service';

export interface Usuario {
  id?: number;
  user: string;
  idUnidade?: number;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USUARIO_KEY = 'auth_usuario';
  
  private usuarioSubject: BehaviorSubject<Usuario | null>;
  public usuario$: Observable<Usuario | null>;
  
  private autenticadoSubject: BehaviorSubject<boolean>;
  public autenticado$: Observable<boolean>;

  constructor(private loginService: LoginService) {
    const usuarioSalvo = this.obterUsuarioLocalStorage();
    this.usuarioSubject = new BehaviorSubject<Usuario | null>(usuarioSalvo);
    this.usuario$ = this.usuarioSubject.asObservable();

    const hayToken = this.obterToken() !== null;
    this.autenticadoSubject = new BehaviorSubject<boolean>(hayToken);
    this.autenticado$ = this.autenticadoSubject.asObservable();
  }

  /**
   * Autentica o usuário com as credenciais fornecidas
   */
  autenticar(user: string, password: string): Observable<LoginAuthResponse> {
    const credentials: LoginAuthRequest = { user, password };
    
    return this.loginService.autenticar(credentials).pipe(
      map(response => {
        // Armazenar token
        if (response.token) {
          this.armazenarToken(response.token);
        }

        // Armazenar dados do usuário
        if (response.usuario) {
          const usuario: Usuario = {
            user: response.usuario.user || user,
            ...response.usuario
          };
          this.armazenarUsuario(usuario);
          this.usuarioSubject.next(usuario);
        } else {
          this.usuarioSubject.next({ user });
        }

        this.autenticadoSubject.next(true);
        return response;
      })
    );
  }

  /**
   * Verifica se o usuário está autenticado
   */
  estaAutenticado(): boolean {
    const token = this.obterToken();
    return !!token;
  }

  /**
   * Obtém o token armazenado
   */
  obterToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtém o usuário atual
   */
  obterUsuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  /**
   * Realiza logout e limpa os dados
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USUARIO_KEY);
    this.usuarioSubject.next(null);
    this.autenticadoSubject.next(false);
  }

  /**
   * Checa se é um token válido (básico)
   */
  ehTokenValido(): boolean {
    const token = this.obterToken();
    if (!token) return false;

    try {
      // Decodificar JWT (basic check)
      const [, payloadBase64] = token.split('.');
      if (!payloadBase64) return false;

      const payload = JSON.parse(atob(payloadBase64));
      const expiracao = payload.exp * 1000; // converter para ms
      return Date.now() < expiracao;
    } catch {
      return false;
    }
  }

  // Métodos privados
  private armazenarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private armazenarUsuario(usuario: Usuario): void {
    localStorage.setItem(this.USUARIO_KEY, JSON.stringify(usuario));
  }

  private obterUsuarioLocalStorage(): Usuario | null {
    const usuarioJson = localStorage.getItem(this.USUARIO_KEY);
    return usuarioJson ? JSON.parse(usuarioJson) : null;
  }
}
