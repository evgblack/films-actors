import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import {
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
} from './db';

const PORT = 3013;

const app = express();
app.use(express.json());

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function log(msg) {
  //  console.log('* app.ts * ', msg);
}

/*
get: /api/films
response code: 200
response:
[
    {
        id: number,
        name: string,
        actors: [
            {
                id: number,
                name: string
            }
        ]
    }
]
*/

app.get('/api/films', async (req: Request, res: Response) => {
  try {
    const films = await getAllFilms();
    res.status(200).json(films);
  } catch (error) {
    log(error);
    res.status(error.code).json(error);
  }
});

/*
get: api/film/{filmId}
response code: 200
response:
{
    id: number,
    name: string,
    actors: [
        {
            id: number,
            name: string
        }
    ]
}
*/

app.get('/api/film/:filmId', async (req: Request, res: Response) => {
  try {
    const filmId = parseInt(req.params.filmId, 10);
    const film = await getFilmById(filmId);
    res.status(200).json(film);
  } catch (error) {
    log(error);
    res.status(error.code).json(error);
  }
});

/*
post: api/film
request body:
// в actors отправляется массив id сущностей actor
{
    name: string,
    actors: number[actorId]
}
response code: 201
response:
{
    id: number,
    name: string,
    actors: [
        {
            id: number,
            name: string
        }
    ]
}
*/
app.post('/api/film', async (req: Request, res: Response) => {
  try {
    let { name, actors } = req.body;
    const film = await createFilm(name, actors);
    res.status(201).json(film);
  } catch (error) {
    log(error);
    res.status(error.code).json(error);
  }
});

/*
patch: api/film/{filmId}
request body:
// любое из полей может быть не обязательным
// в actors отправляется массив id сущностей actor
{
    name?: string,
    actors?: number[actorId]
}
response code: 200
response:

{
    id: number,
    name: string,
    actors: [
        {
            id: number,
            name: string
        }
    ]
}
*/
app.patch('/api/film/:filmId', async (req: Request, res: Response) => {
  try {
    const filmId = parseInt(req.params.filmId, 10);
    let { name, actors } = req.body;
    const film = await updateFilm(filmId, name, actors);
    res.status(200).json(film);
  } catch (error) {
    log(error);
    res.status(error.code).json(error);
  }
});

/*
delete: api/film/{filmId}
response code: 200
response:
{}
*/
app.delete('/api/film/:filmId', async (req: Request, res: Response) => {
  try {
    const filmId = parseInt(req.params.filmId, 10);
    await deleteFilm(filmId);
    res.status(200).json({});
  } catch (error) {
    log(error);
    res.status(error.code).json(error);
  }
});

/*
get: /api/actors
response code: 200
response:
[
    {
        id: string,
        name: string
    }
]
*/

app.get('/api/actors', async (req: Request, res: Response) => {
  try {
    res.status(200).json(await getAllActors());
  } catch (error) {
    log(error);
    res.status(error.code).json(error);
  }
});

/*
get: /api/actor/{actorId}
response code: 200
{
    id: string,
    name: string
}
*/

app.get('/api/actor/:actorId', async (req: Request, res: Response) => {
  try {
    const actorId = parseInt(req.params.actorId, 10);
    const actor = await getActorById(actorId);
    res.status(200).json(actor);
  } catch (error) {
    log(error);
    res.status(error.code).json(error);
  }
});

/*
post: /api/actor
request body:
{
    name: string
}
response code: 201
response:
{
    id: string,
    name: string
}
*/
app.post('/api/actor', async (req: Request, res: Response) => {
  try {
    let { name } = req.body;
    res.status(201).json(await createActor(name));
  } catch (error) {
    log(error);
    res.status(error.code).json(error);
  }
});

/*
patch: /api/actor/{actorId}
response code: 200
request body:
{
    name: string
}
response:
{
    id: string,
    name: string
}
*/
app.patch('/api/actor/:actorId', async (req: Request, res: Response) => {
  try {
    const actorId = parseInt(req.params.actorId, 10);
    let { name } = req.body;
    res.status(200).json(await updateActor(actorId, name));
  } catch (error) {
    log(error);
    res.status(error.code).json(error);
  }
});

/*
delete: /api/actor/{actorId}
response code: 200
response:
{}
*/
app.delete('/api/actor/:actorId', async (req: Request, res: Response) => {
  try {
    const actorId = parseInt(req.params.actorId, 10);
    await deleteActor(actorId);
    res.status(200).json({});
  } catch (error) {
    log(error);
    res.status(error.code).json(error);
  }
});

async function startApp() {
  return new Promise<void>(async (resolve, reject) => {
    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        resolve();
      });
  });
}

export { app, startApp };
