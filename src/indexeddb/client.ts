export class DbClient {
  readonly DB_NAME = "workout-log";
  private _db?: IDBDatabase;
  readonly VERSION = 2;

  constructor(onSuccess) {
    const request = indexedDB.open(this.DB_NAME, this.VERSION);

    request.onerror = (event) => {
      console.error("error:", event);
    };
    request.onsuccess = (event) => {
      this._db = (event as any).target.result;
      onSuccess(this);
      // console.log("success", this._db);
    };

    request.onupgradeneeded = (event) => {
      console.log("onupgradeneeded");
      this.db = request.result;
      if (event.oldVersion < this.VERSION && event.oldVersion > 1) {
        this.db.deleteObjectStore("exercises");
      }
      this.db.createObjectStore("exercises", {
        keyPath: "name",
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

  public listExercises(onSuccess) {
    const request = this.db
      .transaction("exercises")
      .objectStore("exercises")
      .getAll();
    request.onsuccess = () => {
      onSuccess(request.result);
    };
  }
  public addExercise(data: { name: string; description: string }) {
    const store = this.db
      .transaction("exercises", "readwrite")
      .objectStore("exercises");
    store.add(data);
  }

  public deleteExercise(name: string, onSuccess: () => void) {
    const request = this.db.transaction("exercises", "readwrite").objectStore("exercises").delete(name)
    request.onsuccess = (event) => {
      onSuccess()
    }
  }
}
