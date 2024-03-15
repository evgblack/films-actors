interface Iactor {
  id: number;
  name: string; // max_len:1024  Тут нет уникальности, т.е. можно создать актёра с таким же именем.
  // films: Ifilm[]; // TODO : Реализую позже. В текущем задании не требуется
}

interface Ifilm {
  id: number;
  name: string; // unique, max_len:255
  actors: Iactor[];
}

export { Iactor, Ifilm };
