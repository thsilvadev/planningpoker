export interface Participant {
  id: string;
  name: string;
  vote?: number | string;
  hasVoted: boolean;
}
