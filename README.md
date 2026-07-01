# Mutant Lab — Web Sitesi Paketi

Bu klasör, Claude artifact'ında geliştirdiğimiz oyunun **gerçek bir web
sitesinde çalışacak** haline getirilmiş sürümüdür.

## Ne Değişti?

- Oyun kodu (`src/App.jsx`) **birebir aynı** — hiçbir oyun mantığı
  değiştirilmedi.
- Claude'a özel `window.storage` API'si, `src/storage-shim.js` ile
  **`localStorage` üzerine** kuruldu. Yani artık kayıtlar tarayıcının
  kendi hafızasında tutuluyor.

## ⚠️ Önemli Sınırlama: Lider Tablosu

**GÜNCELLEME:** Lider tablosu artık Supabase'e bağlı — GERÇEKTEN paylaşımlı
ve kalıcı. Kendi ilerlemen (mutantlar, hurda vb.) hâlâ `localStorage`'da,
yani cihaza özel kalıyor — bu zaten doğru davranış.

### Supabase Kurulumu (tek seferlik)

1. [supabase.com](https://supabase.com) üzerinde ücretsiz hesap aç, yeni
   bir proje oluştur.
2. Proje panelinde **SQL Editor**'a git, bu klasördeki
   `supabase-schema.sql` dosyasının içeriğini yapıştırıp çalıştır.
3. **Project Settings → API**'den "Project URL" ve "anon public" anahtarını
   kopyala.
4. `src/supabase-client.js` dosyasını aç, `SUPABASE_URL` ve
   `SUPABASE_ANON_KEY` değerlerini kendi bilgilerinle değiştir.
5. `npm run build` ile yeniden derle, sitene tekrar yükle (veya GitHub'a
   push edip Netlify'ın otomatik yeniden derlemesini bekle).

### Hile Konusunda Dürüst Not

Bu kurulum lider tablosunu GERÇEKTEN paylaşımlı yapar, ama skor hâlâ
tarayıcıda hesaplanıp sunucuya gönderiliyor — teknik bilgisi olan biri
API'ye doğrudan sahte bir sayı gönderebilir (SQL şemasındaki 0-100000
sınırı sadece saçma değerleri engeller, akıllıca sahtekarlığı değil).
Tam koruma için bir Supabase Edge Function ile skorun sunucu tarafında
gönderilen canlı verisinden yeniden hesaplanıp doğrulanması gerekir —
istersen bunu da birlikte ekleyebiliriz.

## Kurulum ve Test (Kendi Bilgisayarında)

Bilgisayarında [Node.js](https://nodejs.org) kurulu olmalı (18 veya üzeri).

```bash
# 1. Bağımlılıkları kur (sadece ilk seferde gerekir)
npm install

# 2. Geliştirme sunucusunu başlat (canlı önizleme için)
npm run dev
```

Terminalde çıkan `http://localhost:5173` adresini tarayıcında aç, oyunu
orada test edebilirsin.

## Siteye Yükleme (Yayına Alma)

```bash
# Üretim için statik dosyaları üret
npm run build
```

Bu komut bir `dist/` klasörü oluşturur — içinde birkaç HTML/JS/CSS
dosyası vardır. Yapman gereken tek şey:

1. `dist/` klasörünün İÇİNDEKİ dosyaları (klasörün kendisini değil,
   içeriğini) kendi sitenin sunucusuna FTP/dosya yöneticisi ile
   yüklemek (örneğin `public_html/mutant-lab/` gibi bir alt klasöre).
2. Tarayıcıdan `siten.com/mutant-lab/` adresine gidip test etmek.

### Alternatif: Ücretsiz Barındırma (Kendi Sunucun Yoksa)

Eğer ayrı bir hosting hesabın yoksa, [Vercel](https://vercel.com) veya
[Netlify](https://netlify.com) gibi servisler bu klasörü GitHub'a
bağlayıp otomatik olarak yayınlayabilir — tamamen ücretsiz ve kod
bilgisi gerektirmez, sadece hesap açıp klasörü sürükle-bırak yapman
yeterli.

## Sonraki Adımlar (İsteğe Bağlı)

- **Gerçek reklam:** `MarketView` içindeki reklam simülasyonunun
  yerine Google AdSense / rewarded video ağı entegre edilebilir.
- **Gerçek ödeme:** Somun'un gerçek parayla satın alınması için
  Stripe gibi bir ödeme servisi eklenebilir.
- **Gerçek backend:** Yukarıda bahsedilen paylaşımlı lider tablosu
  sorunu için.

Bunların herhangi birine geçmek istediğinde haber ver.
