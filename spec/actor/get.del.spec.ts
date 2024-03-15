import { expect } from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import { app } from '../../src/app';

import { getCountActors, getOneActor, getLastActorId } from '../../src/db';

const { get, del } = request(app) as any;

describe('actors', () => {
  describe('GET /api/actors', () => {
    it('Should return all actors', async () => {
      let сountActors = await getCountActors();
      const res = await get('/api/actors');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(сountActors);
    });
  });

  describe('GET /api/actor/:actorId', () => {
    it('Should return an actor', async () => {
      const actor = await getOneActor();

      const res = await get('/api/actor/' + actor.id);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('name', actor.name);
    });

    it('Should return 404 error when actor not exist', async () => {
      const actorId = (await getLastActorId()) + 1;
      const res = await get('/api/actor/' + actorId);
      expect(res.status).to.equal(404);
    });
  });

  describe('DELETE /api/actor/:actorId', () => {
    it('Should delete requested actor and return response 200. And 404 after', async () => {
      const actor = await getOneActor();
      const uri = '/api/actor/' + actor.id;

      const countBefore = await getCountActors();

      let res = await del(uri);

      const countAfter = await getCountActors();

      expect(res.status).to.be.equal(200);
      expect(res.body).to.be.empty;
      expect(countAfter).to.be.equal(countBefore - 1);

      res = await get(uri);
      expect(res.status).to.be.equal(404);
    });
  });
});
