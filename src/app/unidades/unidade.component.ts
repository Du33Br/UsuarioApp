import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { UnidadeService, Unidade } from '../services/unidade.service';

@Component({
  selector: 'app-unidade',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzCardModule, NzPopconfirmModule, NzIconModule, NzToolTipModule, NzMessageModule],
  templateUrl: './unidade.component.html',
  styleUrls: ['./unidade.component.css']
})
export class UnidadeComponent implements OnInit {
  unidades: Unidade[] = [];
  loading = false;

  constructor(
    private router: Router,
    private unidadeService: UnidadeService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.unidadeService.listar().subscribe({
      next: res => { this.unidades = res || []; this.loading = false; },
      error: () => { this.message.error('Erro ao carregar unidades.'); this.loading = false; }
    });
  }

  novo(): void {
    this.router.navigate(['/app/unidades/novo']);
  }

  editar(u?: Unidade): void {
    if (!u || !u.id) return;
    this.router.navigate(['/app/unidades', u.id, 'editar']);
  }

  view(u?: Unidade): void {
    if (!u || !u.id) return;
    this.router.navigate(['/app/unidades', 'view', u.id]);
  }

  excluir(u?: Unidade): void {
    if (!u || !u.id) return;
    this.unidadeService.deletar(u.id).subscribe({
      next: () => { this.message.success(`Unidade "${u.nome}" excluída.`); this.load(); },
      error: () => { this.message.error('Erro ao excluir unidade.'); }
    });
  }

  confirmDelete(u?: Unidade): void {
    if (!u || !u.id) return;
    const ok = window.confirm(`Confirma exclusão da unidade "${u.nome}"?`);
    if (!ok) return;
    this.unidadeService.deletar(u.id).subscribe({
      next: () => { this.message.success(`Unidade "${u.nome}" excluída.`); this.load(); },
      error: () => { this.message.error('Erro ao excluir unidade.'); }
    });
  }

  formatarEndereco(u: Unidade): string {
    const partes: string[] = [];
    if (u.logradouro) partes.push(u.logradouro);
    if (u.numero)     partes.push(u.numero);
    if (u.complemento) partes.push(u.complemento);
    if (u.bairro)     partes.push(u.bairro);
    const localidade = [u.cidade, u.uf].filter(Boolean).join(' - ');
    if (localidade)   partes.push(localidade);
    if (u.cep)        partes.push(`CEP ${u.cep}`);
    return partes.length ? partes.join(', ') : (u.endereco || '—');
  }
}
