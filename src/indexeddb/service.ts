import { IExercise, IExerciseLog } from "../types";
import { DbClient } from "./client";

export interface DbState {
  exercises: Array<IExercise>;
  exercise_logs: Array<IExerciseLog>;
}
export interface IEventService {
  getState(): Promise<DbState>;
  logExercise(data: IExerciseLog): Promise<void>;
  addExercise(data: IExercise): Promise<void>;
  deleteExercise(name: string): Promise<void>;
  listExercises(): Promise<Array<IExercise>>;
  listLogs(): Promise<Array<IExerciseLog>>;
}

class EventService implements IEventService {
  private client: DbClient;

  constructor() {
    this.client = new DbClient();
  }

  public async listExercises() {
    return this.client.listTable<IExercise>("exercises");
  }
  public async listLogs() {
    return this.client.listTable<IExerciseLog>("exercise_logs");
  }
  public async getState() {
    const exercises = await this.listExercises();
    const exercise_logs = await this.listLogs();
    return { exercises, exercise_logs };
  }
  public async logExercise(data: IExerciseLog) {
    return this.client.putRow("exercise_logs", data);
  }
  public async addExercise(data: IExercise) {
    return this.client.putRow<IExercise>("exercises", data);
  }
  public async deleteExercise(key: string) {
    return this.client.deleteRow("exercises", key);
  }
}

let _eventService: IEventService;
export function getEventService() {
  if (!_eventService) {
    _eventService = new EventService();
  }

  return _eventService;
}
