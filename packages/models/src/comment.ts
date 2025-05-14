import { z } from 'zod';

import {
    UUIDv7,
    ISODate,
    Comment,
    CommentInsert,
    CommentUpdate
} from '@phyt/types';

import { isUUIDv7, Iso } from './core.js';
import { InputError, ValidationError } from './errors.js';

interface CommentRow {
    id?: UUIDv7;
    postId: UUIDv7;
    userId: UUIDv7;
    parentCommentId: UUIDv7 | null;
    content: string;
    createdAt: ISODate;
    updatedAt: ISODate;
}

const MAX_LEN = 2_000;
const validate = (txt: string) => {
    if (!txt.trim()) throw new ValidationError('Empty comment');
    if (txt.length > MAX_LEN) throw new ValidationError('Comment too long');
};

export interface CommentVO extends CommentInsert {
    id?: UUIDv7;
    createdAt: Date;
    updatedAt: Date;
    updateContent(p: CommentUpdate): CommentVO;
    toDTO(): Comment;
    toNew(): CommentInsert;
}

const make = (row: CommentRow): CommentVO => {
    const updateContent = ({ content }: CommentUpdate): CommentVO =>
        make({
            ...row,
            content: (validate(content), content),
            updatedAt: new Date().toISOString() as ISODate
        });

    const toDTO = (): Comment => {
        if (!row.id) throw new InputError('Comment ID missing');
        return {
            id: row.id,
            postId: row.postId,
            userId: row.userId,
            content: row.content,
            parentCommentId: row.parentCommentId,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        };
    };

    const toNew = (): CommentInsert => ({
        postId: row.postId,
        userId: row.userId,
        parentCommentId: row.parentCommentId,
        content: row.content
    });

    return Object.freeze({
        ...toDTO(),
        updateContent,
        toDTO,
        toNew
    }) as CommentVO;
};

export const CommentVO = {
    create(input: CommentInsert): CommentVO {
        validate(input.content);
        const now = new Date().toISOString() as ISODate;
        return make({
            ...input,
            createdAt: now,
            updatedAt: now
        });
    },

    fromRow(raw: unknown): CommentVO {
        const row = z
            .object({
                id: z.custom(isUUIDv7),
                postId: z.custom(isUUIDv7),
                userId: z.custom(isUUIDv7),
                parentCommentId: z.custom(isUUIDv7).nullable(),
                content: z.string().min(1).max(MAX_LEN),
                createdAt: Iso(),
                updatedAt: Iso()
            })
            .parse(raw) as CommentRow;
        return make(row);
    }
};
