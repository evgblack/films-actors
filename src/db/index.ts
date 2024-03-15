import sqlite3 from 'sqlite3';

import {
  createFilm,
  getAllFilms,
  updateFilm,
  getFilmById,
  deleteFilm,
  getCountFilms,
  getOneFilm,
  getLastFilmId,
} from './films';
import {
  getAllActors,
  updateActor,
  createActor,
  getActorById,
  deleteActor,
  getActorByName,
  getActorsId,
  getLastActorId,
  getCountActors,
  getOneActor,
  getActorsById,
} from './actors';

import { seedDB } from './seed';

let db = null;
let wait = false;

async function connectDB(): Promise<sqlite3.Database> {
  return new Promise<sqlite3.Database>(async (resolve, reject) => {
    if (wait) {
      setTimeout(() => {
        if (db) {
          resolve(db);
          return;
        }
      }, 1000);
      return;
    }

    if (db) {
      resolve(db);
      return;
    }

    wait = true;

    let path = process.env.SQLITE_PATH || './database/dev.db';

    db = new sqlite3.Database(path, async (err) => {
      if (err) {
        return console.error(err.message);
      }

      db.serialize(() => {
        db.exec('BEGIN');

        db.run(
          `
              CREATE TABLE IF NOT EXISTS film (
                  id INTEGER PRIMARY KEY,
                  name TEXT NOT NULL
              )
          `,
          function (err) {
            if (err) return reject();
          },
        );

        db.run(
          `
              CREATE TABLE IF NOT EXISTS actor (
                  id INTEGER PRIMARY KEY,
                  name TEXT NOT NULL
              )
          `,
          function (err) {
            if (err) return reject();
          },
        );

        db.run(
          `
              CREATE TABLE IF NOT EXISTS film_actor (
                  film_id INTEGER,
                  actor_id INTEGER,
                  FOREIGN KEY(film_id) REFERENCES film(id),
                  FOREIGN KEY(actor_id) REFERENCES actor(id),
                  PRIMARY KEY(film_id, actor_id)
              )
          `,
          function (err) {
            if (err) return reject();
          },
        );

        db.exec('COMMIT', async () => {
          wait = false;
          if (process.env.SEED_DB) {
            await seedDB();
          }
          resolve(db);
        });
      });
    });
  });
}

export {
  connectDB,
  seedDB,
  createFilm,
  getAllFilms,
  updateFilm,
  getFilmById,
  deleteFilm,
  getAllActors,
  updateActor,
  createActor,
  getActorById,
  deleteActor,
  getActorByName,
  getCountFilms,
  getOneFilm,
  getActorsId,
  getLastActorId,
  getLastFilmId,
  getCountActors,
  getOneActor,
  getActorsById,
};
