import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NzLayoutModule, NzMenuModule, NzIconModule],
  template: `
    <nz-sider nzCollapsible [nzCollapsed]="collapsed" (nzCollapsedChange)="onCollapsedChange($event)" [nzCollapsedWidth]="80" style="padding:8px">
      <ul nz-menu nzMode="inline" [nzInlineCollapsed]="collapsed">
        <li nz-menu-item routerLink="/dashboard">
          <i nz-icon nzType="home"></i>
          <span *ngIf="!collapsed">Home</span>
        </li>
        <li nz-submenu>
          <span title><i nz-icon nzType="setting"></i><span *ngIf="!collapsed">Admin</span></span>
          <ul>
            <li nz-menu-item routerLink="/users">Users</li>
            <li nz-menu-item>Settings</li>
          </ul>
        </li>
        <!-- login removed from menu (use header Sair / rota /login separada) -->
      </ul>
    </nz-sider>
  `,
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  onCollapsedChange(v: boolean) {
    this.collapsed = v;
    this.collapsedChange.emit(v);
  }
}
