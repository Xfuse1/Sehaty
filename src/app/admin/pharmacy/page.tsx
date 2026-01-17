"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Pill, ExternalLink, Image as ImageIcon, CheckCircle2, Clock, Truck, Package, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFirestore, useAuth } from '@/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Prescription {
    id: string;
    userId: string;
    patientName: string;
    imageUrl?: string;
    text: string;
    type: string;
    status: string;
    createdAt: any;
}

export default function AdminPharmacyPage() {
    const { t, language } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [requests, setRequests] = useState<Prescription[]>([]);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { isAdmin, isLoading: isAuthLoading } = useAdminAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const pharmaT = t.admin.pharmaAdmin;

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const q = query(
                    collection(firestore, 'prescriptions'),
                    where('type', '==', 'pharmacy'),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Prescription[];
                setRequests(data);
            } catch (error) {
                console.error('Error fetching pharmacy requests:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!isAuthLoading && isAdmin) {
            fetchRequests();
        }
    }, [firestore, isAdmin, isAuthLoading]);

    const handleStatusChange = async (requestId: string, newStatus: string) => {
        try {
            setUpdatingId(requestId);
            const requestRef = doc(firestore, 'prescriptions', requestId);
            await updateDoc(requestRef, { status: newStatus });

            setRequests(prev => prev.map(req =>
                req.id === requestId ? { ...req, status: newStatus } : req
            ));

            toast({
                title: t.admin.actions.successUpdate,
                description: pharmaT.status[newStatus as keyof typeof pharmaT.status] || newStatus,
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                variant: "destructive",
                title: t.admin.actions.error,
                description: t.admin.actions.errorSaving,
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'processing': return <Package className="h-4 w-4" />;
            case 'shipping': return <Truck className="h-4 w-4" />;
            case 'completed': return <CheckCircle2 className="h-4 w-4" />;
            case 'cancelled': return <XCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary';
            case 'processing': return 'default';
            case 'shipping': return 'outline';
            case 'completed': return 'outline'; // custom green would be better
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    if (isAuthLoading || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 md:py-12 px-4 max-w-7xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Pill className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black font-headline text-primary tracking-tight">
                        {pharmaT.title}
                    </h1>
                </div>
                <p className="text-muted-foreground font-medium">{pharmaT.subtitle}</p>
            </header>

            <Card className="shadow-xl border-border/50 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-6">
                    <CardTitle className="text-xl font-bold">{pharmaT.requestsTab}</CardTitle>
                    <CardDescription className="font-medium">
                        {language === 'ar' ? 'عرض ومتابعة طلبات الأدوية والروشتات' : 'View and track medication and prescription requests'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="font-bold">{pharmaT.table.user}</TableHead>
                                    <TableHead className="font-bold">{pharmaT.table.date}</TableHead>
                                    <TableHead className="font-bold">{pharmaT.table.prescription}</TableHead>
                                    <TableHead className="font-bold">{pharmaT.table.notes}</TableHead>
                                    <TableHead className="font-bold">{pharmaT.table.status}</TableHead>
                                    <TableHead className="font-bold text-center">{pharmaT.table.actions}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                        </TableCell>
                                    </TableRow>
                                ) : requests.length > 0 ? (
                                    requests.map((request) => (
                                        <TableRow key={request.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-semibold">{request.patientName}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {request.createdAt?.toDate ?
                                                    request.createdAt.toDate().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    }) : 'N/A'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {request.imageUrl ? (
                                                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(request.imageUrl, '_blank')}>
                                                        <ImageIcon className="h-4 w-4" />
                                                        {pharmaT.table.prescription}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">
                                                        {language === 'ar' ? 'لا توجد صورة' : 'No image'}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[200px] truncate" title={request.text}>
                                                    {request.text || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(request.status)} className="gap-1 px-3 py-1">
                                                    {getStatusIcon(request.status)}
                                                    {pharmaT.status[request.status as keyof typeof pharmaT.status] || request.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center min-w-[200px]">
                                                <Select
                                                    value={request.status}
                                                    onValueChange={(val) => handleStatusChange(request.id, val)}
                                                    disabled={updatingId === request.id}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        {updatingId === request.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                                        ) : (
                                                            <SelectValue />
                                                        )}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">{pharmaT.status.pending}</SelectItem>
                                                        <SelectItem value="processing">{pharmaT.status.processing}</SelectItem>
                                                        <SelectItem value="shipping">{pharmaT.status.shipping}</SelectItem>
                                                        <SelectItem value="completed">{pharmaT.status.completed}</SelectItem>
                                                        <SelectItem value="cancelled">{pharmaT.status.cancelled}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                                            {pharmaT.table.noRequests}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
