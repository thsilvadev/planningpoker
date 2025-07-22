import { IsString, IsNotEmpty } from 'class-validator';
import { Vote } from '../../task/interfaces/task.interface';
export class SubmitVoteDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  participantId: string;

  @IsString()
  @IsNotEmpty()
  vote: Vote;
}
