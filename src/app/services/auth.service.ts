import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { LoginService, LoginAuthRequest, LoginAuthResponse } from './login.service';
import { UnidadeService } from './unidade.service';
import { Unidade } from './unidade.service';

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

  constructor(private loginService: LoginService, private unidadeService: UnidadeService) {
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
      switchMap(response => {
        // Armazenar token se presente
        if (response.token) {
          this.armazenarToken(response.token);
        }

        // Se backend retornou usuário, garantir que possua nome da unidade
        if (response.usuario) {
          // normalizar campos: backend pode retornar PascalCase (Id, User, IdUnidade)
          const raw = response.usuario;
          const usuario: Usuario = {
            ...raw,
            id:        raw.id        ?? raw.Id        ?? undefined,
            user:      raw.user      || raw.User      || user,
            idUnidade: raw.idUnidade ?? raw.IdUnidade ?? raw.id_unidade ?? undefined,
            status:    raw.status    ?? raw.Status    ?? undefined,
          };
          // debug removed

          const idUnidade = usuario.idUnidade as number | undefined;
          const hasUnidadeName = !!(response.usuario.unidade || response.usuario.unidadeName || response.usuario.nomeUnidade);

          if (idUnidade && !hasUnidadeName) {
            // buscar unidade e anexar nome antes de persistir
            return this.unidadeService.obterPorId(idUnidade).pipe(
              map(un => {
                try {
                  (usuario as any).unidade = (un as any).nome || (usuario as any).unidade || '';
                } catch {
                  (usuario as any).unidade = (usuario as any).unidade || '';
                }
                this.armazenarUsuario(usuario);
                this.usuarioSubject.next(usuario);
                this.autenticadoSubject.next(true);
                return response;
              }),
              catchError(() => {
                // se falhar ao buscar unidade, persistir usuário mesmo assim
                this.armazenarUsuario(usuario);
                this.usuarioSubject.next(usuario);
                this.autenticadoSubject.next(true);
                return of(response);
              })
            );
          }

          // sem necessidade de buscar unidade
          this.armazenarUsuario(usuario);
          this.usuarioSubject.next(usuario);
          this.autenticadoSubject.next(true);
          return of(response);
        }

        // sem usuário retornado
        this.usuarioSubject.next({ user });
        this.autenticadoSubject.next(true);
        return of(response);
      })
    );
  }

  /**
   * Cria uma `Unidade` simples (apenas nome) e associa ao usuário autenticado.
   * Retorna o `Unidade` criado e atualiza o usuário em localStorage.
   */
  associarUnidade(nome: string) {
    const atual = this.obterUsuario();
    if (!atual || !atual.id) {
      throw new Error('Usuário não autenticado ou sem id');
    }

    const payload: Unidade = { nome, observacoes: '', textoCarteirinha: '' };
    return this.unidadeService.criar(payload).pipe(
      switchMap(un => {
        // atualizar login via LoginService (preservar outros campos)
        const updatePayload: any = { idUnidade: un.id, unidade: un.nome };
        return this.loginService.atualizar((atual as any).id, updatePayload).pipe(
          map(updated => {
            // ajustar usuário local e emitir
            const novoUsuario = { ...(atual as any), idUnidade: un.id, unidade: un.nome };
            this.armazenarUsuario(novoUsuario as any);
            this.usuarioSubject.next(novoUsuario as any);
            return { unidade: un, usuario: updated };
          })
        );
      })
    );
  }

  /**
   * Atualiza os dados do usuário autenticado em memória e no localStorage.
   */
  atualizarUsuarioLocal(parcial: Partial<Usuario>): void {
    const atual = this.obterUsuario();
    if (!atual) return;
    const atualizado = { ...atual, ...parcial } as Usuario;
    this.armazenarUsuario(atualizado);
    this.usuarioSubject.next(atualizado);
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
