type Cardan = typeof import('@emurgo/cardano-serialization-lib-browser');

class cardanoLoader {
  wasm: Cardan | null = null;

  async load() {
    if (this.wasm == null) {
      this.wasm = await import('@emurgo/cardano-serialization-lib-browser');
    }
    return this.wasm;
  }
}

export default new cardanoLoader();
