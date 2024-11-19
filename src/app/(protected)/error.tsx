'use client';

import React from 'react';
import Image from 'next/image';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '~/components/ui/card';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <Card className="mx-auto max-w-md">
                <CardHeader>
                    <div className="flex flex-row items-center justify-center">
                        <Image
                            src="/images/image-192.png"
                            alt="Digisales Logo"
                            width={80}
                            height={80}
                            priority
                        />
                    </div>

                    <CardTitle className="text-2xl text-center">Digisales</CardTitle>
                    <CardDescription className="text-center">
                        Something went wrong!
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4">
                        <div className="space-y-2 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <AlertCircle className="h-12 w-12 text-red-500" />
                                </div>
                            </div>

                            <p className="text-gray-600">
                                {error.message || 'An unexpected error has occurred. We are working on fixing this issue.'}
                            </p>
                        </div>

                        <div className="space-y-2 pt-4">
                            <Button
                                className="w-full"
                                onClick={() => window.location.href = '/sign-in'}
                            >
                                <Home className="h-4 w-4 mr-2" />
                                Return to Login
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => reset()}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}