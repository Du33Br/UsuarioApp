import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UnidadeService, Unidade } from '../../services/unidade.service';
import { CepService } from '../../services/cep.service';

@Component({
  selector: 'app-unidade-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NzInputModule, NzButtonModule, NzCardModule, NzFormModule, NzMessageModule, NzSpinModule, NzIconModule],
  templateUrl: './unidade-form.component.html',
  styleUrls: ['./unidade-form.component.css']
})
export class UnidadeFormComponent implements OnInit {
  unidade: Unidade = {
    nome: '',
    apelido: '',
    cnpj: '',
    dre: '',
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    observacoes: '',
    textoCarteirinha: ''
  };
  id?: number;
  readonly = false;
  loading = false;
  saving = false;
  buscandoCep = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private unidadeService: UnidadeService,
    private message: NzMessageService,
    private cepService: CepService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : undefined;
    this.readonly = !!(this.route.snapshot.data?.['readonly']);
    if (this.id) {
      this.loading = true;
      this.unidadeService.obterPorId(this.id).subscribe({
        next: u => {
          this.unidade = {
            ...u,
            cnpj: this.formatarCnpj((u.cnpj || '').replace(/\D/g, '').slice(0, 14)),
            cep: this.formatarCep((u.cep || '').replace(/\D/g, '').slice(0, 8)),
            telefone: this.formatarTelefone((u.telefone || '').replace(/\D/g, '').slice(0, 11)),
          };
          this.loading = false;
        },
        error: () => {
          this.message.error('Erro ao carregar unidade.');
          this.loading = false;
        }
      });
    }
  }

  salvar(): void {
    if (this.readonly) { this.router.navigate(['/app/unidades']); return; }
    const payload = this.sanitizar(this.unidade);
    this.saving = true;
    if (this.id) {
      this.unidadeService.atualizar(this.id, payload).subscribe({
        next: () => {
          this.message.success('Unidade atualizada com sucesso!');
          this.router.navigate(['/app/unidades']);
        },
        error: () => {
          this.message.error('Erro ao atualizar unidade. Verifique sua sessão e tente novamente.');
          this.saving = false;
        }
      });
      return;
    }
    this.unidadeService.criar(payload).subscribe({
      next: () => {
        this.message.success('Unidade criada com sucesso!');
        this.router.navigate(['/app/unidades']);
      },
      error: () => {
        this.message.error('Erro ao criar unidade. Verifique sua sessão e tente novamente.');
        this.saving = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/app/unidades']);
  }

  // ---- Handlers de máscara (chamados via (ngModelChange)) ----

  onCnpjChange(value: string): void {
    this.unidade.cnpj = this.formatarCnpj((value || '').replace(/\D/g, '').slice(0, 14));
  }

  onCepChange(value: string): void {
    const digitos = (value || '').replace(/\D/g, '').slice(0, 8);
    this.unidade.cep = this.formatarCep(digitos);
    if (digitos.length === 8) {
      this.buscarEndereco(digitos);
    }
  }

  buscarEndereco(cep: string): void {
    if (this.readonly) return;
    this.buscandoCep = true;
    this.cepService.buscarEndereco(cep).subscribe({
      next: endereco => {
        this.unidade.logradouro = endereco.logradouro;
        this.unidade.bairro     = endereco.bairro;
        this.unidade.cidade     = endereco.cidade;
        this.unidade.uf         = endereco.uf;
        // preenche complemento apenas se a API retornar e o campo estiver vazio
        if (endereco.complemento && !this.unidade.complemento) {
          this.unidade.complemento = endereco.complemento;
        }
        this.buscandoCep = false;
        this.message.success('Endereço preenchido automaticamente.');
      },
      error: () => {
        this.buscandoCep = false;
        this.message.warning('CEP não encontrado. Preencha o endereço manualmente.');
      }
    });
  }

  onTelefoneChange(value: string): void {
    this.unidade.telefone = this.formatarTelefone((value || '').replace(/\D/g, '').slice(0, 11));
  }

  // ---- Formatadores (public para facilitar testes) ----

  formatarCnpj(v: string): string {
    if (!v) return '';
    if (v.length <= 2) return v;
    if (v.length <= 5) return `${v.slice(0, 2)}.${v.slice(2)}`;
    if (v.length <= 8) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`;
    if (v.length <= 12) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8)}`;
    return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12)}`;
  }

  formatarCep(v: string): string {
    if (!v) return '';
    if (v.length <= 5) return v;
    return `${v.slice(0, 5)}-${v.slice(5)}`;
  }

  formatarTelefone(v: string): string {
    if (!v) return '';
    if (v.length <= 2) return `(${v}`;
    if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  }

  // ---- Remove máscara antes de enviar à API ----

  private sanitizar(u: Unidade): Unidade {
    return {
      ...u,
      cnpj: (u.cnpj || '').replace(/\D/g, '') || undefined,
      cep: (u.cep || '').replace(/\D/g, '') || undefined,
      telefone: (u.telefone || '').replace(/\D/g, '') || undefined,
    };
  }
}
