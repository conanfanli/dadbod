import type { WithId } from "../types";
const TABLES = ["events", "exercises", "exerciseLogs"] as const;

type Table = (typeof TABLES)[number];

export interface IDbClient {
  listTable<T>(table: Table): Promise<Array<T>>;
  putRow<T extends { id: string }>(table: Table, data: T): Promise<T>;
  deleteRow(table: Table, id: string): Promise<void>;
  getByIndex<T extends { id: string }>(
    table: Table,
    indexName: string,
    value: string | string[]
  ): Promise<T>;
}

export class DbClient implements IDbClient {
  readonly DB_NAME = "workout-log";
  readonly LATEST_VERSION = 9;
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
      db.deleteObjectStore("events");
    }

    // Create new tables
    // exercises: id, name, description
    const exercisesStore = db.createObjectStore("exercises", {
      keyPath: "id",
    });
    exercisesStore.createIndex("name", "name", { unique: true });

    // exerciseLogs: date, exerciseId, createdAt
    const logStore = db.createObjectStore("exerciseLogs", {
      keyPath: "id",
    });
    logStore.createIndex("date-exerciseId", ["date", "exerciseId"], {
      unique: true,
    });

    // events: id, createdAt, action, entityId
    const eventStore = db.createObjectStore("events", {
      keyPath: "id",
    });
    eventStore.createIndex("createdAt", "createdAt", { unique: false });
    eventStore.createIndex("action", "action", { unique: false });
    eventStore.createIndex("entityId", "entityId", { unique: false });
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
      query.onsuccess = () => {
        resolve(query.result);
      };
      query.onerror = (event) => {
        console.error("failed to list table ", event);
        reject(event);
      };
    });
  }

  public async getByIndex<T extends { id: string }>(
    table: Table,
    indexName: string,
    value: string | string[]
  ) {
    const db = await this.connect();
    const index = db.transaction(table).objectStore(table).index(indexName);
    const query = index.get(value);

    return new Promise<T>((resolve, reject) => {
      query.onsuccess = () => {
        resolve(query.result);
      };
      query.onerror = (event) => {
        console.error("failed to list table ", event);
        reject(event);
      };
    });
  }

  public async putRow<T extends { id: string }>(table: Table, data: T) {
    const db = await this.connect();
    const store = db.transaction(table, "readwrite").objectStore(table);

    const query = store.put(data);
    return new Promise<WithId<T>>((resolve, reject) => {
      query.onsuccess = () => {
        resolve(data);
      };
      query.onerror = (event) => {
        console.error("failed to put row", event, data);
        reject(event);
      };
    });
  }

  public async deleteRow(table: Table, id: string) {
    const db = await this.connect();

    const query = db
      .transaction(table, "readwrite")
      .objectStore(table)
      .delete(id);

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
