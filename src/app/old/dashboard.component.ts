import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PageTitleComponent } from './page-title.component';

interface Invoice { id: string; client: string; value: number; status: 'paid' | 'pending' | 'overdue' }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzGridModule, NzButtonModule, NzTableModule, NzPaginationModule, NzTagModule, NzIconModule, PageTitleComponent],
  template: `
    <div class="dashboard">
      <app-page-title title="Painel - Contabilidade" subtitle="Visão geral financeira"></app-page-title>

      <div class="kpis">
        <nz-card class="kpi" nzBordered>
          <div class="kpi-label">Receita (Mês)</div>
          <div class="kpi-value">R$ 124.560</div>
          <div class="kpi-sub">+8.4% vs mês anterior</div>
        </nz-card>

        <nz-card class="kpi" nzBordered>
          <div class="kpi-label">Despesas (Mês)</div>
          <div class="kpi-value danger">R$ 76.230</div>
          <div class="kpi-sub">-4.1% vs mês anterior</div>
        </nz-card>

        <nz-card class="kpi" nzBordered>
          <div class="kpi-label">Lucro</div>
          <div class="kpi-value">R$ 48.330</div>
          <div class="kpi-sub">Margem 38.8%</div>
        </nz-card>

        <nz-card class="kpi" nzBordered>
          <div class="kpi-label">Clientes Ativos</div>
          <div class="kpi-value">342</div>
          <div class="kpi-sub">+12 novos / mês</div>
        </nz-card>
      </div>

      <div class="mid-row">
        <nz-card class="chart-card" nzTitle="Fluxo de Caixa (últimos 7 dias)">
          <div class="bars">
            <div *ngFor="let b of cashflow" class="bar-wrap">
              <div class="bar" [style.height.%]="b"></div>
            </div>
          </div>
        </nz-card>

        <nz-card class="table-card" nzTitle="Últimas faturas">
          <nz-table [nzData]="displayInvoices" nzSize="small">
            <thead>
              <tr><th>ID</th><th>Cliente</th><th>Valor</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let i of displayInvoices">
                <td>{{i.id}}</td>
                <td>{{i.client}}</td>
                <td>R$ {{i.value | number:'1.2-2'}}</td>
                <td>
                  <nz-tag [nzColor]="i.status === 'paid' ? 'green' : (i.status === 'overdue' ? 'red' : 'orange')">{{i.status}}</nz-tag>
                </td>
              </tr>
            </tbody>
          </nz-table>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
            <div>Exibindo {{displayInvoices.length}} de {{invoices.length}} registros</div>
            <nz-pagination
              [nzPageIndex]="pageIndex"
              [nzTotal]="invoices.length"
              [nzPageSize]="pageSize"
              [nzPageSizeOptions]="pageSizeOptions"
              [nzShowSizeChanger]="true"
              (nzPageIndexChange)="onPageIndexChange($event)"
              (nzPageSizeChange)="onPageSizeChange($event)">
            </nz-pagination>
          </div>
        </nz-card>
      </div>

      <div class="bottom-row">
        <nz-card nzTitle="Atividades recentes">
          <ul class="activities">
            <li *ngFor="let a of activities">{{a}}</li>
          </ul>
        </nz-card>
      </div>
    </div>
  `,
  styles: [
    `.dashboard{padding:8px 4px}`,
    `.kpis{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px}`,
    `.kpi{flex:1;min-width:200px;padding:12px}`,
    `.kpi-label{color:rgba(0,0,0,0.45);font-size:0.9rem}`,
    `.kpi-value{font-size:1.4rem;font-weight:700;margin-top:6px}`,
    `.kpi-value.danger{color:#d32029}`,
    `.kpi-sub{color:rgba(0,0,0,0.45);margin-top:6px}`,
    `.mid-row{display:flex;gap:12px;flex-wrap:wrap}`,
    `.chart-card{flex:1;min-width:280px}`,
    `.table-card{flex:1.2;min-width:320px}`,
    `.bars{display:flex;align-items:flex-end;height:120px;gap:8px;padding:8px 0}`,
    `.bar-wrap{flex:1;display:flex;align-items:flex-end}`,
    `.bar{width:100%;background:linear-gradient(180deg,var(--primary-color),var(--primary-light));border-radius:4px}`,
    `.activities{margin:0;padding-left:16px}`,
    `::ng-deep .table-card .ant-table-pagination { display: none !important; }`,
    `::ng-deep .table-card .ant-pagination.ant-table-pagination { display: none !important; }`,
    `@media (max-width:720px){ .kpis{flex-direction:column} .mid-row{flex-direction:column} .logout-link{display:none} }`
  ]
})
export class DashboardComponent {
  cashflow = [60, 72, 55, 80, 90, 70, 85];

  invoices: Invoice[] = [
    { id: 'FAT-1001', client: 'ACME Ltda', value: 12500.5, status: 'paid' },
    { id: 'FAT-1002', client: 'Beta SA', value: 4200, status: 'pending' },
    { id: 'FAT-1003', client: 'Gamma ME', value: 890.75, status: 'overdue' },
    { id: 'FAT-1004', client: 'Delta LTDA', value: 2130, status: 'paid' },
    { id: 'FAT-1005', client: 'Epsilon', value: 5400, status: 'pending' }
  ];

  // pagination
  displayInvoices: Invoice[] = [];
  pageIndex = 1;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];

  activities = [
    'Recebimento de R$12500 registrado (FAT-1001)',
    'Envio de cobrança para Beta SA (FAT-1002)',
    'Notificação de vencimento para Gamma ME (FAT-1003)',
    'Relatório mensal gerado',
    'Novo cliente cadastrado: Zeta Comércio'
  ];
  
  ngOnInit(): void {
    this.updateDisplayInvoices();
  }

  updateDisplayInvoices() {
    const start = (this.pageIndex - 1) * this.pageSize;
    this.displayInvoices = this.invoices.slice(start, start + this.pageSize);
  }

  onPageIndexChange(idx: number) {
    this.pageIndex = idx;
    this.updateDisplayInvoices();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageIndex = 1;
    this.updateDisplayInvoices();
  }
}
