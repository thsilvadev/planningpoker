import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
  @IsString()
  @IsNotEmpty()
  creatorId: string;
}
