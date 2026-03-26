import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PageTitleComponent } from '../page-title.component';

interface Invoice { id: string; client: string; value: number; status: 'paid' | 'pending' | 'overdue' }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzGridModule, NzButtonModule, NzTableModule, NzPaginationModule, NzTagModule, NzIconModule, PageTitleComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
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
