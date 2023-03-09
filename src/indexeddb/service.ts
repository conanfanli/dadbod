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
  getConnectedSheetName(): Promise<string>;
  listExercises(): Promise<Array<WithId<IExercise>>>;
  getExerciseSets(filter: {
    date: string;
    exerciseId: string;
  }): Promise<Array<IExerciseLog>>;
  logExercise(data: IExerciseLog): Promise<WithId<IExerciseLog>>;
}

class EventService implements IEventService {
  private db: DbClient;
  private ss: ISheetService;

  constructor() {
    this.db = new DbClient();
    this.ss = getSheetService();
  }

  public async getConnectedSheetName(): Promise<string> {
    if (!(await this.ss.hasConsent())) {
      return "";
    }
    return this.ss.getSheetName();
  }

  public async listExercises() {
    return this.db.exercises.toArray();
  }
  public async getExerciseSets(filter: { date: string; exerciseId: string }) {
    return this.db.exerciseLogs.where(filter).toArray();
  }
  public async getState() {
    const exercises = await this.listExercises();
    const exerciseLogs = await this.db.exerciseLogs.toArray();
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
    return this.db.transaction(
      "rw",
      this.db.exercises,
      this.db.events,
      async () => {
        const item = { id: uuidv4(), ...data };
        await this.db.exercises.add(item);
        await this.db.events.add({
          id: uuidv4(),
          action: "create-exercise",
          createdAt: new Date().toISOString(),
          entityId: item.id,
        });
        return item;
      }
    );
  }

  public async deleteExercise(id: string) {
    return this.db.transaction(
      "rw",
      this.db.exercises,
      this.db.events,
      async () => {
        await this.db.exercises.delete(id);
        await this.db.events.add({
          id: uuidv4(),
          action: "delete-exercise",
          createdAt: new Date().toISOString(),
          entityId: id,
        });
      }
    );
  }
}

let _eventService: IEventService;
export function getEventService() {
  if (!_eventService) {
    _eventService = new EventService();
  }

  return _eventService;
}
