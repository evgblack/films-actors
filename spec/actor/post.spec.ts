import { expect } from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import { app } from '../../src/app';

import { getCountActors, getOneActor, getLastActorId } from '../../src/db';

const { post } = request(app) as any;

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vestibulum purus libero,
 in hendrerit mi aliquet imperdiet. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
  Nulla urna diam, tincidunt a dui non, tincidunt dictum erat. Integer cursus leo eget cursus tincidunt.
   In in tincidunt leo, at dapibus sapien. Phasellus pretium quam id nunc sagittis hendrerit.
    Donec cursus massa eros, sit amet cursus neque placerat nec. Sed viverra fringilla cursus.
     Cras tempor neque metus, eu semper lorem pharetra sit amet. Cras luctus fringilla ligula, at tincidunt nunc lobortis in.
      Pellentesque enim eros, convallis eu tempor id, blandit nec risus.
       Nulla lobortis sapien sit amet ligula sollicitudin tincidunt.
        Vivamus condimentum suscipit libero, accumsan sagittis metus imperdiet nec.
Nulla viverra sed urna quis ullamcorper. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
 Maecenas laoreet sem quis eros ornare, vitae bibendum elit erat curae.
`;

describe('actors', () => {
  describe('POST /api/actor', () => {
    const uri = '/api/actor';

    describe('Should return status 201', () => {
      it('Should return actor when the all request body is valid', async () => {
        const name = 'Fake actor';
        const countBefore = await getCountActors();

        const res = await post(uri).send({
          name,
        });

        const countAfter = await getCountActors();

        const data = res.body;

        expect(res.status).to.equal(201);
        expect(data).to.have.property('id');
        expect(data).to.have.property('name', name);
        expect(countBefore + 1).to.equal(countAfter);
      });

      it('Actor with the same name', async () => {
        const actor = await getOneActor();
        const countBefore = await getCountActors();

        const res = await post(uri).send({
          name: actor.name,
        });

        const countAfter = await getCountActors();

        const data = res.body;

        expect(res.status).to.equal(201);
        expect(data).to.have.property('id');
        expect(data).to.have.property('name', actor.name);
        expect(countBefore + 1).to.equal(countAfter);
      });
    });

    describe('Should return error 400', () => {
      it('Not valid name with length > 255', async () => {
        const countBefore = await getCountActors();

        const res = await post(uri).send({
          name: lorem,
        });

        const countAfter = await getCountActors();

        expect(res.status).to.equal(400);
        expect(countBefore).to.equal(countAfter);
      });

      it('Actor without name', async () => {
        const countBefore = await getCountActors();

        const res = await post(uri).send({});

        const countAfter = await getCountActors();

        expect(res.status).to.equal(400);
        expect(countBefore).to.equal(countAfter);
      });
    });
  });
});
