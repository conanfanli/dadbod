import { DbState, WithId, IExercise, IExerciseLog, IWorkout } from "../types";
import { v4 as uuidv4 } from "uuid";
import { DbClient } from "./client";
import { getSheetService, ISheetService } from "../googlespreadsheet/service";

export interface IEventService {
  getConnectedSheetName(): Promise<string>;

  //States
  /**
   * Return the time difference between local state and remote state
   */
  getStateDiff(): Promise<number>;
  getLocalState(): Promise<DbState>;
  getRevision(source: "local" | "remote"): Promise<Date>;
  syncState(): Promise<void>;

  // Exercises
  createExercise(data: IExercise): Promise<WithId<IExercise>>;
  deleteExercise(name: string): Promise<void>;
  getExercise(id: string): Promise<WithId<IExercise>>;
  updateExercise(data: WithId<IExercise>): Promise<WithId<IExercise>>;
  getExerciseSets(filter: {
    date: string;
    exerciseId: string;
  }): Promise<Array<IExerciseLog>>;
  listExercises(): Promise<Array<WithId<IExercise>>>;
  logExercise(data: IExerciseLog): Promise<WithId<IExerciseLog>>;

  //Workouts
  getWorkouts(id?: string): Promise<WithId<IWorkout>[]>;
  updateWorkout(data: WithId<IWorkout>): Promise<WithId<IWorkout>>;
}

class EventService implements IEventService {
  private local: DbClient;
  private remote: ISheetService;

  constructor() {
    this.local = new DbClient();
    this.remote = getSheetService();
  }

  public async getWorkouts(id?: string): Promise<WithId<IWorkout>[]> {
    if (!id) {
      return this.local.workouts.toArray();
    }
    const workout = await this.local.workouts.get(id);
    if (!workout) {
      return [];
    }
    return [workout];
  }
  public async getExercise(id: string): Promise<WithId<IExercise>> {
    const ret = await this.local.exercises.get(id);
    if (!ret) {
      throw new Error(`cannot find exercise with id = ${id}`);
    }

    return ret;
  }
  public async getRevision(source: "local" | "remote"): Promise<Date> {
    if (source === "local") {
      return (await this.local.getRevision()) || new Date("1907-01-01");
    }
    const remoteState = await this.remote.getLatestState();
    const remoteRevision = remoteState
      ? remoteState.revision
      : new Date("1907-01-01");
    return remoteRevision;
  }

  public async getStateDiff(): Promise<number> {
    const localRevision = await this.getRevision("local");
    const remoteRevision = await this.getRevision("remote");
    const timeDiff = localRevision.getTime() - remoteRevision.getTime();
    return timeDiff;
  }

  public async syncState(): Promise<void> {
    const timeDiff = await this.getStateDiff();
    if (timeDiff > 0) {
      const localState = await this.local.serialize();
      await this.remote.saveState(JSON.stringify(localState));
    } else if (timeDiff < 0) {
      const remoteState = await this.remote.getLatestState();
      if (!remoteState) {
        throw new Error("no remote state available");
      }
      await this.local.loadRemoteState(remoteState);
    }
  }

  public async getConnectedSheetName(): Promise<string> {
    if (!(await this.remote.hasConsent())) {
      return "";
    }
    return this.remote.getSheetName();
  }

  public async listExercises() {
    return this.local.exercises.toArray();
  }
  public async getExerciseSets(filter: { date: string; exerciseId: string }) {
    return this.local.exerciseLogs.where(filter).toArray();
  }

  public async getLocalState() {
    return this.local.serialize();
  }

  // TODO: split create and update
  public async logExercise(data: IExerciseLog) {
    let existing = await this.local.exerciseLogs.get({
      date: data.date,
      exerciseId: data.exerciseId,
    });

    return this.local.transaction(
      "rw",
      this.local.exerciseLogs,
      this.local.events,
      async () => {
        const log = {
          id: existing ? existing.id : uuidv4(),
          ...data,
        };
        await this.local.exerciseLogs.put(log);
        if (!existing) {
          await this.local.events.add({
            id: uuidv4(),
            action: "create-exercise-log",
            createdAt: new Date(),
            payload: log,
            entityId: log.id,
          });
        } else {
          await this.local.events.add({
            id: uuidv4(),
            action: "update-exercise-log",
            createdAt: new Date(),
            payload: log,
            entityId: log.id,
          });
        }

        return log;
      }
    );
  }
  public async createExercise(data: IExercise) {
    return this.local.transaction(
      "rw",
      this.local.exercises,
      this.local.events,
      async () => {
        const item = { id: uuidv4(), ...data };
        await this.local.exercises.add(item);
        await this.local.events.add({
          id: uuidv4(),
          action: "create-exercise",
          createdAt: new Date(),
          entityId: item.id,
          payload: item,
        });
        return item;
      }
    );
  }
  public async updateWorkout(
    data: WithId<IWorkout>
  ): Promise<WithId<IWorkout>> {
    console.log("update-workout", data);
    return this.local.transaction(
      "rw",
      this.local.workouts,
      this.local.events,
      async () => {
        await this.local.workouts.put(data);
        await this.local.events.add({
          id: uuidv4(),
          action: "update-workout",
          createdAt: new Date(),
          entityId: data.id,
          payload: data,
        });
        return data;
      }
    );
  }
  public async updateExercise(data: WithId<IExercise>) {
    return this.local.transaction(
      "rw",
      this.local.exercises,
      this.local.events,
      async () => {
        await this.local.exercises.put(data);
        await this.local.events.add({
          id: uuidv4(),
          action: "update-exercise",
          createdAt: new Date(),
          entityId: data.id,
          payload: data,
        });
        console.log("update-exercise", data);
        return data;
      }
    );
  }

  public async deleteExercise(id: string) {
    return this.local.transaction(
      "rw",
      this.local.exercises,
      this.local.events,
      this.local.exerciseLogs,
      async () => {
        const existing = await this.local.exercises.get(id);
        await this.local.exercises.delete(id);
        await this.local.exerciseLogs.where({ exerciseId: id }).delete();
        await this.local.events.add({
          id: uuidv4(),
          action: "delete-exercise",
          createdAt: new Date(),
          entityId: id,
          payload: existing || {},
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
