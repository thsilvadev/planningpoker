import { IsString, IsNotEmpty } from 'class-validator';
export class SubmitVoteDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  participantId: string;

  @IsString()
  @IsNotEmpty()
  vote: string;
}
