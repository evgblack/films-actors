import { expect } from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import { app } from '../../src/app';

import {
  getCountFilms,
  getOneFilm,
  getActorsId,
  getLastActorId,
} from '../../src/db';

const { post } = request(app) as any;

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 Sed eu velit quis leo faucibus luctus. Suspendisse eu nibh vitae lectus feugiat pretium.
  Aenean volutpat, nulla euismod venenatis laoreet, orci quam porttitor purus, non faucibus nunc mi nec posuere.`;

describe('films', () => {
  describe('POST /api/film', () => {
    const uri = '/api/film';

    describe('Should return status 201', () => {
      it('Should return film when the all request body is valid', async () => {
        const name = 'Fake film';
        const actorsId = await getActorsId(3);

        const res = await post(uri).send({
          name,
          actors: actorsId,
        });

        const data = res.body;

        expect(res.status).to.equal(201);
        expect(data).to.have.property('id');
        expect(data).to.have.property('name', name);
        expect(data).to.have.property('actors');
        expect(data.actors).to.have.length(actorsId.length);
      });

      it('Film with empty actors', async () => {
        const countBefore = await getCountFilms();

        const nameFilm = 'Film with empty actors';
        const res = await post(uri).send({
          name: nameFilm,
          actors: [],
        });
        const data = res.body;

        const countAfter = await getCountFilms();

        expect(res.status).to.equal(201);
        expect(data).to.have.property('actors');
        expect(data.actors).to.have.length(0);
        expect(countBefore + 1).to.equal(countAfter);
      });
    });

    describe('Should return error 4xx', () => {
      it('Not valid name with length > 1024', async () => {
        const countBefore = await getCountFilms();

        const res = await post(uri).send({
          name: lorem,
          actors: [],
        });

        const countAfter = await getCountFilms();

        expect(res.status).to.equal(400);
        expect(countBefore).to.equal(countAfter);
      });

      it('Not valid actor id', async () => {
        const countBefore = await getCountFilms();

        let actorsId = await getActorsId(3);
        const actorId = (await getLastActorId()) + 1; // Not valid actor id
        actorsId.push(actorId);

        const res = await post(uri).send({
          name: 'Fake with not valid actor id',
          actors: actorsId,
        });

        const countAfter = await getCountFilms();

        expect(res.status).to.equal(404);
        expect(countBefore).to.equal(countAfter);
      });

      it('The list of actors is required', async () => {
        const countBefore = await getCountFilms();

        const name = 'Film without actors';
        const res = await post(uri).send({ name });

        const countAfter = await getCountFilms();

        expect(res.status).to.equal(400);
        expect(countBefore).to.equal(countAfter);
      });

      it('Film without name', async () => {
        const countBefore = await getCountFilms();

        const res = await post(uri).send({
          actors: [],
        });

        const countAfter = await getCountFilms();

        expect(res.status).to.equal(400);
        expect(countBefore).to.equal(countAfter);
      });

      it('There is already such a film', async () => {
        const countBefore = await getCountFilms();

        const film = await getOneFilm();

        const res = await post(uri).send({
          name: film.name,
        });

        const countAfter = await getCountFilms();

        expect(res.status).to.equal(400);
        expect(countBefore).to.equal(countAfter);
      });
    });
  });
});
