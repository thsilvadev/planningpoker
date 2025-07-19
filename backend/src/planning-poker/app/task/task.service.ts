import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Task } from './interfaces/task.interface';

@Injectable()
export class TaskService {
  createTask(title: string, description: string): Task {
    // Criar uma nova tarefa com um ID único e o nome do moderador
    const newTask: Task = {
      id: uuid(),
      title,
      description,
      createdAt: new Date(),
      status: 'waiting',
      votes: {},
    };

    return newTask;
  }
}
