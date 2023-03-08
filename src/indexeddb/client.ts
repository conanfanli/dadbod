const TABLES = ["events", "exercises", "exercise_logs"] as const;

type Table = (typeof TABLES)[number];

export interface IDbClient {}

export class DbClient implements IDbClient {
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

  public async putRow<T>(table: Table, data: T) {
    const db = await this.connect();
    const store = db.transaction(table, "readwrite").objectStore(table);
    store.put(data);
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
