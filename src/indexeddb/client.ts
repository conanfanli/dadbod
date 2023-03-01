export class DbClient {
  readonly DB_NAME = "workout-log";
  private _db?: IDBDatabase;
  // private exercisesStore?: IDBObjectStore;

  constructor() {
    const request = indexedDB.open(this.DB_NAME, 2);

    request.onerror = (event) => {
      console.error("error:", event);
    };
    request.onsuccess = (event) => {
      this._db = (event as any).target.result;
      console.log("success", this._db);
    };

    request.onupgradeneeded = (event) => {
      console.log("onupgradeneeded");
      this.db = request.result;
      if (event.oldVersion < 2) {
        this.db.deleteObjectStore("exercises");
      }
      this.db.createObjectStore("exercises", {
        keyPath: "name",
        autoIncrement: true,
      });
    };
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

  public addExercise() {
    console.log("addd");
    const store = this.db
      .transaction("exercises", "readwrite")
      .objectStore("exercises");
    store.add({ name: "plank" });
  }
}
