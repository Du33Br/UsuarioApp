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
import { LoginService } from '../../services/login.service';
import { UserStateService } from '../../state/user-state.service';
import { UnidadeService } from '../../services/unidade.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
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
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  form: FormGroup;
  loading = signal(true);
  salvando = signal(false);
  erro = '';
  carregandoUnidades = false;
  unidades: { id: number; nome: string; apelido?: string; cnpj?: string }[] = [];
  loginId?: number;
  tipo?: string;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private unidadeService: UnidadeService,
    private auth: AuthService,
    private userState: UserStateService,
    private router: Router,
    private route: ActivatedRoute,
    private msg: NzMessageService,
    private location: Location
  ) {
    this.form = this.fb.group({
      user: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(1)]],
      idUnidade: [null]
    });
  }

  ngOnInit(): void {
    this.carregandoUnidades = true;
    this.unidadeService.listar().subscribe({
      next: (list: any[]) => {
        this.unidades = list.map((u: any) => ({
          id: u.id,
          nome: u.nome || '',
          apelido: u.apelido || undefined,
          cnpj: u.cnpj || undefined,
        }));
        this.carregandoUnidades = false;
      },
      error: () => { this.unidades = []; this.carregandoUnidades = false; }
    });

    const paramId = this.route.snapshot.paramMap.get('id');
    const usuario = this.auth.obterUsuario();
    const routePath = this.route.snapshot.routeConfig?.path ?? '';
    if (routePath.includes('novo')) {
      this.loginId = undefined as any;
      this.form.patchValue({ user: usuario?.user ?? '', idUnidade: (usuario as any)?.idUnidade ?? null });
      this.loading.set(false);
      return;
    }

    const id = paramId ? Number(paramId) : (usuario?.id as number | undefined);
    if (id) { this.loginId = id; this.carregarPorId(id); }
    else if (usuario?.user) {
      this.loginService.buscarPorUsuario(usuario.user).subscribe({ next: (login: any) => { this.loginId = login.id ?? login.Id; this.form.patchValue({ user: login.user ?? login.User, idUnidade: login.idUnidade ?? login.IdUnidade ?? null }); this.tipo = login.tipo ?? login.Tipo ?? 'A'; this.loading.set(false); }, error: () => { this.form.patchValue({ user: usuario!.user, idUnidade: (usuario as any).idUnidade ?? null }); this.loading.set(false); } });
    } else { this.loading.set(false); }
  }

  private carregarPorId(id: number): void {
    this.loginService.obterPorId(id).subscribe({ next: (login: any) => { this.form.patchValue({ user: login.user ?? login.User, idUnidade: login.idUnidade ?? login.IdUnidade ?? null }); this.tipo = login.tipo ?? login.Tipo ?? 'A'; this.loading.set(false); }, error: () => { const usuario = this.auth.obterUsuario(); if (usuario) { this.form.patchValue({ user: usuario.user, idUnidade: (usuario as any).idUnidade ?? null }); } this.loading.set(false); } });
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando.set(true);
    this.erro = '';
    const { user, password, idUnidade } = this.form.value;
    const payload: any = { user, idUnidade };
    if (password && password.trim()) payload.password = password;
    const proceed = () => {
      if (this.loginId) {
        const currentUser = this.auth.obterUsuario();
        const updatePayload: any = { user: payload.user, idUnidade: payload.idUnidade ?? 0, Password: payload.password || '', Tipo: this.tipo ?? 'A', UserCadatro: ((currentUser && ((currentUser as any).user || (currentUser as any).User)) || 'system') };
        this.loginService.atualizar(this.loginId, updatePayload).subscribe({ next: (res: any) => { this.auth.atualizarUsuarioLocal({ user, idUnidade }); try { this.userState.refresh(); } catch {} this.salvando.set(false); this.msg.success('Perfil atualizado com sucesso!'); this.router.navigate(['/app', 'logins']); }, error: (e) => { this.salvando.set(false); this.erro = e?.message || 'Erro ao salvar perfil.'; this.msg.error(this.erro); } });
      } else {
        const currentUser = this.auth.obterUsuario();
        const createPayload: any = { user: payload.user, password: payload.password || undefined, tipo: 'A', idUnidade: payload.idUnidade ?? 0, UserCadatro: ((currentUser && ((currentUser as any).user || (currentUser as any).User)) || 'system') };
        this.loginService.criar(createPayload).subscribe({ next: (res: any) => { this.salvando.set(false); this.msg.success('Login criado com sucesso!'); try { this.auth.atualizarUsuarioLocal({ id: res.id ?? res.Id, user: res.user ?? res.User, idUnidade: res.idUnidade ?? res.IdUnidade }); } catch {} try { this.userState.refresh(); } catch {} this.router.navigate(['/app', 'logins']); }, error: (e) => { this.salvando.set(false); this.erro = e?.message || 'Erro ao criar login.'; this.msg.error(this.erro); } });
      }
    };
    this.loginService.buscarPorUsuario(user).subscribe({ next: (existing: any) => { const existingId = existing?.id ?? existing?.Id; if (existingId && existingId !== this.loginId) { this.salvando.set(false); this.erro = 'Já existe um login com esse nome.'; this.msg.error(this.erro); return; } proceed(); }, error: () => { proceed(); } });
  }

  voltar(): void {
    try { this.location.back(); } catch { this.router.navigate(['/app', 'dashboard']); }
  }

  labelUnidade(u: { id: number; nome: string; apelido?: string; cnpj?: string }): string {
    const base = u.apelido ? `${u.nome} (${u.apelido})` : u.nome;
    return base || `Unidade ${u.id}`;
  }
}
