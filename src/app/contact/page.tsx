"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', message: '' });

        toast({
          title: language === 'ar' ? '✅ تم الإرسال بنجاح!' : '✅ Sent Successfully!',
          description: result.message || (language === 'ar' ? 'سنتواصل معك قريباً' : 'We will contact you soon'),
        });

        // إعادة تعيين الحالة بعد 3 ثواني
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ في الإرسال' : 'Submission Error',
        description: error instanceof Error ? error.message : (language === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, please try again')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-20 pt-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-primary">{t.contact.title}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 border-s-4 border-s-primary shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="text-start" dir="auto">
                  <h3 className="font-bold mb-1">{t.contact.phoneTitle}</h3>
                  <p className="text-muted-foreground font-mono" dir="ltr">{t.contact.phoneNumber}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-s-4 border-s-secondary shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-full text-secondary">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-start" dir="auto">
                  <h3 className="font-bold mb-1">{t.contact.emailTitle}</h3>
                  <p className="text-muted-foreground font-mono break-all">{t.contact.emailAddress}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-s-4 border-s-orange-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-start" dir="auto">
                  <h3 className="font-bold mb-1">{t.contact.hoursTitle}</h3>
                  <p className="text-muted-foreground">{t.contact.hoursValue}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-s-4 border-s-gray-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-full text-gray-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-start" dir="auto">
                  <h3 className="font-bold mb-1">{t.contact.locationTitle}</h3>
                  <p className="text-muted-foreground">{t.contact.locationValue}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-start" dir="auto">{t.contact.formTitle}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2 text-start" dir="auto">
                    <label className="text-sm font-medium">{t.common.name}</label>
                    <Input
                      name="name"
                      placeholder={t.contact.namePlaceholder}
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-2 text-start" dir="auto">
                    <label className="text-sm font-medium">{t.common.email}</label>
                    <Input
                      type="email"
                      name="email"
                      placeholder={t.contact.emailPlaceholder}
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 mb-8 text-start" dir="auto">
                  <label className="text-sm font-medium">{t.common.message}</label>
                  <Textarea
                    name="message"
                    placeholder={t.contact.messagePlaceholder}
                    className="min-h-[150px]"
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full md:w-auto px-8 gap-2"
                  size="lg"
                  disabled={isSubmitting || isSuccess}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {language === 'ar' ? 'تم الإرسال!' : 'Sent!'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t.contact.sendButton}
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
