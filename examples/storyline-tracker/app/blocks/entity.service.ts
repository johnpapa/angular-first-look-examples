import {Injectable} from 'angular2/core';

@Injectable()
export class EntityService {
  clone = (source: {}) => Object.assign({}, source);

  merge = (target: any, ...sources: any[]) => Object.assign(target, ...sources);

  propertiesDiffer = (entityA: {}, entityB: {}) => Object.keys(entityA).find(key => entityA[key] !== entityB[key]);
}