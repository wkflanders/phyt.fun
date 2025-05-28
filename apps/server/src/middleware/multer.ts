import { InputError } from '@phyt/models';

import multer from 'multer';


const storage = multer.memoryStorage();
const fileFilter = (
    _: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
): void => {
    // Only allow image files
    if (!/^image\/(jpeg|png|gif|webp)$/.exec(file.mimetype)) {
        cb(
            new InputError(
                'Only JPEG, PNG, GIF, and WebP image files are allowed'
            )
        );
        return;
    }
    cb(null, true);
};

export const avatarUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter
});
