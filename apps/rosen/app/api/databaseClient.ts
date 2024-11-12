class DatabaseClient {
  data: any;

  getData() {
    return this.data;
  }

  setData(newData: any) {
    this.data = newData;
  }
}

// Singleton instance
let instance: DatabaseClient;

export function getDatabaseClient() {
  if (!instance) {
    instance = new DatabaseClient();
  }
  return instance;
}
