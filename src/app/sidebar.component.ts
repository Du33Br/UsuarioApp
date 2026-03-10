import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, NzLayoutModule, NzMenuModule, NzIconModule],
  template: `
    <nz-sider nzCollapsible style="padding:8px">
      <ul nz-menu nzMode="inline">
        <li nz-menu-item>
          <i nz-icon nzType="home"></i>
          <span>Home</span>
        </li>
        <li nz-submenu nzTitle="Admin">
          <span title><i nz-icon nzType="setting"></i><span>Admin</span></span>
          <ul>
            <li nz-menu-item>Users</li>
            <li nz-menu-item>Settings</li>
          </ul>
        </li>
      </ul>
    </nz-sider>
  `,
})
export class SidebarComponent {}
