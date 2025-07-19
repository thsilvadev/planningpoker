export class CreateTaskDto {
  title: string;
  description: string;
  createdBy: string;
  roomId: string; // ID da sala onde a tarefa será criada
}
