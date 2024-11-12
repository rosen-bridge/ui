export const data = {} as any;

class Singleton {
  static instance: Singleton;
  data: any;
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    // Initialize any properties here
    this.data = {}; // Example property
    Singleton.instance = this;
  }

  getData() {
    return this.data;
  }

  setData(newData: any) {
    this.data = newData;
  }
}

export const singletonInstance = new Singleton();
