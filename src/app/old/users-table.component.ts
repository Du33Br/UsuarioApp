import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { Router } from '@angular/router';
import { UserStateService } from '../state/user-state.service';
import { AuthService } from '../services/auth.service';
import { PageTitleComponent } from '../page-title.component';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

interface User {
  id: number;
  name: string;
  user?: string;
  email: string;
  role: string;
  active: boolean;
  tipo?: string;
  cpf?: string;
  eol?: string;
  unidade?: string;
}

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzTagModule, NzInputModule, NzIconModule, NzPaginationModule, NzPageHeaderModule, NzBadgeModule, NzToolTipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="users-page" style="padding:16px">
      <nz-page-header nzTitle="Gestão de Logins" [nzGhost]="false">
        <ng-template #nzExtra>
          <nz-input-group nzSuffixIcon="search" style="width:360px; margin-right:12px">
            <input nz-input placeholder="Pesquisar por nome, CPF ou unidade" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange($event)" />
          </nz-input-group>
          <button nz-button nzType="primary" (click)="newLogin()"><i nz-icon nzType="plus"></i>&nbsp;Novo Login</button>
          <button nz-button nzType="default" style="margin-left:8px" (click)="newUsuario()"><i nz-icon nzType="user-add"></i>&nbsp;Novo Usuário</button>
        </ng-template>
      </nz-page-header>

      <nz-table nzBordered nzSize="small" [nzData]="displayData">
        <thead>
            <tr>
            <th>Login</th>
            <th>Tipo</th>
            <th>CPF</th>
            <th>EOL</th>
            <th>Unidade</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of displayData">
            <td>{{ item['user'] || item['name'] }}</td>
            <td>
              <nz-tag [nzColor]="tagColor(item['tipo'])">{{ item['tipo'] || '—' }}</nz-tag>
            </td>
            <td>{{ item['cpf'] || '—' }}</td>
            <td>{{ item['eol'] || '—' }}</td>
            <td>{{ item['unidade'] || '—' }}</td>
            <td><nz-badge [nzStatus]="item['active'] ? 'success' : 'default'" [nzText]="item['active'] ? 'Ativo' : 'Inativo'"></nz-badge></td>
            <td class="actions-cell">
              <button nz-button nzType="default" nzSize="small" nz-tooltip nzTitle="Ver" (click)="view(item)"><i nz-icon nzType="eye"></i></button>
              <button nz-button nzType="primary" nzSize="small" nz-tooltip nzTitle="Editar" (click)="edit(item)"><i nz-icon nzType="edit"></i></button>
              <button *ngIf="item?.user" nz-button nzType="default" nzSize="small" nz-tooltip nzTitle="Excluir" (click)="confirmDelete(item)" style="margin-left:6px"><i nz-icon nzType="delete"></i></button>
            </td>
          </tr>
        </tbody>
      </nz-table>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
        <div>Exibindo {{displayData.length}} de {{filteredData.length}} registros</div>
        <nz-pagination
          [nzPageIndex]="pageIndex"
          [nzTotal]="filteredData.length"
          [nzPageSize]="pageSize"
          [nzPageSizeOptions]="pageSizeOptions"
          [nzShowSizeChanger]="true"
          (nzPageIndexChange)="onPageIndexChange($event)"
          (nzPageSizeChange)="onPageSizeChange($event)">
        </nz-pagination>
      </div>

        <div style="margin-top:12px; display:flex; justify-content:flex-end">
          <button nz-button nzType="primary" (click)="newLogin()"><i nz-icon nzType="plus"></i>&nbsp;Novo Login</button>
          <button nz-button nzType="default" style="margin-left:8px" (click)="newUsuario()"><i nz-icon nzType="user-add"></i>&nbsp;Novo Usuário</button>
      </div>
    </div>
  `,
  styles: [
    `.users-page .actions-cell button{margin-right:8px}`,
    `@media (max-width: 720px){ .users-page table, .users-page thead, .users-page tbody, .users-page th, .users-page td, .users-page tr { display:block } .users-page thead{display:none} .users-page tr{margin-bottom:12px} .users-page td{padding:8px 0} }`,
    `/* Hide any internal table pagination so only our external pagination is visible */`,
    `::ng-deep .users-page .ant-table-pagination { display: none !important; }`,
    `::ng-deep .users-page .ant-pagination.ant-table-pagination { display: none !important; }`
  ]
})
export class UsersTableComponent implements OnInit {
  listOfData: User[] = [];
  pageIndex = 1;
  pageSize = 10;
  pageSizeOptions = [6, 10, 20, 50];
  searchTerm = '';
  sortKey: string | null = null;
  sortValue: any = null;
  // use a simple signal for compact UI state (per request)
  compact = signal(true);

  constructor(public router: Router, private userState: UserStateService, private auth: AuthService) {}

  ngOnInit(): void {
    this.userState.load();
  }

  confirmDelete(item: any) {
    if (!item || !item.id) return;
    const ok = window.confirm(`Confirma exclusão do login "${item.user || item.name}"?`);
    if (!ok) return;
    // use the state service to remove and refresh
    try { this.userState.remove(item.id); } catch (e) { console.error(e); }
  }

  get users() {
    return this.userState.users as unknown as any;
  }

  get filteredData(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    return (this.users() || []).filter((u: any) => {
      const name = (u as any).user || (u as any).name || '';
      const unidade = (u as any).unidade || '';
      const cpf = (u as any).cpf || '';
      return !term || name.toLowerCase().includes(term) || String(unidade).toLowerCase().includes(term) || String(cpf).includes(term);
    });
  }

  get displayData(): any[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  onSearchChange(val: string) {
    this.searchTerm = val;
    this.pageIndex = 1;
  }

  onPageIndexChange(idx: number) {
    this.pageIndex = idx;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageIndex = 1;
  }

  view(u: any) {
    // Se o item for um Login (possui campo `user`), abrir perfil do login
    if (u && u.user) {
      this.router.navigate(['/app', 'perfil', u.id]);
      return;
    }
    this.router.navigate(['/app', 'logins', 'view', u.id]);
  }
  edit(u: any) {
    // editar login vs editar usuario
    if (u && u.user) {
      this.router.navigate(['/app', 'perfil', u.id]);
      return;
    }
    this.router.navigate(['/app', 'logins', 'edit', u.id]);
  }



  newLogin() {
    this.router.navigate(['/app', 'perfil', 'novo']);
  }

  newUsuario() {
    this.router.navigate(['/app', 'usuario', 'novo']);
  }

  tagColor(tipo?: string) {
    const t = String(tipo || '').toUpperCase();
    switch (t) {
      case 'MASTER_GERAL':
      case 'MASTER':
      case 'GERAL':
        return 'gold';
      case 'MASTER_UNIDADE':
      case 'UNIDADE':
        return 'blue';
      case 'USER':
      default:
        return 'default';
    }
  }
}
