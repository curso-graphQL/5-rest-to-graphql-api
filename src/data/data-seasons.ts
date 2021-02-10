import { F1 } from './data-source';

export class SeasonsData extends F1 {
  constructor() {
    super();
  }

  async getSeasons() {
    return await this.get('seasons.json', {
      cacheOptions: { ttl: 60 }
    });
  }
}