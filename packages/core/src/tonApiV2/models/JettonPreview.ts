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
import type { JettonVerificationType } from './JettonVerificationType';
import {
    JettonVerificationTypeFromJSON,
    JettonVerificationTypeFromJSONTyped,
    JettonVerificationTypeToJSON,
    JettonVerificationTypeToJSONTyped,
} from './JettonVerificationType';

/**
 * 
 * @export
 * @interface JettonPreview
 */
export interface JettonPreview {
    /**
     * 
     * @type {string}
     * @memberof JettonPreview
     */
    address: string;
    /**
     * 
     * @type {string}
     * @memberof JettonPreview
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof JettonPreview
     */
    symbol: string;
    /**
     * 
     * @type {number}
     * @memberof JettonPreview
     */
    decimals: number;
    /**
     * 
     * @type {string}
     * @memberof JettonPreview
     */
    image: string;
    /**
     * 
     * @type {JettonVerificationType}
     * @memberof JettonPreview
     */
    verification: JettonVerificationType;
    /**
     * 
     * @type {string}
     * @memberof JettonPreview
     */
    customPayloadApiUri?: string;
}



/**
 * Check if a given object implements the JettonPreview interface.
 */
export function instanceOfJettonPreview(value: object): value is JettonPreview {
    if (!('address' in value) || value['address'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('symbol' in value) || value['symbol'] === undefined) return false;
    if (!('decimals' in value) || value['decimals'] === undefined) return false;
    if (!('image' in value) || value['image'] === undefined) return false;
    if (!('verification' in value) || value['verification'] === undefined) return false;
    return true;
}

export function JettonPreviewFromJSON(json: any): JettonPreview {
    return JettonPreviewFromJSONTyped(json, false);
}

export function JettonPreviewFromJSONTyped(json: any, ignoreDiscriminator: boolean): JettonPreview {
    if (json == null) {
        return json;
    }
    return {
        
        'address': json['address'],
        'name': json['name'],
        'symbol': json['symbol'],
        'decimals': json['decimals'],
        'image': json['image'],
        'verification': JettonVerificationTypeFromJSON(json['verification']),
        'customPayloadApiUri': json['custom_payload_api_uri'] == null ? undefined : json['custom_payload_api_uri'],
    };
}

  export function JettonPreviewToJSON(json: any): JettonPreview {
      return JettonPreviewToJSONTyped(json, false);
  }

  export function JettonPreviewToJSONTyped(value?: JettonPreview | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'address': value['address'],
        'name': value['name'],
        'symbol': value['symbol'],
        'decimals': value['decimals'],
        'image': value['image'],
        'verification': JettonVerificationTypeToJSON(value['verification']),
        'custom_payload_api_uri': value['customPayloadApiUri'],
    };
}
