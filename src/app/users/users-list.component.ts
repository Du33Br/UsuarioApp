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
import { NzCardModule } from 'ng-zorro-antd/card';
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
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzTagModule, NzInputModule, NzIconModule, NzPaginationModule, NzCardModule, NzBadgeModule, NzToolTipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="users-page" style="padding:16px">
      <nz-card>
        <div class="page-topbar">
          <h2 class="page-title">{{ isLogins() ? 'Gerenciar Logins' : 'Gestão de Usuários' }}</h2>
          <div class="topbar-actions">
            <nz-input-group nzSuffixIcon="search" class="search-input">
              <input nz-input [placeholder]="isLogins() ? 'Pesquisar por login ou unidade' : 'Pesquisar por nome, CPF ou unidade'" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange($event)" />
            </nz-input-group>
            <button *ngIf="!isLogins()" nz-button nzType="primary" (click)="newUsuario()"><i nz-icon nzType="plus"></i>&nbsp;Usuários</button>
            <button *ngIf="isLogins()" nz-button nzType="primary" (click)="newLogin()"><i nz-icon nzType="plus"></i>&nbsp;Novo Login</button>
          </div>
        </div>

      <nz-table nzBordered nzSize="small" [nzData]="displayData" [nzLoading]="isLogins() && userState.loading()">
        <!-- Colunas de Logins -->
        <thead *ngIf="isLogins(); else usuarioHeader">
          <tr>
            <th>Login</th>
            <th>Tipo</th>
            <th>Unidade</th>
            <th>Status</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>

        <!-- Colunas de Usuários -->
        <ng-template #usuarioHeader>
          <thead>
            <tr>
              <th style="width:80px">ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Unidade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
        </ng-template>

        <tbody>
          <tr *ngFor="let item of displayData">
            <!-- Logins row -->
            <ng-container *ngIf="isLogins(); else usuarioRow">
              <td>{{ item['user'] || '—' }}</td>
              <td>
                <nz-tag [nzColor]="tagColor(item['tipo'])">{{ item['tipo'] || '—' }}</nz-tag>
              </td>
              <td>{{ item['nomeUnidade'] || (item['idUnidade'] ? 'Unidade ' + item['idUnidade'] : '—') }}</td>
              <td><nz-badge [nzStatus]="item['status'] === 'Ativo' ? 'success' : 'default'" [nzText]="item['status'] || 'Inativo'"></nz-badge></td>
              <td class="actions-cell">
                <button nz-button nzType="default" nzSize="small" nz-tooltip nzTitle="Ver" (click)="view(item)"><i nz-icon nzType="eye"></i></button>
                <button nz-button nzType="primary" nzSize="small" nz-tooltip nzTitle="Editar" (click)="edit(item)"><i nz-icon nzType="edit"></i></button>
                <button nz-button nzType="default" nzSize="small" nz-tooltip nzTitle="Excluir" (click)="confirmDelete(item)"><i nz-icon nzType="delete"></i></button>
              </td>
            </ng-container>

            <!-- Usuários row -->
            <ng-template #usuarioRow>
              <td>{{ item['id'] || '—' }}</td>
              <td>{{ item['nome'] || item['name'] || '—' }}</td>
              <td>{{ item['cpf'] || '—' }}</td>
              <td>{{ item['unidade']?.nome || item['unidade'] || '—' }}</td>
              <td><nz-badge [nzStatus]="item['status'] === 'Ativo' || item['active'] ? 'success' : 'default'" [nzText]="item['status'] === 'Ativo' || item['active'] ? 'Ativo' : 'Inativo'"></nz-badge></td>
              <td class="actions-cell">
                <button nz-button nzType="default" nzSize="small" nz-tooltip nzTitle="Ver" (click)="view(item)"><i nz-icon nzType="eye"></i></button>
                <button nz-button nzType="primary" nzSize="small" nz-tooltip nzTitle="Editar" (click)="edit(item)"><i nz-icon nzType="edit"></i></button>
              </td>
            </ng-template>
          </tr>
        </tbody>
      </nz-table>

      <div class="table-footer">
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
      </nz-card>
    </div>
  `,
  styles: [
    `.users-page .page-topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}`,
    `.users-page .page-title{margin:0}`,
    `.users-page .topbar-actions{display:flex;align-items:center;gap:12px}`,
    `.users-page .search-input{width:360px}`,
    `.users-page .table-footer{display:flex;justify-content:space-between;align-items:center;margin-top:12px}`,
    `.users-page .actions-cell{white-space:nowrap;display:flex;gap:6px;justify-content:flex-end;align-items:center}`,
    `@media (max-width: 920px){ .users-page .page-topbar{flex-direction:column;align-items:stretch} .users-page .topbar-actions{flex-direction:column;align-items:stretch} .users-page .search-input{width:100%} .users-page .table-footer{flex-direction:column;align-items:flex-start;gap:8px} }`,
    `@media (max-width: 720px){ .users-page table, .users-page thead, .users-page tbody, .users-page th, .users-page td, .users-page tr { display:block } .users-page thead{display:none} .users-page tr{margin-bottom:12px} .users-page td{padding:8px 0} }`,
    `/* Hide any internal table pagination so only our external pagination is visible */`,
    `::ng-deep .users-page .ant-table-pagination { display: none !important; }`,
    `::ng-deep .users-page .ant-pagination.ant-table-pagination { display: none !important; }`
  ]
})
export class UsersListComponent implements OnInit {
  listOfData: User[] = [];
  pageIndex = 1;
  pageSize = 10;
  pageSizeOptions = [6, 10, 20, 50];
  searchTerm = '';
  sortKey: string | null = null;
  sortValue: any = null;
  compact = signal(true);

  constructor(public router: Router, public userState: UserStateService, private auth: AuthService) {}

  ngOnInit(): void { this.userState.load(); }

  confirmDelete(item: any) { if (!item || !item.id) return; const ok = window.confirm(`Confirma exclusão do login "${item.user || item.name}"?`); if (!ok) return; try { this.userState.remove(item.id); } catch (e) { console.error(e); } }

  get users() { return this.userState.users as unknown as any; }

  get filteredData(): any[] { const term = this.searchTerm.trim().toLowerCase(); return (this.users() || []).filter((u: any) => { const name = (u as any).user || (u as any).name || ''; const unidade = (u as any).nomeUnidade || (u as any).unidade || ''; const cpf = (u as any).cpf || ''; return !term || name.toLowerCase().includes(term) || String(unidade).toLowerCase().includes(term) || String(cpf).includes(term); }); }

  get displayData(): any[] { const start = (this.pageIndex - 1) * this.pageSize; return this.filteredData.slice(start, start + this.pageSize); }

  onSearchChange(val: string) { this.searchTerm = val; this.pageIndex = 1; }

  onPageIndexChange(idx: number) { this.pageIndex = idx; }

  onPageSizeChange(size: number) { this.pageSize = size; this.pageIndex = 1; }

  view(u: any) {
    if (this.isLogins()) {
      this.router.navigate(['/app', 'logins', 'view', u.id]);
      return;
    }
    // usuários: abrir view/edição no admin de usuário
    this.router.navigate(['/app', 'admin', 'usuario', u.id]);
  }

  edit(u: any) {
    if (this.isLogins()) {
      this.router.navigate(['/app', 'logins', 'edit', u.id]);
      return;
    }
    this.router.navigate(['/app', 'admin', 'usuario', u.id]);
  }

  newLogin() { this.router.navigate(['/app', 'logins', 'novo']); }
  newUsuario() { this.router.navigate(['/app', 'usuario', 'novo']); }

  isLogins(): boolean { return !!(this.router && this.router.url && this.router.url.indexOf('/app/logins') !== -1); }

  tagColor(tipo?: string) { const t = String(tipo || '').toUpperCase(); switch (t) { case 'MASTER_GERAL': case 'MASTER': case 'GERAL': return 'gold'; case 'MASTER_UNIDADE': case 'UNIDADE': return 'blue'; case 'USER': default: return 'default'; } }
}
