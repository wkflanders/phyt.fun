import { z } from 'zod';

import {
    UUIDv7,
    ISODate,
    CommentData,
    CreateCommentInput,
    UpdateCommentInput,
    CommentRecord
} from '@phyt/types';

import { isUUIDv7, Iso } from './core.js';
import { InputError, ValidationError } from './errors.js';

export interface Comment extends CommentData {
    updateContent(input: UpdateCommentInput): Comment;
    toDTO(): CommentData;
    toJSON(): CommentRecord;
}

export const Comment = (() => {
    const MAX_LEN = 2_000;
    const validate = (txt: string) => {
        if (!txt.trim()) throw new ValidationError('Empty comment');
        if (txt.length > MAX_LEN) throw new ValidationError('Comment too long');
    };

    const make = (record: CommentRecord): Comment => {
        const updateContent = ({ content }: UpdateCommentInput): Comment =>
            make({
                ...record,
                content: (validate(content), content),
                updatedAt: new Date().toISOString() as ISODate
            });

        const toDTO = (): CommentData => {
            if (!record.id) throw new InputError('Comment ID is required');
            return {
                id: record.id,
                postId: record.postId,
                userId: record.authorId,
                content: record.content,
                parentCommentId: record.parentCommentId ?? null,
                createdAt: new Date(record.createdAt),
                updatedAt: record.updatedAt
                    ? new Date(record.updatedAt)
                    : new Date(record.createdAt)
            };
        };

        const toJSON = (): CommentRecord => ({
            id: record.id,
            postId: record.postId,
            authorId: record.authorId,
            parentCommentId: record.parentCommentId ?? null,
            content: record.content,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        });

        return Object.freeze({
            ...toDTO(),
            updateContent,
            toDTO,
            toJSON
        }) as Comment;
    };

    return {
        create(input: CreateCommentInput): Comment {
            return make({
                postId: input.postId,
                authorId: input.userId,
                parentCommentId: input.parentCommentId,
                content: (validate(input.content), input.content),
                createdAt: new Date().toISOString() as ISODate
            });
        },
        fromRecord(raw: unknown): Comment {
            const record = z
                .object({
                    id: z.custom<UUIDv7>(isUUIDv7).optional(),
                    postId: z.custom<UUIDv7>(isUUIDv7),
                    authorId: z.custom<UUIDv7>(isUUIDv7),
                    parentCommentId: z
                        .custom<UUIDv7>(isUUIDv7)
                        .nullable()
                        .optional(),
                    content: z.string().min(1).max(MAX_LEN),
                    createdAt: Iso(),
                    updatedAt: Iso().optional()
                })
                .parse(raw);

            return make(record);
        }
    };
})();
