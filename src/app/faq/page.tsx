import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    question: "كيف يمكنني حجز موعد؟",
    answer: "يمكنك حجز موعد بسهولة من خلال صفحة الخدمات، اختر الخدمة المطلوبة ثم اتبع الخطوات لاختيار الطبيب والوقت المناسب لك. ستحتاج إلى تسجيل الدخول لإتمام الحجز.",
  },
  {
    question: "هل بياناتي الصحية آمنة؟",
    answer: "نعم، نولي أهمية قصوى لأمان وخصوصية بياناتك. نستخدم أحدث تقنيات التشفير ونتبع معايير صارمة لحماية معلوماتك الصحية، ولا يتم مشاركتها مع أي طرف ثالث بدون موافقتك.",
  },
  {
    question: "ما هي طرق الدفع المتاحة؟",
    answer: "نوفر طرق دفع متعددة لتسهيل الأمر عليك، بما في ذلك البطاقات الائتمانية (Visa, MasterCard)، وخدمات الدفع الإلكتروني، بالإضافة إلى خيار الدفع النقدي لبعض الخدمات.",
  },
  {
    question: "كيف أحصل على نتائج التحاليل المخبرية؟",
    answer: "بعد إجراء التحليل، سيتم رفع النتائج مباشرة إلى حسابك في قسم 'السجلات الطبية'. ستتلقى إشعارًا عبر التطبيق والبريد الإلكتروني عندما تكون النتائج جاهزة للاطلاع عليها.",
  },
  {
    question: "هل يمكنني إلغاء أو إعادة جدولة موعدي؟",
    answer: "نعم، يمكنك إلغاء أو إعادة جدولة موعدك من خلال صفحة 'حجوزاتي'. يرجى ملاحظة أنه قد يتم تطبيق سياسة الإلغاء اعتمادًا على الخدمة وتوقيت الإلغاء.",
  },
  {
    question: "كيف تعمل خدمة الاستشارات عن بعد؟",
    answer: "خدمة الاستشارات عن بعد تتيح لك التحدث مع طبيب متخصص عبر مكالمة فيديو آمنة. كل ما تحتاجه هو اتصال جيد بالإنترنت وجهاز (هاتف ذكي أو حاسوب) مزود بكاميرا وميكروفون.",
  },
];

export default function FaqPage() {
  return (
    <div className="bg-background text-foreground">
      <header className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
            الأسئلة الشائعة
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            هل لديك أسئلة؟ لدينا الإجابات
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            جمعنا لك هنا إجابات على أكثر الأسئلة شيوعًا حول خدماتنا وكيفية استخدام المنصة.
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg font-semibold text-right hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
}
