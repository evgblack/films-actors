import { Iactor, Ifilm } from '../common';
import { connectDB } from './index';

// Том Круз и Брэд Питт повторяются для демонстрации того что у некоторых фильмов актёр может совпадать.
// В REST API можно создать несколько разных актёров с одним и тем же именем ( id-шники разные, поле name у актёров не уникальное ),
//   но здесь это должен быть один и тотже актёр.
// У Ifilm поле name помечено как unique, а у Iactor нет.

const dbJson = [
  { name: 'Револьвер', actors: ['Джейсон Стэйтем', 'Рэй Лиотта'] },
  { name: 'Автостопом по галактике', actors: ['Мартин Фриман', 'Ясин Бей'] },
  { name: 'Бойцовский клуб', actors: ['Эдвард Нортон', 'Брэд Питт'] },
  { name: 'Последний самурай', actors: ['Кэн Ватанабэ', 'Том Круз'] },
  { name: 'Грань будущего', actors: ['Том Круз', 'Эмили Блант'] },
  { name: 'Интервью с вампиром', actors: ['Том Круз', 'Брэд Питт'] },
  {
    name: 'Ограбление по-итальянски',
    actors: ['Джейсон Стэйтем', 'Ясин Бей', 'Эдвард Нортон'],
  },
];

const actorsHash: Record<string, Iactor> = {};
const filmsHash: Record<string, Ifilm> = {};

const getActorNames = () => {
  for (const filmData of dbJson) {
    for (const actorName of filmData.actors) {
      if (!(filmData.name in filmsHash)) {
        actorsHash[actorName] = null;
      }
    }
  }

  return Object.keys(actorsHash);
};

const seedDB = async () => {
  let db = await connectDB();

  return new Promise<void>(async (resolve, reject) => {
    try {
      let actorNames = getActorNames();

      db.serialize(() => {
        db.exec('BEGIN');

        db.run('DELETE FROM film_actor;');
        db.run('DELETE FROM film;');
        db.run('DELETE FROM actor;');

        for (const name of actorNames) {
          db.run('INSERT INTO actor (name) VALUES (?)', [name], function (err) {
            if (err) {
              db.exec('ROLLBACK');
              console.error(err);
              reject();
              return;
            }
            actorsHash[name] = { id: this.lastID, name };
          });
        }

        let counter = 0;

        for (const filmData of dbJson) {
          db.run(
            'INSERT INTO film (name) VALUES (?)',
            [filmData.name],
            function (err) {
              if (err) {
                db.exec('ROLLBACK');
                console.error(err);
                reject();
                return;
              }

              const filmId = this.lastID;

              for (const actorName of filmData.actors) {
                const actor = actorsHash[actorName];

                db.run(
                  'INSERT INTO film_actor (film_id, actor_id) VALUES (?, ?)',
                  [filmId, actor.id],
                  (err) => {
                    if (err) {
                      db.exec('ROLLBACK');
                      console.error(err);
                      reject();
                      return;
                    }
                  },
                );
              }

              ++counter;

              if (counter === dbJson.length) {
                db.exec('COMMIT');
                return resolve();
              }
            },
          );
        }
      });
    } catch (error) {
      console.error(error);
      reject();
    }
  });
};

export { seedDB };
