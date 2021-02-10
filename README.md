# Api en GraphQL haciendo uso de una API REST

1. [Crear el proyecto desde el generador](#init)
2. [API ergast](#ergast)
3. [Añadir la fuente de tados de la API y de las temporadas](#data-source)
4. [Definición del schema](#schema)


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

- ## Temporadas

  **Temporadas de la historia - Todos:**

  - URL: https://ergast.com/api/f1/seasons?limit=100

  - API: https://ergast.com/api/f1/seasons.json?limit=100

- ## Circuitos

  **Circuitos de la historia - Todos:**

  - URL: https://ergast.com/api/f1/seasons?limit=500

  - API: https://ergast.com/api/f1/seasons.json?limit=500

  **Circuitos con resultados por página - x pilotos por página**

  - URL: https://ergast.com/api/f1/circuits?limit=x

  - API: https://ergast.com/api/f1/circuits.json?limit=x&offset=(<pagina> - 1) * x

  **Circuito seleccionado:**

  - URL: https://ergast.com/api/f1/circuits/<circuitId>

  - API: https://ergast.com/api/f1/circuits/<circuitId>.json

- ## Estadísticas

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

En el archivo server.ts añadimos el dataSource a ka configuración de ApolloServer:

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

El *squema.graphql* quedaría como sigue:

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

<a name="init"></a>

## 1. Crear el proyecto desde el generador