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
 * @interface SendBlockchainMessageRequest
 */
export interface SendBlockchainMessageRequest {
    /**
     * 
     * @type {string}
     * @memberof SendBlockchainMessageRequest
     */
    boc?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof SendBlockchainMessageRequest
     */
    batch?: Array<string>;
}

/**
 * Check if a given object implements the SendBlockchainMessageRequest interface.
 */
export function instanceOfSendBlockchainMessageRequest(value: object): value is SendBlockchainMessageRequest {
    return true;
}

export function SendBlockchainMessageRequestFromJSON(json: any): SendBlockchainMessageRequest {
    return SendBlockchainMessageRequestFromJSONTyped(json, false);
}

export function SendBlockchainMessageRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): SendBlockchainMessageRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'boc': json['boc'] == null ? undefined : json['boc'],
        'batch': json['batch'] == null ? undefined : json['batch'],
    };
}

  export function SendBlockchainMessageRequestToJSON(json: any): SendBlockchainMessageRequest {
      return SendBlockchainMessageRequestToJSONTyped(json, false);
  }

  export function SendBlockchainMessageRequestToJSONTyped(value?: SendBlockchainMessageRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'boc': value['boc'],
        'batch': value['batch'],
    };
}
