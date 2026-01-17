"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc } from "firebase/firestore";
import { User, Heart, Phone, Calendar, Droplet, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Schema للمعلومات الأساسية
const basicInfoSchema = z.object({
    gender: z.enum(["male", "female"], { required_error: "الرجاء اختيار الجنس" }),
    dateOfBirth: z.string().min(1, { message: "الرجاء إدخال تاريخ الميلاد" }),
    bloodType: z.string().optional(),
});

// Schema للتاريخ الصحي
const medicalHistorySchema = z.object({
    chronicDiseases: z.array(z.string()).optional(),
    otherDiseases: z.string().optional(),
    allergies: z.string().optional(),
    currentMedications: z.string().optional(),
});

// Schema لمعلومات الطوارئ
const emergencyContactSchema = z.object({
    emergencyName: z.string().optional(),
    emergencyRelation: z.string().optional(),
    emergencyPhone: z.string().optional(),
});

const chronicDiseasesList = [
    { id: "diabetes", label: "السكري" },
    { id: "hypertension", label: "ضغط الدم" },
    { id: "asthma", label: "الربو" },
    { id: "heart", label: "أمراض القلب" },
    { id: "kidney", label: "أمراض الكلى" },
];

export default function MedicalProfilePage() {
    const [step, setStep] = useState(1);
    const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
    const { toast } = useToast();
    const router = useRouter();
    const auth = useAuth();
    const firestore = useFirestore();

    const basicForm = useForm<z.infer<typeof basicInfoSchema>>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            gender: undefined,
            dateOfBirth: "",
            bloodType: "",
        },
    });

    const medicalForm = useForm<z.infer<typeof medicalHistorySchema>>({
        resolver: zodResolver(medicalHistorySchema),
        defaultValues: {
            chronicDiseases: [],
            otherDiseases: "",
            allergies: "",
            currentMedications: "",
        },
    });

    const emergencyForm = useForm<z.infer<typeof emergencyContactSchema>>({
        resolver: zodResolver(emergencyContactSchema),
        defaultValues: {
            emergencyName: "",
            emergencyRelation: "",
            emergencyPhone: "",
        },
    });

    const handleDiseaseToggle = (diseaseId: string) => {
        setSelectedDiseases(prev =>
            prev.includes(diseaseId)
                ? prev.filter(id => id !== diseaseId)
                : [...prev, diseaseId]
        );
    };

    async function onSubmit() {
        try {
            const user = auth.currentUser;
            if (!user) {
                toast({
                    variant: "destructive",
                    title: "خطأ",
                    description: "يجب تسجيل الدخول أولاً",
                });
                return;
            }

            const userRef = doc(firestore, "users", user.uid);
            const medicalProfile = {
                ...basicForm.getValues(),
                chronicDiseases: selectedDiseases,
                otherDiseases: medicalForm.getValues().otherDiseases,
                allergies: medicalForm.getValues().allergies,
                currentMedications: medicalForm.getValues().currentMedications,
                ...emergencyForm.getValues(),
                profileCompleted: true,
                updatedAt: new Date().toISOString(),
            };

            await setDocumentNonBlocking(userRef, medicalProfile, { merge: true });

            toast({
                title: "تم حفظ ملفك الصحي بنجاح! ✅",
                description: "يمكنك الآن حجز مواعيدك بسهولة",
            });

            router.push("/");
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "حدث خطأ",
                description: "فشل في حفظ المعلومات. الرجاء المحاولة مرة أخرى.",
            });
        }
    }

    function skipProfile() {
        toast({
            title: "تم التخطي",
            description: "يمكنك إكمال ملفك الصحي لاحقاً من الإعدادات",
        });
        router.push("/");
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Card className="w-full max-w-2xl shadow-xl border-border/50">
                <CardHeader className="text-center space-y-2 pb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-headline bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                        ملفك الصحي الشخصي
                    </CardTitle>
                    <CardDescription className="text-base">
                        ساعدنا في تقديم رعاية أفضل لك من خلال إكمال معلوماتك الصحية
                    </CardDescription>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${s === step
                                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white scale-110"
                                        : s < step
                                            ? "bg-green-500 text-white"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`w-12 h-1 mx-1 rounded ${s < step ? "bg-green-500" : "bg-muted"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Step 1: المعلومات الأساسية */}
                    {step === 1 && (
                        <Form {...basicForm}>
                            <form className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <User className="h-5 w-5 text-green-600" />
                                        المعلومات الأساسية
                                    </h3>

                                    {/* الجنس */}
                                    <FormField
                                        control={basicForm.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>الجنس *</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex gap-4"
                                                    >
                                                        <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 flex-1 cursor-pointer hover:bg-accent">
                                                            <RadioGroupItem value="male" id="male" />
                                                            <label htmlFor="male" className="cursor-pointer flex-1">
                                                                ذكر 👨
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 flex-1 cursor-pointer hover:bg-accent">
                                                            <RadioGroupItem value="female" id="female" />
                                                            <label htmlFor="female" className="cursor-pointer flex-1">
                                                                أنثى 👩
                                                            </label>
                                                        </div>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* تاريخ الميلاد */}
                                    <FormField
                                        control={basicForm.control}
                                        name="dateOfBirth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    تاريخ الميلاد *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* فصيلة الدم */}
                                    <FormField
                                        control={basicForm.control}
                                        name="bloodType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Droplet className="h-4 w-4" />
                                                    فصيلة الدم
                                                    <span className="text-xs text-muted-foreground">(اختياري)</span>
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="اختر فصيلة الدم" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="A+">A+</SelectItem>
                                                        <SelectItem value="A-">A-</SelectItem>
                                                        <SelectItem value="B+">B+</SelectItem>
                                                        <SelectItem value="B-">B-</SelectItem>
                                                        <SelectItem value="AB+">AB+</SelectItem>
                                                        <SelectItem value="AB-">AB-</SelectItem>
                                                        <SelectItem value="O+">O+</SelectItem>
                                                        <SelectItem value="O-">O-</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        onClick={skipProfile}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        تخطي الآن
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (basicForm.trigger()) {
                                                setStep(2);
                                            }
                                        }}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                                    >
                                        التالي
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {/* Step 2: التاريخ الصحي */}
                    {step === 2 && (
                        <Form {...medicalForm}>
                            <form className="space-y-6">
                                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                                        <strong>معلومات سرية للغاية:</strong> هذه المعلومات تساعد طبيبك على تقديم رعاية أفضل. يمكنك تخطيها الآن وإضافتها لاحقاً.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-green-600" />
                                        التاريخ الصحي
                                    </h3>

                                    {/* الأمراض المزمنة */}
                                    <div className="space-y-3">
                                        <FormLabel>الأمراض المزمنة (إن وجدت)</FormLabel>
                                        <div className="grid grid-cols-2 gap-3">
                                            {chronicDiseasesList.map((disease) => (
                                                <div
                                                    key={disease.id}
                                                    className={`flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer transition-all ${selectedDiseases.includes(disease.id)
                                                        ? "bg-green-50 border-green-500 dark:bg-green-950/20"
                                                        : "hover:bg-accent"
                                                        }`}
                                                    onClick={() => handleDiseaseToggle(disease.id)}
                                                >
                                                    <Checkbox
                                                        checked={selectedDiseases.includes(disease.id)}
                                                        onCheckedChange={() => handleDiseaseToggle(disease.id)}
                                                    />
                                                    <label className="cursor-pointer text-sm flex-1">
                                                        {disease.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* أمراض أخرى */}
                                    <FormField
                                        control={medicalForm.control}
                                        name="otherDiseases"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>أمراض أخرى</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="مثال: حساسية الجيوب الأنفية..."
                                                        className="min-h-[80px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* الحساسيات */}
                                    <FormField
                                        control={medicalForm.control}
                                        name="allergies"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>الحساسيات (أدوية، أطعمة)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="مثال: حساسية من البنسلين، الفول السوداني..."
                                                        className="min-h-[80px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* الأدوية الحالية */}
                                    <FormField
                                        control={medicalForm.control}
                                        name="currentMedications"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>الأدوية الحالية</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="مثال: أسبرين 100mg يومياً..."
                                                        className="min-h-[80px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                        السابق
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                                    >
                                        التالي
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {/* Step 3: معلومات الطوارئ */}
                    {step === 3 && (
                        <Form {...emergencyForm}>
                            <form className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Phone className="h-5 w-5 text-green-600" />
                                        معلومات الاتصال للطوارئ
                                    </h3>

                                    <FormField
                                        control={emergencyForm.control}
                                        name="emergencyName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>اسم جهة الاتصال</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="مثال: محمد أحمد" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={emergencyForm.control}
                                        name="emergencyRelation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>العلاقة</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="اختر العلاقة" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="father">أب</SelectItem>
                                                        <SelectItem value="mother">أم</SelectItem>
                                                        <SelectItem value="spouse">زوج/ة</SelectItem>
                                                        <SelectItem value="sibling">أخ/أخت</SelectItem>
                                                        <SelectItem value="child">ابن/ابنة</SelectItem>
                                                        <SelectItem value="friend">صديق/ة</SelectItem>
                                                        <SelectItem value="other">أخرى</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={emergencyForm.control}
                                        name="emergencyPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>رقم الهاتف</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <div className="absolute right-3 top-3 flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span className="text-lg">🇸🇦</span>
                                                            <span dir="ltr">+966</span>
                                                        </div>
                                                        <Input
                                                            type="tel"
                                                            inputMode="numeric"
                                                            placeholder="512345678"
                                                            className="pr-24"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                        السابق
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={onSubmit}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                    >
                                        احفظ معلوماتي ✓
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
