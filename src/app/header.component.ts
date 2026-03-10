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
    <nz-header class="app-header">
      <div class="brand">
        <img src="/public/favicon.ico" alt="logo" class="logo" />
        <span class="title">Meu App</span>
      </div>
      <div class="actions">
        <button nz-button nzType="text" aria-label="notifications"><i nz-icon nzType="bell"></i></button>
        <a class="logout-corner logout-link" href="/login" aria-label="logout"><i nz-icon nzType="logout"></i></a>
      </div>
    </nz-header>
  `,
  styles: [
    `.app-header{display:flex;align-items:center;padding:0 20px;background:linear-gradient(90deg,var(--primary-color),var(--primary-light));color:#fff;position:relative}`,
    `.app-header .brand{display:flex;align-items:center;gap:12px}`,
    `.app-header .logo{height:36px}`,
    `.app-header .title{font-weight:700;font-size:1.125rem;color:rgba(255,255,255,0.98)}`,
    `.app-header .actions{margin-left:auto;display:flex;gap:12px;align-items:center;z-index:2}`,
    `.app-header .ant-btn{color:rgba(255,255,255,0.95);border-color:transparent}`,
    `.app-header .ant-btn-default{background:transparent;color:rgba(255,255,255,0.95);border:none;border-radius:var(--btn-radius);padding:6px 10px}`,
    `.app-header .ant-btn-default:hover{background:rgba(255,255,255,0.06)}`,
    `.logout-link{color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px;background:linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03));border:1px solid rgba(255,255,255,0.06);transition:all .18s ease}`,
    `.logout-link i{color:rgba(255,255,255,0.95);font-size:16px}`,
    `.logout-link span{color:#fff;font-weight:600}`,
    `.logout-link:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(10,102,194,0.12)}`,
    `.app-header .anticon{color:rgba(255,255,255,0.95)}`,
    `.logout-corner{border-radius:50%;width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;background:transparent;border:2px solid rgba(255,255,255,0.12);color:#fff;box-shadow:0 6px 18px rgba(10,102,194,0.12);pointer-events:auto;cursor:pointer;transition:transform .12s ease;margin-left:10px}`,
    `.logout-corner:hover{transform:scale(1.06)} .logout-corner i{color:#fff;font-size:18px}`,
    `.app-header .ant-btn, .ant-btn.ant-btn-default{pointer-events:auto}`,
    `@media (max-width:720px){ .app-header{padding:0 10px} .app-header .logo{height:28px} .app-header .title{font-size:1rem} .app-header .ant-btn{padding:4px 6px} .logout-corner{width:40px;height:40px;margin-left:8px} .logout-link{display:none} }`
  ]
})
export class HeaderComponent {}
