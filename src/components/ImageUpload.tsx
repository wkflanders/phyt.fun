import React, { useEffect, useRef, useState } from 'react';
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

interface ImageUploadProps {
    onChange?: (value: string) => void;
}

export const ImageUpload = ({ onChange }: ImageUploadProps) => {
    const IKUploadRef = useRef(null);
    const [imageUrl, setImageUrl] = useState<string | null>("https://ik.imagekit.io/phyt/icon.png?updatedAt=1737542010549");
    const [fileName, setFileName] = useState<string | null>(null);

    const onError = (error: any) => {
        toast({
            title: "Image Upload Failed",
            description: `Your image could not be uploaded. Please try again`,
        });
    };

    const onSuccess = (res: any) => {
        const fullUrl = `${urlEndpoint}/${res.filePath}`;
        setImageUrl(fullUrl);
        setFileName(res.name);

        if (onChange) {
            onChange(fullUrl);
        }

        toast({
            title: "Image Uploaded Successfully",
            description: `Image uploaded successfully`
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
                className="upload-btn bg-phyt_form border-2 border-phyt_form_border"
            >

                <Image
                    src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFeyNj9PWXIurj6HFPzfoB0Zb1R7MUvkETnedi"
                    alt="upload-icon"
                    width={20}
                    height={20}
                />
                <p className="font-inter text-phyt_text">Upload a File</p>

                {fileName && <p className="upload-filename font-inter">{fileName}</p>}
            </button>

            {imageUrl && (
                <Image
                    className="mx-auto mt-4"
                    src={imageUrl}
                    alt="Avatar preview"
                    width={100}
                    height={100}
                />
            )}
        </ImageKitProvider>
    );
};