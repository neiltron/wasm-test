import * as wasm from '../pkg/index_bg.wasm';

export function get_memory() {
  try {
      return wasm.memory;
  } catch (e) {
      logError(e)
  }
}
