import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from './usuario.model';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule, NzTableModule, NzPaginationModule, NzButtonModule, NzIconModule, NzSpinModule],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuarioComponent implements OnInit {
  users = signal<Usuario[]>([]);
  loading = signal(true);
  pageIndex = signal(1);
  pageSize = signal(10);
  total = signal(0);

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.load();
  }

  load(page = this.pageIndex(), pageSize = this.pageSize()): void {
    this.loading.set(true);
    const params: any = { page, pageSize };
    this.usuarioService.list(params).subscribe({
      next: (res: any) => {
        const items = res?.items ?? res ?? [];
        this.users.set(items);
        this.total.set(res?.total ?? (items.length || 0));
        this.loading.set(false);
      },
      error: () => {
        this.users.set([]);
        this.total.set(0);
        this.loading.set(false);
      }
    });
  }

  onPageIndexChange(idx: number) {
    this.pageIndex.set(idx);
    this.load();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.load();
  }
}
