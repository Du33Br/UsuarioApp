import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzGridModule],
  template: `
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <nz-card style="width:300px" nzTitle="Usuários">
        <p>Resumo e métricas sobre usuários.</p>
      </nz-card>

      <nz-card style="width:300px" nzTitle="Atividades">
        <p>Últimas ações e eventos.</p>
      </nz-card>

      <nz-card style="width:300px" nzTitle="Configurações">
        <p>Ações rápidas e links.</p>
      </nz-card>
    </div>
  `
})
export class DashboardComponent {}
