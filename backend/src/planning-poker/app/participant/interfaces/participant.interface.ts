export type Vote = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '20'; // Valores possíveis para o voto

export interface Participant {
  id: string;
  name: string;
  hasVoted: boolean; // Mudança: de vote para hasVoted
}
