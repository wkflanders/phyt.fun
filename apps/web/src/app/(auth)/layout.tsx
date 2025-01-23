import Image from 'next/image';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode; }) {
    return (
        <main className="auth-container">
            <section className="auth-form">
                <div className="auth-box">
                    <div className="flex flex-row gap-3 my-8">
                        <Image src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFduORvackTPlRILfDrtYWge59yzhSjpFisE6v" alt="logo" width={400} height={400} />
                    </div>

                    <div className="my-8">
                        {children}
                    </div>
                </div>
            </section>

            <section className="auth-illustration">
                <Image
                    src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFtMbRka3eIV0DWvzEjTGN8LRyCBrUu2QqfF5J"
                    alt="auth-img"
                    height={1000}
                    width={2000}
                    className="size-full object-cover"
                />
            </section>
        </main>
    );
}
