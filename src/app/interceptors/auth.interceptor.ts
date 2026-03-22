import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Usuários mock - mesmo do db.json
  private users = [
    { id: 1, user: 'admin', password: '123456', status: 'active', idUnidade: 1 },
    { id: 2, user: 'usuario', password: 'senha123', status: 'active', idUnidade: 2 }
  ];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Interceptar requisição de autenticação
    if (req.url.includes('/api/Login/auth') && req.method === 'POST') {
      return this.handleAuthRequest(req);
    }

    // Deixar outras requisições passarem normalmente
    return next.handle(req);
  }

  private handleAuthRequest(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    const { user, password } = req.body;

    console.log('🔐 Tentativa de login:', { user });
    console.log('📋 Usuários disponíveis:', this.users);

    // Validar credenciais
    const foundUser = this.users.find(u => u.user === user && u.password === password);

    if (foundUser) {
      console.log('✅ Login bem-sucedido para usuário:', user);
      
      // Login bem-sucedido
      const response = {
        token: this.generateToken(foundUser),
        usuario: {
          id: foundUser.id,
          user: foundUser.user,
          status: foundUser.status,
          idUnidade: foundUser.idUnidade
        }
      };

      return of(new HttpResponse({
        status: 200,
        body: response
      }));
    } else {
      console.log('❌ Login falhou - credenciais inválidas para:', user);
      
      // Login falhou - lançar erro
      const error = new HttpErrorResponse({
        error: { message: 'Usuário ou senha inválidos' },
        status: 401,
        statusText: 'Unauthorized',
        url: req.url
      });

      return throwError(() => error);
    }
  }

  private generateToken(user: any): string {
    // Gerar um JWT mock (não é um JWT real, apenas para demo)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      user: user.user,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // expires in 24h
    }));
    const signature = btoa('mock-signature');

    return `${header}.${payload}.${signature}`;
  }
}

