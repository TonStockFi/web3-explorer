import Avatar from '@web3-explorer/uikit-mui/dist/mui/Avatar';
import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';
import { useEffect, useState } from 'react';
import TgUserService from '../services/TgUserService';

export const AvatarCache = new Map<string, string>();
export const NameCache = new Map<string, string>();

export default function AvatarView({
    userId,
    name,
    full
}: {
    full?: boolean;
    userId: string;
    name?: string;
}) {
    const [avatar, setAvatar] = useState(AvatarCache.get(userId) || '');
    const [nameVal, setNameVal] = useState(NameCache.get(userId) || '');
    useEffect(() => {
        const service = new TgUserService(userId);
        if (!avatar) {
            service
                .getAvatar()
                .then(res => {
                    //console.log(userId, res);
                    if (res) {
                        setAvatar(res);
                        AvatarCache.set(userId, res);
                    }
                })
                .catch(console.error);
        }
        if (!name) {
            service
                .get()
                .then(res => {
                    if (res) {
                        setNameVal(res.firstName);
                        NameCache.set(userId, res.firstName);
                    }
                })
                .catch(console.error);
        }
    }, [userId, avatar, name]);
    const node = (
        <Avatar sx={{ mr: full ? 1 : 2, width: 24, height: 24 }} alt="Avatar" src={avatar}>
            {nameVal.substring(0, 1)}
        </Avatar>
    );
    if (full) {
        if (!nameVal) {
            return null;
        }
        return (
            <View row aCenter>
                {node} {nameVal}
            </View>
        );
    } else {
        return node;
    }
}
