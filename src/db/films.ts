import { Iactor, Ifilm } from '../common';
import { connectDB } from './index';
import { getActorsByFilm, getActorsById } from './actors';

interface IfilmActor {
  id: number;
  film_id: number;
  actor_id: number;
  film_name: string;
  actor_name: string;
}

const NOT_VALID_NAME = { code: 400, message: 'Not valid name' };
const FILM_NOT_FOUND = { code: 404, message: 'The movie was not found' };
const FILM_NAME_MUST_HAVE = {
  code: 400,
  message: 'The name of film is required',
};
const FILM_ACTORS_MUST_HAVE = {
  code: 400,
  message: 'The list of actors is required',
};
const FILM_ALREADY_EXIST = {
  code: 400,
  message: 'There is already such a film',
};

function checkName(name: string) {
  if (!name) {
    throw FILM_NAME_MUST_HAVE;
  }

  if (!name.length || name.length > 255) {
    throw NOT_VALID_NAME;
  }
}

function checkActors(actorsId: number[]) {
  if (!actorsId) {
    throw FILM_ACTORS_MUST_HAVE;
  }
}

function log(label, msg) {
  // console.error('* films.ts * ', label, msg);
}

async function getAllFilms(): Promise<Ifilm[]> {
  let db = await connectDB();

  return new Promise<Ifilm[]>(async (resolve, reject) => {
    db.all(
      `SELECT film.id as film_id, actor.id as actor_id, film.name as film_name, actor.name as actor_name
         FROM film LEFT JOIN film_actor on film.id = film_actor.film_id
         LEFT JOIN actor on actor.id = film_actor.actor_id`,
      async (err, film_actor: IfilmActor[]) => {
        if (err) {
          log('getAllFilms', err);
          return reject({ code: 500, message: err.message });
        }

        let hash: Record<number, Ifilm> = {};

        for (const fa of film_actor) {
          if (!hash[fa.film_id]) {
            hash[fa.film_id] = {
              id: fa.film_id,
              name: fa.film_name,
              actors: [],
            };
          }

          if (fa.actor_id) {
            hash[fa.film_id].actors.push({
              id: fa.actor_id,
              name: fa.actor_name,
            });
          }
        }

        let result: Ifilm[] = Object.keys(hash).map((k) => hash[k]);

        resolve(result);
      },
    );
  });
}

async function getOneFilm(): Promise<Ifilm> {
  let db = await connectDB();

  return new Promise<Ifilm>((resolve, reject) => {
    db.get('SELECT * FROM film LIMIT 1', async (err, film: Ifilm) => {
      if (err) {
        log('getOneFilm', err);
        return reject({ code: 500, message: err.message });
      }

      if (film) {
        try {
          film.actors = await getActorsByFilm(film.id);
          resolve(film);
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(null);
      }
    });
  });
}

async function getLastFilmId(): Promise<number> {
  let db = await connectDB();

  return new Promise<number>((resolve, reject) => {
    db.get(
      'SELECT id FROM film ORDER BY id DESC LIMIT 1',
      async (err, res: Record<string, number>) => {
        if (err) {
          log('getLastFilmId', err);
          return reject({ code: 500, message: err.message });
        }
        if (!res) return resolve(0);
        const filmId: number = res.id;
        resolve(filmId);
      },
    );
  });
}

async function getCountFilms(): Promise<number> {
  let db = await connectDB();

  return new Promise<number>((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) AS count FROM film',
      (err, res: Record<string, number>) => {
        if (err) {
          log('getCountFilms', err);
          return reject({ code: 500, message: err.message });
        }
        if (!res) return resolve(0);
        resolve(res.count);
      },
    );
  });
}

async function getFilmByName(name: string) {
  checkName(name);

  let db = await connectDB();

  return new Promise<Ifilm>((resolve, reject) => {
    db.get('SELECT id FROM film WHERE name = ?', [name], (err, film: Ifilm) => {
      if (err) {
        log('getFilmByName', err);
        return reject({ code: 500, message: err.message });
      }
      resolve(film);
    });
  });
}

