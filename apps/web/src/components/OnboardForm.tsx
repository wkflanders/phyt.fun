'use client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

import Image from 'next/image';
import React, { useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { ZodType } from 'zod';

interface OnboardFormProps {
    schema: ZodType;
    defaultValues: {
        username: string;
    };
    onSubmit: (formData: FormData) => Promise<void>;
    isSubmitting?: boolean;
}

export const OnboardForm = ({
    schema,
    defaultValues,
    onSubmit,
    isSubmitting = false
}: OnboardFormProps) => {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid File Type',
                description: 'Please select an image file',
                variant: 'destructive'
            });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'File Too Large',
                description: 'Please select an image under 5MB',
                variant: 'destructive'
            });
            return;
        }

        setSelectedFile(file);
        setFileName(file.name);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (values: { username: string }) => {
        const formData = new FormData();
        formData.append('username', values.username);

        if (selectedFile) {
            formData.append('avatar', selectedFile);
        }

        await onSubmit(formData);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-12"
            >
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-inter">
                                Username
                            </FormLabel>
                            <FormControl>
                                <Input
                                    className="border-2 h-14 text-text font-inter"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className="font-inter">
                                This is your public display name
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormItem>
                    <FormLabel className="font-inter">Avatar</FormLabel>
                    <div className="flex flex-col items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />

                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="upload-btn bg-phyt_form border-2 border-phyt_form_border"
                        >
                            <Image
                                src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFeyNj9PWXIurj6HFPzfoB0Zb1R7MUvkETnedi"
                                alt="upload-icon"
                                width={20}
                                height={20}
                            />
                            <span className="font-inter text-phyt_text">
                                Upload Avatar
                            </span>
                        </Button>

                        {previewUrl && (
                            <>
                                <div className="relative w-24 h-24">
                                    <Image
                                        src={previewUrl}
                                        alt="Avatar preview"
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                {fileName && (
                                    <p className="text-sm text-phyt_text_secondary">
                                        {fileName}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </FormItem>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-xl font-inconsolata font-bold w-full h-14 bg-secondary hover:bg-secondary-shade"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>CREATING PROFILE...</span>
                        </>
                    ) : (
                        <span>CREATE PROFILE</span>
                    )}
                </Button>
            </form>
        </Form>
    );
};
