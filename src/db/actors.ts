import { Iactor, Ifilm } from '../common';
import { connectDB } from './index';

const ACTOR_NOT_FOUND = { code: 404, message: 'The actor was not found' };
const NOT_VALID_NAME = { code: 400, message: 'Not valid name' };
const ACTOR_NAME_MUST_HAVE = {
  code: 400,
  message: 'The name of actor is required',
};

function log(label, msg) {
  // console.error('* actors.ts * ', label, msg);
}

function checkName(name: string) {
  if (!name) {
    throw ACTOR_NAME_MUST_HAVE;
  }

  if (!name.length || name.length > 1024) {
    throw NOT_VALID_NAME;
  }
}

async function getAllActors(): Promise<Iactor[]> {
  let db = await connectDB();

  return new Promise<Iactor[]>((resolve, reject) => {
    db.all('SELECT * FROM actor', async (err, actors: Iactor[]) => {
      if (err) {
        log('getAllActors', err);
        return reject({ code: 500, message: err.message });
      }
      resolve(actors);
    });
  });
}

async function getActorsId(limit: number): Promise<number[]> {
  let db = await connectDB();

  return new Promise<number[]>((resolve, reject) => {
    db.all(
      'SELECT id FROM actor LIMIT ?',
      [limit],
      async (err, res: Record<string, number>[]) => {
        if (err) {
          log('getActorsId', err);
          return reject({ code: 500, message: err.message });
        }

        const actorsId: number[] = res.map((rec) => rec.id);
        resolve(actorsId);
      },
    );
  });
}

async function getLastActorId(): Promise<number> {
  let db = await connectDB();

  return new Promise<number>((resolve, reject) => {
    db.get(
      'SELECT id FROM actor ORDER BY id DESC LIMIT 1',
      async (err, res: Record<string, number>) => {
        if (err) {
          log('getLastActorId', err);
          return reject({ code: 500, message: err.message });
        }
        if (!res) return resolve(0);
        const actorId: number = res.id;
        resolve(actorId);
      },
    );
  });
}

async function getCountActors(): Promise<number> {
  let db = await connectDB();

  return new Promise<number>((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) AS count FROM actor',
      (err, res: Record<string, number>) => {
        if (err) {
          log('getCountActors', err);
          return reject({ code: 500, message: err.message });
        }
        if (!res) return resolve(0);
        resolve(res.count);
      },
    );
  });
}

async function getActorsByFilm(filmId: number): Promise<Iactor[]> {
  let db = await connectDB();

  return new Promise<Iactor[]>((resolve, reject) => {
    db.all(
      'SELECT actor.* FROM actor JOIN film_actor ON actor.id = film_actor.actor_id WHERE film_actor.film_id = ?',
      [filmId],
      (err, actors: Iactor[]) => {
        if (err) {
          log('getActorsByFilm', err);
          return reject({ code: 500, message: err.message });
        }

        resolve(actors);
      },
    );
  });
}

async function getActorByName(name: string) {
  checkName(name);

  let db = await connectDB();

  return new Promise<Iactor>((resolve, reject) => {
    db.get(
      'SELECT id, name FROM actor WHERE name = ?',
      [name],
      (err, actor: Iactor) => {
        if (err) {
          log('getActorByName', err);
          return reject({ code: 500, message: err.message });
        }

        if (!actor) return reject({ ...ACTOR_NOT_FOUND, name });

        resolve(actor);
      },
    );
  });
}

async function getActorById(actorId: number) {
  let db = await connectDB();

  return new Promise<Iactor>((resolve, reject) => {
    db.get(
      'SELECT id, name FROM actor WHERE id = ?',
      [actorId],
      (err, actor: Iactor) => {
        if (err) {
          log('getActorById', err);
          return reject({ code: 500, message: err.message });
        }

        if (!actor) return reject({ ...ACTOR_NOT_FOUND, actorId });

        resolve(actor);
      },
    );
  });
}

async function getOneActor(): Promise<Iactor> {
  let db = await connectDB();

  return new Promise<Iactor>((resolve, reject) => {
    db.get('SELECT * FROM actor LIMIT 1', async (err, actor: Iactor) => {
      if (err) {
        log('getOneActor', err);
        return reject({ code: 500, message: err.message });
      }
      if (!actor) return resolve(null);
      resolve(actor);
    });
  });
}

async function createActor(name: string) {
  checkName(name);

  let db = await connectDB();

  return new Promise<Iactor>(async (resolve, reject) => {
    db.run('INSERT INTO actor (name) VALUES (?)', [name], function (err) {
      if (err) {
        log('createActor', err);
        return reject({ code: 500, message: err.message });
      }

      resolve({ id: this.lastID, name });
    });
  });
}

async function updateActor(actorId: number, name: string): Promise<Iactor> {
  checkName(name);

  let db = await connectDB();

  return new Promise<Iactor>(async (resolve, reject) => {
    try {
      await getActorById(actorId);
    } catch (error) {
      log('updateActor', error);
      return reject(error);
    }

    db.run(
      'UPDATE actor SET name = ? WHERE id = ?',
      [name, actorId],
      async (err) => {
        if (err) {
          log('updateActor', err);
          return reject({ code: 500, message: err.message });
        }

        resolve({ id: actorId, name });
      },
    );
  });
}

async function deleteActor(actorId: number) {
  let db = await connectDB();

  return new Promise<void>(async (resolve, reject) => {
    await getActorById(actorId);

    db.run('DELETE FROM actor WHERE id = ?', [actorId], function (err) {
      if (err) {
        log('deleteActor', err);
        return reject({ code: 500, message: err.message });
      }

      db.run('DELETE FROM film_actor WHERE actor_id = ?', [actorId], (err) => {
        if (err) {
          log('deleteActor', err);
          return reject({ code: 500, message: err.message });
        }

        resolve();
      });
    });
  });
}

async function getActorsById(actorsId: number[]): Promise<Iactor[]> {
  return new Promise<Iactor[]>(async (resolve, reject) => {
    try {
      let actors: Iactor[] = [];
      for (const id of actorsId) {
        const actor = await getActorById(id);
        actors.push(actor);
      }
      resolve(actors);
    } catch (error) {
      log('getActorsById', error);
      reject(error);
    }
  });
}

export {
  createActor,
  updateActor,
  getActorById,
  getActorByName,
  getAllActors,
  getActorsByFilm,
  deleteActor,
  getActorsId,
  getLastActorId,
  getCountActors,
  getOneActor,
  getActorsById,
};
