import { expect } from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import { app } from '../../src/app';

import {
  getCountFilms,
  getOneFilm,
  getActorsId,
} from '../../src/db';

const { patch } = request(app) as any;

describe('films', () => {
  describe('PATCH /api/film/:filmId', () => {
    it('Should update the existing film and return 200', async () => {
      const countBefore = await getCountFilms();

      const film = await getOneFilm();
      const actorsId = await getActorsId(3);
      const name = `${film.name} Fake ${Math.random()}`;

      const res = await patch('/api/film/' + film.id).send({
        name: name,
        actors: actorsId,
      });

      const data = res.body;

      expect(res.status).to.equal(200);
      expect(data).to.have.property('id', film.id);
      expect(data).to.have.property('name', name);
      expect(data).to.have.property('actors');
      expect(data.actors).to.have.length(actorsId.length);

      const countAfter = await getCountFilms();
      expect(countBefore).to.equal(countAfter);
    });
  });
});
