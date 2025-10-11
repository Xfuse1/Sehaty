
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Doctor extends DocumentData {
    id: string;
    name: string;
    specialty: string;
}

export default function SpecializedClinicsPage() {
    const firestore = useFirestore();
    const { data: doctors, isLoading } = useCollection<Doctor>(
        useMemoFirebase(() => {
            if (!firestore) return null;
            return query(collection(firestore, 'doctors'));
        }, [firestore])
    );

    return (
        <div className="container mx-auto py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold font-headline text-primary">العيادات المتخصصة</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    تصفح قائمة الأطباء المتاحين.
                </p>
            </header>

            <main>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : doctors && doctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map(doctor => (
                            <Card key={doctor.id}>
                                <CardHeader>
                                    <CardTitle>{doctor.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{doctor.specialty}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>لا يوجد أطباء متاحون حالياً.</p>
                        <p className="text-sm">يرجى إضافتهم من خلال لوحة التحكم.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
