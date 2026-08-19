# Terra Ferro Tech

Terra Ferro Tech için geliştirilen modern, yönetilebilir traktör ve tarım makineleri web sitesi.

Proje; ürün kataloğu, galeri, teklif talepleri, içerik yönetimi, SEO, teknik PDF dokümanları ve isteğe bağlı ikinci el traktör modülünü tek bir yönetim paneli üzerinden kontrol edecek şekilde hazırlanmıştır.

## Canlı Site

- Website: `https://terraferrotech.com`
- Admin Panel: `https://terraferrotech.com/admin`

> Admin kullanıcı bilgileri ve gizli anahtarlar README içerisinde tutulmamalıdır.

## Teknolojiler

- **Next.js**
- **React**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Supabase**
- **Cloudinary**
- **Vercel**
- **Cloudflare**
- **Git / GitHub**

## Temel Özellikler

### Public Website

- Arnavutça web sitesi
- Responsive tasarım
- Traktör katalog sayfası
- Tarım makineleri katalog sayfası
- Ürün detay sayfaları
- Teknik özellikler
- Teknik PDF görüntüleme ve indirme
- Fotoğraf / video galerisi
- Hizmetler sayfası
- Hakkımızda sayfası
- İletişim sayfası
- Teklif talep formları
- Google Maps entegrasyonu
- Mobil uyumlu navbar
- Scroll tabanlı navbar davranışı
- SEO uyumlu sayfa yapısı

### Admin Panel

- Ürün yönetimi
- Traktör ve tarım makinesi ayrımı
- Kategori yönetimi
- Ürün arama ve filtreleme
- Ürün sıralama
- Görsel yükleme
- Cloudinary medya yönetimi
- Teknik PDF ekleme
- Slider yönetimi
- Galeri yönetimi
- Sayfa içerik yönetimi
- Firma bilgileri yönetimi
- Teklif talepleri
- Bildirim sistemi
- Kullanıcı yönetimi
- Güvenlik bölümü
- Yayın / taslak / arşiv mantığı

## İkinci El Traktör Modülü

Projede isteğe bağlı ikinci el traktör sistemi bulunmaktadır.

Public menü adı:

`Traktorë të Përdorur`

Özellikler:

- Admin panelinden aç / kapat
- Varsayılan olarak kapalı kullanılabilir
- İkinci el traktör ekleme
- Marka
- Model
- Model yılı
- Çalışma saati
- HP
- Kabin / ROPS
- 4x4 / 4x2
- Açıklama
- Fotoğraflar
- Teknik PDF
- Satışta
- Rezerve
- Satıldı
- Taslak
- Arşiv

Modül kapatıldığında kayıtlar silinmez; yalnızca public görünürlük kapatılır.

## Teklif Talepleri

Public sitedeki teklif formları veritabanına kaydedilir.

Teklif talepleri admin panelinde görüntülenebilir.

Teklif kayıtları şu kaynaklardan gelebilir:

- Genel iletişim formu
- Normal ürün detay sayfası
- İkinci el traktör detay sayfası

Admin tarafında:

- Yeni talepler görüntülenebilir
- Bildirim sayacı gösterilebilir
- Talepler okunmuş olarak işaretlenebilir
- Talepler silinebilir

## Veritabanı

Production veritabanı:

**Supabase PostgreSQL**

ORM:

**Prisma**

Temel tablolar / modeller proje sürümüne göre şunları içerebilir:

- `User`
- `Product`
- `ProductCategory`
- `Lead`
- `HomeSlide`
- `GalleryCategory`
- `GalleryItem`
- `PageContent`
- `CategoryPage`
- `SiteSettings`
- `HomeSection`
- `AuditLog`
- `UsedTractor`

> Prisma şeması için güncel kaynak her zaman `prisma/schema.prisma` dosyasıdır.

## Medya Yönetimi

Ürün ve galeri görselleri için **Cloudinary** kullanılmaktadır.

Cloudinary üzerinden:

- Ürün kapak görselleri
- Ürün galeri görselleri
- Slider görselleri
- Galeri görselleri
- Teknik PDF dosyaları

saklanabilir.

Gizli API anahtarları `.env` dosyalarında tutulmalıdır.

## Environment Variables

Örnek değişkenler:

```env
DATABASE_URL=""
DIRECT_URL=""

AUTH_SECRET=""

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

MAX_TECHNICAL_PDF_BYTES="20971520"
```

Production ortamında bu değerler **Vercel > Project > Environment Variables** bölümünden tanımlanmalıdır.

> `.env`, `.env.local`, `.env.supabase` gibi gizli bilgi içeren dosyaları GitHub'a göndermeyin.

## Kurulum

Projeyi klonlayın:

```bash
git clone https://github.com/furkanmertaks19-boop/terra-ferro-tech.git
cd terra-ferro-tech
```

Paketleri yükleyin:

```bash
npm install
```

Prisma Client oluşturun:

```bash
npx prisma generate
```

Development ortamını başlatın:

```bash
npm run dev
```

Varsayılan olarak:

```text
http://localhost:3000
```

