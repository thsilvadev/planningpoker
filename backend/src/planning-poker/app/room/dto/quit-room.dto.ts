import { IsString, IsNotEmpty } from 'class-validator';

export class QuitRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string; // ID da sala
  @IsString()
  @IsNotEmpty()
  participantId: string; // ID do participante
}
