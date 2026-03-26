export interface Unidade {
  id: number;
  nome: string;
}

export interface UsuarioAgenda {
  id: number;
  descricao: string;
  data: string | null;
}

export interface UsuarioParentesco {
  id: number;
  nomeParente: string;
  parentesco: string;
  contato?: string;
}

export interface Usuario {
  id?: number;
  nome?: string;
  nomeSocial?: string | null;
  rg?: string | null;
  cpf: string;
  eol?: string | null;
  dataNascimento?: string | null; // ISO

  // Localização
  cep?: string | null;
  logradouro?: string | null;
  bairro?: string | null;
  unidadeId?: number | null;
  unidade?: Unidade | null;

  // Saúde / autorizações
  problemaSaude?: string | null;
  necessidadesEspeciais?: string | null;
  autorizacaoFoto?: boolean;
  autorizacaoTransporte?: boolean;

  // Vínculos
  usuarioAgendas?: UsuarioAgenda[];
  usuarioParentescos?: UsuarioParentesco[];

  status?: string | number;
  [key: string]: any;
}

export interface UsuarioListResponse {
  items: Usuario[];
  total?: number;
}
