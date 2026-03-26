import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CepService, ViaCepResponse } from './cep.service';

describe('CepService', () => {
  let service: CepService;
  let http: HttpTestingController;

  const mockViaCep: ViaCepResponse = {
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    complemento: 'de 1 a 610 - lado par',
    bairro: 'Bela Vista',
    localidade: 'São Paulo',
    uf: 'SP'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CepService]
    });
    service = TestBed.inject(CepService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve chamar API ViaCEP e retornar endereço normalizado', () => {
    service.buscarEndereco('01310100').subscribe(res => {
      expect(res.logradouro).toBe('Avenida Paulista');
      expect(res.bairro).toBe('Bela Vista');
      expect(res.cidade).toBe('São Paulo');
      expect(res.uf).toBe('SP');
      expect(res.complemento).toBe('de 1 a 610 - lado par');
    });

    const req = http.expectOne('https://viacep.com.br/ws/01310100/json/');
    expect(req.request.method).toBe('GET');
    req.flush(mockViaCep);
  });

  it('deve remover máscara do CEP antes de chamar a API', () => {
    service.buscarEndereco('01310-100').subscribe();

    const req = http.expectOne('https://viacep.com.br/ws/01310100/json/');
    expect(req.request.url).toContain('01310100');
    req.flush(mockViaCep);
  });

  it('deve lançar erro quando ViaCEP retornar { erro: true }', (done) => {
    service.buscarEndereco('99999999').subscribe({
      next: () => fail('Deveria ter lançado erro'),
      error: err => {
        expect(err.message).toBe('CEP não encontrado');
        done();
      }
    });

    const req = http.expectOne('https://viacep.com.br/ws/99999999/json/');
    req.flush({ erro: true });
  });

  it('deve lançar erro em caso de falha HTTP', (done) => {
    service.buscarEndereco('00000000').subscribe({
      next: () => fail('Deveria ter lançado erro'),
      error: err => {
        expect(err).toBeTruthy();
        done();
      }
    });

    const req = http.expectOne('https://viacep.com.br/ws/00000000/json/');
    req.error(new ProgressEvent('error'));
  });

  it('deve retornar strings vazias para campos ausentes na resposta', () => {
    service.buscarEndereco('01310100').subscribe(res => {
      expect(res.complemento).toBe('');
      expect(res.logradouro).toBe('');
    });

    const req = http.expectOne('https://viacep.com.br/ws/01310100/json/');
    req.flush({ cep: '01310-100', logradouro: '', complemento: '', bairro: 'Bela Vista', localidade: 'São Paulo', uf: 'SP' });
  });
});
