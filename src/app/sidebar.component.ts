import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NzLayoutModule, NzMenuModule, NzIconModule, NzAvatarModule],
  template: `
    <nz-sider nzCollapsible [nzCollapsed]="collapsed" (nzCollapsedChange)="onCollapsedChange($event)" [nzCollapsedWidth]="80" style="padding:8px">
      <div class="user-panel" [class.collapsed]="collapsed">
        <ng-container *ngIf="userAvatar; else defaultAvatar">
          <nz-avatar [nzSrc]="userAvatar" nzSize="large"></nz-avatar>
        </ng-container>
        <ng-template #defaultAvatar>
          <nz-avatar nzIcon="user" nzSize="large"></nz-avatar>
        </ng-template>
        <div class="user-info" *ngIf="!collapsed">
          <div class="user-name">{{userName}}</div>
          <div class="user-role">{{userRole}}</div>
        </div>
      </div>
      <ul nz-menu nzMode="inline" [nzInlineCollapsed]="collapsed">
        <li nz-menu-item routerLink="/dashboard">
          <i nz-icon nzType="home"></i>
          <span *ngIf="!collapsed">Home</span>
        </li>
        <li nz-submenu>
          <span title><i nz-icon nzType="setting"></i><span *ngIf="!collapsed">Admin</span></span>
          <ul>
            <li nz-menu-item routerLink="/users">Users</li>
            <li nz-menu-item routerLink="/clients">Clients</li>
            <li nz-menu-item>Settings</li>
          </ul>
        </li>
      </ul>
    </nz-sider>
  `,
  styles: [
    `.user-panel{display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px;margin-bottom:8px;background:linear-gradient(90deg,rgba(10,102,194,0.06),rgba(95,177,255,0.03))}`,
    `.user-panel.collapsed{justify-content:center;padding:8px}`,
    `.user-info{display:flex;flex-direction:column}`,
    `.user-name{font-weight:700;color:var(--primary-color)}`,
    `.user-role{font-size:0.85rem;color:rgba(0,0,0,0.45)}`
  ],
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  userName = 'João Silva';
  userRole = 'Contador';
  // set to a string URL when the user has an uploaded avatar, otherwise keep null
  userAvatar: string | null = null;

  onCollapsedChange(v: boolean) {
    this.collapsed = v;
    this.collapsedChange.emit(v);
  }
}
