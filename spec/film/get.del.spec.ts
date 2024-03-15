import { expect } from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import { app } from '../../src/app';

import {
  getAllFilms,
  getCountFilms,
  getOneFilm,
  getActorsId,
  getLastFilmId,
} from '../../src/db';

const { get, patch, del } = request(app) as any;

describe('films', () => {
  describe('GET /api/films', () => {
    it('Should return all films', async () => {
      const films = await getAllFilms();
      const countFilms = await getCountFilms();

      const res = await get('/api/films');
      const data = res.body;

      expect(res.status).to.equal(200);
      expect(data).to.be.an('array');
      expect(data.length).to.equal(countFilms);
      expect(data.length).to.equal(films.length);
    });
  });

  describe('GET /api/film/:filmId', () => {
    it('Should return a film', async () => {
      const film = await getOneFilm();

      const res = await get('/api/film/' + film.id);
      const data = res.body;

      expect(res.status).to.equal(200);
      expect(data).to.have.property('name', film.name);
      expect(data.actors).to.be.an('array');
      expect(data.actors).to.have.length(film.actors.length);
    });

    it('Should return 404 error when film not exist', async () => {
      const filmId = (await getLastFilmId()) + 1;
      const res = await get('/api/film/' + filmId);
      expect(res.status).to.equal(404);
    });
  });

  describe('DELETE /api/film/:filmId', () => {
    it('Should delete requested film and return response 200. And 404 after', async () => {
      const film = await getOneFilm();
      const countBefore = await getCountFilms();
      const uri = '/api/film/' + film.id;

      let res = await del(uri);

      const countAfter = await getCountFilms();

      expect(res.status).to.be.equal(200);
      expect(res.body).to.be.empty;
      expect(countAfter).to.be.equal(countBefore - 1);

      res = await get(uri);
      expect(res.status).to.be.equal(404);
    });
  });
});
