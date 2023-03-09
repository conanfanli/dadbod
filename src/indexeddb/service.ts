import { WithId, IExercise, IExerciseLog } from "../types";
import { v4 as uuidv4 } from "uuid";
import { DbClient } from "./client";
import { getSheetService, ISheetService } from "../googlespreadsheet/service";

export interface DbState {
  exercises: Array<WithId<IExercise>>;
  exerciseLogs: Array<IExerciseLog>;
}
export interface IEventService {
  createExercise(data: IExercise): Promise<WithId<IExercise>>;
  deleteExercise(name: string): Promise<void>;
  getState(): Promise<DbState>;
  isReadyToSync(): Promise<boolean>;
  listExercises(): Promise<Array<WithId<IExercise>>>;
  listLogs(): Promise<Array<IExerciseLog>>;
  logExercise(data: IExerciseLog): Promise<WithId<IExerciseLog>>;
}

class EventService implements IEventService {
  private db: DbClient;
  private ss: ISheetService;

  constructor() {
    this.db = new DbClient();
    this.ss = getSheetService();
  }

  public async isReadyToSync(): Promise<boolean> {
    return this.ss.hasConsent();
  }

  public async listExercises() {
    return this.db.exercises.toArray();
  }
  public async listLogs() {
    return this.db.exerciseLogs.toArray();
  }
  public async getState() {
    const exercises = await this.listExercises();
    const exerciseLogs = await this.listLogs();
    return { exercises, exerciseLogs };
  }

  public async logExercise(data: IExerciseLog) {
    let existing = await this.db.exerciseLogs.get({
      date: data.date,
      exerciseId: data.exerciseId,
    });

    const log = {
      id: existing ? existing.id : uuidv4(),
      ...data,
    };
    await this.db.exerciseLogs.put(log, log.id);
    return log;
  }
  public async createExercise(data: IExercise) {
    const item = { id: uuidv4(), ...data };
    await this.db.exercises.add(item);
    return item;
  }

  public async deleteExercise(id: string) {
    await this.db.exercises.delete(id);
  }
}

let _eventService: IEventService;
export function getEventService() {
  if (!_eventService) {
    _eventService = new EventService();
  }

  return _eventService;
}
