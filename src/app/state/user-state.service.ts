import { Injectable, signal, computed, Signal } from '@angular/core';
import { UserService } from '../services/user.service';
import { UnidadeService, Unidade } from '../services/unidade.service';
import { AuthService } from '../services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Login } from '../services/login.service';
import { forkJoin } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  readonly users = signal<Login[]>([]);
  readonly loading = signal(false);
  readonly filter = signal<{ search?: string; tipo?: string; idUnidade?: number }>({});
  readonly selectedUser = signal<Login | null>(null);

  readonly isAdminGeral: Signal<boolean> = computed(() => {
    const u = this.auth.obterUsuario();
    if (!u) return false;
    const tipo = String((u as any).tipo || '').toUpperCase();
    return tipo === 'MASTER_GERAL' || tipo.includes('GERAL') || tipo === 'MASTER';
  });

  constructor(
    private userService: UserService,
    private unidadeService: UnidadeService,
    private auth: AuthService,
    private notification: NzNotificationService
  ) {}

  load(params?: Record<string, any>): void {
    this.loading.set(true);
    const merged = { ...(this.filter()), ...(params || {}) };
    forkJoin({
      logins: this.userService.listar(merged),
      unidades: this.unidadeService.listar()
    }).subscribe({
      next: ({ logins, unidades }) => {
        const unidadeMap = new Map<number, string>(unidades.map(u => [u.id!, u.nome]));
        const enriched = (logins || []).map(l => ({
          ...l,
          nomeUnidade: l.idUnidade ? (unidadeMap.get(l.idUnidade) || '') : ''
        }));
        this.users.set(enriched);
      },
      error: () => {},
      complete: () => this.loading.set(false)
    });
  }

  refresh(): void {
    this.load();
  }

  select(id: number): void {
    this.loading.set(true);
    this.userService.obterPorId(id).subscribe({
      next: u => this.selectedUser.set(u),
      error: () => {},
      complete: () => this.loading.set(false)
    });
  }

  clearSelection(): void {
    this.selectedUser.set(null);
  }

  create(payload: Login): void {
    this.userService.criar(payload).subscribe({
      next: () => {
        this.notification.success('Sucesso', 'Usuário criado');
        this.refresh();
      }
    });
  }

  update(id: number, payload: Login): void {
    this.userService.atualizar(id, payload).subscribe({
      next: () => {
        this.notification.success('Sucesso', 'Usuário atualizado');
        this.refresh();
      }
    });
  }

  remove(id: number): void {
    this.userService.deletar(id).subscribe({
      next: () => {
        this.notification.success('Sucesso', 'Usuário removido');
        this.refresh();
      }
    });
  }

  setFilter(f: Partial<{ search?: string; tipo?: string; idUnidade?: number }>): void {
    this.filter.update(prev => ({ ...prev, ...f }));
  }
}
