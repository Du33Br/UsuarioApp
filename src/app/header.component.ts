import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NzLayoutModule, NzButtonModule, NzIconModule],
  template: `
    <nz-header style="display:flex;align-items:center;padding:0 16px">
      <div style="display:flex;align-items:center;gap:8px">
        <img src="/public/favicon.ico" alt="logo" style="height:32px" />
        <span class="title">Meu App</span>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <button nz-button nzType="text" aria-label="notifications"><i nz-icon nzType="bell"></i></button>
        <button nz-button nzType="default" aria-label="logout"><i nz-icon nzType="logout"></i> Sair</button>
      </div>
    </nz-header>
  `,
  styles: [`.title{font-weight:600;font-size:1.125rem}`]
})
export class HeaderComponent {}
