import { IExercise, IExerciseLog } from "../types";
import { DbClient } from "./client";

export interface IEventService {
  getState(): Promise<{
    exercises: Array<IExercise>;
    logs: Array<IExerciseLog>;
  }>;
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
    return this.client.getState();
  }
  public async logExercise(data: IExerciseLog) {
    return this.client.logExercise(data);
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
