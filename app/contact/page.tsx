import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, MessageSquare, Phone, MapPin, Github, Send } from 'lucide-react';
import { ContactForm } from '@/components/contact/contact-form';

export const metadata: Metadata = {
  title: 'İletişim',
  description:
    'mekan.guru ile iletişime geçin. Sorularınız, önerileriniz ve geri bildirimleriniz için bizimle iletişime geçebilirsiniz.',
  keywords: [
    'iletişim',
    'destek',
    'yardım',
    'geri bildirim',
    'öneri',
    'contact',
  ],
  openGraph: {
    title: 'İletişim | mekan.guru',
    description: 'mekan.guru ile iletişime geçin',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      {/* Hero Section */}
      <section className="border-b border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              <MessageSquare className="h-4 w-4" />
              <span>İletişim</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-5xl">
              Bizimle İletişime Geçin
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Sorularınız, önerileriniz veya geri bildirimleriniz için size yardımcı olmaktan
              mutluluk duyarız.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ContactInfoCard
            icon={<Mail className="h-6 w-6" />}
            title="Email"
            description="info@localflavours.com"
            href="mailto:info@localflavours.com"
          />
          <ContactInfoCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="Destek"
            description="Sıkça Sorulan Sorular"
            href="/faq"
          />

          <ContactInfoCard
            icon={<MapPin className="h-6 w-6" />}
            title="Konum"
            description="İstanbul, Türkiye"
            href="#"
          />
        </div>
      </section>

      <Separator />

      {/* Contact Form Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <Badge variant="outline" className="mb-2">
              Mesaj Gönder
            </Badge>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Bize Ulaşın
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Formdan bize mesaj gönderin, en kısa sürede dönüş yapalım.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="border-t border-neutral-200 bg-gradient-to-br from-orange-50 to-white py-16 dark:border-neutral-800 dark:from-orange-950/20 dark:to-neutral-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2">
              {/* FAQ Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-orange-500" />
                    Sıkça Sorulan Sorular
                  </CardTitle>
                  <CardDescription>
                    Çoğu sorunuzun cevabı muhtemelen SSS sayfasında bulunabilir.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href="/faq"
                    className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    SSS Sayfasına Git
                    <Send className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>


            </div>

            {/* Response Time Note */}
            <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
              <h3 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-50">
                📧 Yanıt Süresi
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Mesajlarınıza genellikle <strong>24-48 saat</strong> içinde yanıt vermeye
                çalışıyoruz. Yoğun dönemlerde bu süre uzayabilir. Anlayışınız için teşekkür
                ederiz.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Contact Info Card Component
function ContactInfoCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  const content = (
    <Card className="group h-full transition-all hover:border-orange-500 hover:shadow-md dark:hover:border-orange-600">
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
          {icon}
        </div>
        <CardTitle className="text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );

  if (href === '#') {
    return content;
  }

  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <a href={href}>{content}</a>;
}
