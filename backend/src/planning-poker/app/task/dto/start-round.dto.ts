import { IsString, IsNotEmpty } from 'class-validator';
export class StartRoundDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsNotEmpty()
  creatorId: string;
}
