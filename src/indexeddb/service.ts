import { WithKey, IExercise, IExerciseLog } from "../types";
import { DbClient, IDbClient } from "./client";

export interface DbState {
  exercises: Array<WithKey<IExercise>>;
  exerciseLogs: Array<IExerciseLog>;
}
export interface IEventService {
  getState(): Promise<DbState>;
  logExercise(data: IExerciseLog): Promise<WithKey<IExerciseLog>>;
  addExercise(data: IExercise): Promise<WithKey<IExercise>>;
  deleteExercise(name: string): Promise<void>;
  listExercises(): Promise<Array<WithKey<IExercise>>>;
  listLogs(): Promise<Array<IExerciseLog>>;
}

class EventService implements IEventService {
  private client: IDbClient;

  constructor() {
    this.client = new DbClient();
  }

  public async listExercises() {
    return this.client.listTable<WithKey<IExercise>>("exercises");
  }
  public async listLogs() {
    return this.client.listTable<IExerciseLog>("exerciseLogs");
  }
  public async getState() {
    const exercises = await this.listExercises();
    const exerciseLogs = await this.listLogs();
    return { exercises, exerciseLogs };
  }
  public async logExercise(data: IExerciseLog) {
    return this.client.putRow("exerciseLogs", data);
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
