export interface LoginApi {
  id: number;
  user: string;
  password?: string | null;
  dataCadastro?: string;
  dataAtualizacao?: string;
  userCadatro?: string;
  tipo?: string;
  idUnidade?: number | null;
  unidade?: string | null;
  [key: string]: any;
}

export interface UnidadeApi {
  id: number;
  dre?: string;
  nome?: string;
  apelido?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  status?: boolean;
  textoCarteirinha?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  logins?: LoginApi[];
  usuarios?: string[];
  [key: string]: any;
}
