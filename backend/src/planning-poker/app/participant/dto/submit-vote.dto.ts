export class SubmitVoteDto {
  roomId: string;
  participantId: string;
  vote: number | string; // tipo "?" também é possível
}
