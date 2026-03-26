import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, EMPTY, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Rotas públicas que não precisam de autenticação
  private readonly PUBLIC_URLS = [
    '/api/Login/auth',
    '/api/Login/register',
    '/api/health',
    'viacep.com.br'
  ];

  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Permitir rotas públicas sem token
    if (this.isPublicUrl(req.url)) {
      return next.handle(req);
    }

    const token = this.auth.obterToken();

    // Sem token: em dev permite continuar sem header; em prod redireciona para login
    if (!token) {
      if (!environment.production && environment.allowUnauthenticatedRequestsInDev) {
        return next.handle(req);
      }
      this.auth.logout();
      this.router.navigate(['/login']);
      return EMPTY;
    }

    // Token presente: sempre incluir no header e deixar o servidor validar
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        // Token rejeitado pelo servidor: limpar sessão e redirecionar
        if (err.status === 401 || err.status === 403) {
          this.auth.logout();
          this.router.navigate(['/login']);
          return EMPTY;
        }
        return throwError(() => err);
      })
    );
  }

  private isPublicUrl(url: string): boolean {
    return this.PUBLIC_URLS.some(publicUrl => url.includes(publicUrl));
  }
}
