"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowRight, ArrowLeft, Stethoscope, Brain, Heart, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function QuizPage() {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    // Questions data from translations
    const quizQuestions = [
        {
            id: 1,
            question: t.quiz.questions.age.question,
            icon: <Activity className="w-6 h-6" />,
            options: [
                { value: "under18", label: t.quiz.questions.age.options.under18 },
                { value: "18-30", label: t.quiz.questions.age.options['18-30'] },
                { value: "31-50", label: t.quiz.questions.age.options['31-50'] },
                { value: "51-70", label: t.quiz.questions.age.options['51-70'] },
                { value: "over70", label: t.quiz.questions.age.options.over70 }
            ]
        },
        {
            id: 2,
            question: t.quiz.questions.symptoms.question,
            icon: <Stethoscope className="w-6 h-6" />,
            options: [
                { value: "headache", label: t.quiz.questions.symptoms.options.headache },
                { value: "chestPain", label: t.quiz.questions.symptoms.options.chestPain },
                { value: "fatigue", label: t.quiz.questions.symptoms.options.fatigue },
                { value: "digestive", label: t.quiz.questions.symptoms.options.digestive },
                { value: "jointPain", label: t.quiz.questions.symptoms.options.jointPain },
                { value: "other", label: t.quiz.questions.symptoms.options.other }
            ]
        },
        {
            id: 3,
            question: t.quiz.questions.duration.question,
            icon: <Brain className="w-6 h-6" />,
            options: [
                { value: "days", label: t.quiz.questions.duration.options.days },
                { value: "weeks", label: t.quiz.questions.duration.options.weeks },
                { value: "months", label: t.quiz.questions.duration.options.months },
                { value: "years", label: t.quiz.questions.duration.options.years }
            ]
        },
        {
            id: 4,
            question: t.quiz.questions.chronic.question,
            icon: <Heart className="w-6 h-6" />,
            options: [
                { value: "diabetes", label: t.quiz.questions.chronic.options.diabetes },
                { value: "hypertension", label: t.quiz.questions.chronic.options.hypertension },
                { value: "heart", label: t.quiz.questions.chronic.options.heart },
                { value: "asthma", label: t.quiz.questions.chronic.options.asthma },
                { value: "none", label: t.quiz.questions.chronic.options.none }
            ]
        }
    ];

    // Determine recommendation based on answers
    const getRecommendedSpecialty = (answers: Record<number, string>) => {
        const symptom = answers[2];

        if (symptom === "headache" || symptom === "fatigue") {
            return {
                specialty: t.quiz.specialties.neurology.name,
                specialtyEn: "neurology",
                reason: t.quiz.specialties.neurology.reason,
                icon: "🧠"
            };
        } else if (symptom === "chestPain") {
            return {
                specialty: t.quiz.specialties.cardiology.name,
                specialtyEn: "cardiology",
                reason: t.quiz.specialties.cardiology.reason,
                icon: "❤️"
            };
        } else if (symptom === "digestive") {
            return {
                specialty: t.quiz.specialties.gastroenterology.name,
                specialtyEn: "gastroenterology",
                reason: t.quiz.specialties.gastroenterology.reason,
                icon: "🩺"
            };
        } else if (symptom === "jointPain") {
            return {
                specialty: t.quiz.specialties.orthopedics.name,
                specialtyEn: "orthopedics",
                reason: t.quiz.specialties.orthopedics.reason,
                icon: "🦴"
            };
        } else {
            return {
                specialty: t.quiz.specialties.internalMedicine.name,
                specialtyEn: "internal-medicine",
                reason: t.quiz.specialties.internalMedicine.reason,
                icon: "🏥"
            };
        }
    };

    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
    const currentAnswer = answers[quizQuestions[currentQuestion].id];

    const handleNext = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResults(true);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleAnswerChange = (value: string) => {
        setAnswers({
            ...answers,
            [quizQuestions[currentQuestion].id]: value
        });
    };

    const handleViewDoctors = () => {
        const recommendation = getRecommendedSpecialty(answers);
        router.push(`/specialized-clinics?specialty=${recommendation.specialtyEn}`);
    };

    if (showResults) {
        const recommendation = getRecommendedSpecialty(answers);

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="container mx-auto max-w-2xl">
                    <Card className="shadow-2xl border-2 border-primary/20">
                        <CardHeader className="text-center pb-6 bg-gradient-to-r from-primary/5 to-blue-600/5">
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center text-4xl">
                                    {recommendation.icon}
                                </div>
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                {t.quiz.resultsTitle}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{t.quiz.recommendedSpecialty}</p>
                                    <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                                        {recommendation.specialty}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-muted-foreground mb-2">💡 {t.quiz.recommendation}</p>
                                <p className="text-foreground leading-relaxed">
                                    {recommendation.reason}
                                </p>
                            </div>

                            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                                    ⚠️ {t.quiz.importantNote}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t.quiz.disclaimer}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    onClick={handleViewDoctors}
                                    className="flex-1 h-12 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                                >
                                    {t.quiz.viewDoctors}
                                    {language === 'ar' ? <ArrowLeft className="mr-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowResults(false);
                                        setCurrentQuestion(0);
                                        setAnswers({});
                                    }}
                                    variant="outline"
                                    className="h-12"
                                >
                                    {t.quiz.retakeQuiz}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container mx-auto max-w-3xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                        {t.quiz.title}
                    </h1>
                    <p className="text-muted-foreground">
                        {t.quiz.subtitle}
                    </p>
                </div>

                {/* Progress */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            {t.quiz.questionOf} {currentQuestion + 1} {t.quiz.from} {quizQuestions.length}
                        </span>
                        <span className="text-sm font-bold text-primary">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Question Card */}
                <Card className="shadow-xl border-2 border-border/50">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                {quizQuestions[currentQuestion].icon}
                            </div>
                            <CardTitle className="text-xl md:text-2xl">
                                {quizQuestions[currentQuestion].question}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
                            <div className="space-y-3">
                                {quizQuestions[currentQuestion].options.map((option) => (
                                    <div
                                        key={option.value}
                                        className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} p-4 rounded-lg border-2 cursor-pointer transition-all ${currentAnswer === option.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50 hover:bg-accent'
                                            }`}
                                        onClick={() => handleAnswerChange(option.value)}
                                    >
                                        <RadioGroupItem value={option.value} id={option.value} />
                                        <Label
                                            htmlFor={option.value}
                                            className="flex-1 cursor-pointer text-base"
                                        >
                                            {option.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6">
                    <Button
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        variant="outline"
                        className="flex-1 h-12"
                    >
                        {language === 'ar' ? <ArrowRight className="ml-2 h-5 w-5" /> : <ArrowLeft className="mr-2 h-5 w-5" />}
                        {t.quiz.previous}
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!currentAnswer}
                        className="flex-1 h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                    >
                        {currentQuestion === quizQuestions.length - 1 ? t.quiz.showResults : t.quiz.next}
                        {language === 'ar' ? <ArrowLeft className="mr-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
