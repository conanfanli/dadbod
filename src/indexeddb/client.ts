import { IExercise, IExerciseLog } from "../types";

export class DbClient {
  readonly DB_NAME = "workout-log";
  private _db?: IDBDatabase;
  readonly VERSION = 3;

  public async connect() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      request.onerror = (event) => {
        console.error("error:", event);
        reject(event);
      };
      request.onsuccess = (event) => {
        this._db = (event as any).target.result;
        resolve(this._db);
      };

      request.onupgradeneeded = (event) => {
        console.log(
          "onupgradeneeded",
          "oldVersion:",
          event.oldVersion,
          "latest:",
          this.VERSION
        );
        this.db = request.result;

        if (event.oldVersion < this.VERSION && event.oldVersion > 1) {
          this.db.deleteObjectStore("exercises");
        }
        this.db.createObjectStore("exercises", {
          keyPath: "name",
        });
        this.db.createObjectStore("exercise_logs", {
          keyPath: ["date", "exerciseName"],
        });

        resolve(this._db);
      };
    });
  }

  private get db() {
    if (!this._db) {
      throw new Error("DB has not been initialized");
    }
    return this._db;
  }
  private set db(v: IDBDatabase) {
    if (!v) {
      throw new Error("Cannot set db");
    }
    this._db = v;
  }

  public async getState() {
    const exercises = await this.listExercises();
    const logs = await this.listLogs();
    return { exercises, logs };
  }

  public async logExercise(data: IExerciseLog) {
    await this.connect();
    const store = this.db
      .transaction("exercise_logs", "readwrite")
      .objectStore("exercise_logs");
    store.put(data);
  }

  public async listExercises() {
    await this.connect();

    const request = this.db
      .transaction("exercises")
      .objectStore("exercises")
      .getAll();
    return new Promise<Array<IExercise>>(
      (resolve, reject) =>
        (request.onsuccess = () => {
          resolve(request.result);
        })
    );
  }
  public async listLogs() {
    await this.connect();
    const request = this.db
      .transaction("exercise_logs")
      .objectStore("exercise_logs")
      .getAll();
    return new Promise<Array<IExerciseLog>>((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }
  public async addExercise(data: { name: string; description: string }) {
    await this.connect();
    const store = this.db
      .transaction("exercises", "readwrite")
      .objectStore("exercises");
    store.put(data);
  }

  public async deleteExercise(name: string, onSuccess: () => void) {
    await this.connect();

    const request = this.db
      .transaction("exercises", "readwrite")
      .objectStore("exercises")
      .delete(name);
    request.onsuccess = (event) => {
      onSuccess();
    };
  }
}
