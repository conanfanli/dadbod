import { WithId, IExercise, IExerciseLog } from "../types";
import { v4 as uuidv4 } from "uuid";
import { DbClient, IDbClient } from "./client";

export interface DbState {
  exercises: Array<WithId<IExercise>>;
  exerciseLogs: Array<IExerciseLog>;
}
export interface IEventService {
  getState(): Promise<DbState>;
  logExercise(data: IExerciseLog): Promise<WithId<IExerciseLog>>;
  addExercise(data: IExercise): Promise<WithId<IExercise>>;
  deleteExercise(name: string): Promise<void>;
  listExercises(): Promise<Array<WithId<IExercise>>>;
  listLogs(): Promise<Array<IExerciseLog>>;
}

class EventService implements IEventService {
  private client: IDbClient;

  constructor() {
    this.client = new DbClient();
  }

  public async listExercises() {
    return this.client.listTable<WithId<IExercise>>("exercises");
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
    let existing = await this.client.getByIndex<WithId<IExerciseLog>>(
      "exerciseLogs",
      "date-exerciseId",
      [data.date, data.exerciseId]
    );

    return this.client.putRow<WithId<IExerciseLog>>("exerciseLogs", {
      id: existing ? existing.id : uuidv4(),
      ...data,
    });
  }
  public async addExercise(data: IExercise) {
    const id = uuidv4();
    return this.client.putRow<WithId<IExercise>>("exercises", {
      id,
      ...data,
    });
  }
  public async deleteExercise(id: string) {
    return this.client.deleteRow("exercises", id);
  }
}

let _eventService: IEventService;
export function getEventService() {
  if (!_eventService) {
    _eventService = new EventService();
  }

  return _eventService;
}
