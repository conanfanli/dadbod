import type { IEvent, IExercise, IExerciseLog, WithId } from "../types";
import Dexie, { Table as DexieTable } from "dexie";

export class DbClient extends Dexie {
  static readonly DB_NAME = "workout-log";
  static readonly LATEST_VERSION = 13;

  exercises!: DexieTable<WithId<IExercise>>;
  exerciseLogs!: DexieTable<WithId<IExerciseLog>>;
  events!: DexieTable<WithId<IEvent>>;

  public constructor() {
    super(DbClient.DB_NAME);
    this.version(DbClient.LATEST_VERSION).stores({
      exercises: "id, &name",
      exerciseLogs: "id, &[date+exerciseId]",
      events: "id, action, entityId, createdAt",
    });
    console.log("inited db client");
  }
}
