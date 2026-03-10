import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, NzLayoutModule],
  template: `
    <nz-content style="padding:16px">
      <div class="main-content">
        <h1>Bem-vindo</h1>
        <p>Área principal do aplicativo. Substitua por suas rotas ou componentes.</p>
      </div>
    </nz-content>
  `,
  styles: [`.main-content{padding:1rem}`]
})
export class MainComponent {}
