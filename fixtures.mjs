process.env.SEED_DB = true;
process.env.SQLITE_PATH = ':memory:';

import {
  startApp
} from "./dist/app.js";

export async function mochaGlobalSetup() {
  await startApp();

/*   return new Promise(resolve => {
    setTimeout(() => {
      // TODO : удалить все console.log
      console.log('----------START----------')
      resolve();
    }, 500);
  }); */
}
