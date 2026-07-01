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

`localStorage` sadece **o tarayıcıya/cihaza özeldir**. Yani:

- Kendi ilerlemen (mutantların, hurdan vb.) sorunsuz çalışır — sayfayı
  kapatıp açsan bile kalır.
- Ama **lider tablosu artık gerçekten paylaşımlı değil** — sadece kendi
  tarayıcında "paylaşımlı" gibi davranır, başka biri siteye girdiğinde
  senin skorlarını göremez.

Gerçek, çok kullanıcılı bir lider tablosu istersen `storage-shim.js`
dosyasını gerçek bir backend'e (örn. [Supabase](https://supabase.com) —
ücretsiz katmanı var, kurulumu nispeten kolay) bağlaman gerekir. İstersen
bunu birlikte bir sonraki adımda yapabiliriz.

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
