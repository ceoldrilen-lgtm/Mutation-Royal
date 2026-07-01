// Bu dosya, Claude artifact ortamına özel olan `window.storage` API'sini
// gerçek bir web sitesinde çalışacak şekilde `localStorage` üzerine kurar.
// Fonksiyon imzaları (get/set/delete/list, shared parametresi) birebir aynı
// tutuldu ki oyun kodunda (App.jsx) HİÇBİR DEĞİŞİKLİK gerekmesin.
//
// NOT: Lider tablosu artık bu shim'i DEĞİL, doğrudan Supabase'i kullanıyor
// (bkz. src/supabase-client.js ve LeaderboardView). Bu shim, kişisel
// ilerleme (mutantlar, hurda, enerji vb.) için hâlâ kullanılıyor — bunlar
// cihaza özel kalması gereken veriler zaten.

const PREFIX = "mutantlab:";

function storageKey(key, shared) {
  return `${PREFIX}${shared ? "shared" : "personal"}:${key}`;
}

function delay(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

window.storage = {
  async get(key, shared = false) {
    await delay();
    const raw = localStorage.getItem(storageKey(key, shared));
    if (raw === null) {
      // Orijinal API ile aynı davranış: olmayan anahtar hata fırlatır.
      throw new Error(`storage: "${key}" bulunamadı`);
    }
    return { key, value: raw, shared };
  },

  async set(key, value, shared = false) {
    await delay();
    localStorage.setItem(storageKey(key, shared), value);
    return { key, value, shared };
  },

  async delete(key, shared = false) {
    await delay();
    localStorage.removeItem(storageKey(key, shared));
    return { key, deleted: true, shared };
  },

  async list(prefix = "", shared = false) {
    await delay();
    const fullPrefix = storageKey(prefix, shared);
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(fullPrefix)) {
        keys.push(k.slice(`${PREFIX}${shared ? "shared" : "personal"}:`.length));
      }
    }
    return { keys, prefix, shared };
  },
};
