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
/**
 * 
 * @export
 * @interface GetAccountsRequest
 */
export interface GetAccountsRequest {
    /**
     * 
     * @type {Array<string>}
     * @memberof GetAccountsRequest
     */
    accountIds: Array<string>;
}

/**
 * Check if a given object implements the GetAccountsRequest interface.
 */
export function instanceOfGetAccountsRequest(value: object): value is GetAccountsRequest {
    if (!('accountIds' in value) || value['accountIds'] === undefined) return false;
    return true;
}

export function GetAccountsRequestFromJSON(json: any): GetAccountsRequest {
    return GetAccountsRequestFromJSONTyped(json, false);
}

export function GetAccountsRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetAccountsRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'accountIds': json['account_ids'],
    };
}

  export function GetAccountsRequestToJSON(json: any): GetAccountsRequest {
      return GetAccountsRequestToJSONTyped(json, false);
  }

  export function GetAccountsRequestToJSONTyped(value?: GetAccountsRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'account_ids': value['accountIds'],
    };
}