## Prisma

Schema değişikliği sonrasında:

```bash
npx prisma generate
```

Migration oluşturmak için development ortamında:

```bash
npx prisma migrate dev
```

Production migration için:

```bash
npx prisma migrate deploy
```

### Önemli

Production veritabanında şu komutu kullanmayın:

```bash
npx prisma migrate reset
```

Bu işlem verileri silebilir.

## Build Kontrolü

Deploy öncesinde:

```bash
npx prisma generate
npm run typecheck
npm run build
```

Build başarılı olmadan production'a gönderilmemesi önerilir.

## Git Workflow

Değişiklikleri GitHub'a göndermek için:

```bash
git status
git add -A
git commit -m "Update project"
git push origin main
```

`main` branch GitHub'a push edildiğinde Vercel otomatik olarak yeni production deployment başlatır.

## Deployment

### Vercel

Frontend ve server-side Next.js uygulaması Vercel üzerinde çalışmaktadır.

Production branch:

```text
main
```

GitHub repository Vercel projesine bağlıdır.

Her başarılı `main` push sonrasında otomatik deployment oluşturulur.

### Supabase

PostgreSQL veritabanı Supabase üzerinde çalışır.

Prisma için production bağlantısında:

- `DATABASE_URL` → uygulama bağlantısı / pooler
- `DIRECT_URL` → migration / direct bağlantı

kullanılabilir.

### Cloudflare

Domain ve DNS yönetimi Cloudflare üzerindedir.

Ana domain:

```text
terraferrotech.com
```

`www` ve root domain Vercel production deployment'a yönlendirilmelidir.

DNS değişikliklerinden sonra SSL ve DNS yayılımı birkaç dakika sürebilir.

## SEO

Projede SEO için aşağıdaki yapılar kullanılmalıdır:

- `robots.txt`
- sitemap
- canonical URL
- page metadata
- Open Graph
- ürün bazlı dinamik metadata
- semantic heading yapısı
- responsive images
- uygun `alt` metinleri
- index / noindex kontrolü

İkinci el modülü kapalı olduğunda ikinci el sayfaları sitemap'e eklenmemeli ve indexlenmemelidir.

## Güvenlik

- Admin şifreleri hash olarak tutulmalıdır
- Plain-text şifre kullanılmamalıdır
- API secret değerleri client tarafına gönderilmemelidir
- `CLOUDINARY_API_SECRET` hiçbir zaman `NEXT_PUBLIC_` ile başlamamalıdır
- Admin route'ları yetki kontrolü ile korunmalıdır
- Form verileri server-side doğrulanmalıdır
- Database sorgularında Prisma kullanılmalıdır
- Environment variables GitHub repository içinde tutulmamalıdır

## Dosya Yapısı

Proje yapısı sürüme göre değişebilir ancak genel olarak:

```text
terra-ferro-tech/
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ lib/
│  └─ ...
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ public/
├─ package.json
├─ next.config.ts
└─ README.md
```

## Favicon

Next.js App Router kullanılıyorsa favicon genellikle:

```text
src/app/favicon.ico
```

veya:

```text
app/favicon.ico
```

dosyasından yönetilir.

## Production Güncelleme Akışı

Normal kod değişikliği:

```bash
git add -A
git commit -m "Update"
git push origin main
```

Eğer Prisma schema değişikliği varsa:

1. Migration dosyasını kontrol edin.
2. Production Supabase'e migration uygulayın.
3. Prisma Client üretin.
4. Build kontrolü yapın.
5. GitHub'a push edin.
6. Vercel deployment sonucunu kontrol edin.

## Proje Sahipliği / Devir

Proje ileride müşteriye tamamen bağımsız şekilde devredilebilir.

Devir sırasında müşteriye ait olması gereken hesaplar:

- GitHub
- Vercel
- Supabase
- Cloudinary
- Cloudflare
- Domain hesabı

Gizli anahtarlar ve şifreler ayrı ve güvenli şekilde aktarılmalıdır.

Repository içerisindeki kodun çalışması için gerekli production environment variable değerleri Vercel üzerinde yeniden tanımlanmalıdır.

## Bakım Notları

Yeni geliştirme yaparken:

- Mevcut verileri silmeyin
- Migration geçmişini bozmayın
- Production üzerinde `migrate reset` kullanmayın
- Cloudinary public URL kayıtlarını rastgele değiştirmeyin
- Admin panelindeki taslak / yayın mantığını koruyun
- Public sayfaların mobil görünümünü kontrol edin
- Vercel Runtime Logs üzerinden server hatalarını kontrol edin

## Lisans

Bu proje Terra Ferro Tech için özel olarak geliştirilmiştir.

Kullanım, dağıtım ve kaynak kod paylaşımı proje sahibi ve müşteri arasındaki anlaşmaya göre yapılmalıdır.

---

## Geliştirici

**Furkan Mert Aksungur**  
*Developer / IT Specialist*  
GitHub: `@furkanmertaks19-boop`

> Bu proje Terra Ferro Tech için Furkan Mert Aksungur tarafından geliştirilmiştir.

