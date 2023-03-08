import type { WithKey } from "../types";
const TABLES = ["events", "exercises", "exerciseLogs"] as const;

type Table = (typeof TABLES)[number];

export interface IDbClient {
  listTable<T>(table: Table): Promise<Array<T>>;
  putRow<T>(table: Table, data: T): Promise<WithKey<T>>;
  deleteRow(table: Table, key: string): Promise<void>;
}

export class DbClient implements IDbClient {
  readonly DB_NAME = "workout-log";
  readonly LATEST_VERSION = 6;
  private _openRequest: IDBOpenDBRequest;
  private _db?: IDBDatabase;

  public constructor() {
    console.log("init db client");
    this._openRequest = indexedDB.open(this.DB_NAME, this.LATEST_VERSION);
  }

  private migrate(event: IDBVersionChangeEvent) {
    const self = this;
    const db = self!._db;
    const version = event.oldVersion;

    if (!db) {
      throw new Error("db not available");
    }

    // Destroy existing db
    if (version >= 2 && version < self.LATEST_VERSION) {
      db.deleteObjectStore("exercises");
      db.deleteObjectStore("exerciseLogs");
      db.deleteObjectStore("exercise_logs");
      db.deleteObjectStore("events");
    }

    // Create new tables
    // exercises: key, name, description
    const exercisesStore = db.createObjectStore("exercises", {
      autoIncrement: true,
    });
    exercisesStore.createIndex("name", "name", { unique: true });

    // exerciseLogs: date, exerciseKey, createdAt
    const logStore = db.createObjectStore("exerciseLogs", {
      keyPath: ["date", "exerciseKey"],
    });
    logStore.createIndex("createdAt", "createdAt", { unique: false });

    // events: key, createdAt, action, entityKey
    const eventStore = db.createObjectStore("events", {
      autoIncrement: true,
    });
    eventStore.createIndex("createdAt", "createdAt", { unique: false });
    eventStore.createIndex("action", "action", { unique: false });
    eventStore.createIndex("entityKey", "entityKey", { unique: false });
  }

  private async connect() {
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
          self.LATEST_VERSION
        );
        self._db = self._openRequest.result;
        self.migrate(event);

        resolve(self._db);
      };
    });
  }

  public async listTable<T>(table: Table) {
    const db = await this.connect();
    const query = db.transaction(table).objectStore(table).getAll();
    return new Promise<Array<T>>((resolve, reject) => {
      query.onsuccess = (event) => {
        console.log("query.result", query.result);
        console.log("query", query);
        console.log("event", event);
        resolve(query.result);
      };
      query.onerror = (event) => {
        console.error("failed to list table ", event);
        reject(event);
      };
    });
  }

  public async putRow<T>(table: Table, data: T) {
    const db = await this.connect();
    const store = db.transaction(table, "readwrite").objectStore(table);

    const query = store.put(data);
    return new Promise<WithKey<T>>((resolve, reject) => {
      query.onsuccess = () => {
        resolve({ ...data, key: query.result.toString() });
      };
      query.onerror = (event) => {
        console.error("failed to delte row", event);
        reject(event);
      };
    });
  }

  public async deleteRow(table: Table, key: string) {
    const db = await this.connect();

    const query = db
      .transaction(table, "readwrite")
      .objectStore(table)
      .delete(key);

    return new Promise<void>((resolve, reject) => {
      query.onsuccess = () => {
        resolve();
      };
      query.onerror = (event) => {
        console.error("failed to delte row", event);
        reject(event);
      };
    });
  }
}
