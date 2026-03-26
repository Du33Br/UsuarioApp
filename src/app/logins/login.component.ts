import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../services/auth.service';
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
          const usuario = this.authService.obterUsuario();
          const hasUnidade = !!(usuario && (usuario.idUnidade || (usuario as any).unidade));
          if (!hasUnidade) {
            this.message.info('Nenhuma unidade vinculada. Redirecionando para cadastro/associação de unidade.');
            this.router.navigateByUrl('/app/usuario/novo');
            return;
          }
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
