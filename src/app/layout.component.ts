import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { MainComponent } from './main.component';
import { FooterComponent } from './footer.component';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, MainComponent, FooterComponent, NzLayoutModule],
  template: `
    <div class="layout">
      <app-header></app-header>
      <div class="content-area">
        <aside class="sidebar"><app-sidebar></app-sidebar></aside>
        <main class="main"><app-main></app-main></main>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `.layout{display:flex;flex-direction:column;min-height:100vh}`,
    `.content-area{display:flex;flex:1}`,
    `.sidebar{width:240px;border-right:1px solid #e6e6e6;padding:1rem}`,
    `.main{flex:1;padding:1rem}`
  ]
})
export class LayoutComponent {}
