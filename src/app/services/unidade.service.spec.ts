import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UnidadeService, Unidade } from './unidade.service';

describe('UnidadeService', () => {
  let service: UnidadeService;
  let http: HttpTestingController;

  const mockUnidade: Unidade = {
    id: 1,
    nome: 'Unidade Central',
    apelido: 'Central',
    cnpj: '12345678000195',
    dre: '01',
    email: 'central@empresa.com',
    telefone: '11987654321',
    cep: '01310100',
    logradouro: 'Av. Paulista',
    numero: '1000',
    complemento: 'Sala 10',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    observacoes: 'Obs padrão',
    textoCarteirinha: 'Texto carteirinha padrão'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UnidadeService]
    });
    service = TestBed.inject(UnidadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('listar()', () => {
    it('deve fazer GET /api/Unidade e retornar lista', () => {
      const mock: Unidade[] = [mockUnidade, { id: 2, nome: 'Filial Norte', observacoes: '', textoCarteirinha: '' }];
      service.listar().subscribe(res => {
        expect(res.length).toBe(2);
        expect(res[0].nome).toBe('Unidade Central');
      });
      const req = http.expectOne('/api/Unidade');
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });
  });

  describe('obterPorId()', () => {
    it('deve fazer GET /api/Unidade/:id', () => {
      service.obterPorId(1).subscribe(res => {
        expect(res.id).toBe(1);
        expect(res.nome).toBe('Unidade Central');
      });
      const req = http.expectOne('/api/Unidade/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockUnidade);
    });
  });

  describe('criar()', () => {
    it('deve fazer POST /api/Unidade com body correto', () => {
      const payload: Unidade = { nome: 'Nova Unidade', cnpj: '12345678000195', observacoes: 'test', textoCarteirinha: 'cart' };
      service.criar(payload).subscribe(res => {
        expect(res.id).toBe(99);
      });
      const req = http.expectOne('/api/Unidade');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ ...payload, id: 99 });
    });
  });

  describe('atualizar()', () => {
    it('deve fazer PUT /api/Unidade/:id com body correto', () => {
      const payload: Unidade = { nome: 'Atualizada', cnpj: '98765432000188', observacoes: 'obs', textoCarteirinha: 'cart' };
      service.atualizar(1, payload).subscribe(res => {
        expect(res.nome).toBe('Atualizada');
      });
      const req = http.expectOne('/api/Unidade/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({ id: 1, ...payload });
    });
  });

  describe('deletar()', () => {
    it('deve fazer DELETE /api/Unidade/:id', () => {
      service.deletar(1).subscribe(res => expect(res).toBeTruthy());
      const req = http.expectOne('/api/Unidade/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('listarAtivas()', () => {
    it('deve fazer GET /api/Unidade/ativas', () => {
      service.listarAtivas().subscribe(res => expect(res).toEqual([]));
      const req = http.expectOne('/api/Unidade/ativas');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('buscarPorCnpj()', () => {
    it('deve fazer GET /api/Unidade/cnpj/:cnpj', () => {
      service.buscarPorCnpj('12345678000195').subscribe(res => {
        expect(res.id).toBe(1);
      });
      const req = http.expectOne('/api/Unidade/cnpj/12345678000195');
      expect(req.request.method).toBe('GET');
      req.flush(mockUnidade);
    });
  });

  describe('JSON padrão da Unidade', () => {
    it('payload completo deve ter todos os campos esperados', () => {
      const payload: Unidade = {
        nome: 'Escola Estadual',
        apelido: 'EE Centro',
        cnpj: '12345678000195',
        dre: 'DRE-01',
        email: 'ee@escola.edu.br',
        telefone: '11987654321',
        cep: '01310100',
        logradouro: 'Av. Paulista',
        numero: '1000',
        complemento: 'Bloco A',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
        observacoes: 'Escola pública estadual',
        textoCarteirinha: 'Aluno Regular'
      };
      service.criar(payload).subscribe(res => {
        expect(res).toEqual(jasmine.objectContaining({ nome: 'Escola Estadual' }));
      });
      const req = http.expectOne('/api/Unidade');
      expect(req.request.body.cnpj).toBe('12345678000195');
      expect(req.request.body.uf).toBe('SP');
      expect(req.request.body.observacoes).toBe('Escola pública estadual');
      expect(req.request.body.textoCarteirinha).toBe('Aluno Regular');
      req.flush({ id: 1, ...payload });
    });
  });
});
