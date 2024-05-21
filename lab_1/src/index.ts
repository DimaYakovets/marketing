import { Engine } from './engine.ts';

const engine = new Engine();
await engine.init();
await engine.run();
