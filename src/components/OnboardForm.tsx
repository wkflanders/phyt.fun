import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultValues, useForm, UseFormReturn, SubmitHandler, FieldValues, Path } from 'react-hook-form';
import { ZodType } from 'zod';

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageUpload } from './ImageUpload';

interface Props<T extends FieldValues> {
    schema: ZodType<T>;
    defaultValues: T;
    onSubmit: (data: T) => void,
    isSubmitting?: boolean;
}

export const OnboardForm = <T extends FieldValues>({
    schema,
    defaultValues,
    onSubmit,
    isSubmitting = false
}: Props<T>) => {
    const form: UseFormReturn<T> = useForm({
        resolver: zodResolver(schema),
        defaultValues: defaultValues as DefaultValues<T>
    });

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                    <FormField
                        control={form.control}
                        name={"username" as Path<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className=" font-inter">Username</FormLabel>
                                <FormControl>
                                    <Input className="border-2 border-phyt_form_border h-14 text-phyt_text font-inter" {...field} />
                                </FormControl>
                                <FormDescription className="font-inter">
                                    This is your public display name
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={"avatar_url" as Path<T>}
                        render={({ field: { value, onChange, ...field } }) => (
                            <FormItem>
                                <FormLabel className="text-phyt_text font-inter">Avatar URL</FormLabel>
                                <FormControl>
                                    <ImageUpload />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        className="text-xl font-inconsolata font-bold w-full h-14 bg-red hover:bg-red-100 hover:text-phyt_text_dark"
                    >
                        {isSubmitting ? 'CREATING PROFILE...' : 'CREATE PROFILE'}
                    </Button>
                </form>
            </Form>

        </div>
    );
};