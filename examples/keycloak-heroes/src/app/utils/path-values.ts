import { environment } from '../../environments';

const dotaApi = environment.apis.dota;
const dotaImages = environment.assets.dotaImages;
const heroesApi = `${dotaApi}/v1/dota-heroes`;
const heroesImages = `${dotaImages}`;

const pathValues = {
  dotaApi,
  heroesApi,
  heroesImages
};

export { pathValues };
