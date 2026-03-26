import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Unidade {
  id?: number;
  nome: string;
  apelido?: string;
  cnpj?: string;
  dre?: string;
  email?: string;
  telefone?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  endereco?: string;
  status?: string;
  /** Obrigatório pela API */
  observacoes: string;
  /** Obrigatório pela API */
  textoCarteirinha: string;
}

@Injectable({ providedIn: 'root' })
export class UnidadeService {
  private apiUrl = '/api/Unidade';

  constructor(private http: HttpClient) {}

  listar(): Observable<Unidade[]> {
    return this.http.get<Unidade[]>(this.apiUrl);
  }

  obterPorId(id: number): Observable<Unidade> {
    return this.http.get<Unidade>(`${this.apiUrl}/${id}`);
  }

  criar(unidade: Unidade): Observable<Unidade> {
    return this.http.post<Unidade>(this.apiUrl, unidade);
  }

  atualizar(id: number, unidade: Unidade): Observable<Unidade> {
    return this.http.put<Unidade>(`${this.apiUrl}/${id}`, unidade);
  }

  deletar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  listarAtivas(): Observable<Unidade[]> {
    return this.http.get<Unidade[]>(`${this.apiUrl}/ativas`);
  }

  buscarPorCnpj(cnpj: string): Observable<Unidade> {
    return this.http.get<Unidade>(`${this.apiUrl}/cnpj/${cnpj}`);
  }
}
