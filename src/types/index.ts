export interface Jogo {
  casa: string;
  fora: string;
  campo: string;
  data: string;
  hora: string;
}

export interface Divisao {
  key: string;
  label: string;
  jogos: Jogo[];
}

export interface DivisaoUpload {
  key: string;
  label: string;
  arquivo: File | null;
  processando: boolean;
  jogos: Jogo[];
  erro: string | null;
}

export interface ClassificacaoItem {
  pos: number;
  time: string;
  pts: number;
  j: number;
  v: number;
  e: number;
  d: number;
  sg: number;
}

export interface DivisaoClassificacaoUpload {
  key: string;
  label: string;
  arquivo: File | null;
  processando: boolean;
  tabela: ClassificacaoItem[];
  erro: string | null;
}
