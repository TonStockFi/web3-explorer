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
import type { Refund } from './Refund';
import {
    RefundFromJSON,
    RefundFromJSONTyped,
    RefundToJSON,
    RefundToJSONTyped,
} from './Refund';
import type { EncryptedComment } from './EncryptedComment';
import {
    EncryptedCommentFromJSON,
    EncryptedCommentFromJSONTyped,
    EncryptedCommentToJSON,
    EncryptedCommentToJSONTyped,
} from './EncryptedComment';
import type { AccountAddress } from './AccountAddress';
import {
    AccountAddressFromJSON,
    AccountAddressFromJSONTyped,
    AccountAddressToJSON,
    AccountAddressToJSONTyped,
} from './AccountAddress';

/**
 * 
 * @export
 * @interface TonTransferAction
 */
export interface TonTransferAction {
    /**
     * 
     * @type {AccountAddress}
     * @memberof TonTransferAction
     */
    sender: AccountAddress;
    /**
     * 
     * @type {AccountAddress}
     * @memberof TonTransferAction
     */
    recipient: AccountAddress;
    /**
     * amount in nanotons
     * @type {number}
     * @memberof TonTransferAction
     */
    amount: number;
    /**
     * 
     * @type {string}
     * @memberof TonTransferAction
     */
    comment?: string;
    /**
     * 
     * @type {EncryptedComment}
     * @memberof TonTransferAction
     */
    encryptedComment?: EncryptedComment;
    /**
     * 
     * @type {Refund}
     * @memberof TonTransferAction
     */
    refund?: Refund;
}

/**
 * Check if a given object implements the TonTransferAction interface.
 */
export function instanceOfTonTransferAction(value: object): value is TonTransferAction {
    if (!('sender' in value) || value['sender'] === undefined) return false;
    if (!('recipient' in value) || value['recipient'] === undefined) return false;
    if (!('amount' in value) || value['amount'] === undefined) return false;
    return true;
}

export function TonTransferActionFromJSON(json: any): TonTransferAction {
    return TonTransferActionFromJSONTyped(json, false);
}

export function TonTransferActionFromJSONTyped(json: any, ignoreDiscriminator: boolean): TonTransferAction {
    if (json == null) {
        return json;
    }
    return {
        
        'sender': AccountAddressFromJSON(json['sender']),
        'recipient': AccountAddressFromJSON(json['recipient']),
        'amount': json['amount'],
        'comment': json['comment'] == null ? undefined : json['comment'],
        'encryptedComment': json['encrypted_comment'] == null ? undefined : EncryptedCommentFromJSON(json['encrypted_comment']),
        'refund': json['refund'] == null ? undefined : RefundFromJSON(json['refund']),
    };
}

  export function TonTransferActionToJSON(json: any): TonTransferAction {
      return TonTransferActionToJSONTyped(json, false);
  }

  export function TonTransferActionToJSONTyped(value?: TonTransferAction | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'sender': AccountAddressToJSON(value['sender']),
        'recipient': AccountAddressToJSON(value['recipient']),
        'amount': value['amount'],
        'comment': value['comment'],
        'encrypted_comment': EncryptedCommentToJSON(value['encryptedComment']),
        'refund': RefundToJSON(value['refund']),
    };
}
