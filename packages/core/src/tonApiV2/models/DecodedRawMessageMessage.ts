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
 * @interface DecodedRawMessageMessage
 */
export interface DecodedRawMessageMessage {
    /**
     * 
     * @type {string}
     * @memberof DecodedRawMessageMessage
     */
    boc: string;
    /**
     * 
     * @type {string}
     * @memberof DecodedRawMessageMessage
     */
    decodedOpName?: string;
    /**
     * 
     * @type {string}
     * @memberof DecodedRawMessageMessage
     */
    opCode?: string;
    /**
     * 
     * @type {any}
     * @memberof DecodedRawMessageMessage
     */
    decodedBody?: any | null;
}

/**
 * Check if a given object implements the DecodedRawMessageMessage interface.
 */
export function instanceOfDecodedRawMessageMessage(value: object): value is DecodedRawMessageMessage {
    if (!('boc' in value) || value['boc'] === undefined) return false;
    return true;
}

export function DecodedRawMessageMessageFromJSON(json: any): DecodedRawMessageMessage {
    return DecodedRawMessageMessageFromJSONTyped(json, false);
}

export function DecodedRawMessageMessageFromJSONTyped(json: any, ignoreDiscriminator: boolean): DecodedRawMessageMessage {
    if (json == null) {
        return json;
    }
    return {
        
        'boc': json['boc'],
        'decodedOpName': json['decoded_op_name'] == null ? undefined : json['decoded_op_name'],
        'opCode': json['op_code'] == null ? undefined : json['op_code'],
        'decodedBody': json['decoded_body'] == null ? undefined : json['decoded_body'],
    };
}

  export function DecodedRawMessageMessageToJSON(json: any): DecodedRawMessageMessage {
      return DecodedRawMessageMessageToJSONTyped(json, false);
  }

  export function DecodedRawMessageMessageToJSONTyped(value?: DecodedRawMessageMessage | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'boc': value['boc'],
        'decoded_op_name': value['decodedOpName'],
        'op_code': value['opCode'],
        'decoded_body': value['decodedBody'],
    };
}
