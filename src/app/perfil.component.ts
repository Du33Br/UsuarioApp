import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { LoginService } from './services/login.service';
import { UnidadeService } from './services/unidade.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzSkeletonModule,
    NzMessageModule,
  ],
  template: `
    <div style="max-width:480px;margin:40px auto;padding:0 16px">
      <nz-card nzTitle="Meu Perfil / Login">

        <nz-skeleton [nzActive]="true" *ngIf="loading(); else formTpl"></nz-skeleton>

        <ng-template #formTpl>
          <form [formGroup]="form" (ngSubmit)="salvar()">

            <nz-form-item>
              <nz-form-label [nzSpan]="24">Login</nz-form-label>
              <nz-form-control [nzSpan]="24">
                <input nz-input formControlName="user" placeholder="nome do login" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="24">Nova Senha <span style="color:#999;font-weight:400;font-size:12px">(deixe em branco para manter)</span></nz-form-label>
              <nz-form-control [nzSpan]="24">
                <input nz-input type="password" formControlName="password" autocomplete="new-password" placeholder="••••••••" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label [nzSpan]="24">Unidade</nz-form-label>
              <nz-form-control [nzSpan]="24">
                <nz-select formControlName="idUnidade" nzPlaceHolder="— selecione —" style="width:100%">
                  <nz-option *ngFor="let u of unidades" [nzValue]="u.id" [nzLabel]="u.nome || ('Unidade ' + u.id)"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>

            <div *ngIf="erro" style="color:#f5222d;margin-bottom:12px">{{ erro }}</div>

            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
              <button nz-button nzType="default" type="button" (click)="voltar()">Cancelar</button>
              <!-- botão Excluir removido do perfil -->
              <button nz-button nzType="primary" type="submit" [disabled]="form.invalid || salvando()">
                {{ salvando() ? 'Salvando…' : 'Salvar' }}
              </button>
            </div>
          </form>
        </ng-template>

      </nz-card>
    </div>
  `
})
export class PerfilComponent implements OnInit {
  form: FormGroup;
  loading = signal(true);
  salvando = signal(false);
  erro = '';
  unidades: { id: number; nome: string }[] = [];
  loginId?: number;
  tipo?: string;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private unidadeService: UnidadeService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private msg: NzMessageService,
    private location: Location
  ) {
    this.form = this.fb.group({
      user: ['', [Validators.required]],
      password: [''],
      idUnidade: [null]
    });
  }

  ngOnInit(): void {
    // Carregar unidades disponíveis para seleção
    this.unidadeService.listar().subscribe({
      next: (list: any[]) => {
        this.unidades = list.map((u: any) => ({ id: u.id, nome: u.nome || '' }));
      },
      error: () => { this.unidades = []; }
    });

    // Determinar o id do login: via rota ou via usuário autenticado
    const paramId = this.route.snapshot.paramMap.get('id');
    const usuario = this.auth.obterUsuario();

    // Se a rota atual for a de criação ('perfil/novo'), não pré-carregar o último login
    const routePath = this.route.snapshot.routeConfig?.path ?? '';
    if (routePath.includes('novo')) {
      // modo criação — manter formulário limpo (pode pré-preencher com alguns valores do usuário autenticado)
      this.loginId = undefined as any;
      this.form.patchValue({ user: usuario?.user ?? '', idUnidade: (usuario as any)?.idUnidade ?? null });
      this.loading.set(false);
      return;
    }

    const id = paramId ? Number(paramId) : (usuario?.id as number | undefined);

    if (id) {
      this.loginId = id;
      this.carregarPorId(id);
    } else if (usuario?.user) {
      // sem id no localStorage: buscar pelo username
      this.loginService.buscarPorUsuario(usuario.user).subscribe({
        next: (login: any) => {
          this.loginId = login.id ?? login.Id;
          this.form.patchValue({
            user:      login.user      ?? login.User,
            idUnidade: login.idUnidade ?? login.IdUnidade ?? null
          });
          // armazenar tipo para usar em atualizações
          this.tipo = login.tipo ?? login.Tipo ?? 'A';
          this.loading.set(false);
        },
        error: () => {
          this.form.patchValue({ user: usuario!.user, idUnidade: (usuario as any).idUnidade ?? null });
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  private carregarPorId(id: number): void {
    this.loginService.obterPorId(id).subscribe({
      next: (login: any) => {
        this.form.patchValue({
          user:      login.user      ?? login.User,
          idUnidade: login.idUnidade ?? login.IdUnidade ?? null
        });
        this.tipo = login.tipo ?? login.Tipo ?? 'A';
        this.loading.set(false);
      },
      error: () => {
        const usuario = this.auth.obterUsuario();
        if (usuario) {
          this.form.patchValue({ user: usuario.user, idUnidade: (usuario as any).idUnidade ?? null });
        }
        this.loading.set(false);
      }
    });
  }

  // exclusão inline removida — fluxo de remoção agora centralizado na listagem quando apropriado

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando.set(true);
    this.erro = '';

    const { user, password, idUnidade } = this.form.value;
    const payload: any = { user, idUnidade };
    if (password && password.trim()) payload.password = password;
    // evitar duplicidade: consultar por usuário existente
    const proceed = () => {
      if (this.loginId) {
        // atualizar login existente — incluir campos obrigatórios esperados pelo backend
        const currentUser = this.auth.obterUsuario();
        const updatePayload: any = {
          user: payload.user,
          idUnidade: payload.idUnidade ?? 0,
          ...(payload.password ? { password: payload.password } : {}),
          Tipo: this.tipo ?? 'A',
          UserCadatro: ((currentUser && ((currentUser as any).user || (currentUser as any).User)) || 'system')
        };

        this.loginService.atualizar(this.loginId, updatePayload).subscribe({
          next: (res: any) => {
            this.auth.atualizarUsuarioLocal({ user, idUnidade });
            this.salvando.set(false);
            this.msg.success('Perfil atualizado com sucesso!');
            this.router.navigate(['/app', 'logins']);
          },
          error: (e) => {
            this.salvando.set(false);
            this.erro = e?.message || 'Erro ao salvar perfil.';
            this.msg.error(this.erro);
          }
        });
      } else {
        // criar novo login — garantir que payload atenda ao modelo esperado pelo backend
        const currentUser = this.auth.obterUsuario();
        const createPayload: any = {
          user: payload.user,
          password: payload.password || undefined,
          tipo: 'A', // padrão: A (ajuste conforme necessário)
          idUnidade: payload.idUnidade ?? 0,
          // garantir valor não vazio para UserCadatro (backend exige)
          UserCadatro: ((currentUser && ((currentUser as any).user || (currentUser as any).User)) || 'system')
        };

        this.loginService.criar(createPayload).subscribe({
          next: (res: any) => {
            this.salvando.set(false);
            this.msg.success('Login criado com sucesso!');
            try { this.auth.atualizarUsuarioLocal({ id: res.id ?? res.Id, user: res.user ?? res.User, idUnidade: res.idUnidade ?? res.IdUnidade }); } catch {}
            this.router.navigate(['/app', 'logins']);
          },
          error: (e) => {
            this.salvando.set(false);
            this.erro = e?.message || 'Erro ao criar login.';
            this.msg.error(this.erro);
          }
        });
      }
    };

    // checar existência de login com mesmo nome (caso insensível assumido pelo backend)
    this.loginService.buscarPorUsuario(user).subscribe({
      next: (existing: any) => {
        const existingId = existing?.id ?? existing?.Id;
        if (existingId && existingId !== this.loginId) {
          this.salvando.set(false);
          this.erro = 'Já existe um login com esse nome.';
          this.msg.error(this.erro);
          return;
        }
        proceed();
      },
      error: () => {
        // não encontrado — pode prosseguir
        proceed();
      }
    });
  }

  voltar(): void {
    try {
      this.location.back();
    } catch {
      this.router.navigate(['/app', 'dashboard']);
    }
  }
}
