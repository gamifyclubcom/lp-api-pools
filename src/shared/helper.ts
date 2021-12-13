import {
  IExtractPoolData,
  IExtractPoolV2Data,
  IPoolV3ContractData,
  IPoolV4ContractData,
} from '@gamify/onchain-program-sdk';
import {Decimal128, ObjectId} from 'bson';
import * as _ from 'lodash';

export function getEnumKeys<T extends string | number>(e: Record<string, T>): string[] {
  return _.difference(_.keys(e), _.map(_.filter(_.values(e), _.isNumber), _.toString));
}

export function getEnumValues<T extends string | number>(e: Record<string, T>): T[] {
  return _.values(_.pick(e, getEnumKeys(e)));
}

export function getStringEnumValues<E extends Record<keyof E, string>>(e: E): E[keyof E][] {
  return (Object.keys(e) as (keyof E)[]).map((k) => e[k]);
}

export function stringToBoolean(value: string | null | undefined): boolean | undefined {
  return _.isNil(value)
    ? undefined
    : {
        true: true,
        false: false,
        1: true,
        0: false,
      }[value.toLowerCase()];
}

export function convertSetToArray<T = any>(value: Set<T>): T[] {
  return Array.from(value.values());
}

export function convertMapToPlainObject<T = any>(value: Map<string, T>): {[key: string]: T} {
  return _.fromPairs(Array.from(value.entries()));
}

export function forOwnRecursive(
  obj: any,
  iteratee: (value: any, path: string[], obj: any) => any = _.identity,
) {
  return _.forOwn(obj, (value, key) => {
    const path = [].concat(key.toString());
    if (_.isPlainObject(value) || _.isArray(value)) {
      return forOwnRecursive(value, (v, p) => iteratee(v, path.concat(p), obj));
    }
    return iteratee(value, path, obj);
  });
}

export interface ConvertObjectOptions {
  /**
   * Fields to exclude, either as dot-notation string or path array
   */
  exclude?: (string | string[])[];
  /**
   * Exclude properties starting with prefix
   */
  excludePrefix?: string;
  /**
   * Function to replace value (see lodash@cloneDeepWith)
   */
  replacer?: (value: any) => any;
  /**
   * Key-to-key mapping, or function
   */
  keymap?: {[key: string]: string} | ((key: string) => string);
}

export const defaultReplacer = (value) => {
  if (value instanceof ObjectId) {
    return value.toHexString();
  }
  if (value instanceof Decimal128) {
    return Number(value.toString());
  }
  if (value instanceof Set) {
    return convertSetToArray(value);
  }
  if (value instanceof Map) {
    return convertMapToPlainObject(value);
  }
};

export const convertPlainObject = (obj: any, options: ConvertObjectOptions = {}): any => {
  const {keymap = {_id: 'id'}} = options;
  forOwnRecursive(obj, (value, path) => {
    const key = _.last(path);
    const newKey = _.isFunction(keymap) ? keymap(key) : _.get(keymap, key);
    if (newKey) {
      _.set(obj, _.concat(_.dropRight(path), newKey), value);
    }
  });

  return obj;
};

export const convertArray = (arr: any[], options: ConvertObjectOptions = {}) => {
  const {exclude = [], excludePrefix = '_'} = options;
  forOwnRecursive(arr, (value, path) => {
    if (excludePrefix && _.last(path).startsWith(excludePrefix)) {
      _.unset(arr, path);
    }
    _.forEach(exclude, (field) => {
      if (_.isString(field)) {
        field = _.toPath(field);
      }
      if (_.isEqual(field, path)) {
        _.unset(arr, path);
        return false;
      }
    });
  });

  return arr;
};

export function convertObject(obj: any, options: ConvertObjectOptions = {}): any {
  const {replacer = defaultReplacer} = options;
  let resultObj = _.cloneDeepWith(obj, replacer);
  if (_.isPlainObject(resultObj)) {
    resultObj = convertPlainObject(resultObj, options);
  }
  if (_.isArray(resultObj)) {
    resultObj = convertArray(resultObj, options);
  }

  return resultObj;
}

export function isPoolV2Version(
  pool: IExtractPoolData | IExtractPoolV2Data | IPoolV3ContractData | IPoolV4ContractData,
): pool is IExtractPoolV2Data {
  if ((pool as IExtractPoolV2Data).version === 2) {
    return true;
  }

  return false;
}

export function isPoolV3Version(
  pool: IExtractPoolData | IExtractPoolV2Data | IPoolV3ContractData | IPoolV4ContractData,
): pool is IPoolV3ContractData {
  if ((pool as IPoolV3ContractData).version === 3) {
    return true;
  }

  return false;
}

export function isPoolV4Version(
  pool: IExtractPoolData | IExtractPoolV2Data | IPoolV3ContractData | IPoolV4ContractData,
): pool is IPoolV4ContractData {
  if ((pool as IPoolV4ContractData).version === 4) {
    return true;
  }

  return false;
}
