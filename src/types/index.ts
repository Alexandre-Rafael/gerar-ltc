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
