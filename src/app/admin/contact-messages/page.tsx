'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2, Mail, MailOpen, Eye, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLanguage } from '@/contexts/language-context';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    createdAt: Timestamp;
    repliedAt?: Timestamp | null;
    replyMessage?: string | null;
    repliedBy?: string | null;
    ip?: string;
    userAgent?: string;
}

export default function ContactMessagesPage() {
    const { isAdmin, isLoading: isAuthLoading } = useAdminAuth();
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (firestore && isAdmin) {
            fetchMessages();
        }
    }, [firestore, isAdmin]);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const messagesRef = collection(firestore, 'contact_messages');
            const q = query(messagesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const fetchedMessages: ContactMessage[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ContactMessage));

            setMessages(fetchedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast({
                variant: 'destructive',
                title: language === 'ar' ? 'خطأ' : 'Error',
                description: language === 'ar' ? 'فشل تحميل الرسائل' : 'Failed to load messages',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (messageId: string) => {
        try {
            const messageRef = doc(firestore, 'contact_messages', messageId);
            await updateDoc(messageRef, {
                status: 'read'
            });

            // Update local state
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, status: 'read' as const } : msg
            ));

            toast({
                title: language === 'ar' ? 'تم التحديث' : 'Updated',
                description: language === 'ar' ? 'تم وضع علامة مقروء' : 'Marked as read',
            });
        } catch (error) {
            console.error('Error marking as read:', error);
            toast({
                variant: 'destructive',
                title: language === 'ar' ? 'خطأ' : 'Error',
                description: language === 'ar' ? 'فشل التحديث' : 'Failed to update',
            });
        }
    };

    const deleteMessage = async (messageId: string) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الرسالة؟' : 'Are you sure you want to delete this message?')) {
            return;
        }

        try {
            setIsDeleting(true);
            const messageRef = doc(firestore, 'contact_messages', messageId);
            await deleteDoc(messageRef);

            setMessages(prev => prev.filter(msg => msg.id !== messageId));
            setSelectedMessage(null);

            toast({
                title: language === 'ar' ? 'تم الحذف' : 'Deleted',
                description: language === 'ar' ? 'تم حذف الرسالة بنجاح' : 'Message deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            toast({
                variant: 'destructive',
                title: language === 'ar' ? 'خطأ' : 'Error',
                description: language === 'ar' ? 'فشل الحذف' : 'Failed to delete',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap = {
            unread: { label: language === 'ar' ? 'غير مقروء' : 'Unread', variant: 'destructive' as const },
            read: { label: language === 'ar' ? 'مقروء' : 'Read', variant: 'secondary' as const },
            replied: { label: language === 'ar' ? 'تم الرد' : 'Replied', variant: 'default' as const },
        };

        const { label, variant } = statusMap[status as keyof typeof statusMap] || statusMap.unread;
        return <Badge variant={variant}>{label}</Badge>;
    };

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp || !timestamp.toDate) return '';
        return timestamp.toDate().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isAuthLoading || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const unreadCount = messages.filter(m => m.status === 'unread').length;

    return (
        <div className="container mx-auto py-12 px-4 max-w-7xl space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline text-primary">
                        {language === 'ar' ? 'رسائل التواصل' : 'Contact Messages'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {language === 'ar' ? 'إدارة الرسائل الواردة من العملاء' : 'Manage incoming customer messages'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                        <Mail className="w-4 h-4 mr-2" />
                        {unreadCount} {language === 'ar' ? 'رسالة جديدة' : 'new'}
                    </Badge>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{language === 'ar' ? 'جميع الرسائل' : 'All Messages'}</CardTitle>
                    <CardDescription>
                        {language === 'ar' ? `إجمالي: ${messages.length} رسالة` : `Total: ${messages.length} messages`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                                <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                                <TableHead>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                                <TableHead>{language === 'ar' ? 'الرسالة' : 'Message'}</TableHead>
                                <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                                <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : messages.length > 0 ? (
                                messages.map((message) => (
                                    <TableRow key={message.id} className={message.status === 'unread' ? 'bg-primary/5 font-semibold' : ''}>
                                        <TableCell>{getStatusBadge(message.status)}</TableCell>
                                        <TableCell>{message.name}</TableCell>
                                        <TableCell className="font-mono text-sm">{message.email}</TableCell>
                                        <TableCell className="max-w-xs truncate">{message.message}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{formatDate(message.createdAt)}</TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedMessage(message);
                                                    if (message.status === 'unread') {
                                                        markAsRead(message.id);
                                                    }
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {message.status === 'unread' && (
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    onClick={() => markAsRead(message.id)}
                                                    title={language === 'ar' ? 'وضع علامة مقروء' : 'Mark as read'}
                                                >
                                                    <MailOpen className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => deleteMessage(message.id)}
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        {language === 'ar' ? 'لا توجد رسائل' : 'No messages'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Message Detail Dialog */}
            <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
                <DialogContent className="max-w-2xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            {language === 'ar' ? 'تفاصيل الرسالة' : 'Message Details'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedMessage && formatDate(selectedMessage.createdAt)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedMessage && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-muted-foreground">
                                        {language === 'ar' ? 'الاسم' : 'Name'}
                                    </label>
                                    <p className="text-lg">{selectedMessage.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-muted-foreground">
                                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                    </label>
                                    <p className="text-lg font-mono">{selectedMessage.email}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-muted-foreground">
                                    {language === 'ar' ? 'الحالة' : 'Status'}
                                </label>
                                <div className="mt-1">
                                    {getStatusBadge(selectedMessage.status)}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-muted-foreground">
                                    {language === 'ar' ? 'الرسالة' : 'Message'}
                                </label>
                                <Card className="mt-2 p-4 bg-muted/50">
                                    <p className="whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                                </Card>
                            </div>
                            {selectedMessage.ip && (
                                <div className="text-xs text-muted-foreground border-t pt-2">
                                    <span className="font-mono">IP: {selectedMessage.ip}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                            {language === 'ar' ? 'إغلاق' : 'Close'}
                        </Button>
                        {selectedMessage && (
                            <Button
                                variant="default"
                                onClick={() => {
                                    window.open(`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.message.substring(0, 50))}`, '_blank');
                                }}
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                {language === 'ar' ? 'الرد عبر البريد' : 'Reply via Email'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
