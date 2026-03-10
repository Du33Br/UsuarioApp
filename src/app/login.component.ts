import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NzFormModule, NzInputModule, NzButtonModule],
  template: `
    <div class="login-wrap">
      <div class="login-box">
        <h2 class="login-title">Bem-vindo</h2>
        <p class="login-sub">Acesse sua conta</p>

        <form nz-form (ngSubmit)="login()">
          <nz-form-item>
            <nz-form-control>
              <input nz-input name="username" [(ngModel)]="username" placeholder="Usuário" class="full" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control>
              <input nz-input type="password" name="password" [(ngModel)]="password" placeholder="Senha" class="full" />
            </nz-form-control>
          </nz-form-item>

          <div class="actions">
            <button nz-button nzType="default" type="button" (click)="cancel()">Cancelar</button>
            <button nz-button nzType="primary" htmlType="submit" class="primary-btn">Entrar</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `:host{display:block;height:100vh}`,
    `.login-wrap{height:100%;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,var(--primary-color,#0a66c2),var(--primary-light,#5fb1ff))}`,
    `.login-box{width:100%;max-width:420px;background:var(--card-bg,#ffffff);border-radius:12px;padding:28px;border:1px solid rgba(0,0,0,0.04)}`,
    `.login-title{margin:0;color:var(--primary-color,#0a66c2);font-size:1.5rem;font-weight:700}`,
    `.login-sub{margin:6px 0 18px;color:rgba(0,0,0,0.54);font-size:0.95rem}`,
    `.full{width:100%;box-sizing:border-box;background:transparent}`,
    `.actions{display:flex;gap:10px;justify-content:flex-end;margin-top:16px}`,
    `.primary-btn{background:linear-gradient(90deg,var(--primary-color,#0a66c2),var(--primary-light,#5fb1ff));border:none;color:#fff}`,
    `@media (max-width:480px){.login-box{padding:18px;border-radius:10px}.login-title{font-size:1.125rem}.actions{gap:8px}}`
  ]
})
export class LoginComponent {
  username = '';
  password = '';
  constructor(private router: Router) {}

  login() {
    // placeholder: autenticação fictícia
    if (this.username) {
      this.router.navigate(['/dashboard']);
    }
  }

  cancel() {
    this.username = '';
    this.password = '';
  }
}
