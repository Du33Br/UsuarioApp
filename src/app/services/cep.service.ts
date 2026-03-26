import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface EnderecoViaCep {
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

@Injectable({ providedIn: 'root' })
export class CepService {
  private readonly API = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  buscarEndereco(cep: string): Observable<EnderecoViaCep> {
    const cepLimpo = cep.replace(/\D/g, '');
    return this.http.get<ViaCepResponse>(`${this.API}/${cepLimpo}/json/`).pipe(
      map(res => {
        if (res.erro) {
          throw new Error('CEP não encontrado');
        }
        return {
          logradouro: res.logradouro || '',
          complemento: res.complemento || '',
          bairro: res.bairro || '',
          cidade: res.localidade || '',
          uf: res.uf || ''
        };
      }),
      catchError(err => throwError(() => err))
    );
  }
}
