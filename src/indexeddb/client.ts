import { IExercise, IExerciseLog } from "../types";

const TABLES = ["events", "exercises", "exercise_logs"] as const;

type Table = (typeof TABLES)[number];

export class DbClient {
  readonly DB_NAME = "workout-log";
  private _db?: IDBDatabase;
  readonly VERSION = 3;
  private _openRequest: IDBOpenDBRequest;

  public constructor() {
    console.log("init db client");
    this._openRequest = indexedDB.open(this.DB_NAME, this.VERSION);
  }
  public async connect() {
    const self = this;
    return new Promise<IDBDatabase>((resolve, reject) => {
      if (self._db) {
        resolve(self._db);
      }

      self._openRequest.onerror = (event) => {
        console.error("error:", event);
        reject(event);
      };
      self._openRequest.onsuccess = () => {
        self._db = this._openRequest.result;
        console.log("connect", self._db);
        resolve(self._db);
      };

      self._openRequest.onupgradeneeded = (event) => {
        console.log(
          "onupgradeneeded",
          "oldVersion:",
          event.oldVersion,
          "latest:",
          self.VERSION
        );
        self._db = self._openRequest.result;

        if (event.oldVersion < this.VERSION && event.oldVersion > 1) {
          self._db.deleteObjectStore("exercises");
        }
        self._db.createObjectStore("exercises", {
          keyPath: "name",
        });
        self._db.createObjectStore("exercise_logs", {
          keyPath: ["date", "exerciseName"],
        });

        resolve(self._db);
      };
    });
  }

  public async getState() {
    const exercises = await this.listTable<IExercise>("exercises");
    const logs = await this.listTable<IExerciseLog>("exercise_logs");
    return { exercises, logs };
  }

  public async logExercise(data: IExerciseLog) {
    const db = await this.connect();
    const store = db
      .transaction("exercise_logs", "readwrite")
      .objectStore("exercise_logs");
    store.put(data);
  }

  public async listTable<T>(table: Table) {
    const db = await this.connect();
    const query = db.transaction(table).objectStore(table).getAll();
    return new Promise<Array<T>>((resolve, reject) => {
      query.onsuccess = () => {
        resolve(query.result);
      };
      query.onerror = (event) => {
        console.error("failed to list table ", event);
        reject(event);
      };
    });
  }

  public async addExercise(data: { name: string; description: string }) {
    const db = await this.connect();
    const store = db
      .transaction("exercises", "readwrite")
      .objectStore("exercises");
    store.put(data);
  }

  public async deleteExercise(name: string, onSuccess: () => void) {
    const db = await this.connect();

    const request = db
      .transaction("exercises", "readwrite")
      .objectStore("exercises")
      .delete(name);
    request.onsuccess = (event) => {
      onSuccess();
    };
  }
}
