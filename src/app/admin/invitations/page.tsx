"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Copy, Plus, Trash2, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { useLanguage } from '@/contexts/language-context';
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface Invitation {
  id: string
  code: string
  createdAt: string
  createdBy: string
  expiresAt: string
  used: boolean
  usedBy?: string
  usedAt?: string
}

export default function AdminInvitationsPage() {
  const { isAdmin, isLoading: isAuthLoading, user } = useAdminAuth();
  const { toast } = useToast()
  const firestore = useFirestore()
  const { t, language } = useLanguage()

  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // تحميل الدعوات
  const loadInvitations = useCallback(async () => {
    if (!firestore || !isAdmin) return

    try {
      setLoading(true)
      const invitationsRef = collection(firestore, "admin_invitations")
      const snapshot = await getDocs(invitationsRef)

      const invitationsList: Invitation[] = []
      snapshot.forEach((docSnap) => {
        invitationsList.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as Invitation)
      })

      invitationsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setInvitations(invitationsList)
    } catch (error: any) {
      console.error("Error loading invitations:", error)
      toast({
        variant: "destructive",
        title: t.admin.dashboard.actions.error,
        description: error.message || t.admin.dashboard.invitationsAdmin.toasts.errorDelete,
      })
    } finally {
      setLoading(false)
    }
  }, [firestore, isAdmin, toast, t.admin.dashboard.actions.error, t.admin.dashboard.invitationsAdmin.toasts.errorDelete])

  useEffect(() => {
    if (isAdmin) {
      loadInvitations()
    }
  }, [isAdmin, loadInvitations])

  async function generateInvitation() {
    if (!user?.email || !firestore) return

    try {
      setGenerating(true)
      const code = `ADMIN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const invitationsRef = collection(firestore, "admin_invitations")
      await addDoc(invitationsRef, {
        code: code,
        createdAt: new Date().toISOString(),
        createdBy: user.email,
        expiresAt: expiresAt.toISOString(),
        used: false,
      })

      toast({
        title: t.admin.dashboard.invitationsAdmin.toasts.successCreate,
        description: `${t.admin.dashboard.invitationsAdmin.toasts.successCreate}: ${code}`,
      })

      loadInvitations()
    } catch (error: any) {
      console.error("Error generating invitation:", error)
      toast({
        variant: "destructive",
        title: t.admin.dashboard.actions.error,
        description: error.message || t.admin.dashboard.invitationsAdmin.toasts.errorCreate,
      })
    } finally {
      setGenerating(false)
    }
  }

  async function deleteInvitation(invitationId: string) {
    if (!firestore) return

    try {
      await deleteDoc(doc(firestore, "admin_invitations", invitationId))
      toast({
        title: t.admin.dashboard.actions.successDelete,
        description: t.admin.dashboard.invitationsAdmin.toasts.successDelete,
      })
      loadInvitations()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t.admin.dashboard.actions.error,
        description: t.admin.dashboard.invitationsAdmin.toasts.errorDelete,
      })
    }
  }

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code)
    toast({
      title: t.admin.dashboard.invitationsAdmin.toasts.successCopy,
      description: `${t.admin.dashboard.invitationsAdmin.toasts.successCopy}: ${code}`,
    })
  }

  function isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date()
  }

  if (isAuthLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 max-w-6xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t.admin.dashboard.invitationsAdmin.title}</h1>
        <p className="text-muted-foreground">
          {t.admin.dashboard.invitationsAdmin.subtitle}
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t.admin.dashboard.invitationsAdmin.createTitle}</CardTitle>
          <CardDescription>
            {t.admin.dashboard.invitationsAdmin.createDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateInvitation} disabled={generating} size="lg">
            <Plus className="w-4 h-4 ml-2" />
            {generating ? t.admin.dashboard.invitationsAdmin.creating : t.admin.dashboard.invitationsAdmin.createBtn}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.dashboard.invitationsAdmin.listTitle} ({invitations.length})</CardTitle>
          <CardDescription>
            {t.admin.dashboard.invitationsAdmin.listDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.common.loading}
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.admin.dashboard.invitationsAdmin.toasts.noData}
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const expired = isExpired(invitation.expiresAt)
                const canDelete = !invitation.used

                return (
                  <div
                    key={invitation.id}
                    className={`p-4 border rounded-lg ${invitation.used
                      ? "bg-green-50 dark:bg-green-950 border-green-200"
                      : expired
                        ? "bg-red-50 dark:bg-red-950 border-red-200"
                        : "bg-blue-50 dark:bg-blue-950 border-blue-200"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-lg font-bold bg-white dark:bg-slate-800 px-3 py-1 rounded">
                            {invitation.code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(invitation.code)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            {invitation.used ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-700 dark:text-green-300">
                                  {t.admin.dashboard.invitationsAdmin.status.used}
                                </span>
                              </>
                            ) : expired ? (
                              <>
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-red-700 dark:text-red-300">
                                  {t.admin.dashboard.invitationsAdmin.status.expired}
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-700 dark:text-blue-300">
                                  {t.admin.dashboard.invitationsAdmin.status.active}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="text-muted-foreground">
                            {t.admin.dashboard.invitationsAdmin.fields.createdBy} {invitation.createdBy}
                          </div>

                          <div className="text-muted-foreground">
                            {t.admin.dashboard.invitationsAdmin.fields.createdAt}{" "}
                            {new Date(invitation.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </div>

                          <div className="text-muted-foreground">
                            {t.admin.dashboard.invitationsAdmin.fields.expiresAt}{" "}
                            {new Date(invitation.expiresAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </div>
                        </div>

                        {invitation.used && invitation.usedBy && (
                          <div className="text-sm text-green-700 dark:text-green-300">
                            {t.admin.dashboard.invitationsAdmin.fields.usedBy
                              .replace('{user}', invitation.usedBy || "")
                              .replace('{date}', new Date(invitation.usedAt!).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'))}
                          </div>
                        )}
                      </div>

                      {canDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteInvitation(invitation.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
