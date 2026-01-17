"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { UserMinus, Mail, Calendar, Loader2, Shield } from "lucide-react"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { useLanguage } from '@/contexts/language-context';
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AdminUser {
  uid: string
  email: string
  name: string
  createdAt: string
  invitationCode?: string
}

export default function ManageAdminsPage() {
  const { isAdmin, isLoading: isAuthLoading, user: currentUser } = useAdminAuth();
  const { toast } = useToast()
  const firestore = useFirestore()
  const { t, language } = useLanguage()

  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingUid, setDeletingUid] = useState<string | null>(null)
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null)

  // تحميل قائمة الأدمنز
  const loadAdmins = useCallback(async () => {
    if (!firestore || !isAdmin) return

    try {
      setLoading(true)
      const usersRef = collection(firestore, "users")
      const q = query(usersRef, where("role", "==", "admin"))
      const snapshot = await getDocs(q)

      const adminsList: AdminUser[] = []
      snapshot.forEach((docSnap) => {
        const data = docSnap.data()
        adminsList.push({
          uid: docSnap.id,
          email: data.email || "",
          name: data.name || "غير محدد",
          createdAt: data.createdAt || "",
          invitationCode: data.invitationCode,
        })
      })

      adminsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setAdmins(adminsList)
    } catch (error: any) {
      if (error.code !== 'permission-denied') {
        console.error("Error loading admins:", error)
        toast({
          variant: "destructive",
          title: t.admin.dashboard.actions.error,
          description: error.message || t.admin.dashboard.manageAdminsAdmin.toasts.errorDelete,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [firestore, isAdmin, toast, t.admin.dashboard.actions.error, t.admin.dashboard.manageAdminsAdmin.toasts.errorDelete])

  useEffect(() => {
    if (isAdmin) {
      loadAdmins()
    }
  }, [isAdmin, loadAdmins])

  async function confirmRemoveAdmin() {
    if (!firestore || !adminToDelete) return

    if (adminToDelete.uid === currentUser?.uid) {
      toast({
        variant: "destructive",
        title: t.admin.dashboard.manageAdminsAdmin.toasts.notAllowed,
        description: t.admin.dashboard.manageAdminsAdmin.toasts.notAllowedDesc,
      })
      return
    }

    try {
      setDeletingUid(adminToDelete.uid)

      // 1. إزالة Custom Claims من خلال API
      const response = await fetch("/api/admin/remove-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: adminToDelete.uid }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove admin claims")
      }

      // 2. تحديث role في Firestore
      const userRef = doc(firestore, "users", adminToDelete.uid)
      await updateDoc(userRef, {
        role: "user",
      })

      toast({
        title: t.admin.dashboard.actions.successDelete,
        description: `${t.admin.dashboard.manageAdminsAdmin.toasts.successDelete}: ${adminToDelete.email}`,
      })

      setAdminToDelete(null)
      loadAdmins()
    } catch (error: any) {
      console.error("Error removing admin:", error)
      toast({
        variant: "destructive",
        title: t.admin.dashboard.actions.error,
        description: error.message || t.admin.dashboard.manageAdminsAdmin.toasts.errorDelete,
      })
    } finally {
      setDeletingUid(null)
    }
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
        <h1 className="text-4xl font-bold mb-2">{t.admin.dashboard.manageAdminsAdmin.title}</h1>
        <p className="text-muted-foreground">
          {t.admin.dashboard.manageAdminsAdmin.subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.dashboard.manageAdminsAdmin.listTitle} ({admins.length})</CardTitle>
          <CardDescription>
            {t.admin.dashboard.manageAdminsAdmin.listDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.common.loading}
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.admin.dashboard.manageAdminsAdmin.table.noData}
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => {
                const isCurrentUser = admin.uid === currentUser?.uid
                const isDeleting = deletingUid === admin.uid

                return (
                  <div
                    key={admin.uid}
                    className={`p-4 border rounded-lg ${isCurrentUser
                      ? "bg-primary/5 border-primary/20"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">
                            {admin.name}
                            {isCurrentUser && (
                              <span className="mx-2 text-sm text-primary font-normal">
                                {t.admin.dashboard.manageAdminsAdmin.table.you}
                              </span>
                            )}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{admin.email}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {t.admin.dashboard.manageAdminsAdmin.table.date} {new Date(admin.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                            </span>
                          </div>

                          {admin.invitationCode && (
                            <div className="text-xs bg-muted px-2 py-1 rounded">
                              {t.admin.dashboard.manageAdminsAdmin.table.invitationCode} {admin.invitationCode}
                            </div>
                          )}
                        </div>
                      </div>

                      {!isCurrentUser && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => setAdminToDelete(admin)}
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserMinus className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!adminToDelete} onOpenChange={(open) => !open && setAdminToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.dashboard.manageAdminsAdmin.delete.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.dashboard.manageAdminsAdmin.delete.desc.replace('{email}', adminToDelete?.email || "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingUid}>{t.admin.dashboard.manageAdminsAdmin.delete.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmRemoveAdmin}
              disabled={!!deletingUid}
            >
              {t.admin.dashboard.manageAdminsAdmin.delete.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
