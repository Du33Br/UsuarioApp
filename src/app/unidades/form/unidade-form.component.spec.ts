import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UnidadeFormComponent } from './unidade-form.component';
import { UnidadeService, Unidade } from '../../services/unidade.service';
import { CepService, EnderecoViaCep } from '../../services/cep.service';

const activatedRouteMock = {
  snapshot: { params: {}, data: {} }
};

describe('UnidadeFormComponent', () => {
  let component: UnidadeFormComponent;
  let fixture: ComponentFixture<UnidadeFormComponent>;
  let unidadeService: jasmine.SpyObj<UnidadeService>;
  let messageService: jasmine.SpyObj<NzMessageService>;
  let cepService: jasmine.SpyObj<CepService>;
  let router: Router;

  beforeEach(async () => {
    unidadeService = jasmine.createSpyObj('UnidadeService', ['criar', 'atualizar', 'obterPorId']);
    messageService = jasmine.createSpyObj('NzMessageService', ['success', 'error', 'warning']);
    cepService = jasmine.createSpyObj('CepService', ['buscarEndereco']);
    cepService.buscarEndereco.and.returnValue(of({
      logradouro: '', complemento: '', bairro: '', cidade: '', uf: ''
    }));

    await TestBed.configureTestingModule({
      imports: [UnidadeFormComponent, RouterTestingModule],
      providers: [
        { provide: UnidadeService, useValue: unidadeService },
        { provide: NzMessageService, useValue: messageService },
        { provide: CepService, useValue: cepService },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(UnidadeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar unidade com valores padrão', () => {
    expect(component.unidade.nome).toBe('');
    expect(component.unidade.cnpj).toBe('');
    expect(component.unidade.cep).toBe('');
    expect(component.unidade.observacoes).toBe('');
    expect(component.unidade.textoCarteirinha).toBe('');
    expect(component.readonly).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(component.saving).toBeFalse();
  });

  // ---- Testes de formatação de máscaras ----

  describe('formatarCnpj()', () => {
    it('deve formatar 14 dígitos como CNPJ completo', () => {
      expect(component.formatarCnpj('12345678000195')).toBe('12.345.678/0001-95');
    });

    it('deve formatar parcialmente enquanto digita', () => {
      expect(component.formatarCnpj('12')).toBe('12');
      expect(component.formatarCnpj('123')).toBe('12.3');
      expect(component.formatarCnpj('12345')).toBe('12.345');
      expect(component.formatarCnpj('123456')).toBe('12.345.6');
      expect(component.formatarCnpj('12345678')).toBe('12.345.678');
      expect(component.formatarCnpj('123456780001')).toBe('12.345.678/0001');
    });

    it('deve retornar string vazia para entrada vazia', () => {
      expect(component.formatarCnpj('')).toBe('');
    });
  });

  describe('formatarCep()', () => {
    it('deve formatar 8 dígitos como CEP', () => {
      expect(component.formatarCep('01310100')).toBe('01310-100');
    });

    it('deve formatar parcialmente enquanto digita', () => {
      expect(component.formatarCep('0131')).toBe('0131');
      expect(component.formatarCep('013101')).toBe('01310-1');
    });

    it('deve retornar string vazia para entrada vazia', () => {
      expect(component.formatarCep('')).toBe('');
    });
  });

  describe('formatarTelefone()', () => {
    it('deve formatar 11 dígitos como celular', () => {
      expect(component.formatarTelefone('11987654321')).toBe('(11) 98765-4321');
    });

    it('deve formatar 10 dígitos como fixo', () => {
      expect(component.formatarTelefone('1132354321')).toBe('(11) 3235-4321');
    });

    it('deve formatar parcialmente enquanto digita', () => {
      expect(component.formatarTelefone('11')).toBe('(11');
      expect(component.formatarTelefone('119')).toBe('(11) 9');
      expect(component.formatarTelefone('11987')).toBe('(11) 987');
      expect(component.formatarTelefone('119876')).toBe('(11) 9876');
      expect(component.formatarTelefone('1198765')).toBe('(11) 9876-5');
    });

    it('deve retornar string vazia para entrada vazia', () => {
      expect(component.formatarTelefone('')).toBe('');
    });
  });

  // ---- Testes dos handlers de ngModelChange ----

  describe('onCnpjChange()', () => {
    it('deve formatar e atribuir ao modelo', () => {
      component.onCnpjChange('12345678000195');
      expect(component.unidade.cnpj).toBe('12.345.678/0001-95');
    });

    it('deve ignorar caracteres não numéricos na entrada', () => {
      component.onCnpjChange('12.345.678/0001-95');
      expect(component.unidade.cnpj).toBe('12.345.678/0001-95');
    });
  });

  describe('onCepChange()', () => {
    it('deve formatar e atribuir ao modelo', () => {
      component.onCepChange('01310100');
      expect(component.unidade.cep).toBe('01310-100');
    });
  });

  describe('onTelefoneChange()', () => {
    it('deve formatar celular e atribuir ao modelo', () => {
      component.onTelefoneChange('11987654321');
      expect(component.unidade.telefone).toBe('(11) 98765-4321');
    });
  });

  // ---- Testes de salvar (criar) ----

  describe('salvar() — criar', () => {
    it('deve chamar unidadeService.criar e navegar ao ter sucesso', () => {
      unidadeService.criar.and.returnValue(of({ id: 1, nome: 'Teste', observacoes: '', textoCarteirinha: '' }));
      const navigateSpy = spyOn(router, 'navigate');
      component.unidade.nome = 'Teste';

      component.salvar();

      expect(unidadeService.criar).toHaveBeenCalled();
      expect(messageService.success).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/app/unidades']);
    });

    it('deve chamar criar sem máscara nos campos (sanitizado)', () => {
      unidadeService.criar.and.returnValue(of({ id: 1, nome: 'Teste', observacoes: '', textoCarteirinha: '' }));
      component.unidade.cnpj = '12.345.678/0001-95';
      component.unidade.cep = '01310-100';
      component.unidade.telefone = '(11) 98765-4321';
      component.unidade.observacoes = 'Obs';
      component.unidade.textoCarteirinha = 'Carteirinha';

      component.salvar();

      const payload = unidadeService.criar.calls.mostRecent().args[0] as Unidade;
      expect(payload.cnpj).toBe('12345678000195');
      expect(payload.cep).toBe('01310100');
      expect(payload.telefone).toBe('11987654321');
      expect(payload.observacoes).toBe('Obs');
      expect(payload.textoCarteirinha).toBe('Carteirinha');
    });

    it('deve mostrar mensagem de erro e manter saving=false ao falhar', () => {
      unidadeService.criar.and.returnValue(throwError(() => new Error('500')));

      component.salvar();

      expect(messageService.error).toHaveBeenCalled();
      expect(component.saving).toBeFalse();
    });
  });

  // ---- Testes de salvar (editar) ----

  describe('salvar() — editar', () => {
    beforeEach(() => {
      component.id = 1;
    });

    it('deve chamar unidadeService.atualizar e navegar ao ter sucesso', () => {
      unidadeService.atualizar.and.returnValue(of({ id: 1, nome: 'Editada', observacoes: '', textoCarteirinha: '' }));
      const navigateSpy = spyOn(router, 'navigate');

      component.salvar();

      expect(unidadeService.atualizar).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(messageService.success).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/app/unidades']);
    });

    it('deve mostrar erro ao falhar na atualização', () => {
      unidadeService.atualizar.and.returnValue(throwError(() => new Error('401')));

      component.salvar();

      expect(messageService.error).toHaveBeenCalled();
      expect(component.saving).toBeFalse();
    });
  });

  // ---- Testes de modo readonly ----

  describe('salvar() — readonly', () => {
    it('deve navegar sem salvar quando readonly=true', () => {
      component.readonly = true;
      const navigateSpy = spyOn(router, 'navigate');

      component.salvar();

      expect(unidadeService.criar).not.toHaveBeenCalled();
      expect(unidadeService.atualizar).not.toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/app/unidades']);
    });
  });

  // ---- Testes de cancelar ----

  describe('cancelar()', () => {
    it('deve navegar para /app/unidades', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.cancelar();
      expect(navigateSpy).toHaveBeenCalledWith(['/app/unidades']);
    });
  });

  // ---- Testes de busca de endereço por CEP ----

  describe('buscarEndereco()', () => {
    const mockEndereco: EnderecoViaCep = {
      logradouro: 'Avenida Paulista',
      complemento: '',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP'
    };

    it('deve preencher os campos de endereço ao encontrar o CEP', () => {
      cepService.buscarEndereco.and.returnValue(of(mockEndereco));

      component.buscarEndereco('01310100');

      expect(component.unidade.logradouro).toBe('Avenida Paulista');
      expect(component.unidade.bairro).toBe('Bela Vista');
      expect(component.unidade.cidade).toBe('São Paulo');
      expect(component.unidade.uf).toBe('SP');
      expect(component.buscandoCep).toBeFalse();
      expect(messageService.success).toHaveBeenCalled();
    });

    it('deve preencher complemento apenas se estiver vazio', () => {
      cepService.buscarEndereco.and.returnValue(of({ ...mockEndereco, complemento: 'Bloco A' }));
      component.unidade.complemento = '';

      component.buscarEndereco('01310100');

      expect(component.unidade.complemento).toBe('Bloco A');
    });

    it('não deve sobrescrever complemento já preenchido', () => {
      cepService.buscarEndereco.and.returnValue(of({ ...mockEndereco, complemento: 'Bloco A' }));
      component.unidade.complemento = 'Sala 10';

      component.buscarEndereco('01310100');

      expect(component.unidade.complemento).toBe('Sala 10');
    });

    it('deve exibir warning e manter buscandoCep=false quando CEP não for encontrado', () => {
      cepService.buscarEndereco.and.returnValue(throwError(() => new Error('CEP não encontrado')));

      component.buscarEndereco('99999999');

      expect(messageService.warning).toHaveBeenCalled();
      expect(component.buscandoCep).toBeFalse();
    });

    it('não deve buscar endereço no modo readonly', () => {
      component.readonly = true;
      component.buscarEndereco('01310100');
      expect(cepService.buscarEndereco).not.toHaveBeenCalled();
    });
  });

  describe('onCepChange()', () => {
    it('deve acionar buscarEndereco automaticamente ao completar 8 dígitos', () => {
      cepService.buscarEndereco.and.returnValue(of({
        logradouro: 'Av. Test', complemento: '', bairro: 'Bairro', cidade: 'Cidade', uf: 'SP'
      }));
      const spy = spyOn(component, 'buscarEndereco').and.callThrough();

      component.onCepChange('01310100');

      expect(spy).toHaveBeenCalledWith('01310100');
    });

    it('não deve acionar buscarEndereco com menos de 8 dígitos', () => {
      const spy = spyOn(component, 'buscarEndereco');

      component.onCepChange('0131');

      expect(spy).not.toHaveBeenCalled();
    });

    it('deve formatar o CEP corretamente ao digitar', () => {
      spyOn(component, 'buscarEndereco');
      component.onCepChange('01310100');
      expect(component.unidade.cep).toBe('01310-100');
    });
  });
});

