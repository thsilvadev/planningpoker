import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  creatorId: string;

  @IsString()
  @IsNotEmpty()
  roomId: string; // ID da sala onde a tarefa será criada
}
