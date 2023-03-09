import { DbState, WithId, IExercise, IExerciseLog } from "../types";
import { v4 as uuidv4 } from "uuid";
import { DbClient } from "./client";
import { getSheetService, ISheetService } from "../googlespreadsheet/service";

export interface IEventService {
  createExercise(data: IExercise): Promise<WithId<IExercise>>;
  deleteExercise(name: string): Promise<void>;
  getConnectedSheetName(): Promise<string>;
  getExerciseSets(filter: {
    date: string;
    exerciseId: string;
  }): Promise<Array<IExerciseLog>>;
  getState(): Promise<DbState>;
  getStateDiff(): Promise<number>;
  listExercises(): Promise<Array<WithId<IExercise>>>;
  logExercise(data: IExerciseLog): Promise<WithId<IExerciseLog>>;
  syncState(): Promise<void>;
}

class EventService implements IEventService {
  private db: DbClient;
  private ss: ISheetService;

  constructor() {
    this.db = new DbClient();
    this.ss = getSheetService();
  }

  public async getStateDiff(): Promise<number> {
    const localTimestamp = new Date(
      (await this.db.events.orderBy("createdAt").last())!.createdAt
    );
    const remoteState = await this.ss.getLatestState();
    const remoteTimeStamp = new Date(remoteState?.date || "2000-10-10");

    console.log("local ", localTimestamp, "remote ", remoteTimeStamp);
    const timeDiff = localTimestamp.getTime() - remoteTimeStamp.getTime();

    return timeDiff;
  }
  public async syncState(): Promise<void> {
    const timeDiff = await this.getStateDiff();
    if (timeDiff > 0) {
      const localState = await this.db.serialize();
      console.log("saving local state", localState);
      this.ss.saveState(JSON.stringify(localState));
    }
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
    return this.db.serialize();
  }

  // TODO: split create and update
  public async logExercise(data: IExerciseLog) {
    let existing = await this.db.exerciseLogs.get({
      date: data.date,
      exerciseId: data.exerciseId,
    });

    /*
    const log = {
      id: existing ? existing.id : uuidv4(),
      ...data,
    };
    await this.db.exerciseLogs.put(log, log.id);
    return log;
    */

    return this.db.transaction(
      "rw",
      this.db.exerciseLogs,
      this.db.events,
      async () => {
        const log = {
          id: existing ? existing.id : uuidv4(),
          ...data,
        };
        await this.db.exerciseLogs.put(log);
        if (!existing) {
          await this.db.events.add({
            id: uuidv4(),
            action: "create-exercise-log",
            createdAt: new Date().toISOString(),
            payload: log,
            entityId: log.id,
          });
        } else {
          await this.db.events.add({
            id: uuidv4(),
            action: "update-exercise-log",
            createdAt: new Date().toISOString(),
            payload: log,
            entityId: log.id,
          });
        }

        return log;
      }
    );
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
          payload: item,
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
        const existing = this.db.exercises.get(id);
        await this.db.exercises.delete(id);
        await this.db.events.add({
          id: uuidv4(),
          action: "delete-exercise",
          createdAt: new Date().toISOString(),
          entityId: id,
          payload: existing,
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
