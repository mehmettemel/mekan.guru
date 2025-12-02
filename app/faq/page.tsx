import { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  HelpCircle,
  Users,
  MapPin,
  ThumbsUp,
  Star,
  Shield,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular (SSS)',
  description:
    'mekan.guru hakkında merak ettiğiniz her şey. Platform nasıl çalışır, koleksiyon nasıl oluşturulur, oylama sistemi ve daha fazlası.',
  keywords: [
    'mekanguru sss',
    'nasıl kullanılır',
    'koleksiyon oluşturma',
    'oylama sistemi',
    'mekan ekleme',
    'sıkça sorulan sorular',
  ],
  openGraph: {
    title: 'Sıkça Sorulan Sorular | mekan.guru',
    description: 'mekan.guru hakkında merak ettiğiniz her şey',
    type: 'website',
  },
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      {/* Hero Section */}
      <section className="border-b border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              <HelpCircle className="h-4 w-4" />
              <span>Sıkça Sorulan Sorular</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-5xl">
              Size Nasıl Yardımcı Olabiliriz?
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              mekan.guru hakkında merak ettiğiniz her şeyi burada bulabilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLinkCard
            title="Platform Hakkında"
            description="mekan.guru nedir?"
            icon={<Star className="h-5 w-5" />}
            href="#platform"
          />
          <QuickLinkCard
            title="Koleksiyonlar"
            description="Nasıl oluşturulur?"
            icon={<BookOpen className="h-5 w-5" />}
            href="#koleksiyonlar"
          />
          <QuickLinkCard
            title="Oylama Sistemi"
            description="Nasıl çalışır?"
            icon={<ThumbsUp className="h-5 w-5" />}
            href="#oylama"
          />
          <QuickLinkCard
            title="Hesap & Güvenlik"
            description="Gizlilik ve güvenlik"
            icon={<Shield className="h-5 w-5" />}
            href="#hesap"
          />
        </div>
      </section>

      <Separator />

      {/* FAQ Sections */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Platform Hakkında */}
          <div id="platform">
            <div className="mb-6">
              <Badge variant="outline" className="mb-2">
                Platform
              </Badge>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Platform Hakkında
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>mekan.guru nedir?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    mekan.guru, Türkiye'nin en iyi restoranlarını ve mekanlarını keşfetmenizi
                    sağlayan topluluk destekli bir platformdur. Kullanıcılar kendi koleksiyonlarını
                    oluşturabilir, mekanları oylayabilir ve şehir bazlı sıralamalarda en popüler
                    yerleri görebilir.
                  </p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Platformumuz, kişisel kürasyon ile topluluk bilgeliğini birleştirerek güvenilir
                    mekan önerileri sunar.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>mekan.guru ücretsiz mi?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Evet, mekan.guru tamamen ücretsizdir! Koleksiyon oluşturabilir, mekanları
                    oylayabilir ve tüm özelliklere sınırsız erişebilirsiniz. Herhangi bir ücret
                    talep edilmez.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Platform nasıl para kazanıyor?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Şu anda platformumuz kar amacı gütmeden, topluluk için çalışmaktadır. Gelecekte
                    premium özellikler veya restoran sahipleri için tanıtım paketleri
                    sunabiliriz, ancak temel özellikler her zaman ücretsiz kalacaktır.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Hangi şehirlerde aktifsiniz?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Şu anda İstanbul, Ankara, İzmir başta olmak üzere Türkiye'nin tüm şehirlerinde
                    aktifiz. Kullanıcılarımız herhangi bir şehirden mekan ekleyebilir ve
                    koleksiyon oluşturabilir.
                  </p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Popüler şehirlerimiz: İstanbul, Ankara, İzmir, Antalya, Bursa, Adana,
                    Gaziantep, Konya ve daha fazlası.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Koleksiyonlar */}
          <div id="koleksiyonlar">
            <div className="mb-6">
              <Badge variant="outline" className="mb-2">
                Koleksiyonlar
              </Badge>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Koleksiyon Oluşturma
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="coll-1">
                <AccordionTrigger>Koleksiyon nedir?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Koleksiyon, belirli bir temaya göre oluşturduğunuz mekan listesidir. Örneğin,
                    "İstanbul'daki En İyi Adana Kebapçıları" veya "Ankara'da Kahvaltı Yapılacak
                    Yerler" gibi.
                  </p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Her koleksiyon bir şehir, kategori ve alt kategoriye sahiptir. Mekanları
                    istediğiniz sıraya koyabilir, her biri için ünlü ürünler belirtebilir ve
                    küratör notu ekleyebilirsiniz.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="coll-2">
                <AccordionTrigger>Nasıl koleksiyon oluşturabilirim?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-neutral-600 dark:text-neutral-400">
                    <p className="font-medium">Adım adım koleksiyon oluşturma:</p>
                    <ol className="list-decimal space-y-2 pl-5">
                      <li>
                        Giriş yapın (sağ üstteki "Giriş Yap" butonundan kayıt olun veya giriş
                        yapın)
                      </li>
                      <li>Ana sayfada veya "Koleksiyonlarım" sayfasında "Yeni Koleksiyon" butonuna tıklayın</li>
                      <li>
                        Koleksiyonunuza bir başlık verin (örn: "İstanbul'daki En İyi Kebapçılar")
                      </li>
                      <li>Açıklama ekleyin (opsiyonel ama önerilir)</li>
                      <li>Şehir ve kategori seçin</li>
                      <li>
                        Mekanları ekleyin (Google Places API ile arama yapabilir veya mevcut
                        mekanlardan seçebilirsiniz)
                      </li>
                      <li>
                        Her mekan için ünlü ürünlerini belirtin (örn: "Adana Kebap", "Ayran")
                      </li>
                      <li>Mekanları sürükle-bırak ile sıralayın</li>
                      <li>"Koleksiyonu Kaydet" butonuna tıklayın</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="coll-3">
                <AccordionTrigger>
                  Koleksiyonuma kaç mekan ekleyebilirim?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Şu anda bir koleksiyona ekleyebileceğiniz mekan sayısında bir sınır yoktur.
                    Ancak kaliteli ve anlamlı koleksiyonlar için 5-15 mekan arası önerilir.
                  </p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Çok fazla mekan eklemek yerine, gerçekten beğendiğiniz ve önerdiğiniz
                    mekanları eklemenizi öneririz. Küratörlü içerik daha değerlidir!
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="coll-4">
                <AccordionTrigger>
                  Koleksiyonumu düzenleyebilir miyim?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Evet! Kendi oluşturduğunuz koleksiyonları istediğiniz zaman düzenleyebilir,
                    mekan ekleyebilir/çıkarabilir, sıralamayı değiştirebilir ve bilgileri
                    güncelleyebilirsiniz.
                  </p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Koleksiyon sayfasında sağ üstteki "Düzenle" butonunu kullanabilirsiniz.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="coll-5">
                <AccordionTrigger>
                  Öne çıkan koleksiyon nedir?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Öne çıkan koleksiyonlar, admin tarafından seçilen ve ana sayfada özel olarak
                    görüntülenen kaliteli koleksiyonlardır. Yüksek oy alan, kapsamlı ve faydalı
                    koleksiyonlar öne çıkarılma şansına sahiptir.
                  </p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Koleksiyonunuzun öne çıkarılması için kaliteli içerik oluşturun, mekanlar için
                    detaylı notlar ekleyin ve topluluğa değer katın.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Oylama Sistemi */}
          <div id="oylama">
            <div className="mb-6">
              <Badge variant="outline" className="mb-2">
                Oylama
              </Badge>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Oylama Sistemi
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="vote-1">
                <AccordionTrigger>Oylama sistemi nasıl çalışır?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Kullanıcılar hem mekanlara hem de koleksiyonlara upvote (👍) veya downvote
                    (👎) vererek oy kullanabilir. Oylar, mekanların ve koleksiyonların sıralamada
                    nerede görüneceğini belirler.
                  </p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Liderlik tablosunda en çok oy alan mekanlar üst sıralarda yer alır. Bu sistem
                    topluluk tarafından en beğenilen yerlerin öne çıkmasını sağlar.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="vote-2">
                <AccordionTrigger>
                  Oy ağırlığı nedir? Hesap yaşı neden önemli?
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-neutral-600 dark:text-neutral-400">
                    <p>
                      Spam ve manipülasyonu önlemek için, oyların ağırlığı hesap yaşına göre
                      değişir:
                    </p>
                    <ul className="space-y-1 pl-5">
                      <li>
                        <strong>0-7 gün:</strong> Oy ağırlığı 0.1 (yeni hesaplar)
                      </li>
                      <li>
                        <strong>8-30 gün:</strong> Oy ağırlığı 0.3
                      </li>
                      <li>
                        <strong>31-90 gün:</strong> Oy ağırlığı 0.5
                      </li>
                      <li>
                        <strong>91-180 gün:</strong> Oy ağırlığı 0.7
                      </li>
                      <li>
                        <strong>180+ gün:</strong> Oy ağırlığı 1.0 (tam ağırlık)
                      </li>
                    </ul>
                    <p className="mt-2">
                      Bu sistem, platformu uzun süredir kullanan güvenilir kullanıcıların
                      oylarının daha fazla değer taşımasını sağlar.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="vote-3">
                <AccordionTrigger>
                  Oyumu değiştirebilir miyim?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Evet! Verdiğiniz oyu istediğiniz zaman değiştirebilirsiniz. Upvote'u downvote
                    yapabilir, oyunuzu geri çekebilir veya tekrar verebilirsiniz.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="vote-4">
                <AccordionTrigger>
                  Her mekana/koleksiyona sadece bir kez mi oy verebilirim?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Evet, her mekan ve koleksiyon için bir kullanıcı sadece bir oy kullanabilir.
                    Ancak oyunuzu upvote'tan downvote'a (veya tam tersi) değiştirebilirsiniz.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Mekan Ekleme */}
          <div id="mekanlar">
            <div className="mb-6">
              <Badge variant="outline" className="mb-2">
                Mekanlar
              </Badge>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Mekan Ekleme
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="place-1">
                <AccordionTrigger>Nasıl mekan ekleyebilirim?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Mekan eklemek için koleksiyon oluştururken veya admin panelinden (eğer
                    yetkiniz varsa) mekan ekleyebilirsiniz. Google Places API entegrasyonu
                    sayesinde mekan adını yazdığınızda otomatik olarak adres, telefon ve konum
                    bilgileri doldurulur.
                  </p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    MVP aşamasında eklenen mekanlar otomatik olarak onaylanmaktadır.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="place-2">
                <AccordionTrigger>
                  Eklediğim mekan görünmüyor, neden?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    MVP aşamasında mekanlar otomatik onaylanmaktadır. Eğer mekanınız
                    görünmüyorsa, muhtemelen duplike kontrol sistemi tarafından engellenmiştir
                    (aynı mekan zaten var).
                  </p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Eğer sorun devam ediyorsa, lütfen bizimle iletişime geçin.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="place-3">
                <AccordionTrigger>
                  Yanlış bilgisi olan mekanı nasıl düzeltebilirim?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Şu anda mekan bilgilerini sadece admin kullanıcılar düzenleyebilir. Eğer bir
                    mekanın bilgilerinde hata görürseniz, lütfen bizimle iletişime geçin veya
                    gelecekte eklenecek "Düzenleme Öner" özelliğini kullanabilirsiniz.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Hesap & Güvenlik */}
          <div id="hesap">
            <div className="mb-6">
              <Badge variant="outline" className="mb-2">
                Hesap
              </Badge>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Hesap & Güvenlik
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="acc-1">
                <AccordionTrigger>Nasıl kayıt olabilirim?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Sağ üstteki "Giriş Yap" butonuna tıklayın ve "Kayıt Ol" sekmesine geçin.
                    Email, kullanıcı adı ve şifre girmeniz yeterlidir. Email doğrulaması
                    opsiyoneldir.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="acc-2">
                <AccordionTrigger>Şifremi unuttum, ne yapmalıyım?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Giriş sayfasında "Şifremi Unuttum" linkine tıklayın. Email adresinizi
                    girdikten sonra şifre sıfırlama linki gönderilecektir.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="acc-3">
                <AccordionTrigger>
                  Kullanıcı adımı değiştirebilir miyim?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Şu anda kullanıcı adı değiştirme özelliği bulunmamaktadır. Gelecek
                    güncellemelerde bu özellik eklenebilir.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="acc-4">
                <AccordionTrigger>
                  Hesabımı silebilir miyim?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Evet, hesabınızı silmek için ayarlar sayfasından "Hesabı Sil" butonunu
                    kullanabilirsiniz. Bu işlem geri alınamaz ve tüm verileriniz silinir
                    (koleksiyonlar, oylar, vb.).
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="acc-5">
                <AccordionTrigger>
                  Verilerim güvende mi?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Evet! Verileriniz Supabase (PostgreSQL) veritabanında güvenli şekilde
                    saklanmaktadır. Şifreleriniz hash'lenerek saklanır ve asla düz metin olarak
                    tutulmaz. HTTPS ile şifreli bağlantı kullanılmaktadır.
                  </p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Email adresiniz asla üçüncü taraflarla paylaşılmaz.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Diğer */}
          <div id="diger">
            <div className="mb-6">
              <Badge variant="outline" className="mb-2">
                Diğer
              </Badge>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Diğer Sorular
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="other-1">
                <AccordionTrigger>
                  Mobile uygulama var mı?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Şu anda sadece web platformu mevcuttur. Ancak site tamamen mobil uyumlu
                    (responsive) olarak tasarlanmıştır ve mobil tarayıcınızdan rahatça
                    kullanabilirsiniz.
                  </p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Gelecekte iOS ve Android uygulamaları planlanmaktadır.
                  </p>
                </AccordionContent>
              </AccordionItem>


            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-neutral-200 bg-gradient-to-br from-orange-50 to-white py-16 dark:border-neutral-800 dark:from-orange-950/20 dark:to-neutral-900">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-2xl border-orange-200 dark:border-orange-900/50">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Sorunuz Cevaplanmadı mı?
              </CardTitle>
              <CardDescription className="text-center">
                Size yardımcı olmaktan mutluluk duyarız
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/">Ana Sayfaya Dön</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/my-collections">Koleksiyon Oluştur</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

// Quick Link Card Component
function QuickLinkCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <a href={href}>
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
    </a>
  );
}
