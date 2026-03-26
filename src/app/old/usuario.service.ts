import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { Usuario, Unidade, UsuarioListResponse } from './usuario/novo/usuario.model';
import { LoadingService } from './services/loading.service';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly base = environment.baseUrl;
  private unidades$?: Observable<Unidade[]>;
  private statuses$?: Observable<string[]>;

  constructor(private http: HttpClient, private loading: LoadingService) {}

  list(params?: any): Observable<UsuarioListResponse> {
    this.loading.start();
    return this.http.get<UsuarioListResponse>(`${this.base}/api/Usuario`, { params }).pipe(
      tap(() => this.loading.stop()),
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Usuario> {
    this.loading.start();
    const url = `${this.base}/api/Usuario/${id}`;
    // debug removed
    return this.http.get<Usuario>(url).pipe(
      tap(() => this.loading.stop()),
      catchError(this.handleError)
    );
  }

  create(u: Usuario): Observable<Usuario> {
    this.loading.start();
    // preparar payload: mapear para o DTO que o backend espera (PascalCase)
    const dto: any = mapUsuarioToApiDto(u);
    // remover id para criação
    delete dto.Id;
    // Muitos endpoints esperam wrapper { usuario: ... } e a propriedade Unidade como objeto
    // montar Unidade como objeto quando houver IdUnidade
    if (dto.IdUnidade !== undefined && dto.IdUnidade !== null) {
      dto.Unidade = { Id: Number(dto.IdUnidade), Nome: dto.Unidade || '' };
    } else {
      dto.Unidade = null;
    }
    // enviar wrapper
    const wrapper = { usuario: dto };
    // debug removed
    return this.http.post<Usuario>(`${this.base}/api/Usuario`, wrapper).pipe(
      tap(() => this.loading.stop()),
      catchError((err) => this.handleError(err))
    );
  }

  update(id: number, u: Usuario): Observable<Usuario> {
    this.loading.start();
    const dto: any = mapUsuarioToApiDto(u);
    // garantir id correto
    dto.Id = id;
    if (dto.IdUnidade !== undefined && dto.IdUnidade !== null) {
      dto.Unidade = { Id: Number(dto.IdUnidade), Nome: dto.Unidade || '' };
    } else {
      dto.Unidade = null;
    }
    const wrapper = { usuario: dto };
    // debug removed
    return this.http.put<Usuario>(`${this.base}/api/Usuario/${id}`, wrapper).pipe(
      tap(() => this.loading.stop()),
      catchError(this.handleError)
    );
  }

  // Unidades - cache com shareReplay(1)
  getUnidades(): Observable<Unidade[]> {
    if (!this.unidades$) {
      this.unidades$ = this.http.get<Unidade[]>(`${this.base}/api/Unidade`).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.unidades$;
  }

  // Status (exemplo)
  getStatuses(): Observable<string[]> {
    if (!this.statuses$) {
      this.statuses$ = this.http.get<string[]>(`${this.base}/api/Status`).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.statuses$;
  }

  // CEP lookup (exemplo usando ViaCEP pública)
  buscarCep(cep: string): Observable<any> {
    const cleaned = (cep || '').replace(/\D/g, '');
    if (!cleaned) return throwError(() => new Error('CEP inválido'));
    return this.http.get<any>(`https://viacep.com.br/ws/${cleaned}/json/`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(err: any) {
    console.error('UsuarioService error', err);
    // tentar extrair mensagem detalhada do backend
    const message = err?.error && (typeof err.error === 'string' ? err.error : err.error.message || err.error.errors || JSON.stringify(err.error));
    const status = err?.status;
    return throwError(() => ({ status, message: message || err?.message || 'Server error' }));
  }

}

function mapUsuarioToApiDto(u: any) {
  // Mapeamento conservador: usa campos do form quando disponíveis e preenche defaults
  return {
    Id: u.id ?? undefined,
    Nome: u.nome || '',
    NomeSocial: u.nomeSocial || '',
    Rg: u.rg || '',
    UF: u.uf || '',
    CEP: u.cep || '',
    CPF: u.cpf || '',
    Sexo: u.sexo || '',
    Email: u.email || '',
    Orgao: u.orgao || '',
    Bairro: u.bairro || '',
    Cidade: u.cidade || '',
    Numero: u.numero || '',
    Telefone: u.telefone || '',
    Profissao: u.profissao || '',
    Logradouro: u.logradouro || '',
    Complemento: u.complemento || '',
    NomeUserAlt: u.nomeUserAlt || '',
    NomeUserCad: u.nomeUserCad || '',
    Observacoes: u.observacoes || '',
    CertidaoNasc: u.certidaoNasc || '',
    Naturalidade: u.naturalidade || '',
    Nacionalidade: u.nacionalidade || '',
    ProblemaSaude: u.problemaSaude || '',
    NaturalidadeUf: u.naturalidadeUf || '',
    NecessidadesEspeciais: u.necessidadesEspeciais || '',
    LogradouroNumero: u.numero || '',
    // unidade mapping
    IdUnidade: (u.unidadeId !== undefined && u.unidadeId !== null) ? Number(u.unidadeId) : undefined,
    Unidade: (u.unidade && (u.unidade.nome || u.unidade)) ? (u.unidade.nome || u.unidade) : (u.unidadeNome || ''),
    // campos adicionais que backend pode esperar
    SexoId: u.sexoId || null,
    DataNascimento: u.dataNascimento || null
  };
}