async function getFilmById(filmId: number): Promise<Ifilm> {
  let db = await connectDB();

  return new Promise<Ifilm>((resolve, reject) => {
    db.get(
      'SELECT * FROM film WHERE id = ?',
      [filmId],
      async (err, film: Ifilm) => {
        if (err) {
          log('getFilmById', err);
          return reject({ code: 500, message: err.message });
        }

        if (film) {
          film.actors = await getActorsByFilm(filmId);
          resolve(film);
        } else {
          return reject({ ...FILM_NOT_FOUND, filmId });
        }
      },
    );
  });
}

async function createFilm(name: string, actorsId: number[]): Promise<Ifilm> {
  checkName(name);
  checkActors(actorsId);

  let db = await connectDB();

  return new Promise<Ifilm>(async (resolve, reject) => {
    try {
      const film: Ifilm = await getFilmByName(name);
      if (film) return reject(FILM_ALREADY_EXIST);
    } catch (error) {
      log('createFilm', error);
      return reject(error);
    }

    try {
      // Проверика того что id-шники атёров правильные
      await getActorsById(actorsId);
    } catch (error) {
      log('createFilm', error);
      return reject(error);
    }

    db.run('INSERT INTO film (name) VALUES (?)', [name], async function (err) {
      if (err) {
        log('createFilm', err);
        return reject({ code: 500, message: err.message });
      }
      try {
        const film = await updateActors(this.lastID, actorsId);
        resolve(film);
      } catch (error) {
        log('createFilm', error);
        reject(error);
      }
    });
  });
}

async function updateName(filmId: number, name: string): Promise<void> {
  let db = await connectDB();

  return new Promise<void>(async (resolve, reject) => {
    db.run(
      'UPDATE film SET name = ? WHERE id = ?',
      [name, filmId],
      async (err) => {
        if (err) {
          log('updateName', err);
          return reject({ code: 500, message: err.message });
        }

        resolve();
      },
    );
  });
}

async function updateActors(
  filmId: number,
  actorsId: number[],
): Promise<Ifilm> {
  checkActors(actorsId);

  let db = await connectDB();

  return new Promise<Ifilm>(async (resolve, reject) => {
    let film = null;
    let actors: Iactor[] = null;

    try {
      film = await getFilmById(filmId);
      actors = await getActorsById(actorsId);
    } catch (error) {
      log('updateActors', error);
      return reject(error);
    }

    db.serialize(async () => {
      db.run('DELETE FROM film_actor WHERE film_id = ?', [filmId], (err) => {
        if (err) {
          log('updateActors', err);
          return reject({ code: 500, message: err.message });
        }
      });

      for (const actor of actors) {
        db.run(
          'INSERT INTO film_actor (film_id, actor_id) VALUES (?, ?)',
          [filmId, actor.id],
          async (err) => {
            if (err) {
              log('updateActors', err);
              return reject({ code: 500, message: err.message });
            }
          },
        );
      }
      film.actors = actors;
      resolve(film);
    });
  });
}

async function updateFilm(
  filmId: number,
  name?: string,
  actors?: number[],
): Promise<Ifilm> {
  return new Promise<Ifilm>(async (resolve, reject) => {
    try {
      let film = await getFilmById(filmId);

      if (name) await updateName(filmId, name);
      if (actors) await updateActors(filmId, actors);

      film = await getFilmById(filmId);

      resolve(film);
    } catch (error) {
      log('updateFilm', error);
      reject(error);
    }
  });
}

async function deleteFilm(filmId: number) {
  return new Promise<void>(async (resolve, reject) => {
    let db = await connectDB();

    await getFilmById(filmId);

    db.run('DELETE FROM film WHERE id = ?', [filmId], (err) => {
      if (err) {
        log('deleteFilm', err);
        return reject({ code: 500, message: err.message });
      }

      db.run('DELETE FROM film_actor WHERE film_id = ?', [filmId], (err) => {
        if (err) {
          log('deleteFilm', err);
          return reject({ code: 500, message: err.message });
        }

        resolve();
      });
    });
  });
}

export {
  createFilm,
  getAllFilms,
  updateFilm,
  getFilmByName,
  getFilmById,
  deleteFilm,
  getCountFilms,
  getOneFilm,
  getLastFilmId,
};
