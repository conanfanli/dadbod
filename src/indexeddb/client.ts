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
      // const request = indexedDB.open(this.DB_NAME, this.VERSION);
      console.log("before", self._db);
      if (self._db) {
        console.log("already connected");
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
    const exercises = await this.listExercises();
    const logs = await this.listLogs();
    return { exercises, logs };
  }

  public async logExercise(data: IExerciseLog) {
    const db = await this.connect();
    const store = db
      .transaction("exercise_logs", "readwrite")
      .objectStore("exercise_logs");
    store.put(data);
  }

  public async listExercises() {
    const db = await this.connect();

    const request = db
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
    const db = await this.connect();
    const request = db
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
