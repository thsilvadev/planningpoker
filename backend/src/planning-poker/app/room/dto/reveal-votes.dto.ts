import { IsString, IsNotEmpty } from 'class-validator';

export class RevealVotesDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  creatorId: string;
}
