"use-client";

import React, { useRef, useState } from 'react';
import {
    IKImage, ImageKitProvider, IKUpload
} from 'imagekitio-next';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_ENDPOINT;

const authenticator = async () => {
    try {
        const response = await fetch(`/api/imagekit`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed ${errorText}`);
        }

        const data = await response.json();

        const { signature, expire, token } = data;

        return { signature, expire, token };
    } catch (error: any) {
        throw new Error(`Authentication request failed: , ${error.message}`);
    }
};

export const ImageUpload = () => {
    const IKUploadRef = useRef(null);
    const [file, setFile] = useState<{ filePath: string; } | null>(null);

    const onError = (error: any) => {
        toast({
            title: "Image Upload Failed",
            description: `Your image could not be uploaded. Please try again`,
        });
    };
    const onSuccess = (res: any) => {
        setFile(res);
        toast({
            title: "Image Uploaded Succesfully",
            description: `${res.filePath} uploaded`
        });
    };

    return (
        <ImageKitProvider
            publicKey={publicKey}
            urlEndpoint={urlEndpoint}
            authenticator={authenticator}
        >
            <IKUpload
                className="hidden"
                ref={IKUploadRef}
                onError={onError}
                onSuccess={onSuccess}
            />
            <button
                onClick={(e) => {
                    e.preventDefault();

                    if (IKUploadRef.current) {
                        // @ts-ignore
                        IKUploadRef.current?.click();
                    }
                }}
                className="upload-btn bg-phyt_form_bg border-2 border-phyt_form_border"
            >
                {!file && (
                    <>
                        <Image src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFeyNj9PWXIurj6HFPzfoB0Zb1R7MUvkETnedi" alt="upload-icon" width={20} height={20} />

                        <p className="font-inter text-phyt_text">Upload a File</p>
                    </>
                )}

                {file && <p className="upload-filename font-inter">{file.filePath}</p>}
            </button>

            {file && (
                <IKImage
                    className="mx-auto mt-4"
                    alt={file.filePath}
                    path={file.filePath}
                    width={300}
                    height={300}
                />
            )}
        </ImageKitProvider>
    );
};
