/* tslint:disable */
/* eslint-disable */
/**
 * REST api to TON blockchain explorer
 * Provide access to indexed TON blockchain
 *
 * The version of the OpenAPI document: 2.0.0
 * Contact: support@tonkeeper.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { InscriptionBalance } from './InscriptionBalance';
import {
    InscriptionBalanceFromJSON,
    InscriptionBalanceFromJSONTyped,
    InscriptionBalanceToJSON,
    InscriptionBalanceToJSONTyped,
} from './InscriptionBalance';

/**
 * 
 * @export
 * @interface InscriptionBalances
 */
export interface InscriptionBalances {
    /**
     * 
     * @type {Array<InscriptionBalance>}
     * @memberof InscriptionBalances
     */
    inscriptions: Array<InscriptionBalance>;
}

/**
 * Check if a given object implements the InscriptionBalances interface.
 */
export function instanceOfInscriptionBalances(value: object): value is InscriptionBalances {
    if (!('inscriptions' in value) || value['inscriptions'] === undefined) return false;
    return true;
}

export function InscriptionBalancesFromJSON(json: any): InscriptionBalances {
    return InscriptionBalancesFromJSONTyped(json, false);
}

export function InscriptionBalancesFromJSONTyped(json: any, ignoreDiscriminator: boolean): InscriptionBalances {
    if (json == null) {
        return json;
    }
    return {
        
        'inscriptions': ((json['inscriptions'] as Array<any>).map(InscriptionBalanceFromJSON)),
    };
}

  export function InscriptionBalancesToJSON(json: any): InscriptionBalances {
      return InscriptionBalancesToJSONTyped(json, false);
  }

  export function InscriptionBalancesToJSONTyped(value?: InscriptionBalances | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'inscriptions': ((value['inscriptions'] as Array<any>).map(InscriptionBalanceToJSON)),
    };
}
