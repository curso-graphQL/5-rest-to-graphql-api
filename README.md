# Api en GraphQL haciendo uso de una API REST

1. [Crear el proyecto desde el generador](#init)
2. [API ergast](#ergast)
3. [Añadir la fuente de tados de la API y de las temporadas](#data-source)
4. [Definición del schema](#schema)
5. [Lista de temporadas](#season-list)
6. [Solucionar problema de valores nulos](#null-values)
7. [Lista de carreras de una temporada: preparativos](#races-list1)
8. [Lista de carreras de una temporada: definición del schema](#races-list2)
9. [Lista de carreras de un año seleccionado](#races-list3)

<hr>

<a name="init"></a>

## 1. Crear el proyecto desde el generador

Para crear el proyecto vamos a utilizar el [generador de proyectos GraphQL](https://github.com/code-starters/graphql-project-cli) en su versión más básica (graphql-hello-world).

Necesitaremos además dos librerías adicionaes:

- [apollo-datasource-rest](https://www.npmjs.com/package/apollo-datasource-rest)
- [apollo-server](https://www.npmjs.com/package/apollo-server)

~~~
npm i apollo-datasource-rest apollo-server
~~~

<hr>

<a name="init"></a>

## 2. API Ergast

Para realizar este proyecto vamos a basarnos en la api ergast de Fórmula 1 [link](https://ergast.com/mrd/).

- ### Carreras

  **De un año concreto:**

  - URL: https://ergast.com/api/f1/<YEAR>

  - API: https://ergast.com/api/f1/<YEAR>.json

  **De un año concreto y carrera concreta:**

  - URL: https://ergast.com/api/f1/<YEAR>/<ROUND>

  - API: https://ergast.com/api/f1/<YEAR>/<ROUND>.json

- ### Pilotos

  **Pilotos de la historia - Todos:**

  - URL: https://ergast.com/api/f1/drivers?limit=1000

  - API: https://ergast.com/api/f1/drivers.json?limit=1000

  **Pilotos con resultados por página - x pilotos por página**

  - URL: https://ergast.com/api/f1/drivers?limit=x

  - API: https://ergast.com/api/f1/drivers.json?limit=x&offset=(<pagina> - 1) * x

  **Piloto seleccionado:**

  - URL: https://ergast.com/api/f1/drivers/<driverId>

  - API: https://ergast.com/api/f1/drivers/<driverId>.json

- ### Temporadas

  **Temporadas de la historia - Todos:**

  - URL: https://ergast.com/api/f1/seasons?limit=100

  - API: https://ergast.com/api/f1/seasons.json?limit=100

- ### Circuitos

  **Circuitos de la historia - Todos:**

  - URL: https://ergast.com/api/f1/seasons?limit=500

  - API: https://ergast.com/api/f1/seasons.json?limit=500

  **Circuitos con resultados por página - x pilotos por página**

  - URL: https://ergast.com/api/f1/circuits?limit=x

  - API: https://ergast.com/api/f1/circuits.json?limit=x&offset=(<pagina> - 1) * x

  **Circuito seleccionado:**

  - URL: https://ergast.com/api/f1/circuits/<circuitId>

  - API: https://ergast.com/api/f1/circuits/<circuitId>.json

- ### Estadísticas

  **Clasificación de la temporada - Pilotos:**

  - URL: http://ergast.com/api/f1/<YEAR>/driverStandings

  - API: http://ergast.com/api/f1/<YEAR>/driverStandings.json

  **Clasificación de la temporada - Constructores:**

  - URL: http://ergast.com/api/f1/<YEAR>/constructorStandings

  - API: http://ergast.com/api/f1/<YEAR>/constructorStandings.json

  **Clasificación de la carrera y año - Pilotos:**

  - URL: http://ergast.com/api/f1/<YEAR>/<RONDA>/driverStandings

  - API: http://ergast.com/api/f1/<YEAR>/<RONDA>/driverStandings.json

  **Clasificación de la carrera y año - Constructores:**
  - URL: http://ergast.com/api/f1/<YEAR>/<RONDA>/constructorStandings

  - API: http://ergast.com/api/f1/<YEAR>/<RONDA>/constructorStandings.json

  **Resultados de una carrera profesional de un piloto:**

  - URL: http://ergast.com/api/f1/drivers/<ID_DRIVER>/driverStandings

  - API: http://ergast.com/api/f1/drivers/<ID_DRIVER>/driverStandings.json

<hr>

<a name="data-source"></a>

## 3. Añadir la fuente de tados de la API y de las temporadas

Creamos la carpeta *src/data* y en ella los siguientes archivos:

- *data-source-ts*:

~~~js
import { RESTDataSource } from "apollo-datasource-rest";

export class F1 extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://ergast.com/api/f1/'
  }
}
~~~

- *data-seasons.ts*:

~~~js
import { F1 } from './data-source';

export class SeasonsData extends F1 {
  constructor() {
    super();
  }
}
~~~

- *index.ts*:

~~~js
import { SeasonsData } from './data-seasons';

export const dataSources = {
  SeasonsData,
}
~~~

En el archivo server.ts añadimos el dataSource a la configuración de ApolloServer:

~~~js
...
import { dataSources } from './data/index';
...
  const server = new ApolloServer({
      schema,
      dataSources: () => ({
          seasons: new dataSources.SeasonsData()
      }),
      introspection: true // Necesario
  });
~~~

> modificamos la configuración de cors que viene por defecto a ```app.use(cors());```

<hr>

<a name="schema"></a>

## 4. Definición del schema

> En este paso se puede hacer uso de la web [json to ts](http://www.jsontots.com/) que dado un json nos define las distintas interfaces, de forma que podamos *"traducir"* estas interfaces en definiciones de schema.

El *schema.graphql* quedaría como sigue:

~~~graphql
type Query {
    seasonList: [Season!]!
}

type Season {
    year: String!;
    url: String!;
    urlMobile: String!;
}
~~~

<hr>

<a name="season-list"></a>

## 4. Lista de temporadas

En la fuente de datos creamos una función asíncrona para obtener los datos de la API Rest:

~~~js
export class SeasonsData extends F1 {
...
  async getSeasons() {
    return await this.get('seasons.json', {
      cacheOptions: { ttl: 60 }
    });
  }
}
~~~

En el resolver de Queries creamos la consulta que llamaŕa a ese resolver y que obtendrá los datos:

~~~js
import { IResolvers } from 'graphql-tools';

const query: IResolvers = {
  Query: {
    async seasonList(_: void, __: any, { dataSources }) {
      return await dataSources.seasons
        .getSeasons()
        .then((data: any) => data.MRData.SeasonTable.Seasons);
    },
  },
};

export default query;
~~~

> Por ahora la llamada a la API de GraphQL para consultar las temporadas generará un error en aquellas keys que no se correspondan (sólo funciona *url*). Esto lo resolveremos en la siguiente sección.

<hr>

<a name="null-value"></a>

## 6. Solucionar problema de valores nulos

Ahora mismo tenemos en nuestra api de GraphQL dos keys que no tienen correspondencia en la API Rest (year y urlMobile).

Para solventar este problema, creamos el archivo *src/resolvers/type.ts*.

~~~js
import { IResolvers } from 'graphql-tools';

const type: IResolvers = {
  Season: {
    year: parent => parent.season,
    urlMobile: parent => parent.url
  }
};

export default type;
~~~

De este modo, estamos pasando a la key year lo que viene en la key season en la API Rest, y a urlMobile lo que vienen en la key url.

Para obtener la urlMobile correcta, creamos un archivo *src/lib/utils.ts*.

~~~js
export function getWikipediaMobileUrl(url: string) {
  return (url  !== undefined) 
    ? url.replace('wikipedia', 'm.wikipedia')
    : ''
}
~~~

Utilizamos esta función en el resolver de types:

~~~js
import { getWikipediaMobileUrl } from '../lib/utils';
...
    urlMobile: parent => getWikipediaMobileUrl(parent.url)
...
~~~

Finalmente importamos el tipo definido al **resolverMap**, que quedaría como sigue:

~~~js
import { IResolvers } from 'graphql-tools';
import query from './query';
import type from './type';

const resolvers : IResolvers = {
    ...query,
    ...type
};

export default resolvers;
~~~


<hr>

<a name="races-list1"></a>

## 7. Lista de carreras de una temporada

Creamos un nuevo archivo en la carpeta src/data *data-races.ts*:

~~~js
import { F1 } from './data-source';

export class RacesData extends F1 {
  constructor() {
    super();
  }
}
~~~

y lo importamos en el index...

~~~js
import { SeasonsData } from './data-seasons';
import { RacesData } from './data-races';

export const dataSources = {
  SeasonsData,
  RacesData
}
~~~

Añadimos la nueva fuente de datos al *server.ts*:

~~~js
...
    const server = new ApolloServer({
        schema,
        dataSources: () => ({
            seasons: new dataSources.SeasonsData(),
            races: new dataSources.RacesData()
        }),
        introspection: true // Necesario
    });
...
~~~


<hr>

<a name="races-list2"></a>

## 8. Lista de carreras de una temporada: definición del schema

Valiénonos de la API y de "json to ts" podemos generar en el *schema.graphql* los nuevos tipos:

~~~graphql
type Race {
    season: String!
    round: String!
    url: String!
    raceName: String!
    circuit: Circuit!
    date: String!
    time: String!
}

type Circuit {
    id: String!
    url: String!
    name: String!
    location: Location!
}

type Location {
    lat: String!
    lng: String!
    locality: String!
    country: String!
}
~~~


<hr>

<a name="races-list3"></a>

## 9. Lista de carreras de un año seleccionado

Definimos en el *schema.graphql* la nueva query:

~~~graphql
type Query {
    seasonList: [Season!]!
    racesByYear(year: String!): [Race!]!
}
~~~

En la fuente de datos definimos la función que hará la petición a la api:

~~~js
  async getRacesByYear(year: string) {
    const currentYear = new Date().getFullYear()
    if (isNaN(+year) || +year < 1950 || +year > currentYear) {
      year = String(currentYear)
    }
    return await this.get(`${ year }.json`, {
      cacheOptions: { ttl: 60 }
    });
  }
~~~
> Incluimos una validación para el caso en el que se mande un año no numérico, anteriores a 1950 o posteriores al año actual.

En el resolver creamos la query correspondiente:

~~~js
Query: {
  ...
      async racesByYear(_: void, { year }, { dataSources }) {
      return await dataSources.races
        .getRacesByYear(year)
        .then((data: any) => data.MRData.RaceTable.Races);
    }
  ...
}
~~~