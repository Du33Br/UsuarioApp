import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from './services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzMessageModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Bem-vindo</h1>
        <p>Acesse sua conta</p>

        <form [formGroup]="loginForm" (ngSubmit)="login()">
          <div class="form-group">
            <label for="username">Usuário</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              placeholder="Digite seu usuário"
              [disabled]="isLoading"
              class="form-input"
            />
            <span class="error" *ngIf="getError('username')">
              {{ getError('username') }}
            </span>
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Digite sua senha"
              [disabled]="isLoading"
              class="form-input"
            />
            <span class="error" *ngIf="getError('password')">
              {{ getError('password') }}
            </span>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="button-group">
            <button type="button" (click)="limpar()" [disabled]="isLoading" class="btn-secondary">
              Limpar
            </button>
            <button type="submit" [disabled]="isLoading || loginForm.invalid" class="btn-primary">
              {{ isLoading ? 'Autenticando...' : 'Entrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a66c2 0%, #5fb1ff 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    }

    h1 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 700;
      color: #0a66c2;
    }

    p {
      margin: 0 0 28px;
      color: rgba(0, 0, 0, 0.54);
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-input:focus {
      border-color: #0a66c2;
      box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.1);
    }

    .form-input:disabled {
      background: #f5f5f5;
      color: rgba(0, 0, 0, 0.45);
    }

    .error {
      color: #f5222d;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    }

    .error-message {
      background: rgba(245, 34, 45, 0.1);
      border: 1px solid rgba(245, 34, 45, 0.3);
      color: #f5222d;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 24px;
    }

    button {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: linear-gradient(90deg, #0a66c2, #5fb1ff);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn-primary:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: rgba(0, 0, 0, 0.85);
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e0e0e0;
    }

    .btn-secondary:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/app/dashboard';
  }

  login(): void {
    if (!this.loginForm.valid) {
      return;
    }

    const { username, password } = this.loginForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.autenticar(username, password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.message.success('Autenticação realizada com sucesso!');
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Erro ao autenticar:', err);
          this.errorMessage = 'Usuário ou senha inválidos.';
          this.message.error(this.errorMessage);
        }
      });
  }

  limpar(): void {
    this.loginForm.reset();
    this.errorMessage = '';
  }

  getError(field: string): string {
    const control = this.loginForm.get(field);
    if (!control || !control.hasError('required') || !control.touched) {
      return '';
    }
    return field === 'username' ? 'Usuário é obrigatório' : 'Senha é obrigatória';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


