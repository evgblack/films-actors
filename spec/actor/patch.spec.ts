import { expect } from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import { app } from '../../src/app';

import { getCountActors, getOneActor } from '../../src/db';

const { patch } = request(app) as any;

describe('actors', () => {
  describe('PATCH /api/actor/:actorId', () => {
    it('Should update the existing actor and return 200', async () => {
      const countBefore = await getCountActors();
      const actor = await getOneActor();
      const name = `${actor.name} Jr.`;

      const res = await patch('/api/actor/' + actor.id).send({ name });

      const data = res.body;

      expect(res.status).to.equal(200);
      expect(data).to.have.property('id', actor.id);
      expect(data).to.have.property('name', name);

      const countAfter = await getCountActors();
      expect(countAfter).to.be.equal(countBefore);
    });
  });
});
