import React, { useState, useRef, useEffect } from "react";

/* ============================================================
   MUTANT LAB — Web Prototip v0.3
   Kısıtlı başlangıç kiti + melezlemede ebeveyn tüketimi (risk/kıtlık)
   ============================================================ */

const STORAGE_KEY = "mutant-lab-player-state";

const LIMB_TYPES = ["Kafa", "Govde", "Bacak", "Ayak", "Kuyruk", "Pence", "Goz", "Zeka"];
const LIMB_LABELS = {
  Kafa: "KAFA", Govde: "GÖVDE", Bacak: "BACAK", Ayak: "AYAK",
  Kuyruk: "KUYRUK", Pence: "PENÇE", Goz: "GÖZ", Zeka: "ZEKA",
};

const RARITY_COLOR = { Sıradan: "#8B95A1", Ender: "#4FA8FF", Destansı: "#C77DFF" };

const stat = (hp, attack, armor, dodge, crit) => ({ hp, attack, armor, dodge, crit });
const zeroStat = () => stat(0, 0, 0, 0, 0);
const addStat = (a, b) => stat(a.hp + b.hp, a.attack + b.attack, a.armor + b.armor, a.dodge + b.dodge, a.crit + b.crit);
const scaleStat = (s, f) => stat(s.hp * f, s.attack * f, s.armor * f, s.dodge * f, s.crit * f);

const ANIMALS = {
  "Köpek": { rarity: "Sıradan", limbs: {
    Kafa: stat(20,3,1,0,0.5), Govde: stat(25,0,4,0,0), Bacak: stat(5,0,0,1.5,0),
    Ayak: stat(5,1,1,0.5,0), Kuyruk: stat(5,0,0,0.5,0.5), Pence: stat(0,4,0,0,1),
    Goz: stat(10,0,0,0.5,1), Zeka: stat(10,2,1,0,1.5),
  }},
  "Kaplumbağa": { rarity: "Sıradan", limbs: {
    Kafa: stat(25,2,0,0,0), Govde: stat(50,0,15,0,0), Bacak: stat(15,0,0,0,0),
    Ayak: stat(10,1,0,0,0), Kuyruk: stat(5,0,0,0,0), Pence: stat(0,2,0,0,0),
    Goz: stat(5,0,0,0,0), Zeka: stat(10,0,5,0,0),
  }},
  "Arı": { rarity: "Sıradan", limbs: {
    Kafa: stat(5,2,0,0,1), Govde: stat(10,0,0,1.5,0), Bacak: stat(2,0,0,2,0),
    Ayak: stat(1,1,0,0.5,0), Kuyruk: stat(2,9,0,0,4), Pence: stat(2,3,0,0.5,1),
    Goz: stat(3,0,0,0.5,2.5), Zeka: stat(5,5,0,0,1),
  }},
  "Kurbağa": { rarity: "Sıradan", limbs: {
    Kafa: stat(10,2,0,0,0.2), Govde: stat(20,0,2,1.5,0), Bacak: stat(5,1,0,3,0),
    Ayak: stat(5,1,0,1.5,0), Kuyruk: stat(5,0,0,1,0), Pence: stat(0,2,0,0.5,0.3),
    Goz: stat(5,0,0,0.3,0.3), Zeka: stat(5,0,0,0.2,0),
  }},
  "Boğa": { rarity: "Ender", limbs: {
    Kafa: stat(30,8,2,0,0.5), Govde: stat(60,0,8,0,0), Bacak: stat(15,2,0,0,0),
    Ayak: stat(10,5,2,0,0), Kuyruk: stat(10,1,0,0,0.2), Pence: stat(0,6,0,0,0.3),
    Goz: stat(5,0,0,0,0.7), Zeka: stat(10,3,0,0,0),
  }},
  "Kurt": { rarity: "Ender", limbs: {
    Kafa: stat(20,7,0,0,1), Govde: stat(40,0,3,0.5,0), Bacak: stat(10,0,0,1.5,0),
    Ayak: stat(5,3,0,0.5,0), Kuyruk: stat(5,0,0,0.5,0.3), Pence: stat(5,6,0,0,2),
    Goz: stat(5,0,0,0,2.5), Zeka: stat(5,2,0,0,0.7),
  }},
  "Bukalemun": { rarity: "Ender", limbs: {
    Kafa: stat(10,3,0,0,0.5), Govde: stat(20,0,1,4,0), Bacak: stat(5,0,0,2.5,0),
    Ayak: stat(5,1,0,1,0), Kuyruk: stat(10,0,0,1.5,0), Pence: stat(0,2,0,0,0.5),
    Goz: stat(5,0,0,1,3), Zeka: stat(5,2,0,1,0.5),
  }},
  "Aslan": { rarity: "Destansı", limbs: {
    Kafa: stat(40,8,3,0,1), Govde: stat(70,0,8,0.3,0), Bacak: stat(20,2,0,0.5,0),
    Ayak: stat(15,6,2,0.2,0), Kuyruk: stat(15,2,0,0.5,0.5), Pence: stat(10,14,2,0,3),
    Goz: stat(10,0,0,0.5,2), Zeka: stat(20,8,0,0,1),
  }},
  "Akrep": { rarity: "Destansı", limbs: {
    Kafa: stat(15,6,3,0,0.5), Govde: stat(40,0,15,0,0), Bacak: stat(10,0,0,0.3,0),
    Ayak: stat(10,4,2,0,0), Kuyruk: stat(10,18,0,0,2.5), Pence: stat(15,17,5,0,2),
    Goz: stat(10,0,0,0.2,0.5), Zeka: stat(20,0,3,0,0.5),
  }},
  "Kartal": { rarity: "Destansı", limbs: {
    Kafa: stat(15,4,0,0.5,1), Govde: stat(25,0,0,1.5,0), Bacak: stat(10,0,0,2,0),
    Ayak: stat(10,5,0,0.5,0.5), Kuyruk: stat(10,0,0,1,0.5), Pence: stat(5,21,0,0,4),
    Goz: stat(10,0,0,1.5,5.5), Zeka: stat(15,0,0,1,0.5),
  }},
};

// Herkes TAM OLARAK bu 5 hayvanla başlar: 3 Sıradan + 2 Ender.
// Farklı arketipler (tank, cam top, dengeli, kaba kuvvet, avcı) seçildi ki
// ilk melezlemeler baştan çeşitli olsun.
const STARTER_ROSTER = ["Köpek", "Kaplumbağa", "Arı", "Boğa", "Kurt"];

const MAX_DODGE_CAP = 60;
const MAX_CRIT_CAP = 60;

// Şimdilik Dodge ve Kritik matematiği oyunu dengesizleştirdiği için DEVRE DIŞI.
// Veriler korunuyor (silinmiyor), sadece totalStats() aşamasında sıfırlanıyor —
// istenirse ileride bir "kilit açma" mekaniğiyle geri açılabilir.
const DODGE_CRIT_ENABLED = false;

function makeLimb(type, rarity, source, baseStat, lineage) {
  // lineage: bu uzva katkı veren FARKLI türlerin listesi (Mutasyon Seviyesi'nin temeli).
  return { id: Math.random().toString(36).slice(2), type, rarity, source, baseStat, level: 1, lineage: lineage || (source ? [source] : []) };
}
function emptyLimb(type) {
  return { id: Math.random().toString(36).slice(2), type, rarity: "Sıradan", source: null, baseStat: zeroStat(), level: 1, lineage: [] };
}
function purebred(name) {
  const tpl = ANIMALS[name];
  const limbs = {};
  LIMB_TYPES.forEach((t) => { limbs[t] = makeLimb(t, tpl.rarity, name, tpl.limbs[t], [name]); });
  return { id: Math.random().toString(36).slice(2), name, limbs };
}
// Mutasyon Seviyesi: bu uzvu oluşturan FARKLI tür sayısı. Boş uzuv = 0,
// safkan (tek tür) = 1, iki türün süper birleşimi = 2, üç tür = 3, vb.
// Normal (güç) seviyesinden tamamen ayrı bir kavramdır.
function mutationLevel(limb) {
  if (!limb || !limb.lineage) return 0;
  return limb.lineage.length;
}
function unionLineage(a, b) {
  return Array.from(new Set([...(a || []), ...(b || [])]));
}
function totalStats(animal) {
  // Savunmacı kontrol: herhangi bir nedenle tanımsız/bozuk bir hayvan
  // buraya sızarsa (stale render, bozuk kayıt vb.) çökmek yerine sıfır
  // stat döner — arayüz kararlı kalır, konsola uyarı düşer.
  if (!animal || !animal.limbs) {
    console.warn("totalStats: geçersiz hayvan nesnesi", animal);
    return zeroStat();
  }
  let total = zeroStat();
  LIMB_TYPES.forEach((t) => { total = addStat(total, scaleLimbStats(animal.limbs[t] || emptyLimb(t))); });
  total.dodge = DODGE_CRIT_ENABLED ? Math.min(total.dodge, MAX_DODGE_CAP) : 0;
  total.crit = DODGE_CRIT_ENABLED ? Math.min(total.crit, MAX_CRIT_CAP) : 0;
  return total;
}

// --- Seviye Ölçeklendirme (Unity prototipiyle birebir aynı formül) ---
// Düz statlar (HP/Atak/Zırh) seviye başına %20 katlanarak büyür.
// Yüzdesel statlar (Dodge/Kritik) nadirliğe göre küçük, sabit miktarlarla büyür.
const MAX_LEVEL = 20;
// ÖNEMLİ — Denge düzeltmesi: eskiden katlanarak (compound, 1.20^seviye)
// büyüyordu — bu seviye 10'da 5 kat, seviye 20'de 32 kat gibi patlayıcı
// bir büyümeye yol açıyordu, ve seviye 10'a ulaşmak ucuz olduğu için çok
// az yatırımla aşırı güçlü canlılar üretilebiliyordu. Artık DOĞRUSAL
// büyüyor: her seviye statlara sabit bir yüzde ekler, katlanmaz.
const FLAT_GROWTH_PER_LEVEL = 0.08; // seviye başına +%8 (doğrusal)
function percentGrowthPerLevel(rarity) {
  if (rarity === "Ender") return 0.8;
  if (rarity === "Destansı") return 1.0;
  return 0.5; // Sıradan
}
function scaleLimbStats(limb) {
  if (!limb || !limb.source) return zeroStat();
  const lvl = Math.max(1, Math.min(MAX_LEVEL, limb.level || 1));
  const steps = lvl - 1;
  const flatMult = 1 + FLAT_GROWTH_PER_LEVEL * steps;
  const percentGrowth = percentGrowthPerLevel(limb.rarity) * steps;
  const b = limb.baseStat;
  return stat(b.hp * flatMult, b.attack * flatMult, b.armor * flatMult, b.dodge + percentGrowth, b.crit + percentGrowth);
}
function limbScore(limb) {
  const s = scaleLimbStats(limb);
  return s.hp + s.attack * 2 + s.armor + s.dodge + s.crit;
}
const LEVEL_UP_BASE_COST = 15;
function levelUpCost(currentLevel) { return LEVEL_UP_BASE_COST * currentLevel; }
function getAnimalLevel(animal) {
  if (!animal || !animal.limbs) return 1;
  // Kafa özellikle mutasyonla boş kalmışsa yanlış seviye göstermemek için
  // kaynağı olan (boş olmayan) uzuvlar arasından en yükseği referans alınır
  // — tüm dolu uzuvlar zaten birlikte seviyelendiği için bu güvenli bir yaklaşım.
  let maxLvl = 1;
  LIMB_TYPES.forEach((t) => {
    const limb = animal.limbs[t];
    if (limb && limb.source) maxLvl = Math.max(maxLvl, limb.level || 1);
  });
  return maxLvl;
}
// --- Laboratuvar Ücreti: "zırt pırt mutasyon" yapılmasını engelleyen sistem.
// Melezlenecek 8 uzvun TOPLAM mutasyon seviyesi (iki ebeveynin toplamı) ne
// kadar yüksekse, hem hurda ücreti hem de laboratuvarın bir sonraki
// kullanıma kadar bekleme süresi o kadar artar. Basit/safkan melezlemeler
// ucuz ve hızlı, karmaşık/çok kereli melezlemeler pahalı ve yavaştır.
const LAB_FEE_PER_POINT = 10;       // hurda / mutasyon puanı
const LAB_COOLDOWN_SEC_PER_POINT = 20; // saniye / mutasyon puanı (prototip hızı)
function totalCombinedMutation(parentA, parentB) {
  let sum = 0;
  LIMB_TYPES.forEach((t) => {
    sum += mutationLevel(parentA.limbs[t]) + mutationLevel(parentB.limbs[t]);
  });
  return sum;
}
function labFee(totalMutation) { return totalMutation * LAB_FEE_PER_POINT; }
function labCooldownMs(totalMutation) { return totalMutation * LAB_COOLDOWN_SEC_PER_POINT * 1000; }

// --- Cerrahi İstasyonu: tam laboratuvardan AYRI bir kaynak/bekleme sırası.
// Tek uzuv işlemi olduğu için (8 değil) doğal olarak çok daha ucuz ve hızlı.
const SURGERY_FEE_PER_POINT = 15;
const SURGERY_COOLDOWN_SEC_PER_POINT = 15;
function surgeryFee(combinedMutation) { return combinedMutation * SURGERY_FEE_PER_POINT; }
function surgeryCooldownMs(combinedMutation) { return combinedMutation * SURGERY_COOLDOWN_SEC_PER_POINT * 1000; }

// --- Melezleme: 8 ayrı uzuv için ayrı zar, TOPLAM MUTASYON SEVİYESİNE göre
// değişen olasılık. combinedMutation=2 (iki safkan uzuv) en kolay durumdur;
// combinedMutation=10+ (çok türlü, zaten defalarca birleşmiş uzuvlar) en zorudur.
function getOdds(combinedMutation) {
  const clamped = Math.max(2, Math.min(10, combinedMutation));
  const t = (clamped - 2) / 8;
  const superC = 60 + (20 - 60) * t;
  const mutC = 10 + (40 - 10) * t;
  const domC = 100 - superC - mutC;
  return { superC, domC, mutC };
}
function resolveLimbOutcome(type, limbA, limbB, odds) {
  const { superC, domC } = odds;
  const roll = Math.random() * 100;
  if (!limbA.source && !limbB.source) {
    return { type, outcome: "Mutasyon", limb: emptyLimb(type), roll, odds };
  }
  if (roll < superC) {
    if (!limbA.source) return { type, outcome: "SüperBirleşim", limb: { ...limbB, id: Math.random().toString(36).slice(2), level: 1 }, roll, odds };
    if (!limbB.source) return { type, outcome: "SüperBirleşim", limb: { ...limbA, id: Math.random().toString(36).slice(2), level: 1 }, roll, odds };
    const newLineage = unionLineage(limbA.lineage, limbB.lineage);
    const combined = addStat(limbA.baseStat, limbB.baseStat);
    const rarityRank = { Sıradan: 0, Ender: 1, Destansı: 2 };
    const higherRarity = rarityRank[limbA.rarity] >= rarityRank[limbB.rarity] ? limbA.rarity : limbB.rarity;
    const name = newLineage.join("-");
    return { type, outcome: "SüperBirleşim", limb: makeLimb(type, higherRarity, name, combined, newLineage), roll, odds };
  } else if (roll < superC + domC) {
    // Baskın Gen: SADECE bir ebeveynin uzvu aynen geçer — o ebeveynin
    // lineage'i (dolayısıyla mutasyon seviyesi) da AYNEN, değişmeden aktarılır.
    if (!limbA.source) return { type, outcome: "BaskınGen", limb: { ...limbB }, roll, odds };
    if (!limbB.source) return { type, outcome: "BaskınGen", limb: { ...limbA }, roll, odds };
    const winner = limbScore(limbA) >= limbScore(limbB) ? limbA : limbB;
    return { type, outcome: "BaskınGen", limb: { ...winner, id: Math.random().toString(36).slice(2) }, roll, odds };
  } else {
    return { type, outcome: "Mutasyon", limb: emptyLimb(type), roll, odds };
  }
}

function breedLimb(type, limbA, limbB) {
  // ÖNEMLİ: Melezleme zorluğu artık GÜÇ SEVİYESİNE değil, uzvun MUTASYON
  // SEVİYESİNE (o uzva katkı veren farklı tür sayısına) göre belirleniyor.
  // İki safkan uzuv (1+1=2) kolayca birleşir; zaten çok türlü bir uzvu
  // (örn. 3 türlü + 3 türlü = 6) tekrar birleştirmek çok daha risklidir.
  const combinedMutation = mutationLevel(limbA) + mutationLevel(limbB);
  const odds = { ...getOdds(combinedMutation), combinedMutation };
  return resolveLimbOutcome(type, limbA, limbB, odds);
}

// --- Cerrahi Melezleme: tam hayvan yerine SADECE tek bir uzvu hedef alır.
// Tam melezlemeye göre başarı şansı düşüktür (Süper Birleşim %50, Baskın
// Gen %80 çarpanla küçülür) ama karşılığında bütün bir hayvanı değil,
// sadece bağışçının O UZVUNU tüketir.
function breedLimbSurgical(type, limbA, limbB) {
  const combinedMutation = mutationLevel(limbA) + mutationLevel(limbB);
  const base = getOdds(combinedMutation);
  const superC = base.superC * 0.5;
  const domC = base.domC * 0.8;
  const mutC = 100 - superC - domC;
  const odds = { superC, domC, mutC, combinedMutation };
  return resolveLimbOutcome(type, limbA, limbB, odds);
}
function breedAnimals(parentA, parentB, childName) {
  // Savunmacı kontrol: geçersiz ebeveyn buraya asla ulaşmamalı (handleBreed
  // içinde zaten engelleniyor) ama olası bir sızıntıda net bir hata fırlat.
  if (!parentA || !parentA.limbs || !parentB || !parentB.limbs) {
    throw new Error("breedAnimals: geçersiz ebeveyn verisi");
  }
  const limbs = {};
  const results = [];
  LIMB_TYPES.forEach((t) => {
    const limbA = parentA.limbs[t] || emptyLimb(t);
    const limbB = parentB.limbs[t] || emptyLimb(t);
    const r = breedLimb(t, limbA, limbB);
    results.push(r);
    limbs[t] = r.limb;
  });
  return { child: { id: Math.random().toString(36).slice(2), name: childName, limbs }, results };
}

// --- Savaş: zırh sadece ilk vuruşu bloklar, dodge BONUS bir vuruş kazandırır ---
function simulateBattle(animalA, animalB) {
  const sA = totalStats(animalA), sB = totalStats(animalB);
  const unitA = { name: animalA.name, hp: sA.hp, maxHp: sA.hp, attack: sA.attack, armor: sA.armor, armorUsed: false, dodge: sA.dodge, crit: sA.crit };
  const unitB = { name: animalB.name, hp: sB.hp, maxHp: sB.hp, attack: sB.attack, armor: sB.armor, armorUsed: false, dodge: sB.dodge, crit: sB.crit };

  const order = unitB.dodge > unitA.dodge ? [unitB, unitA] : [unitA, unitB];
  const log = [];
  let turn = 0;

  const resolveAttack = (attacker, defender) => {
    const dodgeRoll = Math.random() * 100;
    if (dodgeRoll < defender.dodge) {
      log.push({ kind: "dodge", text: `${defender.name} sıyrıldı! Bonus karşı saldırı kazandı.` });
      return true;
    }
    let dmg = attacker.attack;
    const isCrit = Math.random() * 100 < attacker.crit;
    if (isCrit) dmg *= 2;
    if (!defender.armorUsed && defender.armor > 0) {
      const blocked = Math.min(defender.armor, dmg);
      dmg -= blocked;
      defender.armorUsed = true;
      log.push({ kind: "armor", text: `${defender.name} zırhıyla ${blocked.toFixed(1)} hasarı blokladı.` });
    }
    dmg = Math.max(dmg, 0);
    defender.hp -= dmg;
    log.push({
      kind: isCrit ? "crit" : "hit",
      text: `${attacker.name} → ${defender.name}: ${dmg.toFixed(1)} hasar${isCrit ? " (KRİTİK!)" : ""}. (${Math.max(defender.hp, 0).toFixed(1)}/${defender.maxHp.toFixed(1)})`,
    });
    return false;
  };

  let attacker = order[0];
  let defender = order[1];
  while (order[0].hp > 0 && order[1].hp > 0 && turn < 150) {
    turn++;
    const dodged = resolveAttack(attacker, defender);
    [attacker, defender] = [defender, attacker];

    if (dodged && attacker.hp > 0 && defender.hp > 0) {
      turn++;
      resolveAttack(attacker, defender);
      [attacker, defender] = [defender, attacker];
    }
  }

  const winner = order[0].hp > 0 ? order[0].name : order[1].name;
  return { log, winner, turns: turn, finalA: { ...unitA }, finalB: { ...unitB } };
}

/* ============================================================ KART SİSTEMİ ============================================================
   Düello modunda kullanılan round-bazlı kart sistemi. Bir "round", her iki
   canlının da birbirine 3'ER KEZ vurmasıdır (toplam 6 vuruş). Round başında
   her tarafa 2 kart dağıtılır. Oyuncu bunlardan birini hemen oynayabilir,
   ya da elinde SAKLAYIP daha sonra 2 kartı BİRLEŞTİREREK daha güçlü, çok
   etkili bir kart oluşturup oynayabilir. 6 temel kart var; birleşimler bu
   temellerin birleşiminden doğar (kapasite şimdilik 2'li birleşim, 3'lü
   ileride eklenebilir). ============================================================ */

const ROUND_GAP_MS = 15000; // round arası bekleme (ileride seslendirme için sahne bırakır)
const MAX_HAND_SIZE = 4; // oyuncu aynı anda en fazla 4 kart tutabilir

function capHand(hand) {
  return hand.length > MAX_HAND_SIZE ? hand.slice(hand.length - MAX_HAND_SIZE) : hand;
}

const CARD_DEFS = {
  kritik: { id: "kritik", name: "Kritik Vuruş", icon: "🎯", color: "#FF6B4A",
    desc: "Bu round attığın 3 vuruştan rastgele biri KESİN kritik (2x hasar) vurur." },
  savunma: { id: "savunma", name: "Zırh Takviyesi", icon: "🛡️", color: "#4FA8FF",
    desc: "Bu round aldığın her hasar %12 azalır." },
  yansitma: { id: "yansitma", name: "Yansıtma", icon: "🪞", color: "#C77DFF",
    desc: "Rakip bu round kritik vurursa, o hasarın 1.5 katı BİR KEZ rakibe geri döner." },
  saldiri: { id: "saldiri", name: "Saldırı Talimi", icon: "⚔️", color: "#FFD166",
    desc: "Bu round verdiğin tüm hasar %15 artar." },
  siyrilma: { id: "siyrilma", name: "Sıyrılma", icon: "💨", color: "#5EEAD4",
    desc: "Bu round rakibin 3 vuruşundan rastgele biri seni tamamen ıskalar." },
  yagma: { id: "yagma", name: "Yağma", icon: "🩸", color: "#8B95A1",
    desc: "Bu round verdiğin hasarın %20'si kadar canını geri kazanırsın." },
};
const BASIC_CARD_IDS = Object.keys(CARD_DEFS);

// --- Füzyon Kartları: 6 temel karttan doğan 15 eşsiz 2'li kombinasyon.
// Her biri kendi ismini taşır ve etkileri, temel kartların basit toplamından
// daha güçlüdür (sayısal etkiler ~%30-40 güçlendirilir).
const FUSION_NAMES = {
  "kritik+savunma": "Keskin Kalkan",
  "kritik+yansitma": "İntikam Darbesi",
  "kritik+saldiri": "Ölümcül Talim",
  "kritik+siyrilma": "Gölge Suikastçı",
  "kritik+yagma": "Kanlı Nokta Atışı",
  "savunma+yansitma": "Ayna Zırh",
  "saldiri+savunma": "Dengeli Cenk",
  "savunma+siyrilma": "Duvar Gibi",
  "savunma+yagma": "Dayanıklı Emici",
  "saldiri+yansitma": "Öfkeli Yansıma",
  "siyrilma+yansitma": "Hayalet Ayna",
  "yagma+yansitma": "Kan Aynası",
  "saldiri+siyrilma": "Fırtına Saldırısı",
  "saldiri+yagma": "Vahşi Talan",
  "siyrilma+yagma": "Sinsi Avcı",
};
// Her füzyonun kendi özel simgesi var (iki temel ikonu yan yana koymak
// yerine, ismine uygun TEK bir sembol).
const FUSION_ICONS = {
  "kritik+savunma": "🔰",
  "kritik+yansitma": "💥",
  "kritik+saldiri": "🔪",
  "kritik+siyrilma": "🥷",
  "kritik+yagma": "🏹",
  "savunma+yansitma": "🔷",
  "saldiri+savunma": "⚖️",
  "savunma+siyrilma": "🧱",
  "savunma+yagma": "🩹",
  "saldiri+yansitma": "💢",
  "siyrilma+yansitma": "👻",
  "yagma+yansitma": "🧛",
  "saldiri+siyrilma": "🌪️",
  "saldiri+yagma": "🦈",
  "siyrilma+yagma": "🐍",
};
function fusionKey(defIds) {
  return [...defIds].sort().join("+");
}

function dealCard() {
  const id = BASIC_CARD_IDS[Math.floor(Math.random() * BASIC_CARD_IDS.length)];
  return { id: Math.random().toString(36).slice(2), defIds: [id] };
}
function fuseCards(cards) {
  // v1: sadece 2'li birleşim destekleniyor (3'lü ileride eklenebilir)
  const defIds = Array.from(new Set(cards.flatMap((c) => c.defIds))).sort().slice(0, 2);
  return { id: Math.random().toString(36).slice(2), defIds };
}
function cardDisplay(card) {
  const isFusion = card.defIds.length >= 2;
  const defs = card.defIds.map((d) => CARD_DEFS[d]);
  if (isFusion) {
    const key = fusionKey(card.defIds);
    const name = FUSION_NAMES[key] || defs.map((d) => d.name).join(" + ");
    const icon = FUSION_ICONS[key] || "🔗";
    return {
      name,
      icon,
      desc: `${defs.map((d) => d.desc).join(" ")} ⚡ Füzyon bonusuyla etkiler güçlendirildi.`,
      color: "#C77DFF",
      isFusion: true,
    };
  }
  return { name: defs[0].name, icon: defs[0].icon, desc: defs[0].desc, color: defs[0].color, isFusion: false };
}

function buildCardEffects(card) {
  const defIds = card ? card.defIds : [];
  const boosted = defIds.length >= 2; // füzyon kartı mı — güçlendirilmiş sayılar
  return {
    forcedCritHit: defIds.includes("kritik") ? Math.floor(Math.random() * 3) : -1,
    forcedDodgeHit: defIds.includes("siyrilma") ? Math.floor(Math.random() * 3) : -1,
    dmgMult: defIds.includes("saldiri") ? (boosted ? 1.20 : 1.15) : 1,
    defMult: defIds.includes("savunma") ? (boosted ? 0.83 : 0.88) : 1,
    reflect: { armed: defIds.includes("yansitma"), mult: boosted ? 1.75 : 1.5 },
    lifestealPct: defIds.includes("yagma") ? (boosted ? 0.25 : 0.20) : 0,
  };
}

// Tek bir vuruşu çözer (saldıran -> savunan), verilen round kartı etkileriyle.
function resolveHit(attacker, defender, attackerFx, defenderFx, hitIndex) {
  if (defenderFx.forcedDodgeHit === hitIndex) {
    return { dmg: 0, blocked: 0, crit: false, dodged: true, reflect: 0 };
  }
  let dmg = attacker.attack;
  const isCrit = attackerFx.forcedCritHit === hitIndex;
  if (isCrit) dmg *= 2;
  dmg *= attackerFx.dmgMult;
  dmg *= defenderFx.defMult;

  let blocked = 0;
  if (!defender.armorUsed && defender.armor > 0) {
    blocked = Math.min(defender.armor, dmg);
    dmg -= blocked;
    defender.armorUsed = true;
  }
  dmg = Math.max(dmg, 0);
  defender.hp -= dmg;

  let reflectDmg = 0;
  if (isCrit && defenderFx.reflect.armed) {
    reflectDmg = dmg * defenderFx.reflect.mult;
    attacker.hp -= reflectDmg;
    defenderFx.reflect.armed = false; // round içinde sadece BİR KEZ
  }

  if (attackerFx.lifestealPct > 0 && dmg > 0) {
    const heal = dmg * attackerFx.lifestealPct;
    attacker.hp = Math.min(attacker.hp + heal, attacker.maxHp);
  }

  return { dmg, blocked, crit: isCrit, dodged: false, reflect: reflectDmg };
}

function hitLogText(attackerName, defenderName, r) {
  if (r.dodged) return { kind: "dodge", text: `${defenderName} bu vuruştan sıyrıldı!` };
  return {
    kind: r.crit ? "crit" : "hit",
    text: `${attackerName} → ${defenderName}: ${r.dmg.toFixed(1)} hasar${r.crit ? " (KRİTİK!)" : ""}` +
      `${r.blocked > 0 ? ` (${r.blocked.toFixed(1)} bloklandı)` : ""}${r.reflect > 0 ? ` — ${r.reflect.toFixed(1)} yansıdı!` : ""}`,
  };
}

// Bir ROUND'u (3'er vuruş, toplam 6 vuruş) çözer. Her log satırı, arayüzün
// vuruş-vuruş efekt (sallanma/parlama/uçan sayı) gösterebilmesi için
// targetSide (kim vuruldu) ve o andaki can anlık görüntüsünü de taşır.
function resolveRound(playerUnit, oppUnit, playerCard, oppCard) {
  const pFx = buildCardEffects(playerCard);
  const oFx = buildCardEffects(oppCard);
  const log = [];
  const summary = { pDealt: 0, pBlocked: 0, oDealt: 0, oBlocked: 0, pTaken: 0, oTaken: 0 };

  for (let i = 0; i < 3; i++) {
    if (playerUnit.hp <= 0 || oppUnit.hp <= 0) break;
    const r1 = resolveHit(playerUnit, oppUnit, pFx, oFx, i);
    log.push({
      ...hitLogText(playerUnit.name, oppUnit.name, r1),
      targetSide: "opp", dmg: r1.dmg, crit: r1.crit, dodged: r1.dodged, reflect: r1.reflect,
      playerHpAfter: playerUnit.hp, oppHpAfter: oppUnit.hp,
    });
    if (!r1.dodged) { summary.pDealt += r1.dmg; summary.oBlocked += r1.blocked; summary.oTaken += r1.dmg; }

    if (playerUnit.hp <= 0 || oppUnit.hp <= 0) break;
    const r2 = resolveHit(oppUnit, playerUnit, oFx, pFx, i);
    log.push({
      ...hitLogText(oppUnit.name, playerUnit.name, r2),
      targetSide: "player", dmg: r2.dmg, crit: r2.crit, dodged: r2.dodged, reflect: r2.reflect,
      playerHpAfter: playerUnit.hp, oppHpAfter: oppUnit.hp,
    });
    if (!r2.dodged) { summary.oDealt += r2.dmg; summary.pBlocked += r2.blocked; summary.pTaken += r2.dmg; }
  }

  return { log, summary };
}

/* ============================================================ EKONOMİ ============================================================ */

const ENERGY_MAX = 5;
const ENERGY_REGEN_MS = 10 * 60 * 1000; // 10 dakikada 1 (prototip hızı; üretimde 1-2 saat önerilir)
const CHEST_COST = 150; // reklam/somun ekonomisine yönlendirmek için bilerek yüksek tutuldu
const STARTING_SCRAP = 80;

function applyEnergyRegen(energy, lastTs) {
  const now = Date.now();
  const elapsed = now - lastTs;
  const gained = Math.floor(elapsed / ENERGY_REGEN_MS);
  if (gained <= 0 || energy >= ENERGY_MAX) {
    return { energy, lastTs: energy >= ENERGY_MAX ? now : lastTs };
  }
  const newEnergy = Math.min(ENERGY_MAX, energy + gained);
  const newLastTs = newEnergy >= ENERGY_MAX ? now : lastTs + gained * ENERGY_REGEN_MS;
  return { energy: newEnergy, lastTs: newLastTs };
}

// Gün değiştiyse (takvim günü) reklam sayacını sıfırlar.
function applyAdDailyReset(adsWatchedToday, lastAdDate) {
  const today = new Date().toDateString();
  if (lastAdDate !== today) return { adsWatchedToday: 0, lastAdDate: today };
  return { adsWatchedToday, lastAdDate };
}

// 6 saat geçtiyse market tekliflerini yeniler.
function applyMarketOfferRefresh(offers) {
  if (!offers || Date.now() - offers.generatedAt >= MARKET_OFFER_REFRESH_MS) {
    return generateMarketOffers();
  }
  return offers;
}

function formatCountdown(ms) {
  if (ms <= 0) return "00:00";
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function rollChestAnimal() {
  const roll = Math.random() * 100;
  let tierNames;
  if (roll < 70) tierNames = Object.keys(ANIMALS).filter((n) => ANIMALS[n].rarity === "Sıradan");
  else if (roll < 95) tierNames = Object.keys(ANIMALS).filter((n) => ANIMALS[n].rarity === "Ender");
  else tierNames = Object.keys(ANIMALS).filter((n) => ANIMALS[n].rarity === "Destansı");
  return tierNames[Math.floor(Math.random() * tierNames.length)];
}

const BOT_TIERS = [
  { id: "hurdalik", label: "HURDALIK", rarity: "Sıradan", names: ["Köpek", "Kaplumbağa", "Arı", "Kurbağa"], reward: 15 },
  { id: "sanayi", label: "SANAYİ BÖLGESİ", rarity: "Ender", names: ["Boğa", "Kurt", "Bukalemun"], reward: 25 },
  { id: "zirve", label: "MEKATRONİK ZİRVE", rarity: "Destansı", names: ["Aslan", "Akrep", "Kartal"], reward: 40 },
];

// --- Zorluk Duvarı: Nöbetçiler ---
// Herhangi bir türden değil, sabit ve kasıtlı olarak çok güçlü "boss"lar.
// Yenmek gerçek bir hedef olsun diye var. Her kademenin bir GÜÇ EŞİĞİ var:
// şampiyonunun Güç Puanı eşiğin altındaysa dövüşe girmene bile izin verilmez.
const REQUIRED_POWER_RATIO = 0.85; // eşik = boss'un kendi gücünün %85'i

const BOSS_TIERS = [
  { id: "ufak", label: "UFAK NÖBETÇİ", limbStat: stat(25, 4, 3, 0, 0), energyCost: 1, firstReward: 150, repeatReward: 25, color: "#8B95A1", visualLevel: 2 },
  { id: "orta", label: "NÖBETÇİ", limbStat: stat(45, 7, 5, 0, 0), energyCost: 2, firstReward: 500, repeatReward: 60, color: "#4FA8FF", visualLevel: 4 },
  { id: "bas", label: "BAŞ NÖBETÇİ", limbStat: stat(70, 11, 8, 0, 0), energyCost: 3, firstReward: 1500, repeatReward: 150, color: "#C77DFF", visualLevel: 6 },
];

function createBossAnimal(tier) {
  const limbs = {};
  const lineage = Array.from({ length: tier.visualLevel }, (_, i) => `${tier.label}-${i}`);
  LIMB_TYPES.forEach((t) => {
    limbs[t] = {
      id: `boss-${tier.id}-${t}`, type: t, rarity: "Destansı", source: tier.label,
      baseStat: tier.limbStat, level: 1, lineage,
    };
  });
  return { id: `boss-${tier.id}`, name: tier.label, limbs };
}

// --- Güç Puanı: lider tablosu sıralaması ve boss eşikleri için tek bir sayı ---
function computePowerScore(animal) {
  const s = totalStats(animal);
  const lvl = getAnimalLevel(animal);
  const mut = averageMutationLevel(animal);
  return Math.round(s.hp * 0.4 + s.attack * 3 + s.armor * 1.5 + lvl * 8 + mut * 12);
}

function bossRequiredPower(tier) {
  return Math.round(computePowerScore(createBossAnimal(tier)) * REQUIRED_POWER_RATIO);
}

const IDENTITY_KEY = "mutant-lab-identity";
const LEADERBOARD_KEY = "leaderboard-top";
const LEADERBOARD_MAX = 20;

// --- Altın Somun: premium para birimi (ileride gerçek parayla alınacak,
// şimdilik test amaçlı elle eklenebiliyor). Hurda/Enerji/Laboratuvar
// bekleme süresini anında çözmek için kullanılır.
const BOLT_SCRAP_PACK = { cost: 20, amount: 500 };
const BOLT_ENERGY_REFILL_COST = 10;
const BOLT_LAB_CLEAR_COST = 15;

// --- Reklam Ekonomisi ---
// NOT: Bu ortamda gerçek video reklam SDK'sı (AdMob/Unity Ads vb.)
// entegre edilemiyor. "Reklam İzle" butonu birkaç saniyelik bir simülasyon
// oynatıp ödülü veriyor — gerçek oyuna geçerken burası gerçek SDK ile
// değiştirilecek, ekonomi mantığı zaten hazır.
const ADS_PER_DAY = 15;
const AD_REWARD_BOLTS = 3; // 15 reklam = 45 Somun (Orta Sandık'ın (50) az altında — kasıtlı)

// --- Altın Somun Sandıkları (3 kademe) ---
// Her nadirlik için AYNI ROSTER İÇİNDE eşit şansla bir tür seçilir.
function pickRandomFromRarity(rarity) {
  const names = Object.keys(ANIMALS).filter((n) => ANIMALS[n].rarity === rarity);
  return names[Math.floor(Math.random() * names.length)];
}

const GOLD_CHESTS = {
  small: { id: "small", label: "Küçük Sandık", cost: 20, color: "#8B95A1",
    roll: () => {
      const out = ["Sıradan", "Sıradan"];
      if (Math.random() < 0.25) out.push("Ender");
      if (Math.random() < 0.03) out.push("Destansı");
      return out;
    },
    desc: "Kesin 2 Sıradan · %25 ek Ender · %3 ek Destansı" },
  medium: { id: "medium", label: "Orta Sandık", cost: 50, color: "#4FA8FF",
    roll: () => {
      const out = ["Sıradan", "Sıradan", "Sıradan", "Ender", "Ender"];
      if (Math.random() < 0.08) out.push("Destansı");
      return out;
    },
    desc: "Kesin 3 Sıradan + 2 Ender · %8 ek Destansı" },
  large: { id: "large", label: "Büyük Sandık", cost: 150, color: "#C77DFF",
    roll: () => {
      const out = ["Sıradan", "Sıradan", "Sıradan", "Ender", "Ender", "Destansı"];
      if (Math.random() < 0.20) out.push("Ender");
      if (Math.random() < 0.10) out.push("Destansı");
      return out;
    },
    desc: "Kesin 3 Sıradan + 2 Ender + 1 Destansı · %20 ek Ender · %10 ek Destansı" },
};

// --- Rotasyonlu Market Teklifleri (6 saatte bir yenilenir) ---
const MARKET_OFFER_REFRESH_MS = 6 * 60 * 60 * 1000;
const OFFER_PRICES = { common: 15, rare: 45, epic: 120 };
function generateMarketOffers() {
  return {
    generatedAt: Date.now(),
    commons: [pickRandomFromRarity("Sıradan"), pickRandomFromRarity("Sıradan")],
    rare: pickRandomFromRarity("Ender"),
    epic: pickRandomFromRarity("Destansı"),
    purchased: { commons: [false, false], rare: false, epic: false },
  };
}

function defaultPlayerState() {
  const collection = {};
  STARTER_ROSTER.forEach((name) => {
    const animal = purebred(name);
    collection[name] = animal; // roster türleri birbirinden farklı olduğu için isim çakışması yok
  });
  return {
    scrap: STARTING_SCRAP,
    bolts: 0,
    energy: ENERGY_MAX,
    lastEnergyTs: Date.now(),
    mutantCounter: 1,
    collection,
    defeatedBosses: {},
    labReadyAt: 0,
    surgeryReadyAt: 0,
    seenIntro: false,
    adsWatchedToday: 0,
    lastAdDate: new Date().toDateString(),
    marketOffers: generateMarketOffers(),
  };
}

/* ============================================================ UI ============================================================ */

// --- Mutasyon Seviyesi -> Metal Rengi ---
// Uzuvlar artık NADİRLİK değil, MUTASYON SEVİYESİNE (o uzva katkı veren
// farklı tür sayısına) göre renkleniyor. Seviye arttıkça malzeme daha
// "değerli" bir metale dönüşüyor — mutasyonun görsel karşılığı bu.
const MUTATION_TIERS = [
  { max: 1, color: "#CD7F32", label: "Bronz" },
  { max: 2, color: "#B8C0C8", label: "Açık Gri Çelik" },
  { max: 3, color: "#6FBF9E", label: "Yeşile Çalan Metal" },
  { max: 4, color: "#E4E8ED", label: "Gümüş" },
  { max: 5, color: "#BFF3FF", label: "Elmas" },
  { max: Infinity, color: "#FF6FE0", label: "Plazma" },
];
function mutationTierInfo(level) {
  if (level <= 0) return null;
  return MUTATION_TIERS.find((t) => level <= t.max) || MUTATION_TIERS[MUTATION_TIERS.length - 1];
}
function limbGlowStyle(level) {
  if (level >= 6) return { filter: "drop-shadow(0 0 5px #FF6FE0)" };
  if (level === 5) return { filter: "drop-shadow(0 0 4px #BFF3FF)" };
  return undefined;
}
function limbVisual(limb) {
  if (!limb || !limb.source) return { color: null, style: undefined };
  const lvl = mutationLevel(limb);
  const tier = mutationTierInfo(lvl);
  return { color: tier ? tier.color : null, style: limbGlowStyle(lvl) };
}

function MutationTierLegend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-mono text-[#7C8894]">
      {MUTATION_TIERS.map((t, i) => (
        <div key={t.label} className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: t.color }} />
          <span>Sv{i + 1}{i === MUTATION_TIERS.length - 1 ? "+" : ""} {t.label}</span>
        </div>
      ))}
    </div>
  );
}

/// Bir canlının 8 uzvunu tek tek (kaynak, nadirlik, mutasyon seviyesi,
/// güç seviyesi, ölçeklenmiş stat katkısı) gösteren detay dökümü.
function LimbBreakdown({ animal }) {
  return (
    <div className="space-y-1.5">
      {LIMB_TYPES.map((t) => {
        const limb = animal.limbs[t];
        const isEmpty = !limb || !limb.source;
        const scaled = isEmpty ? zeroStat() : scaleLimbStats(limb);
        const lvl = isEmpty ? 0 : mutationLevel(limb);
        const tier = isEmpty ? null : mutationTierInfo(lvl);
        return (
          <div key={t} className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-2">
            <div className="flex justify-between items-center">
              <span className="text-[#7C8894] font-mono text-[9px] tracking-[0.1em]">{LIMB_LABELS[t]}</span>
              {!isEmpty && (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: tier.color }} />
                  <span className="text-[9px] font-mono" style={{ color: tier.color }}>{tier.label}</span>
                </span>
              )}
            </div>
            {isEmpty ? (
              <div className="text-[#FF6B4A] font-mono text-[10px] mt-1">⚡ Boş soket — bu uzuv mutasyonla kayboldu</div>
            ) : (
              <>
                <div className="text-[#E8EDF2] font-mono text-[11px] mt-1 truncate">
                  {limb.source} <span className="text-[#5EEAD4] text-[9px]">Lv.{limb.level}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] font-mono text-[#7C8894] mt-1">
                  <span>HP {scaled.hp.toFixed(1)}</span>
                  <span>ATK {scaled.attack.toFixed(1)}</span>
                  <span>ZIRH {scaled.armor.toFixed(1)}</span>
                  <span style={{ color: RARITY_COLOR[limb.rarity] }}>{limb.rarity}</span>
                  <span className="text-[#C77DFF]">🧬 Mutasyon Sv.{lvl}</span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/// Her canlıyı 8 uzvundan prosedürel olarak çizen SVG avatar.
/// Her parça kendi nadirlik rengini taşır (mekatronik/parça-parça birleşim
/// temasının görsel karşılığı) — boş uzuvlar kırık, kıvılcımlı soket olarak
/// çizilir. Gerçek 3D model değil ama "bu canlı gerçekten bu parçalardan
/// oluşuyor" hissini veriyor.
function EmptySlot({ x, y, w, h, rx = 2 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill="none" stroke="#2A323A" strokeWidth="1.5" strokeDasharray="3,2" />
      <text x={x + w / 2} y={y + h / 2 + 3} fontSize="9" fill="#FF6B4A" textAnchor="middle">⚡</text>
    </g>
  );
}

function CreatureAvatar({ animal, size = 100 }) {
  if (!animal || !animal.limbs) {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <EmptySlot x={25} y={10} w={50} h={78} rx={10} />
      </svg>
    );
  }
  const L = animal.limbs;
  const v = {
    kafa: limbVisual(L.Kafa), govde: limbVisual(L.Govde), bacak: limbVisual(L.Bacak),
    ayak: limbVisual(L.Ayak), kuyruk: limbVisual(L.Kuyruk), pence: limbVisual(L.Pence),
    goz: limbVisual(L.Goz), zeka: limbVisual(L.Zeka),
  };

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
      {/* Kuyruk */}
      {v.kuyruk.color ? (
        <path d="M 62 60 Q 85 55 88 40" stroke={v.kuyruk.color} strokeWidth="5" fill="none" strokeLinecap="round" style={v.kuyruk.style} />
      ) : <EmptySlot x={76} y={36} w={16} h={10} />}

      {/* Bacaklar */}
      {v.bacak.color ? (
        <>
          <rect x="35" y="62" width="7" height="20" rx="2" fill={v.bacak.color} style={v.bacak.style} />
          <rect x="58" y="62" width="7" height="20" rx="2" fill={v.bacak.color} style={v.bacak.style} />
        </>
      ) : <EmptySlot x={33} y={62} w={32} h={20} />}

      {/* Ayaklar */}
      {v.ayak.color ? (
        <>
          <rect x="31" y="80" width="13" height="6" rx="2" fill={v.ayak.color} style={v.ayak.style} />
          <rect x="56" y="80" width="13" height="6" rx="2" fill={v.ayak.color} style={v.ayak.style} />
        </>
      ) : <EmptySlot x={29} y={80} w={42} h={6} />}

      {/* Gövde */}
      {v.govde.color ? (
        <rect x="30" y="40" width="40" height="28" rx="8" fill={v.govde.color} style={v.govde.style} />
      ) : <EmptySlot x={30} y={40} w={40} h={28} rx={8} />}

      {/* Pençeler */}
      {v.pence.color ? (
        <>
          <path d="M 30 48 L 17 52 L 22 57 Z" fill={v.pence.color} style={v.pence.style} />
          <path d="M 70 48 L 83 52 L 78 57 Z" fill={v.pence.color} style={v.pence.style} />
        </>
      ) : <EmptySlot x={15} y={46} w={13} h={12} />}

      {/* Kafa */}
      {v.kafa.color ? (
        <circle cx="50" cy="28" r="16" fill={v.kafa.color} style={v.kafa.style} />
      ) : <EmptySlot x={34} y={12} w={32} h={32} rx={16} />}

      {/* Gözler */}
      {v.goz.color ? (
        <>
          <circle cx="44" cy="26" r="3" fill={v.goz.color} style={v.goz.style} />
          <circle cx="56" cy="26" r="3" fill={v.goz.color} style={v.goz.style} />
        </>
      ) : <EmptySlot x={40} y={22} w={20} h={8} />}

      {/* Zeka (anten) */}
      {v.zeka.color ? (
        <>
          <line x1="50" y1="12" x2="50" y2="4" stroke={v.zeka.color} strokeWidth="2" />
          <circle cx="50" cy="3" r="3" fill={v.zeka.color} style={v.zeka.style} />
        </>
      ) : <EmptySlot x={44} y={0} w={12} h={13} />}
    </svg>
  );
}

function averageMutationLevel(animal) {
  if (!animal || !animal.limbs) return 0;
  let sum = 0;
  LIMB_TYPES.forEach((t) => { sum += mutationLevel(animal.limbs[t]); });
  return sum / LIMB_TYPES.length;
}

const OUTCOME_STYLE = {
  "SüperBirleşim": { label: "SÜPER BİRLEŞİM", color: "#5EEAD4" },
  "BaskınGen": { label: "BASKIN GEN", color: "#FFD166" },
  "Mutasyon": { label: "MUTASYON / KAYIP", color: "#FF6B4A" },
};

function StatRow({ label, value, suffix = "" }) {
  return (
    <div className="flex justify-between text-[11px] py-0.5 border-b border-[#222a31]">
      <span className="text-[#7C8894] font-mono tracking-wide">{label}</span>
      <span className="text-[#E8EDF2] font-mono">{value}{suffix}</span>
    </div>
  );
}

function StatCard({ animal, title }) {
  if (!animal) {
    return (
      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3">
        <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-2">{title}</div>
        <div className="text-[#2A323A] font-mono text-[11px]">// veri yok</div>
      </div>
    );
  }
  const s = totalStats(animal);
  return (
    <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3">
      <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-2">{title}</div>
      <div className="flex gap-3">
        <div className="flex-shrink-0 bg-[#0B0E11] border border-[#2A323A] rounded-sm p-1">
          <CreatureAvatar animal={animal} size={64} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[#E8EDF2] font-display text-sm mb-1 truncate">
            {animal.name} <span className="text-[#5EEAD4] font-mono text-[10px]">Lv.{getAnimalLevel(animal)}</span>
          </div>
          <div className="text-[#C77DFF] font-mono text-[10px] mb-2">🧬 Ort. Mutasyon Sv. {averageMutationLevel(animal).toFixed(1)}</div>
          <StatRow label="HP" value={s.hp.toFixed(1)} />
          <StatRow label="ATAK" value={s.attack.toFixed(1)} />
          <StatRow label="ZIRH" value={s.armor.toFixed(1)} />
        </div>
      </div>
    </div>
  );
}

function AnimalPicker({ value, onChange, options, label, disabled }) {
  return (
    <div className="flex-1">
      <div className="text-[10px] text-[#7C8894] font-mono tracking-[0.15em] mb-1">{label}</div>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0B0E11] border border-[#2A323A] text-[#E8EDF2] font-mono text-xs px-2 py-2 rounded-sm focus:outline-none focus:border-[#5EEAD4] disabled:opacity-40"
      >
        {options.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    </div>
  );
}

function LabView({ pool, onBreed, scrap, labReadyAt, now }) {
  const names = Object.keys(pool);
  const [aName, setAName] = useState(names[0]);
  const [bName, setBName] = useState(names[1] || names[0]);
  const [results, setResults] = useState(null);
  const [revealCount, setRevealCount] = useState(0);
  const [childInfo, setChildInfo] = useState(null);
  const [armed, setArmed] = useState(false);
  const timerRef = useRef(null);
  const armTimerRef = useRef(null);

  // ÖNEMLİ: Sadece "bu isim artık envanterde yok" (tüketildi) durumunu
  // düzeltir — asla A ile aynı diye B'yi SESSİZCE başka bir hayvanla
  // değiştirmez. Önceki sürümde bu sessiz değiştirme, dropdown'da yazan
  // isimle altındaki kartın uyuşmamasına ("rastgele" gibi görünen bir
  // tutarsızlığa) yol açıyordu.
  const displayAName = pool[aName] ? aName : names[0];
  const displayBName = pool[bName] ? bName : (names[1] || names[0]);
  const sameSelection = displayAName === displayBName;

  useEffect(() => {
    if (!pool[aName]) setAName(names[0]);
    if (!pool[bName]) setBName(names[1] || names[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(armTimerRef.current); }, []);

  const onCooldown = now < labReadyAt;
  const cooldownMsLeft = Math.max(0, labReadyAt - now);
  const previewMutation = names.length >= 2 && !sameSelection ? totalCombinedMutation(pool[displayAName], pool[displayBName]) : 0;
  const previewFee = labFee(previewMutation);
  const previewCooldown = labCooldownMs(previewMutation);
  const canAffordFee = scrap >= previewFee;
  const canBreed = names.length >= 2 && !sameSelection && !onCooldown && canAffordFee;

  const handleBreedClick = () => {
    if (!canBreed) return;
    if (!armed) {
      setArmed(true);
      clearTimeout(armTimerRef.current);
      armTimerRef.current = setTimeout(() => setArmed(false), 4000);
      return;
    }
    setArmed(false);
    clearTimeout(timerRef.current);

    const outcome = onBreed(displayAName, displayBName);
    if (!outcome) return;
    const { child, results: r } = outcome;

    setResults(r);
    setChildInfo(null);
    setRevealCount(0);
    let i = 0;
    const tick = () => {
      i++;
      setRevealCount(i);
      if (i < r.length) {
        timerRef.current = setTimeout(tick, 260);
      } else {
        setChildInfo(child);
      }
    };
    timerRef.current = setTimeout(tick, 260);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-4">
          <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-1">SENTEZ TÜPLERİ</div>
          <div className="text-[9px] text-[#FF6B4A] font-mono mb-3">
            ⚠️ Melezleme her İKİ ebeveyni de kalıcı olarak tüketir. Geriye sadece yavru kalır.
          </div>
          <div className="flex gap-3 mb-3">
            <AnimalPicker label="EBEVEYN A" value={displayAName} onChange={setAName} options={names} disabled={names.length < 2} />
            <AnimalPicker label="EBEVEYN B" value={displayBName} onChange={setBName} options={names} disabled={names.length < 2} />
          </div>
          {sameSelection && names.length >= 2 && (
            <div className="text-[9px] text-[#FF6B4A] font-mono mb-2">
              ⚠️ Aynı canlıyı iki ebeveyn olarak seçemezsin — birini değiştir.
            </div>
          )}
          {names.length >= 2 && !sameSelection && (
            <div className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-2 mb-3 text-[10px] font-mono">
              <div className="flex justify-between text-[#7C8894]">
                <span>🧪 Laboratuvar Ücreti</span>
                <span className={canAffordFee ? "text-[#FFD166]" : "text-[#FF6B4A]"}>{previewFee} 🔩</span>
              </div>
              <div className="flex justify-between text-[#7C8894] mt-1">
                <span>⏳ Sonraki kullanıma kadar bekleme</span>
                <span className="text-[#E8EDF2]">{formatCountdown(previewCooldown)}</span>
              </div>
              <div className="text-[#2A323A] mt-1">Toplam mutasyon puanı: {previewMutation} (ücret ve bekleme buna göre ölçekleniyor)</div>
            </div>
          )}
          {onCooldown && (
            <div className="text-[9px] text-[#FF6B4A] font-mono mb-2">
              🧪 Laboratuvar meşgul — tekrar kullanılabilir: {formatCountdown(cooldownMsLeft)}
            </div>
          )}
          {!onCooldown && !canAffordFee && names.length >= 2 && !sameSelection && (
            <div className="text-[9px] text-[#FF6B4A] font-mono mb-2">
              Yetersiz hurda — bu melezleme {previewFee} 🔩 gerektiriyor.
            </div>
          )}
          <button
            onClick={handleBreedClick}
            disabled={!canBreed}
            className="w-full font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm transition-colors font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: armed ? "#FF6B4A" : "#5EEAD4",
              color: "#0B0E11",
            }}
          >
            {names.length < 2
              ? "YETERSİZ CANLI — MARKET'E BAK"
              : sameSelection
              ? "AYNI CANLIYI SEÇTİN"
              : onCooldown
              ? "LABORATUVAR MEŞGUL"
              : !canAffordFee
              ? "YETERSİZ HURDA"
              : armed
              ? "⚠️ EMİN MİSİN? TEKRAR TIKLA (EBEVEYNLER TÜKENECEK)"
              : "▶ MELEZLE"}
          </button>
        </div>

        {results && (
          <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-4">
            <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-2">SENTEZ KAYDI</div>
            <div className="space-y-1">
              {results.map((r, idx) => {
                const visible = idx < revealCount;
                const st = OUTCOME_STYLE[r.outcome];
                return (
                  <div
                    key={r.type}
                    className="py-1.5 border-b border-[#1c2329]"
                    style={{ opacity: visible ? 1 : 0.15, transition: "opacity 0.2s" }}
                  >
                    {visible ? (
                      <>
                        <div className="flex justify-between items-center text-[11px] font-mono">
                          <span className="text-[#7C8894] w-16">{LIMB_LABELS[r.type]}</span>
                          <span style={{ color: st.color }} className="flex-1 text-center">{st.label}</span>
                          <span className="text-[#E8EDF2] text-[10px]">
                            {r.limb.source ? `${r.limb.source}` : "BOŞ SLOT"}
                          </span>
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-[#2A323A] mt-0.5">
                          <span>🧬 birleşen mutasyon sv: {r.odds.combinedMutation}</span>
                          <span>%{r.odds.superC.toFixed(0)} süper / %{r.odds.domC.toFixed(0)} baskın / %{r.odds.mutC.toFixed(0)} mutasyon</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="text-[#7C8894] w-16">{LIMB_LABELS[r.type]}</span>
                        <span className="text-[#2A323A] flex-1 text-center">// taranıyor...</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {names.length >= 2 ? (
          <>
            <StatCard animal={pool[displayAName]} title="EBEVEYN A — ÖNİZLEME (TÜKETİLECEK)" />
            <StatCard animal={pool[displayBName]} title="EBEVEYN B — ÖNİZLEME (TÜKETİLECEK)" />
          </>
        ) : (
          <div className="bg-[#151A1F] border border-[#FF6B4A] rounded-sm p-4 text-center text-[11px] font-mono text-[#FF6B4A]">
            Envanterinde 2'den az canlı kaldı. Melezlemeye devam etmek için Market'ten yeni bir hayvan al.
          </div>
        )}
        {childInfo && (
          <div className="border border-[#5EEAD4] rounded-sm p-1">
            <StatCard animal={childInfo} title="✓ SENTEZ TAMAMLANDI — ENVANTERE EKLENDİ" />
          </div>
        )}
      </div>
    </div>
  );
}

function SurgeryView({ pool, onSurgery, scrap, surgeryReadyAt, now }) {
  const names = Object.keys(pool);
  const [targetName, setTargetName] = useState(names[0]);
  const [limbType, setLimbType] = useState(LIMB_TYPES[0]);
  const [donorName, setDonorName] = useState(names[1] || names[0]);
  const [armed, setArmed] = useState(false);
  const [resultInfo, setResultInfo] = useState(null);
  const armTimerRef = useRef(null);

  useEffect(() => {
    if (!pool[targetName]) setTargetName(names[0]);
    if (!pool[donorName]) setDonorName(names[1] || names[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  useEffect(() => () => clearTimeout(armTimerRef.current), []);

  const target = pool[targetName];
  const donor = pool[donorName];
  const sameSelection = targetName === donorName;
  const onCooldown = now < surgeryReadyAt;

  const targetLimb = target ? target.limbs[limbType] : null;
  const donorLimb = donor ? donor.limbs[limbType] : null;
  const combinedMutation = targetLimb && donorLimb ? mutationLevel(targetLimb) + mutationLevel(donorLimb) : 0;
  const previewFee = surgeryFee(combinedMutation);
  const previewCooldown = surgeryCooldownMs(combinedMutation);
  const canAfford = scrap >= previewFee;
  const canOperate = names.length >= 2 && !sameSelection && !onCooldown && canAfford;

  const previewOdds = React.useMemo(() => {
    if (!targetLimb || !donorLimb) return null;
    const base = getOdds(combinedMutation);
    return { superC: base.superC * 0.5, domC: base.domC * 0.8, mutC: 100 - base.superC * 0.5 - base.domC * 0.8 };
  }, [combinedMutation, targetLimb, donorLimb]);

  const handleClick = () => {
    if (!canOperate) return;
    if (!armed) {
      setArmed(true);
      clearTimeout(armTimerRef.current);
      armTimerRef.current = setTimeout(() => setArmed(false), 4000);
      return;
    }
    setArmed(false);
    const outcome = onSurgery(targetName, limbType, donorName);
    if (!outcome) return;
    setResultInfo(outcome);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-4">
        <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-1">CERRAHİ İSTASYONU</div>
        <div className="text-[9px] text-[#7C8894] font-mono mb-3">
          Sadece TEK bir uzvu hedef alır. Hedef canlı yaşar, sadece o uzvu değişir. Bağışçı canlı da yaşar
          ama seçtiğin uzvunu kaybeder (o uzvu boş soket olur). Başarı şansı tam melezlemeden düşüktür.
        </div>

        <div className="mb-3">
          <div className="text-[10px] text-[#7C8894] font-mono tracking-[0.15em] mb-1">HEDEF UZUV</div>
          <div className="flex flex-wrap gap-1">
            {LIMB_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setLimbType(t)}
                className="px-2 py-1.5 text-[9px] font-mono rounded-sm border"
                style={{
                  borderColor: limbType === t ? "#5EEAD4" : "#2A323A",
                  color: limbType === t ? "#5EEAD4" : "#7C8894",
                  background: limbType === t ? "#0B0E11" : "transparent",
                }}
              >
                {LIMB_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          <AnimalPicker label="HEDEF CANLI" value={targetName} onChange={setTargetName} options={names} disabled={names.length < 2} />
          <AnimalPicker label="BAĞIŞÇI CANLI" value={donorName} onChange={setDonorName} options={names} disabled={names.length < 2} />
        </div>

        {sameSelection && names.length >= 2 && (
          <div className="text-[9px] text-[#FF6B4A] font-mono mb-2">⚠️ Hedef ve bağışçı aynı canlı olamaz.</div>
        )}

        {targetLimb && donorLimb && !sameSelection && (
          <div className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-2 mb-3 text-[10px] font-mono">
            <div className="flex justify-between text-[#7C8894]">
              <span>🧪 Cerrahi Ücreti</span>
              <span className={canAfford ? "text-[#FFD166]" : "text-[#FF6B4A]"}>{previewFee} 🔩</span>
            </div>
            <div className="flex justify-between text-[#7C8894] mt-1">
              <span>⏳ Bekleme</span>
              <span className="text-[#E8EDF2]">{formatCountdown(previewCooldown)}</span>
            </div>
            {previewOdds && (
              <div className="text-[#2A323A] mt-1">
                %{previewOdds.superC.toFixed(0)} süper / %{previewOdds.domC.toFixed(0)} baskın / %{previewOdds.mutC.toFixed(0)} mutasyon
                {" "}(birleşen mutasyon sv: {combinedMutation})
              </div>
            )}
          </div>
        )}

        {onCooldown && (
          <div className="text-[9px] text-[#FF6B4A] font-mono mb-2">
            🧪 Cerrahi istasyon meşgul — tekrar kullanılabilir: {formatCountdown(Math.max(0, surgeryReadyAt - now))}
          </div>
        )}
        {!onCooldown && !canAfford && names.length >= 2 && !sameSelection && (
          <div className="text-[9px] text-[#FF6B4A] font-mono mb-2">Yetersiz hurda — {previewFee} 🔩 gerekiyor.</div>
        )}

        <button
          onClick={handleClick}
          disabled={!canOperate}
          className="w-full font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm transition-colors font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: armed ? "#FF6B4A" : "#5EEAD4", color: "#0B0E11" }}
        >
          {names.length < 2
            ? "YETERSİZ CANLI"
            : sameSelection
            ? "AYNI CANLIYI SEÇTİN"
            : onCooldown
            ? "İSTASYON MEŞGUL"
            : !canAfford
            ? "YETERSİZ HURDA"
            : armed
            ? "⚠️ EMİN MİSİN? TEKRAR TIKLA (BAĞIŞÇI UZVU KAYBEDECEK)"
            : "🔬 AMELİYATI BAŞLAT"}
        </button>
      </div>

      {resultInfo && (
        <div className="border rounded-sm p-4" style={{ borderColor: OUTCOME_STYLE[resultInfo.result.outcome].color }}>
          <div className="text-[11px] font-mono tracking-[0.15em] mb-2" style={{ color: OUTCOME_STYLE[resultInfo.result.outcome].color }}>
            {OUTCOME_STYLE[resultInfo.result.outcome].label}
          </div>
          <div className="text-[10px] font-mono text-[#7C8894]">
            {LIMB_LABELS[limbType]}: {resultInfo.result.limb.source ? resultInfo.result.limb.source : "BOŞ SLOT KALDI"}
          </div>
          <div className="text-[9px] font-mono text-[#FF6B4A] mt-2">Bağışçının {LIMB_LABELS[limbType]} uzvu artık boş soket.</div>
        </div>
      )}
    </div>
  );
}

function BattleLog({ battle, visibleLog, logEndRef }) {
  return (
    <div className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-3 h-56 overflow-y-auto font-mono text-[11px]">
      {!battle && <div className="text-[#2A323A]">// savaş kaydı bekleniyor...</div>}
      {battle && battle.log.slice(0, visibleLog).map((entry, i) => (
        <div
          key={i}
          className="py-0.5"
          style={{ color: entry.kind === "crit" ? "#FF6B4A" : entry.kind === "dodge" ? "#5EEAD4" : entry.kind === "armor" ? "#FFD166" : "#E8EDF2" }}
        >
          {`> ${entry.text}`}
        </div>
      ))}
      {battle && visibleLog >= battle.log.length && (
        <div className="text-[#5EEAD4] mt-2 font-bold">{`>>> KAZANAN: ${battle.winner} (${battle.turns} tur)`}</div>
      )}
      <div ref={logEndRef} />
    </div>
  );
}

function PvEView({ pool, energy, energyMsLeft, onSpendEnergy, onReward }) {
  const names = Object.keys(pool);
  const [fighterName, setFighterName] = useState(names[0]);
  const [tierIdx, setTierIdx] = useState(0);
  const tier = BOT_TIERS[tierIdx];
  const [botName, setBotName] = useState(tier.names[0]);
  const [battle, setBattle] = useState(null);
  const [visibleLog, setVisibleLog] = useState(0);
  const [rewardMsg, setRewardMsg] = useState(null);
  const timerRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (!names.includes(fighterName)) setFighterName(names[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  useEffect(() => () => clearTimeout(timerRef.current), []);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [visibleLog]);

  const changeTier = (idx) => {
    setTierIdx(idx);
    setBotName(BOT_TIERS[idx].names[0]);
  };

  const handleFight = () => {
    if (energy <= 0 || !fighterName) return;
    onSpendEnergy();
    clearTimeout(timerRef.current);
    const fighter = pool[fighterName];
    const bot = purebred(botName);
    bot.name = `${botName} (Bot)`;
    const result = simulateBattle(fighter, bot);
    setBattle(result);
    setVisibleLog(0);
    setRewardMsg(null);
    let i = 0;
    const tick = () => {
      i++;
      setVisibleLog(i);
      if (i < result.log.length) {
        timerRef.current = setTimeout(tick, 150);
      } else {
        const won = result.winner === fighter.name;
        const amount = won ? tier.reward : Math.round(tier.reward * 0.2);
        onReward(amount);
        setRewardMsg(won ? `+${amount} HURDA (ZAFER)` : `+${amount} HURDA (YENİLGİ — teselli)`);
      }
    };
    timerRef.current = setTimeout(tick, 150);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {BOT_TIERS.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => changeTier(idx)}
            className="flex-1 px-2 py-2 text-[9px] font-mono tracking-wide rounded-sm border transition-colors"
            style={{
              borderColor: tierIdx === idx ? RARITY_COLOR[t.rarity] : "#2A323A",
              color: tierIdx === idx ? RARITY_COLOR[t.rarity] : "#7C8894",
              background: tierIdx === idx ? "#151A1F" : "transparent",
            }}
          >
            {t.label}<br /><span className="opacity-70">+{t.reward} hurda</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AnimalPicker label="SAVAŞÇIN" value={fighterName} onChange={setFighterName} options={names} />
        <AnimalPicker label="BOT (DÜŞMAN)" value={botName} onChange={setBotName} options={tier.names} />
      </div>

      <button
        onClick={handleFight}
        disabled={energy <= 0 || !fighterName}
        className="w-full bg-[#FF6B4A] text-[#0B0E11] font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm hover:bg-[#FF8568] transition-colors font-bold disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ⚔ ARENAYA GİR (1 ⚡)
      </button>
      {energy <= 0 && (
        <div className="text-[10px] font-mono text-[#7C8894] text-center -mt-2">
          Enerji bekleniyor: {formatCountdown(energyMsLeft)}
        </div>
      )}

      {rewardMsg && (
        <div className="text-center text-[11px] font-mono py-1 rounded-sm border border-[#2A323A] text-[#5EEAD4]">{rewardMsg}</div>
      )}

      <BattleLog battle={battle} visibleLog={visibleLog} logEndRef={logEndRef} />
    </div>
  );
}

function BossView({ pool, energy, energyMsLeft, defeatedBosses, onSpendBossEnergy, onBossReward }) {
  const names = Object.keys(pool);
  const [fighterName, setFighterName] = useState(names[0]);
  const [tierIdx, setTierIdx] = useState(0);
  const tier = BOSS_TIERS[tierIdx];
  const [duel, setDuel] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rewardMsg, setRewardMsg] = useState(null);
  const [revealIndex, setRevealIndex] = useState(0);
  const [revealToken, setRevealToken] = useState(0);
  const [shakeSide, setShakeSide] = useState(null);
  const [floatTexts, setFloatTexts] = useState([]);
  const timerRef = useRef(null);
  const revealTimerRef = useRef(null);
  const shakeTimerRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (!names.includes(fighterName)) setFighterName(names[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(revealTimerRef.current); clearTimeout(shakeTimerRef.current); }, []);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [duel?.log, revealIndex]);

  useEffect(() => {
    if (duel && duel.phase === "waiting") {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDuel((d) => (d && d.phase === "waiting" ? { ...d, phase: "choosing" } : d));
      }, ROUND_GAP_MS);
    }
    return () => clearTimeout(timerRef.current);
  }, [duel?.phase]);

  // Round çözüldükten sonra vuruş-vuruş açılım: her vuruşta hedefi salla,
  // uçan hasar sayısı göster, en sonunda gerçek round sonucunu (ve varsa
  // ödülü) uygula.
  useEffect(() => {
    if (revealToken === 0) return;
    if (!duel || duel.phase !== "revealing" || !duel.pending) return;
    const pending = duel.pending;
    setRevealIndex(0);
    setShakeSide(null);
    setFloatTexts([]);
    let i = 0;
    const tick = () => {
      const entry = pending.log[i];
      if (entry) {
        if (!entry.dodged) {
          setShakeSide(entry.targetSide);
          clearTimeout(shakeTimerRef.current);
          shakeTimerRef.current = setTimeout(() => setShakeSide(null), 380);
          const color = entry.crit ? "#FF6B4A" : "#E8EDF2";
          setFloatTexts((prev) => [...prev.slice(-4), { id: Math.random().toString(36).slice(2), side: entry.targetSide, text: `-${entry.dmg.toFixed(1)}${entry.crit ? " 💥" : ""}`, color }]);
          if (entry.reflect > 0) {
            const reflectSide = entry.targetSide === "player" ? "opp" : "player";
            setFloatTexts((prev) => [...prev.slice(-4), { id: Math.random().toString(36).slice(2), side: reflectSide, text: `-${entry.reflect.toFixed(1)} ↩`, color: "#C77DFF" }]);
          }
        } else {
          setFloatTexts((prev) => [...prev.slice(-4), { id: Math.random().toString(36).slice(2), side: entry.targetSide, text: "MISS", color: "#5EEAD4" }]);
        }
      }
      i++;
      setRevealIndex(i);
      if (i < pending.log.length) {
        revealTimerRef.current = setTimeout(tick, 480);
      } else {
        revealTimerRef.current = setTimeout(() => {
          if (pending.finished) {
            const won = pending.winner === pending.finalPlayerUnit.name;
            if (won) {
              const amount = onBossReward(tier);
              setRewardMsg(`👑 ${tier.label} DÜŞTÜ! +${amount} HURDA`);
            } else {
              setRewardMsg("Nöbetçi seni geri püskürttü. Daha güçlü dön.");
            }
          }
          setDuel((d) => {
            if (!d || !d.pending) return d;
            const p = d.pending;
            return {
              ...d,
              playerUnit: p.finalPlayerUnit,
              oppUnit: p.finalOppUnit,
              hand: p.newHand,
              log: p.log,
              history: [...d.history, p.historyEntry],
              phase: p.finished ? "finished" : "waiting",
              winner: p.winner,
              round: d.round + 1,
              pending: null,
            };
          });
        }, 350);
      }
    };
    revealTimerRef.current = setTimeout(tick, 480);
    return () => clearTimeout(revealTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealToken]);

  const bossPreview = React.useMemo(() => createBossAnimal(tier), [tier]);
  const bossStats = totalStats(bossPreview);
  const bossPower = computePowerScore(bossPreview);
  const requiredPower = bossRequiredPower(tier);
  const fighter = fighterName ? pool[fighterName] : null;
  const fighterPower = fighter ? computePowerScore(fighter) : 0;
  const meetsThreshold = fighterPower >= requiredPower;
  const alreadyCleared = !!defeatedBosses[tier.id];

  const startFight = () => {
    if (energy < tier.energyCost || !fighterName || !meetsThreshold) return;
    onSpendBossEnergy(tier.energyCost);
    const s1 = totalStats(fighter);
    const boss = createBossAnimal(tier);
    const s2 = totalStats(boss);
    setSelectedIds([]);
    setHistoryOpen(false);
    setRewardMsg(null);
    setFloatTexts([]);
    setShakeSide(null);
    setDuel({
      playerUnit: { name: fighter.name, hp: s1.hp, maxHp: s1.hp, attack: s1.attack, armor: s1.armor, armorUsed: false },
      oppUnit: { name: boss.name, hp: s2.hp, maxHp: s2.hp, attack: s2.attack, armor: s2.armor, armorUsed: false },
      round: 1,
      hand: [dealCard(), dealCard()],
      log: [],
      history: [],
      phase: "choosing",
      winner: null,
      pending: null,
    });
  };

  const toggleSelect = (cardId) => {
    setSelectedIds((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId);
      if (prev.length >= 2) return prev;
      return [...prev, cardId];
    });
  };

  // Sadece 2 TEMEL (füzyon olmayan) kartı birleştirir — round'u BİTİRMEZ.
  const handleFuse = () => {
    setDuel((d) => {
      if (!d) return d;
      const selected = d.hand.filter((c) => selectedIds.includes(c.id));
      if (selected.length !== 2 || selected.some((c) => c.defIds.length > 1)) return d;
      const remaining = d.hand.filter((c) => !selectedIds.includes(c.id));
      const fused = fuseCards(selected);
      return { ...d, hand: capHand([...remaining, fused]) };
    });
    setSelectedIds([]);
  };

  const playRound = () => {
    setDuel((d) => {
      if (!d || d.phase !== "choosing") return d;
      const playerCard = d.hand.find((c) => selectedIds.includes(c.id)) || null;
      const remainingHand = d.hand.filter((c) => c.id !== playerCard?.id);

      const aiHand = [dealCard(), dealCard()];
      const oppCard = aiHand[Math.floor(Math.random() * aiHand.length)];

      const playerUnit = { ...d.playerUnit };
      const oppUnit = { ...d.oppUnit };
      const { log, summary } = resolveRound(playerUnit, oppUnit, playerCard, oppCard);

      const finished = playerUnit.hp <= 0 || oppUnit.hp <= 0;
      const winner = finished ? (playerUnit.hp > 0 ? playerUnit.name : oppUnit.name) : null;

      const historyEntry = {
        round: d.round, summary, playerCard, oppCard,
        playerHpAfter: Math.max(playerUnit.hp, 0), oppHpAfter: Math.max(oppUnit.hp, 0),
      };

      setSelectedIds([]);
      setRevealIndex(0);
      setRevealToken((t) => t + 1);

      return {
        ...d,
        phase: "revealing",
        pending: {
          log, finished, winner, historyEntry,
          finalPlayerUnit: playerUnit, finalOppUnit: oppUnit,
          newHand: finished ? remainingHand : capHand([...remainingHand, dealCard(), dealCard()]),
        },
      };
    });
  };

  const skipWait = () => {
    clearTimeout(timerRef.current);
    setDuel((d) => (d && d.phase === "waiting" ? { ...d, phase: "choosing" } : d));
  };

  const canFuse = selectedIds.length === 2 && duel && duel.hand.filter((c) => selectedIds.includes(c.id)).every((c) => c.defIds.length === 1);
  const playButtonLabel = selectedIds.length === 1 ? "▶ OYNA" : "▶ BU ROUND KART OYNAMA";

  const revealing = duel && duel.phase === "revealing" && duel.pending;
  // Güvenlik: revealIndex bir üst sınırın dışına taşarsa (round geçişindeki
  // kısa bir zamanlama penceresinde olabilir) index'i log uzunluğuna kenetle.
  const safeRevealIndex = revealing ? Math.min(revealIndex, duel.pending.log.length) : 0;
  const revealSnapshot = revealing && safeRevealIndex > 0 ? duel.pending.log[safeRevealIndex - 1] : null;
  const displayedPlayerHp = revealing
    ? (revealSnapshot ? revealSnapshot.playerHpAfter : duel.playerUnit.hp)
    : duel?.playerUnit.hp ?? 0;
  const displayedOppHp = revealing
    ? (revealSnapshot ? revealSnapshot.oppHpAfter : duel.oppUnit.hp)
    : duel?.oppUnit.hp ?? 0;
  const visibleLog = revealing ? duel.pending.log.slice(0, safeRevealIndex) : (duel?.log ?? []);

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {BOSS_TIERS.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => { setTierIdx(idx); setDuel(null); }}
            className="flex-1 px-2 py-2 text-[9px] font-mono tracking-wide rounded-sm border transition-colors"
            style={{
              borderColor: tierIdx === idx ? t.color : "#2A323A",
              color: tierIdx === idx ? t.color : "#7C8894",
              background: tierIdx === idx ? "#151A1F" : "transparent",
            }}
          >
            {t.label}{defeatedBosses[t.id] ? " ✓" : ""}
          </button>
        ))}
      </div>

      <div className="bg-[#151A1F] border rounded-sm p-4" style={{ borderColor: tier.color }}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-3">
            <div className="flex-shrink-0 bg-[#0B0E11] border rounded-sm p-1" style={{ borderColor: tier.color }}>
              <CreatureAvatar animal={bossPreview} size={56} />
            </div>
            <div>
              <div className="font-display text-base" style={{ color: tier.color }}>👑 {tier.label}</div>
              <div className="text-[9px] text-[#7C8894] font-mono mt-1">Güç Puanı: {bossPower}</div>
            </div>
          </div>
          {alreadyCleared && (
            <div className="text-[9px] font-mono px-2 py-1 rounded-sm border" style={{ borderColor: tier.color, color: tier.color }}>✓ FATİH</div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-[#7C8894] mt-2">
          <div>HP <span className="text-[#E8EDF2]">{bossStats.hp.toFixed(0)}</span></div>
          <div>ATK <span className="text-[#E8EDF2]">{bossStats.attack.toFixed(0)}</span></div>
          <div>ZIRH <span className="text-[#E8EDF2]">{bossStats.armor.toFixed(0)}</span></div>
        </div>
        <div className="text-[10px] font-mono mt-2" style={{ color: meetsThreshold ? "#5EEAD4" : "#FF6B4A" }}>
          Giriş Şartı: Güç Puanı ≥ {requiredPower} {fighterName && `(şampiyonun: ${fighterPower})`}
        </div>
      </div>

      {!duel && (
        <>
          <AnimalPicker label="ŞAMPİYONUN" value={fighterName} onChange={setFighterName} options={names} />

          {!meetsThreshold && fighterName && (
            <div className="text-[9px] text-[#FF6B4A] font-mono -mt-2">
              Gücün yetersiz. Seviye atla, daha iyi melez üret veya daha zayıf bir kademe dene.
            </div>
          )}

          <button
            onClick={startFight}
            disabled={energy < tier.energyCost || !fighterName || !meetsThreshold}
            className="w-full font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm transition-colors font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: tier.color, color: "#0B0E11" }}
          >
            👑 MEYDAN OKU ({tier.energyCost} ⚡)
          </button>
          {energy < tier.energyCost && (
            <div className="text-[10px] font-mono text-[#7C8894] text-center -mt-2">
              Yetersiz enerji · dolum: {formatCountdown(energyMsLeft)}
            </div>
          )}
        </>
      )}

      {rewardMsg && (
        <div className="text-center text-[11px] font-mono py-1 rounded-sm border border-[#2A323A]" style={{ color: tier.color }}>{rewardMsg}</div>
      )}

      {duel && (
        <>
          <FightHud
            playerName={duel.playerUnit.name} playerHp={displayedPlayerHp} playerMaxHp={duel.playerUnit.maxHp}
            playerArmorUsed={duel.playerUnit.armorUsed} playerAvatar={pool[fighterName] || duel.playerUnit}
            oppName={duel.oppUnit.name} oppHp={displayedOppHp} oppMaxHp={duel.oppUnit.maxHp}
            oppArmorUsed={duel.oppUnit.armorUsed} oppAvatar={bossPreview}
            vsColor={tier.color} oppBarColor={tier.color} shakeSide={shakeSide} floatTexts={floatTexts}
          />

          <div className="text-center text-[10px] font-mono" style={{ color: tier.color }}>ROUND {duel.round}</div>

          {duel.phase === "choosing" && (
            <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3">
              <div className="text-[9px] font-mono text-[#7C8894] mb-2">
                ELİNDEKİ KARTLAR ({duel.hand.length}/{MAX_HAND_SIZE}) — en fazla 2 seç, birleştirmek için
              </div>
              <CardRail hand={duel.hand} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
              {selectedIds.length === 2 ? (
                canFuse ? (
                  <button
                    onClick={handleFuse}
                    className="w-full font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm font-bold mt-3"
                    style={{ background: "#C77DFF", color: "#0B0E11" }}
                  >
                    🔗 BİRLEŞTİR (oynamaz, ele eklenir)
                  </button>
                ) : (
                  <div className="text-[9px] text-[#FF6B4A] font-mono text-center mt-3">
                    Sadece iki TEMEL kart birleştirilebilir (füzyon kartı tekrar birleştirilemez).
                  </div>
                )
              ) : (
                <button
                  onClick={playRound}
                  className="w-full font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm font-bold mt-3"
                  style={{ background: selectedIds.length > 0 ? tier.color : "#151A1F", color: selectedIds.length > 0 ? "#0B0E11" : "#7C8894", border: "1px solid #2A323A" }}
                >
                  {playButtonLabel}
                </button>
              )}
            </div>
          )}

          {duel.phase === "revealing" && (
            <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3 text-center">
              <div className="font-mono text-[11px]" style={{ color: tier.color }}>⚔ ROUND ÇÖZÜLÜYOR...</div>
            </div>
          )}

          {duel.phase === "waiting" && (
            <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3 text-center">
              <div className="font-mono text-[11px] mb-2" style={{ color: tier.color }}>✓ ROUND {duel.round - 1} BİTTİ</div>
              <button onClick={skipWait} className="text-[9px] font-mono px-3 py-1.5 rounded-sm border border-[#2A323A] text-[#7C8894]">
                ⏩ HEMEN DEVAM ET
              </button>
            </div>
          )}

          {duel.phase === "finished" && (
            <div className="border rounded-sm p-4 text-center" style={{ borderColor: duel.winner === duel.playerUnit.name ? "#5EEAD4" : "#FF6B4A" }}>
              <div className="font-mono text-sm font-bold" style={{ color: duel.winner === duel.playerUnit.name ? "#5EEAD4" : "#FF6B4A" }}>
                {duel.winner === duel.playerUnit.name ? "🏆 KAZANDIN" : "💀 KAYBETTİN"}
              </div>
              <button onClick={() => setDuel(null)} className="mt-3 text-[10px] font-mono px-4 py-2 rounded-sm border border-[#2A323A] text-[#E8EDF2]">
                YENİ MEYDAN OKUMA
              </button>
            </div>
          )}

          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex justify-between items-center text-[10px] font-mono px-3 py-2 rounded-sm border border-[#2A323A] text-[#7C8894]"
          >
            <span>⚔️ Round Geçmişi ({duel.history.length})</span>
            <span>{historyOpen ? "▲" : "▼"}</span>
          </button>
          {historyOpen && (
            <div className="space-y-2">
              {duel.history.map((h, i) => (
                <div key={i} className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-2 text-[9px] font-mono">
                  <div className="mb-1" style={{ color: tier.color }}>ROUND {h.round}</div>
                  <div className="text-[#7C8894]">
                    Sen: {h.summary.pDealt.toFixed(1)} verdi / {h.summary.pBlocked.toFixed(1)} bloklandı / {h.summary.pTaken.toFixed(1)} aldı
                    {h.playerCard && <span> · kart: {cardDisplay(h.playerCard).name}</span>}
                  </div>
                  <div className="text-[#7C8894]">
                    Rakip: {h.summary.oDealt.toFixed(1)} verdi / {h.summary.oBlocked.toFixed(1)} bloklandı / {h.summary.oTaken.toFixed(1)} aldı
                    {h.oppCard && <span> · kart: {cardDisplay(h.oppCard).name}</span>}
                  </div>
                  <div className="text-[#2A323A] mt-1">Round sonu can: Sen {h.playerHpAfter.toFixed(0)} — Rakip {h.oppHpAfter.toFixed(0)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-3 h-40 overflow-y-auto font-mono text-[10px]">
            {visibleLog.map((entry, i) => (
              <div key={i} className="py-0.5" style={{ color: entry.kind === "crit" ? "#FF6B4A" : entry.kind === "dodge" ? "#5EEAD4" : "#E8EDF2" }}>
                {`> ${entry.text}`}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </>
      )}
    </div>
  );
}

// Sol kenarda dikey sıralanan küçük yuvarlak kart sembolü. Tıklandığında
// 3D "çevirme" yapmaz (bu ortamda güvenilir render olmuyordu) — bunun yerine
// dışarıdaki bilgi paneline hangi kartın gösterileceğini bildirir.
function CardIcon({ card, selected, active, onTap }) {
  const disp = cardDisplay(card);
  return (
    <button
      onClick={onTap}
      className="relative flex items-center justify-center rounded-full border-2 transition-colors"
      style={{
        width: 44, height: 44,
        borderColor: active ? "#E8EDF2" : disp.color,
        background: selected ? disp.color : "#151A1F",
        boxShadow: active ? `0 0 0 2px ${disp.color}` : "none",
      }}
      title={disp.name}
    >
      <span style={{ fontSize: 18, filter: selected ? "grayscale(1) brightness(3)" : "none" }}>{disp.icon}</span>
      {selected && (
        <span className="absolute -top-1 -right-1 text-[9px]" style={{ color: "#0B0E11" }}>✓</span>
      )}
    </button>
  );
}

// Sol kenar kart rafı + tıklanan kartın alt bilgi paneli. Duel/Boss
// ekranlarında ortak kullanılır.
function CardRail({ hand, selectedIds, onToggleSelect }) {
  const [infoId, setInfoId] = useState(null);
  const infoCard = hand.find((c) => c.id === infoId) || null;
  const disp = infoCard ? cardDisplay(infoCard) : null;

  useEffect(() => {
    if (infoId && !hand.some((c) => c.id === infoId)) setInfoId(null);
  }, [hand, infoId]);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col gap-2 flex-shrink-0">
        {hand.map((c) => (
          <CardIcon
            key={c.id}
            card={c}
            selected={selectedIds.includes(c.id)}
            active={infoId === c.id}
            onTap={() => setInfoId(infoId === c.id ? null : c.id)}
          />
        ))}
      </div>

      <div className="flex-1 min-w-0">
        {infoCard ? (
          <div className="bg-[#151A1F] border rounded-sm p-3 h-full" style={{ borderColor: disp.color }}>
            <div className="flex items-start gap-2">
              <div className="text-[24px] leading-none">{disp.icon}</div>
              <div className="flex-1 min-w-0">
                {disp.isFusion && <div className="text-[7px] font-mono text-[#C77DFF] tracking-wide">⚡ FÜZYON</div>}
                <div className="font-mono text-[10px]" style={{ color: disp.color }}>{disp.name}</div>
              </div>
              <div className="text-[14px]">♻️</div>
            </div>
            <div className="text-[8px] font-mono text-[#7C8894] leading-snug mt-2">{disp.desc}</div>
            <button
              onClick={() => onToggleSelect(infoCard.id)}
              className="w-full mt-2 text-[9px] font-mono py-1.5 rounded-sm border tracking-wide"
              style={{
                borderColor: selectedIds.includes(infoCard.id) ? disp.color : "#2A323A",
                color: selectedIds.includes(infoCard.id) ? disp.color : "#7C8894",
              }}
            >
              {selectedIds.includes(infoCard.id) ? "✓ SEÇİLDİ" : "SEÇ"}
            </button>
          </div>
        ) : (
          <div className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-3 h-full flex items-center justify-center text-[9px] font-mono text-[#2A323A] text-center">
            Bir kartın bilgisini görmek için soldaki sembole dokun
          </div>
        )}
      </div>
    </div>
  );
}

// Birden çok kart ikonunu tek bir paylaşımlı bilgi paneliyle gösterir —
// Kart Kitabı gibi çok sayıda kartın listelendiği yerlerde kullanılır.
function CardGridWithDetail({ cards }) {
  const [infoId, setInfoId] = useState(null);
  const infoCard = cards.find((c) => c.id === infoId) || null;
  const disp = infoCard ? cardDisplay(infoCard) : null;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {cards.map((c) => (
          <CardIcon key={c.id} card={c} selected={false} active={infoId === c.id} onTap={() => setInfoId(infoId === c.id ? null : c.id)} />
        ))}
      </div>
      {infoCard ? (
        <div className="mt-3 bg-[#0B0E11] border rounded-sm p-3" style={{ borderColor: disp.color }}>
          <div className="flex items-center gap-2">
            <div className="text-[22px] leading-none">{disp.icon}</div>
            <div className="flex-1 min-w-0">
              {disp.isFusion && <div className="text-[7px] font-mono text-[#C77DFF] tracking-wide">⚡ FÜZYON</div>}
              <div className="font-mono text-[10px]" style={{ color: disp.color }}>{disp.name}</div>
            </div>
            <div className="text-[14px]">♻️</div>
          </div>
          <div className="text-[9px] font-mono text-[#7C8894] leading-snug mt-2">{disp.desc}</div>
        </div>
      ) : (
        <div className="mt-3 bg-[#0B0E11] border border-[#2A323A] rounded-sm p-3 text-[9px] font-mono text-[#2A323A] text-center">
          Detay görmek için bir sembole dokun
        </div>
      )}
    </div>
  );
}

function CardCompendiumView() {
  const basics = BASIC_CARD_IDS.map((id) => ({ id, defIds: [id] }));
  const fusions = Object.keys(FUSION_NAMES).map((key) => ({ id: key, defIds: key.split("+") }));
  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono text-[#7C8894]">
        Oyundaki tüm kartlar burada. 6 temel kart, birbirleriyle 2'li birleşerek 15 eşsiz füzyon kartı oluşturur (toplam 21).
      </div>
      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3">
        <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-3">TEMEL KARTLAR ({basics.length})</div>
        <CardGridWithDetail cards={basics} />
      </div>
      <div className="bg-[#151A1F] border border-[#C77DFF] rounded-sm p-3">
        <div className="font-mono text-[11px] tracking-[0.15em] mb-3" style={{ color: "#C77DFF" }}>FÜZYON KARTLARI ({fusions.length})</div>
        <CardGridWithDetail cards={fusions} />
      </div>
    </div>
  );
}

// MK tarzı üst dövüş çubuğu: iki avatar, can/kalkan barları, ve vuruş
// efektleri (sallanma/parlama/uçan sayı). Duello ve Nöbetçi ekranlarında
// ortak kullanılır.
function FightHud({
  playerName, playerHp, playerMaxHp, playerArmorUsed, playerAvatar,
  oppName, oppHp, oppMaxHp, oppArmorUsed, oppAvatar,
  vsColor, oppBarColor, shakeSide, floatTexts,
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`relative flex-shrink-0 bg-[#0B0E11] border border-[#5EEAD4] rounded-sm p-0.5 ${shakeSide === "player" ? "hb-shake" : ""}`}>
        <div className={shakeSide === "player" ? "hb-flash" : ""}>
          <CreatureAvatar animal={playerAvatar} size={40} />
        </div>
        {floatTexts.filter((f) => f.side === "player").map((f) => (
          <div key={f.id} className="hb-float absolute left-1/2 top-0 -translate-x-1/2 text-[10px] font-mono font-bold whitespace-nowrap pointer-events-none" style={{ color: f.color }}>
            {f.text}
          </div>
        ))}
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-mono text-[#7C8894]">{playerName}</div>
        <div className="h-2.5 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden mt-1">
          <div className="h-full bg-[#5EEAD4] transition-all duration-300" style={{ width: `${Math.max(0, playerHp / playerMaxHp) * 100}%` }} />
        </div>
        <div className="h-1 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden mt-0.5">
          <div className="h-full bg-[#4FA8FF] transition-all duration-300" style={{ width: playerArmorUsed ? "0%" : "100%" }} />
        </div>
        <div className="text-[8px] font-mono text-[#7C8894] mt-0.5">{Math.max(0, playerHp).toFixed(0)}/{playerMaxHp.toFixed(0)}</div>
      </div>
      <div className="text-[9px] font-mono px-1" style={{ color: vsColor }}>VS</div>
      <div className="flex-1">
        <div className="text-[10px] font-mono text-[#7C8894] text-right">{oppName}</div>
        <div className="h-2.5 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden mt-1">
          <div className="h-full transition-all duration-300 ml-auto" style={{ width: `${Math.max(0, oppHp / oppMaxHp) * 100}%`, background: oppBarColor }} />
        </div>
        <div className="h-1 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden mt-0.5">
          <div className="h-full bg-[#4FA8FF] transition-all duration-300 ml-auto" style={{ width: oppArmorUsed ? "0%" : "100%" }} />
        </div>
        <div className="text-[8px] font-mono text-[#7C8894] mt-0.5 text-right">{Math.max(0, oppHp).toFixed(0)}/{oppMaxHp.toFixed(0)}</div>
      </div>
      <div className={`relative flex-shrink-0 bg-[#0B0E11] border rounded-sm p-0.5 ${shakeSide === "opp" ? "hb-shake" : ""}`} style={{ borderColor: oppBarColor }}>
        <div className={shakeSide === "opp" ? "hb-flash" : ""} style={{ transform: "scaleX(-1)" }}>
          <CreatureAvatar animal={oppAvatar} size={40} />
        </div>
        {floatTexts.filter((f) => f.side === "opp").map((f) => (
          <div key={f.id} className="hb-float absolute left-1/2 top-0 -translate-x-1/2 text-[10px] font-mono font-bold whitespace-nowrap pointer-events-none" style={{ color: f.color }}>
            {f.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function DuelView({ pool, energy, energyMsLeft, onSpendEnergy }) {
  const names = Object.keys(pool);
  const [fighterName, setFighterName] = useState(names[0]);
  const [tierIdx, setTierIdx] = useState(0);
  const tier = BOT_TIERS[tierIdx];
  const [botName, setBotName] = useState(tier.names[0]);
  const [duel, setDuel] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [revealIndex, setRevealIndex] = useState(0);
  const [revealToken, setRevealToken] = useState(0);
  const [shakeSide, setShakeSide] = useState(null);
  const [floatTexts, setFloatTexts] = useState([]);
  const timerRef = useRef(null);
  const revealTimerRef = useRef(null);
  const shakeTimerRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(revealTimerRef.current); clearTimeout(shakeTimerRef.current); }, []);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [duel?.log, revealIndex]);

  useEffect(() => {
    if (duel && duel.phase === "waiting") {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDuel((d) => (d && d.phase === "waiting" ? { ...d, phase: "choosing" } : d));
      }, ROUND_GAP_MS);
    }
    return () => clearTimeout(timerRef.current);
  }, [duel?.phase]);

  // Round çözüldükten sonra vuruş-vuruş açılım: her vuruşta hedefi salla,
  // uçan hasar sayısı göster, en sonunda gerçek round sonucunu uygula.
  useEffect(() => {
    if (revealToken === 0) return;
    if (!duel || duel.phase !== "revealing" || !duel.pending) return;
    const pending = duel.pending;
    setRevealIndex(0);
    setShakeSide(null);
    setFloatTexts([]);
    let i = 0;
    const tick = () => {
      const entry = pending.log[i];
      if (entry) {
        if (!entry.dodged) {
          setShakeSide(entry.targetSide);
          clearTimeout(shakeTimerRef.current);
          shakeTimerRef.current = setTimeout(() => setShakeSide(null), 380);
          const color = entry.crit ? "#FF6B4A" : "#E8EDF2";
          setFloatTexts((prev) => [...prev.slice(-4), { id: Math.random().toString(36).slice(2), side: entry.targetSide, text: `-${entry.dmg.toFixed(1)}${entry.crit ? " 💥" : ""}`, color }]);
          if (entry.reflect > 0) {
            const reflectSide = entry.targetSide === "player" ? "opp" : "player";
            setFloatTexts((prev) => [...prev.slice(-4), { id: Math.random().toString(36).slice(2), side: reflectSide, text: `-${entry.reflect.toFixed(1)} ↩`, color: "#C77DFF" }]);
          }
        } else {
          setFloatTexts((prev) => [...prev.slice(-4), { id: Math.random().toString(36).slice(2), side: entry.targetSide, text: "MISS", color: "#5EEAD4" }]);
        }
      }
      i++;
      setRevealIndex(i);
      if (i < pending.log.length) {
        revealTimerRef.current = setTimeout(tick, 480);
      } else {
        revealTimerRef.current = setTimeout(() => {
          setDuel((d) => {
            if (!d || !d.pending) return d;
            const p = d.pending;
            return {
              ...d,
              playerUnit: p.finalPlayerUnit,
              oppUnit: p.finalOppUnit,
              hand: p.newHand,
              log: p.log,
              history: [...d.history, p.historyEntry],
              phase: p.finished ? "finished" : "waiting",
              winner: p.winner,
              round: d.round + 1,
              pending: null,
            };
          });
        }, 350);
      }
    };
    revealTimerRef.current = setTimeout(tick, 480);
    return () => clearTimeout(revealTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealToken]);

  const changeTier = (idx) => { setTierIdx(idx); setBotName(BOT_TIERS[idx].names[0]); };

  const startDuel = () => {
    if (energy <= 0 || !fighterName) return;
    onSpendEnergy();
    const fighter = pool[fighterName];
    const s1 = totalStats(fighter);
    const bot = purebred(botName);
    bot.name = `${botName} (Bot)`;
    const s2 = totalStats(bot);
    setSelectedIds([]);
    setHistoryOpen(false);
    setFloatTexts([]);
    setShakeSide(null);
    setDuel({
      playerUnit: { name: fighter.name, hp: s1.hp, maxHp: s1.hp, attack: s1.attack, armor: s1.armor, armorUsed: false },
      oppUnit: { name: bot.name, hp: s2.hp, maxHp: s2.hp, attack: s2.attack, armor: s2.armor, armorUsed: false },
      oppAnimal: bot,
      round: 1,
      hand: [dealCard(), dealCard()],
      log: [],
      history: [],
      phase: "choosing",
      winner: null,
      pending: null,
    });
  };

  const toggleSelect = (cardId) => {
    setSelectedIds((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId);
      if (prev.length >= 2) return prev;
      return [...prev, cardId];
    });
  };

  // Sadece 2 TEMEL (füzyon olmayan) kartı birleştirir — round'u BİTİRMEZ.
  // Ortaya çıkan füzyon kartı ele eklenir, oynanıp oynanmayacağına daha
  // sonra ayrıca karar verilir.
  const handleFuse = () => {
    setDuel((d) => {
      if (!d) return d;
      const selected = d.hand.filter((c) => selectedIds.includes(c.id));
      if (selected.length !== 2 || selected.some((c) => c.defIds.length > 1)) return d;
      const remaining = d.hand.filter((c) => !selectedIds.includes(c.id));
      const fused = fuseCards(selected);
      return { ...d, hand: capHand([...remaining, fused]) };
    });
    setSelectedIds([]);
  };

  const playRound = () => {
    setDuel((d) => {
      if (!d || d.phase !== "choosing") return d;
      const playerCard = d.hand.find((c) => selectedIds.includes(c.id)) || null;
      const remainingHand = d.hand.filter((c) => c.id !== playerCard?.id);

      const aiHand = [dealCard(), dealCard()];
      const oppCard = aiHand[Math.floor(Math.random() * aiHand.length)];

      const playerUnit = { ...d.playerUnit };
      const oppUnit = { ...d.oppUnit };
      const { log, summary } = resolveRound(playerUnit, oppUnit, playerCard, oppCard);

      const finished = playerUnit.hp <= 0 || oppUnit.hp <= 0;
      const winner = finished ? (playerUnit.hp > 0 ? playerUnit.name : oppUnit.name) : null;

      const historyEntry = {
        round: d.round, summary, playerCard, oppCard,
        playerHpAfter: Math.max(playerUnit.hp, 0), oppHpAfter: Math.max(oppUnit.hp, 0),
      };

      setSelectedIds([]);
      setRevealIndex(0);
      setRevealToken((t) => t + 1);

      return {
        ...d,
        phase: "revealing",
        pending: {
          log, finished, winner, historyEntry,
          finalPlayerUnit: playerUnit, finalOppUnit: oppUnit,
          newHand: finished ? remainingHand : capHand([...remainingHand, dealCard(), dealCard()]),
        },
      };
    });
  };

  const skipWait = () => {
    clearTimeout(timerRef.current);
    setDuel((d) => (d && d.phase === "waiting" ? { ...d, phase: "choosing" } : d));
  };

  const canFuse = selectedIds.length === 2 && duel && duel.hand.filter((c) => selectedIds.includes(c.id)).every((c) => c.defIds.length === 1);
  const playButtonLabel = selectedIds.length === 1 ? "▶ OYNA" : "▶ BU ROUND KART OYNAMA";

  // Gösterilecek can değerleri: açılım sırasında vuruş-vuruş, aksi halde final değer.
  const revealing = duel && duel.phase === "revealing" && duel.pending;
  // Güvenlik: revealIndex bir üst sınırın dışına taşarsa (round geçişindeki
  // kısa bir zamanlama penceresinde olabilir) index'i log uzunluğuna kenetle.
  const safeRevealIndex = revealing ? Math.min(revealIndex, duel.pending.log.length) : 0;
  const revealSnapshot = revealing && safeRevealIndex > 0 ? duel.pending.log[safeRevealIndex - 1] : null;
  const displayedPlayerHp = revealing
    ? (revealSnapshot ? revealSnapshot.playerHpAfter : duel.playerUnit.hp)
    : duel?.playerUnit.hp ?? 0;
  const displayedOppHp = revealing
    ? (revealSnapshot ? revealSnapshot.oppHpAfter : duel.oppUnit.hp)
    : duel?.oppUnit.hp ?? 0;
  const visibleLog = revealing ? duel.pending.log.slice(0, safeRevealIndex) : (duel?.log ?? []);

  return (
    <div className="space-y-4">
      {!duel && (
        <>
          <div className="flex gap-1">
            {BOT_TIERS.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => changeTier(idx)}
                className="flex-1 px-2 py-2 text-[9px] font-mono tracking-wide rounded-sm border transition-colors"
                style={{
                  borderColor: tierIdx === idx ? RARITY_COLOR[t.rarity] : "#2A323A",
                  color: tierIdx === idx ? RARITY_COLOR[t.rarity] : "#7C8894",
                  background: tierIdx === idx ? "#151A1F" : "transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AnimalPicker label="ŞAMPİYONUN" value={fighterName} onChange={setFighterName} options={names} />
            <AnimalPicker label="RAKİP" value={botName} onChange={setBotName} options={tier.names} />
          </div>
          <div className="text-[9px] text-[#7C8894] font-mono">
            Düello, round bazlı kart sistemiyle oynanır: her round 2 kart alırsın, hemen oynayabilir ya da saklayıp
            birleştirebilirsin. Her canlı round içinde 3'er kez birbirine vurur.
          </div>
          <button
            onClick={startDuel}
            disabled={energy <= 0 || !fighterName}
            className="w-full bg-[#C77DFF] text-[#0B0E11] font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ⚔ DÜELLOYU BAŞLAT (1 ⚡)
          </button>
          {energy <= 0 && (
            <div className="text-[10px] font-mono text-[#7C8894] text-center">Yetersiz enerji · dolum: {formatCountdown(energyMsLeft)}</div>
          )}
        </>
      )}

      {duel && (
        <>
          <FightHud
            playerName={duel.playerUnit.name} playerHp={displayedPlayerHp} playerMaxHp={duel.playerUnit.maxHp}
            playerArmorUsed={duel.playerUnit.armorUsed} playerAvatar={pool[fighterName] || duel.playerUnit}
            oppName={duel.oppUnit.name} oppHp={displayedOppHp} oppMaxHp={duel.oppUnit.maxHp}
            oppArmorUsed={duel.oppUnit.armorUsed} oppAvatar={duel.oppAnimal}
            vsColor="#C77DFF" oppBarColor="#FF6B4A" shakeSide={shakeSide} floatTexts={floatTexts}
          />

          <div className="text-center text-[10px] font-mono text-[#C77DFF]">ROUND {duel.round}</div>

          {duel.phase === "choosing" && (
            <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3">
              <div className="text-[9px] font-mono text-[#7C8894] mb-2">
                ELİNDEKİ KARTLAR ({duel.hand.length}/{MAX_HAND_SIZE}) — en fazla 2 seç, birleştirmek için
              </div>
              <CardRail hand={duel.hand} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
              {selectedIds.length === 2 ? (
                canFuse ? (
                  <button
                    onClick={handleFuse}
                    className="w-full font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm font-bold mt-3"
                    style={{ background: "#C77DFF", color: "#0B0E11" }}
                  >
                    🔗 BİRLEŞTİR (oynamaz, ele eklenir)
                  </button>
                ) : (
                  <div className="text-[9px] text-[#FF6B4A] font-mono text-center mt-3">
                    Sadece iki TEMEL kart birleştirilebilir (füzyon kartı tekrar birleştirilemez).
                  </div>
                )
              ) : (
                <button
                  onClick={playRound}
                  className="w-full font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm font-bold mt-3"
                  style={{ background: selectedIds.length > 0 ? "#C77DFF" : "#151A1F", color: selectedIds.length > 0 ? "#0B0E11" : "#7C8894", border: "1px solid #2A323A" }}
                >
                  {playButtonLabel}
                </button>
              )}
            </div>
          )}

          {duel.phase === "revealing" && (
            <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3 text-center">
              <div className="text-[#C77DFF] font-mono text-[11px]">⚔ ROUND ÇÖZÜLÜYOR...</div>
            </div>
          )}

          {duel.phase === "waiting" && (
            <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3 text-center">
              <div className="text-[#5EEAD4] font-mono text-[11px] mb-2">✓ ROUND {duel.round - 1} BİTTİ</div>
              <button onClick={skipWait} className="text-[9px] font-mono px-3 py-1.5 rounded-sm border border-[#2A323A] text-[#7C8894]">
                ⏩ HEMEN DEVAM ET
              </button>
            </div>
          )}

          {duel.phase === "finished" && (
            <div className="border rounded-sm p-4 text-center" style={{ borderColor: duel.winner === duel.playerUnit.name ? "#5EEAD4" : "#FF6B4A" }}>
              <div className="font-mono text-sm font-bold" style={{ color: duel.winner === duel.playerUnit.name ? "#5EEAD4" : "#FF6B4A" }}>
                {duel.winner === duel.playerUnit.name ? "🏆 KAZANDIN" : "💀 KAYBETTİN"}
              </div>
              <button onClick={() => setDuel(null)} className="mt-3 text-[10px] font-mono px-4 py-2 rounded-sm border border-[#2A323A] text-[#E8EDF2]">
                YENİ DÜELLO
              </button>
            </div>
          )}

          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex justify-between items-center text-[10px] font-mono px-3 py-2 rounded-sm border border-[#2A323A] text-[#7C8894]"
          >
            <span>⚔️ Round Geçmişi ({duel.history.length})</span>
            <span>{historyOpen ? "▲" : "▼"}</span>
          </button>
          {historyOpen && (
            <div className="space-y-2">
              {duel.history.map((h, i) => (
                <div key={i} className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-2 text-[9px] font-mono">
                  <div className="text-[#5EEAD4] mb-1">ROUND {h.round}</div>
                  <div className="text-[#7C8894]">
                    Sen: {h.summary.pDealt.toFixed(1)} verdi / {h.summary.pBlocked.toFixed(1)} bloklandı / {h.summary.pTaken.toFixed(1)} aldı
                    {h.playerCard && <span> · kart: {cardDisplay(h.playerCard).name}</span>}
                  </div>
                  <div className="text-[#7C8894]">
                    Rakip: {h.summary.oDealt.toFixed(1)} verdi / {h.summary.oBlocked.toFixed(1)} bloklandı / {h.summary.oTaken.toFixed(1)} aldı
                    {h.oppCard && <span> · kart: {cardDisplay(h.oppCard).name}</span>}
                  </div>
                  <div className="text-[#2A323A] mt-1">Round sonu can: Sen {h.playerHpAfter.toFixed(0)} — Rakip {h.oppHpAfter.toFixed(0)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-3 h-40 overflow-y-auto font-mono text-[10px]">
            {visibleLog.map((entry, i) => (
              <div key={i} className="py-0.5" style={{ color: entry.kind === "crit" ? "#FF6B4A" : entry.kind === "dodge" ? "#5EEAD4" : "#E8EDF2" }}>
                {`> ${entry.text}`}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </>
      )}
    </div>
  );
}

function TrainingView({ pool, onReward }) {
  const names = Object.keys(pool);
  const [aName, setAName] = useState(names[0]);
  const [bName, setBName] = useState(names[1] || names[0]);
  const [battle, setBattle] = useState(null);
  const [visibleLog, setVisibleLog] = useState(0);
  const [rewardMsg, setRewardMsg] = useState(null);
  const timerRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (!names.includes(aName)) setAName(names[0]);
    if (!names.includes(bName)) setBName(names[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  useEffect(() => () => clearTimeout(timerRef.current), []);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [visibleLog]);

  const handleFight = () => {
    clearTimeout(timerRef.current);
    const result = simulateBattle(pool[aName], pool[bName]);
    setBattle(result);
    setVisibleLog(0);
    setRewardMsg(null);
    let i = 0;
    const tick = () => {
      i++;
      setVisibleLog(i);
      if (i < result.log.length) {
        timerRef.current = setTimeout(tick, 150);
      } else {
        const amount = 4;
        onReward(amount);
        setRewardMsg(`+${amount} HURDA (antrenman ödülü)`);
      }
    };
    timerRef.current = setTimeout(tick, 150);
  };

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono text-[#7C8894]">
        Antrenman modu enerji harcamaz ve ebeveyn tüketmez — yeni mutantlarını risksiz test etmek için kullan.
      </div>
      <div className="grid grid-cols-2 gap-3">
        <AnimalPicker label="SAVAŞÇI A" value={aName} onChange={setAName} options={names} />
        <AnimalPicker label="SAVAŞÇI B" value={bName} onChange={setBName} options={names} />
      </div>
      <button
        onClick={handleFight}
        className="w-full bg-[#151A1F] border border-[#2A323A] text-[#E8EDF2] font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm hover:border-[#5EEAD4] transition-colors"
      >
        ▶ TEST SAVAŞI BAŞLAT
      </button>
      {rewardMsg && (
        <div className="text-center text-[11px] font-mono py-1 rounded-sm border border-[#2A323A] text-[#7C8894]">{rewardMsg}</div>
      )}
      <BattleLog battle={battle} visibleLog={visibleLog} logEndRef={logEndRef} />
    </div>
  );
}

function MarketView({
  scrap, bolts, energy, labReadyAt, now, onOpenChest, onBuyScrapWithBolts, onRefillEnergyWithBolts, onClearLabWithBolts,
  adsWatchedToday, onWatchAd, marketOffers, onBuyOffer, onOpenGoldChest,
}) {
  const [lastResult, setLastResult] = useState(null);
  const [opening, setOpening] = useState(false);
  const [boltMsg, setBoltMsg] = useState(null);
  const [watchingAd, setWatchingAd] = useState(false);
  const [goldResults, setGoldResults] = useState(null);
  const [openingGold, setOpeningGold] = useState(null);

  const handleOpen = () => {
    if (scrap < CHEST_COST) return;
    setOpening(true);
    setTimeout(() => {
      const result = onOpenChest();
      setLastResult(result);
      setOpening(false);
    }, 500);
  };

  const onCooldown = now < labReadyAt;
  const energyFull = energy >= ENERGY_MAX;

  const flashMsg = (text) => {
    setBoltMsg(text);
    setTimeout(() => setBoltMsg(null), 2500);
  };

  const handleWatchAd = () => {
    if (adsWatchedToday >= ADS_PER_DAY || watchingAd) return;
    setWatchingAd(true);
    // NOT: Gerçek video reklam SDK'sı yerine simülasyon — gerçek oyunda
    // burası AdMob/Unity Ads gibi bir servisle değiştirilecek.
    setTimeout(() => {
      onWatchAd();
      setWatchingAd(false);
      flashMsg(`+${AD_REWARD_BOLTS} 🪙 kazandın!`);
    }, 2200);
  };

  const handleOpenGold = (tierId) => {
    const tier = GOLD_CHESTS[tierId];
    if (bolts < tier.cost || openingGold) return;
    setOpeningGold(tierId);
    setTimeout(() => {
      const results = onOpenGoldChest(tierId);
      setGoldResults(results);
      setOpeningGold(null);
    }, 600);
  };

  const offerRefreshMs = marketOffers ? Math.max(0, MARKET_OFFER_REFRESH_MS - (now - marketOffers.generatedAt)) : 0;

  return (
    <div className="space-y-4">
      {/* Reklamla Somun Kazan */}
      <div className="bg-[#151A1F] border rounded-sm p-4" style={{ borderColor: "#FFD166" }}>
        <div className="flex justify-between items-center mb-1">
          <div className="text-[11px] font-mono tracking-[0.15em]" style={{ color: "#FFD166" }}>📺 REKLAM İZLE, SOMUN KAZAN</div>
          <div className="text-[10px] font-mono text-[#7C8894]">{adsWatchedToday}/{ADS_PER_DAY}</div>
        </div>
        <div className="text-[9px] text-[#7C8894] font-mono mb-1">
          Her reklam +{AD_REWARD_BOLTS} 🪙 verir. Günlük limit {ADS_PER_DAY} reklam ({ADS_PER_DAY * AD_REWARD_BOLTS} 🪙) — bilerek Orta Sandık'ın (50 🪙) az altında tutuldu.
        </div>
        <div className="text-[8px] text-[#2A323A] font-mono mb-3">// Bu ortamda gerçek video reklam gösterilemiyor, bu bir simülasyondur.</div>
        <div className="h-1.5 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden mb-3">
          <div className="h-full transition-all duration-300" style={{ width: `${(adsWatchedToday / ADS_PER_DAY) * 100}%`, background: "#FFD166" }} />
        </div>
        <button
          onClick={handleWatchAd}
          disabled={adsWatchedToday >= ADS_PER_DAY || watchingAd}
          className="w-full font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "#FFD166", color: "#0B0E11" }}
        >
          {watchingAd ? "// reklam oynatılıyor..." : adsWatchedToday >= ADS_PER_DAY ? "BUGÜNLÜK LİMİT DOLDU" : `▶ İZLE (+${AD_REWARD_BOLTS} 🪙)`}
        </button>
      </div>

      {/* Rotasyonlu Teklifler */}
      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-4">
        <div className="flex justify-between items-center mb-1">
          <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em]">GÜNÜN TEKLİFLERİ</div>
          <div className="text-[9px] font-mono text-[#7C8894]">Yenileme: {formatCountdown(offerRefreshMs)}</div>
        </div>
        <div className="text-[9px] text-[#7C8894] font-mono mb-3">Her teklif bir kez alınabilir, 6 saatte bir yenilenir.</div>
        {marketOffers && (
          <div className="grid grid-cols-2 gap-2">
            {marketOffers.commons.map((name, i) => (
              <button
                key={`c${i}`}
                onClick={() => onBuyOffer("common", i)}
                disabled={marketOffers.purchased.commons[i] || bolts < OFFER_PRICES.common}
                className="flex justify-between items-center px-2 py-2 rounded-sm border border-[#2A323A] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FFD166]"
              >
                <span className="text-[9px] font-mono text-[#E8EDF2] truncate">{marketOffers.purchased.commons[i] ? "✓ Alındı" : name}</span>
                {!marketOffers.purchased.commons[i] && <span className="text-[9px] font-mono text-[#FFD166] flex-shrink-0 ml-1">{OFFER_PRICES.common}🪙</span>}
              </button>
            ))}
            <button
              onClick={() => onBuyOffer("rare", 0)}
              disabled={marketOffers.purchased.rare || bolts < OFFER_PRICES.rare}
              className="flex justify-between items-center px-2 py-2 rounded-sm border disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderColor: RARITY_COLOR.Ender }}
            >
              <span className="text-[9px] font-mono text-[#E8EDF2] truncate">{marketOffers.purchased.rare ? "✓ Alındı" : marketOffers.rare}</span>
              {!marketOffers.purchased.rare && <span className="text-[9px] font-mono text-[#FFD166] flex-shrink-0 ml-1">{OFFER_PRICES.rare}🪙</span>}
            </button>
            <button
              onClick={() => onBuyOffer("epic", 0)}
              disabled={marketOffers.purchased.epic || bolts < OFFER_PRICES.epic}
              className="flex justify-between items-center px-2 py-2 rounded-sm border disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderColor: RARITY_COLOR.Destansı }}
            >
              <span className="text-[9px] font-mono text-[#E8EDF2] truncate">{marketOffers.purchased.epic ? "✓ Alındı" : marketOffers.epic}</span>
              {!marketOffers.purchased.epic && <span className="text-[9px] font-mono text-[#FFD166] flex-shrink-0 ml-1">{OFFER_PRICES.epic}🪙</span>}
            </button>
          </div>
        )}
      </div>

      {/* Altın Somun Sandıkları */}
      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-4">
        <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-3">ALTIN SANDIKLAR</div>
        <div className="space-y-2">
          {Object.values(GOLD_CHESTS).map((c) => (
            <button
              key={c.id}
              onClick={() => handleOpenGold(c.id)}
              disabled={bolts < c.cost || openingGold}
              className="w-full text-left px-3 py-2.5 rounded-sm border disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderColor: c.color }}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono" style={{ color: c.color }}>{c.label}</span>
                <span className="text-[10px] font-mono text-[#FFD166]">{openingGold === c.id ? "// açılıyor..." : `${c.cost} 🪙`}</span>
              </div>
              <div className="text-[8px] font-mono text-[#7C8894] mt-1">{c.desc}</div>
            </button>
          ))}
        </div>
        {goldResults && (
          <div className="mt-3 bg-[#0B0E11] border border-[#2A323A] rounded-sm p-3">
            <div className="text-[9px] font-mono text-[#7C8894] mb-2">SANDIKTAN ÇIKANLAR</div>
            <div className="flex flex-wrap gap-2">
              {goldResults.map((r, i) => (
                <div key={i} className="text-[9px] font-mono px-2 py-1 rounded-sm border" style={{ borderColor: RARITY_COLOR[ANIMALS[r.baseName].rarity], color: RARITY_COLOR[ANIMALS[r.baseName].rarity] }}>
                  {r.baseName}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Paslı Sandık (Hurda) */}
      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-4">
        <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-2">PASLI SANDIK</div>
        <div className="text-[10px] text-[#7C8894] mb-4">
          %70 Sıradan · %25 Ender · %5 Destansı şans. İçinden çıkan hayvan tam, safkan
          haliyle laboratuvar envanterine eklenir ve melezlemede kullanılabilir.
        </div>
        <button
          disabled={scrap < CHEST_COST || opening}
          onClick={handleOpen}
          className="w-full bg-[#5EEAD4] text-[#0B0E11] font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm hover:bg-[#7FF3E0] transition-colors font-bold disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {opening ? "// açılıyor..." : `🔓 AÇ (${CHEST_COST} HURDA)`}
        </button>
        {scrap < CHEST_COST && <div className="text-[9px] text-[#FF6B4A] font-mono mt-2 text-center">Yetersiz hurda</div>}
      </div>

      {lastResult && (
        <div className="border rounded-sm p-4 text-center" style={{ borderColor: RARITY_COLOR[ANIMALS[lastResult.baseName].rarity] }}>
          <div className="text-[10px] text-[#7C8894] font-mono tracking-[0.15em]">SANDIKTAN ÇIKTI</div>
          <div className="text-[#E8EDF2] font-display text-lg mt-1">{lastResult.baseName}</div>
          <div style={{ color: RARITY_COLOR[ANIMALS[lastResult.baseName].rarity] }} className="text-[11px] font-mono">
            {ANIMALS[lastResult.baseName].rarity}
          </div>
          <div className="text-[9px] text-[#2A323A] font-mono mt-1">{lastResult.name}</div>
        </div>
      )}

      <div className="bg-[#151A1F] border rounded-sm p-4" style={{ borderColor: "#FFD166" }}>
        <div className="flex justify-between items-center mb-1">
          <div className="text-[11px] font-mono tracking-[0.15em]" style={{ color: "#FFD166" }}>🪙 ALTIN SOMUN İLE ÇÖZÜMLER</div>
          <div className="text-[11px] font-mono" style={{ color: "#FFD166" }}>{bolts} 🪙</div>
        </div>
        <div className="text-[9px] text-[#7C8894] font-mono mb-3">
          Hurda, enerji ve laboratuvar bekleme süresini anında çözer.
        </div>

        <div className="space-y-2">
          <button
            disabled={bolts < BOLT_SCRAP_PACK.cost}
            onClick={() => { onBuyScrapWithBolts(); flashMsg(`+${BOLT_SCRAP_PACK.amount} hurda alındı`); }}
            className="w-full flex justify-between items-center px-3 py-2.5 rounded-sm border border-[#2A323A] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FFD166] transition-colors"
          >
            <span className="text-[10px] font-mono text-[#E8EDF2]">🔩 Hurda Paketi (+{BOLT_SCRAP_PACK.amount})</span>
            <span className="text-[10px] font-mono text-[#FFD166]">{BOLT_SCRAP_PACK.cost} 🪙</span>
          </button>

          <button
            disabled={bolts < BOLT_ENERGY_REFILL_COST || energyFull}
            onClick={() => { onRefillEnergyWithBolts(); flashMsg("Enerji dolduruldu"); }}
            className="w-full flex justify-between items-center px-3 py-2.5 rounded-sm border border-[#2A323A] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FFD166] transition-colors"
          >
            <span className="text-[10px] font-mono text-[#E8EDF2]">⚡ Enerjiyi Anında Doldur</span>
            <span className="text-[10px] font-mono text-[#FFD166]">{BOLT_ENERGY_REFILL_COST} 🪙</span>
          </button>

          <button
            disabled={bolts < BOLT_LAB_CLEAR_COST || !onCooldown}
            onClick={() => { onClearLabWithBolts(); flashMsg("Laboratuvar bekleme süresi temizlendi"); }}
            className="w-full flex justify-between items-center px-3 py-2.5 rounded-sm border border-[#2A323A] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FFD166] transition-colors"
          >
            <span className="text-[10px] font-mono text-[#E8EDF2]">🧪 Laboratuvar Beklemesini Sıfırla</span>
            <span className="text-[10px] font-mono text-[#FFD166]">{BOLT_LAB_CLEAR_COST} 🪙</span>
          </button>
        </div>
        {boltMsg && <div className="text-center text-[10px] font-mono text-[#FFD166] mt-3">{boltMsg}</div>}
      </div>
    </div>
  );
}

function InventoryView({ pool, scrap, onLevelUp }) {
  const names = Object.keys(pool);
  const [expandedName, setExpandedName] = useState(null);
  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono text-[#7C8894]">
        Envanterinde {names.length} canlı var. Bunlar melezlemede tüketilebilir kaynaklarındır. Seviye atlamak tüm uzuvları birlikte güçlendirir (düz statlar %20 katlanır, dodge/kritik küçük miktarlarla artar).
      </div>
      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-2">
        <MutationTierLegend />
      </div>
      <div className="space-y-2">
        {names.map((name) => {
          const animal = pool[name];
          const s = totalStats(animal);
          const lvl = getAnimalLevel(animal);
          const maxed = lvl >= MAX_LEVEL;
          const cost = levelUpCost(lvl);
          const canAfford = scrap >= cost;
          const expanded = expandedName === name;
          return (
            <div key={name} className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setExpandedName(expanded ? null : name)}
                  className="flex-shrink-0 bg-[#0B0E11] border rounded-sm p-1 h-fit"
                  style={{ borderColor: expanded ? "#5EEAD4" : "#2A323A" }}
                  title="Uzuv detaylarını göster"
                >
                  <CreatureAvatar animal={animal} size={52} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[#E8EDF2] font-display text-sm truncate">
                      {name} <span className="text-[#5EEAD4] font-mono text-[10px]">Lv.{lvl}</span>
                    </div>
                    <button
                      onClick={() => onLevelUp(name)}
                      disabled={maxed || !canAfford}
                      className="text-[9px] font-mono px-2 py-1.5 rounded-sm border tracking-wide disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 ml-2"
                      style={{ borderColor: "#5EEAD4", color: "#5EEAD4" }}
                    >
                      {maxed ? "MAKS SEVİYE" : `⬆ SEVİYE ATLA (${cost} 🔩)`}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-[#7C8894]">
                    <div>HP <span className="text-[#E8EDF2]">{s.hp.toFixed(1)}</span></div>
                    <div>ATK <span className="text-[#E8EDF2]">{s.attack.toFixed(1)}</span></div>
                    <div>ZIRH <span className="text-[#E8EDF2]">{s.armor.toFixed(1)}</span></div>
                    <div>🧬 SV <span className="text-[#C77DFF]">{averageMutationLevel(animal).toFixed(1)}</span></div>
                  </div>
                  <button
                    onClick={() => setExpandedName(expanded ? null : name)}
                    className="text-[9px] font-mono text-[#5EEAD4] mt-2"
                  >
                    {expanded ? "▲ Uzuvları gizle" : "▼ 8 uzvu tek tek gör"}
                  </button>
                </div>
              </div>
              {expanded && (
                <div className="mt-3 pt-3 border-t border-[#2A323A]">
                  <LimbBreakdown animal={animal} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpeciesCompendium() {
  const names = Object.keys(ANIMALS);
  return (
    <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm overflow-x-auto">
      <div className="p-3 text-[9px] font-mono text-[#7C8894] border-b border-[#2A323A]">
        // TÜR ANSİKLOPEDİSİ — safkan referans statları (envanterinden bağımsız)
      </div>
      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="border-b border-[#2A323A] text-[#7C8894] text-left">
            <th className="p-2">HAYVAN</th>
            <th className="p-2">NADİRLİK</th>
            <th className="p-2 text-right">HP</th>
            <th className="p-2 text-right">ATAK</th>
            <th className="p-2 text-right">ZIRH</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => {
            const s = totalStats(purebred(name));
            const rarity = ANIMALS[name].rarity;
            return (
              <tr key={name} className="border-b border-[#1c2329]">
                <td className="p-2 text-[#E8EDF2]">{name}</td>
                <td className="p-2" style={{ color: RARITY_COLOR[rarity] }}>{rarity}</td>
                <td className="p-2 text-right text-[#E8EDF2]">{s.hp.toFixed(1)}</td>
                <td className="p-2 text-right text-[#E8EDF2]">{s.attack.toFixed(1)}</td>
                <td className="p-2 text-right text-[#E8EDF2]">{s.armor.toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LeaderboardView({ pool, identity, onSaveNickname }) {
  const [nicknameInput, setNicknameInput] = useState(identity.nickname || "");
  const [selectedName, setSelectedName] = useState(Object.keys(pool)[0]);
  const [board, setBoard] = useState(null);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const names = Object.keys(pool);

  const loadBoard = async () => {
    setLoadingBoard(true);
    try {
      const res = await window.storage.get(LEADERBOARD_KEY, true);
      setBoard(res && res.value ? JSON.parse(res.value) : []);
    } catch (e) {
      setBoard([]);
    }
    setLoadingBoard(false);
  };

  useEffect(() => { loadBoard(); }, []);

  const handleSubmit = async () => {
    if (!identity.nickname) { setMsg("Önce bir takma ad kaydet."); return; }
    if (!selectedName) return;
    setSubmitting(true);
    const animal = pool[selectedName];
    const score = computePowerScore(animal);

    // Okuma ayrı denenir: anahtar henüz hiç oluşturulmadıysa (ilk gönderim)
    // bu normaldir, hata değildir — boş listeyle devam edilir.
    let list = [];
    try {
      const res = await window.storage.get(LEADERBOARD_KEY, true);
      list = res && res.value ? JSON.parse(res.value) : [];
    } catch (e) {
      list = [];
    }

    list = list.filter((e) => e.id !== identity.id);
    list.push({ id: identity.id, nickname: identity.nickname, mutantName: animal.name, score, updatedAt: Date.now() });
    list.sort((a, b) => b.score - a.score);
    list = list.slice(0, LEADERBOARD_MAX);

    try {
      await window.storage.set(LEADERBOARD_KEY, JSON.stringify(list), true);
      setBoard(list);
      setMsg(`Gönderildi! Güç Puanı: ${score}`);
    } catch (e) {
      setMsg("Gönderilemedi, bağlantı sorunu olabilir. Tekrar dene.");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-4">
        <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-2">KİMLİĞİN</div>
        {identity.nickname ? (
          <div className="text-[#E8EDF2] font-mono text-sm">👤 {identity.nickname}</div>
        ) : (
          <div className="text-[9px] text-[#FF6B4A] font-mono mb-2">Lider tablosunda görünmek için bir takma ad seç.</div>
        )}
        <div className="flex gap-2 mt-2">
          <input
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value.slice(0, 16))}
            placeholder="Takma adın (maks 16 karakter)"
            className="flex-1 bg-[#0B0E11] border border-[#2A323A] text-[#E8EDF2] font-mono text-xs px-2 py-2 rounded-sm focus:outline-none focus:border-[#5EEAD4]"
          />
          <button
            onClick={() => nicknameInput.trim() && onSaveNickname(nicknameInput.trim())}
            className="px-3 py-2 text-[10px] font-mono rounded-sm border border-[#5EEAD4] text-[#5EEAD4]"
          >
            KAYDET
          </button>
        </div>
        <div className="text-[9px] text-[#2A323A] font-mono mt-2">
          ⚠️ Takma adın ve gönderdiğin mutantın adı TÜM oyunculara açık şekilde görünür.
        </div>
      </div>

      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-4">
        <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-2">SKORUNU GÖNDER</div>
        <div className="flex gap-3">
          <AnimalPicker label="MUTANT" value={selectedName} onChange={setSelectedName} options={names} />
        </div>
        {selectedName && (
          <div className="text-[10px] font-mono text-[#7C8894] mt-2">
            Güç Puanı: <span className="text-[#5EEAD4]">{computePowerScore(pool[selectedName])}</span>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting || !identity.nickname}
          className="w-full mt-3 bg-[#5EEAD4] text-[#0B0E11] font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm hover:bg-[#7FF3E0] transition-colors font-bold disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {submitting ? "// gönderiliyor..." : "🏆 SIRALAMAYA GÖNDER"}
        </button>
        {msg && <div className="text-center text-[10px] font-mono text-[#7C8894] mt-2">{msg}</div>}
      </div>

      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b border-[#2A323A]">
          <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em]">KÜRESEL SIRALAMA (İLK {LEADERBOARD_MAX})</div>
          <button onClick={loadBoard} className="text-[9px] font-mono text-[#7C8894] border border-[#2A323A] rounded-sm px-2 py-1">
            ⟳ YENİLE
          </button>
        </div>
        {loadingBoard ? (
          <div className="p-4 text-[10px] font-mono text-[#2A323A]">// yükleniyor...</div>
        ) : board && board.length > 0 ? (
          <table className="w-full text-[11px] font-mono">
            <tbody>
              {board.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className="border-b border-[#1c2329]"
                  style={{ background: entry.id === identity.id ? "#1a2530" : "transparent" }}
                >
                  <td className="p-2 text-[#7C8894] w-8">#{idx + 1}</td>
                  <td className="p-2 text-[#E8EDF2]">{entry.nickname}</td>
                  <td className="p-2 text-[#7C8894] text-[10px]">{entry.mutantName}</td>
                  <td className="p-2 text-right text-[#5EEAD4]">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-[10px] font-mono text-[#2A323A]">// henüz kimse skor göndermedi, ilk sen ol</div>
        )}
      </div>
    </div>
  );
}

function SettingsView({
  playerState, onImport, resetArmed, onReset,
  onAddTestScrap, onAddTestEnergy, onAddTestBolts,
}) {
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [copyMsg, setCopyMsg] = useState(null);
  const [importMsg, setImportMsg] = useState(null);
  const [importArmed, setImportArmed] = useState(false);
  const importArmTimerRef = useRef(null);

  const handleExport = () => {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(playerState))));
    setExportText(encoded);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyMsg("Panoya kopyalandı!");
    } catch (e) {
      setCopyMsg("Kopyalanamadı — metni elle seçip kopyala.");
    }
    setTimeout(() => setCopyMsg(null), 2500);
  };

  const handleImportClick = () => {
    if (!importText.trim()) return;
    if (!importArmed) {
      setImportArmed(true);
      clearTimeout(importArmTimerRef.current);
      importArmTimerRef.current = setTimeout(() => setImportArmed(false), 4000);
      return;
    }
    setImportArmed(false);
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(importText.trim()))));
      if (!decoded.collection) throw new Error("geçersiz kayıt");
      onImport(decoded);
      setImportMsg("✓ İçe aktarıldı! İlerlemen değiştirildi.");
    } catch (e) {
      setImportMsg("✗ Geçersiz kod. Tam olarak kopyaladığından emin ol.");
    }
    setTimeout(() => setImportMsg(null), 3500);
  };

  useEffect(() => () => clearTimeout(importArmTimerRef.current), []);

  return (
    <div className="space-y-4">
      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-4">
        <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-2">TEST ARAÇLARI</div>
        <div className="text-[9px] text-[#7C8894] font-mono mb-3">Sadece deneme kolaylığı için — gerçek oyunda kaldırılmalı.</div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={onAddTestScrap} className="text-[10px] font-mono px-3 py-2 rounded-sm border border-[#2A323A] text-[#FFD166]">+500 🔩 Hurda</button>
          <button onClick={onAddTestBolts} className="text-[10px] font-mono px-3 py-2 rounded-sm border border-[#2A323A]" style={{ color: "#FFD166" }}>+50 🪙 Somun</button>
          <button onClick={onAddTestEnergy} className="text-[10px] font-mono px-3 py-2 rounded-sm border border-[#2A323A] text-[#5EEAD4]">+1 ⚡ Enerji</button>
        </div>
      </div>

      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-4">
        <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-2">İLERLEMEYİ DIŞA AKTAR</div>
        <div className="text-[9px] text-[#7C8894] font-mono mb-3">
          Bu kodu üretip bir yere (notlar uygulaması vb.) kaydet. Başka bir cihazda "İçe Aktar" ile geri yükleyebilirsin.
        </div>
        <button onClick={handleExport} className="text-[10px] font-mono px-3 py-2 rounded-sm border border-[#5EEAD4] text-[#5EEAD4] mb-2">
          KOD ÜRET
        </button>
        {exportText && (
          <>
            <textarea
              readOnly
              value={exportText}
              className="w-full h-20 bg-[#0B0E11] border border-[#2A323A] text-[#7C8894] font-mono text-[9px] p-2 rounded-sm resize-none"
              onFocus={(e) => e.target.select()}
            />
            <button onClick={handleCopy} className="w-full mt-2 text-[10px] font-mono px-3 py-2 rounded-sm border border-[#2A323A] text-[#E8EDF2]">
              📋 PANOYA KOPYALA
            </button>
            {copyMsg && <div className="text-[9px] font-mono text-[#5EEAD4] mt-1 text-center">{copyMsg}</div>}
          </>
        )}
      </div>

      <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-4">
        <div className="text-[#5EEAD4] font-mono text-[11px] tracking-[0.15em] mb-2">İLERLEMEYİ İÇE AKTAR</div>
        <div className="text-[9px] text-[#FF6B4A] font-mono mb-3">⚠️ Bu işlem mevcut ilerlemenin ÜZERİNE YAZAR, geri alınamaz.</div>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Dışa aktarılan kodu buraya yapıştır..."
          className="w-full h-20 bg-[#0B0E11] border border-[#2A323A] text-[#E8EDF2] font-mono text-[9px] p-2 rounded-sm resize-none focus:outline-none focus:border-[#5EEAD4]"
        />
        <button
          onClick={handleImportClick}
          disabled={!importText.trim()}
          className="w-full mt-2 text-[10px] font-mono px-3 py-2 rounded-sm border disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderColor: importArmed ? "#FF6B4A" : "#2A323A", color: importArmed ? "#FF6B4A" : "#E8EDF2" }}
        >
          {importArmed ? "⚠️ EMİN MİSİN? TEKRAR TIKLA" : "📥 İÇE AKTAR"}
        </button>
        {importMsg && <div className="text-[9px] font-mono text-center mt-1" style={{ color: importMsg.startsWith("✓") ? "#5EEAD4" : "#FF6B4A" }}>{importMsg}</div>}
      </div>

      <div className="bg-[#151A1F] border border-[#FF6B4A] rounded-sm p-4">
        <div className="text-[#FF6B4A] font-mono text-[11px] tracking-[0.15em] mb-2">TEHLİKELİ BÖLGE</div>
        <button
          onClick={onReset}
          className="w-full text-[10px] font-mono px-3 py-2 rounded-sm border"
          style={{ borderColor: "#FF6B4A", color: "#FF6B4A" }}
        >
          {resetArmed ? "EMİN MİSİN? (TEKRAR TIKLA)" : "🗑 TÜM İLERLEMEYİ SIFIRLA"}
        </button>
      </div>
    </div>
  );
}

export default function MutantLabApp() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("lab");

  const [collection, setCollection] = useState({});
  const [scrap, setScrap] = useState(STARTING_SCRAP);
  const [bolts, setBolts] = useState(0);
  const [mutantCounter, setMutantCounter] = useState(1);
  const [econ, setEcon] = useState({ energy: ENERGY_MAX, lastEnergyTs: Date.now() });
  const [now, setNow] = useState(Date.now());
  const [defeatedBosses, setDefeatedBosses] = useState({});
  const [identity, setIdentity] = useState({ id: null, nickname: null });
  const [labReadyAt, setLabReadyAt] = useState(0);
  const [surgeryReadyAt, setSurgeryReadyAt] = useState(0);
  const [seenIntro, setSeenIntro] = useState(true);
  const [adsWatchedToday, setAdsWatchedToday] = useState(0);
  const [lastAdDate, setLastAdDate] = useState(new Date().toDateString());
  const [marketOffers, setMarketOffers] = useState(null);
  const [resetArmed, setResetArmed] = useState(false);

  // --- Kayıtlı ilerlemeyi yükle ---
  useEffect(() => {
    let active = true;
    (async () => {
      let loaded = null;
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) loaded = JSON.parse(res.value);
      } catch (e) {
        loaded = null;
      }
      const base = (loaded && loaded.collection) ? loaded : defaultPlayerState();
      const regen = applyEnergyRegen(base.energy ?? ENERGY_MAX, base.lastEnergyTs ?? Date.now());

      let loadedIdentity = null;
      try {
        const idRes = await window.storage.get(IDENTITY_KEY, false);
        if (idRes && idRes.value) loadedIdentity = JSON.parse(idRes.value);
      } catch (e) {
        loadedIdentity = null;
      }
      if (!loadedIdentity) {
        loadedIdentity = { id: Math.random().toString(36).slice(2) + Date.now().toString(36), nickname: null };
        window.storage.set(IDENTITY_KEY, JSON.stringify(loadedIdentity), false).catch(() => {});
      }

      if (active) {
        setCollection(base.collection || {});
        setScrap(base.scrap ?? STARTING_SCRAP);
        setBolts(base.bolts ?? 0);
        setMutantCounter(base.mutantCounter ?? 1);
        setEcon({ energy: regen.energy, lastEnergyTs: regen.lastTs });
        setDefeatedBosses(base.defeatedBosses || {});
        setLabReadyAt(base.labReadyAt || 0);
        setSurgeryReadyAt(base.surgeryReadyAt || 0);
        setSeenIntro(base.seenIntro || false);
        const adReset = applyAdDailyReset(base.adsWatchedToday || 0, base.lastAdDate || new Date().toDateString());
        setAdsWatchedToday(adReset.adsWatchedToday);
        setLastAdDate(adReset.lastAdDate);
        setMarketOffers(applyMarketOfferRefresh(base.marketOffers || generateMarketOffers()));
        setIdentity(loadedIdentity);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // --- Her saniye enerji düzelmesini, market tekliflerini ve reklam gününü kontrol et ---
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      setEcon((prev) => {
        const r = applyEnergyRegen(prev.energy, prev.lastEnergyTs);
        if (r.energy === prev.energy && r.lastTs === prev.lastEnergyTs) return prev;
        return { energy: r.energy, lastEnergyTs: r.lastTs };
      });
      setMarketOffers((prev) => {
        const refreshed = applyMarketOfferRefresh(prev);
        return refreshed === prev ? prev : refreshed;
      });
      setLastAdDate((prevDate) => {
        const reset = applyAdDailyReset(0, prevDate); // sadece tarih değişti mi kontrolü için
        if (reset.lastAdDate === prevDate) return prevDate;
        setAdsWatchedToday(0);
        return reset.lastAdDate;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // --- Değişiklikleri kaydet (debounce) ---
  useEffect(() => {
    if (loading) return;
    const handle = setTimeout(() => {
      const payload = JSON.stringify({
        scrap, bolts, collection, mutantCounter, energy: econ.energy, lastEnergyTs: econ.lastEnergyTs,
        defeatedBosses, labReadyAt, surgeryReadyAt, seenIntro,
        adsWatchedToday, lastAdDate, marketOffers,
      });
      window.storage.set(STORAGE_KEY, payload, false).catch((e) => console.error("Kayıt başarısız:", e));
    }, 600);
    return () => clearTimeout(handle);
  }, [scrap, bolts, collection, mutantCounter, econ, defeatedBosses, labReadyAt, surgeryReadyAt, seenIntro, adsWatchedToday, lastAdDate, marketOffers, loading]);

  // --- Melezleme: ebeveynleri TÜKETİR, laboratuvar ücreti + bekleme uygular, yavruyu ekler ---
  const handleBreed = (aKey, bKey) => {
    if (aKey === bKey) return null;
    const parentA = collection[aKey];
    const parentB = collection[bKey];
    if (!parentA || !parentB) return null;

    const totalMutation = totalCombinedMutation(parentA, parentB);
    const fee = labFee(totalMutation);
    const cooldownMs = labCooldownMs(totalMutation);

    if (Date.now() < labReadyAt) return null; // arayüz zaten engelliyor, ek güvenlik
    if (scrap < fee) return null;

    const childName = `Mutant-${String(mutantCounter).padStart(3, "0")}`;
    const { child, results } = breedAnimals(parentA, parentB, childName);

    setScrap((s) => s - fee);
    setLabReadyAt(Date.now() + cooldownMs);
    setCollection((prev) => {
      const next = { ...prev };
      delete next[aKey];
      delete next[bKey];
      next[child.name] = child;
      return next;
    });
    setMutantCounter((c) => c + 1);

    return { child, results, fee, cooldownMs };
  };

  // --- Cerrahi Melezleme: hedefin TEK uzvunu değiştirir, bağışçının o
  // uzvunu boşaltır (bağışçının kendisi yaşamaya devam eder).
  const handleSurgery = (targetName, limbType, donorName) => {
    if (targetName === donorName) return null;
    const target = collection[targetName];
    const donor = collection[donorName];
    if (!target || !donor) return null;

    const targetLimb = target.limbs[limbType];
    const donorLimb = donor.limbs[limbType];
    const combinedMutation = mutationLevel(targetLimb) + mutationLevel(donorLimb);
    const fee = surgeryFee(combinedMutation);
    const cooldownMs = surgeryCooldownMs(combinedMutation);

    if (Date.now() < surgeryReadyAt) return null;
    if (scrap < fee) return null;

    const result = breedLimbSurgical(limbType, targetLimb, donorLimb);

    setScrap((s) => s - fee);
    setSurgeryReadyAt(Date.now() + cooldownMs);
    setCollection((prev) => {
      const next = { ...prev };
      next[targetName] = { ...next[targetName], limbs: { ...next[targetName].limbs, [limbType]: result.limb } };
      next[donorName] = { ...next[donorName], limbs: { ...next[donorName].limbs, [limbType]: emptyLimb(limbType) } };
      return next;
    });

    return { result, fee, cooldownMs };
  };

  const handleSpendEnergy = () => {
    setEcon((prev) => {
      if (prev.energy <= 0) return prev;
      const wasFull = prev.energy >= ENERGY_MAX;
      return { energy: prev.energy - 1, lastEnergyTs: wasFull ? Date.now() : prev.lastEnergyTs };
    });
  };

  const handleReward = (amount) => setScrap((s) => s + amount);

  // --- Test araçları: sadece deneme/oynama kolaylığı için ---
  const handleAddTestScrap = () => setScrap((s) => s + 500);
  const handleAddTestEnergy = () => {
    setEcon((prev) => ({ energy: Math.min(ENERGY_MAX, prev.energy + 1), lastEnergyTs: Math.min(ENERGY_MAX, prev.energy + 1) >= ENERGY_MAX ? Date.now() : prev.lastEnergyTs }));
  };
  const handleAddTestBolts = () => setBolts((b) => b + 50);

  // --- İlerlemeyi içe aktar: mevcut her şeyin üzerine yazar ---
  const handleImport = (decoded) => {
    setCollection(decoded.collection || {});
    setScrap(decoded.scrap ?? STARTING_SCRAP);
    setBolts(decoded.bolts ?? 0);
    setMutantCounter(decoded.mutantCounter ?? 1);
    const regen = applyEnergyRegen(decoded.energy ?? ENERGY_MAX, decoded.lastEnergyTs ?? Date.now());
    setEcon({ energy: regen.energy, lastEnergyTs: regen.lastTs });
    setDefeatedBosses(decoded.defeatedBosses || {});
    setLabReadyAt(decoded.labReadyAt || 0);
    setSurgeryReadyAt(decoded.surgeryReadyAt || 0);
  };

  // --- Altın Somun (premium para) harcamaları ---
  const handleBuyScrapWithBolts = () => {
    if (bolts < BOLT_SCRAP_PACK.cost) return;
    setBolts((b) => b - BOLT_SCRAP_PACK.cost);
    setScrap((s) => s + BOLT_SCRAP_PACK.amount);
  };
  const handleRefillEnergyWithBolts = () => {
    if (bolts < BOLT_ENERGY_REFILL_COST || econ.energy >= ENERGY_MAX) return;
    setBolts((b) => b - BOLT_ENERGY_REFILL_COST);
    setEcon({ energy: ENERGY_MAX, lastEnergyTs: Date.now() });
  };
  const handleClearLabWithBolts = () => {
    if (bolts < BOLT_LAB_CLEAR_COST || Date.now() >= labReadyAt) return;
    setBolts((b) => b - BOLT_LAB_CLEAR_COST);
    setLabReadyAt(0);
  };

  const handleSpendBossEnergy = (cost) => {
    setEcon((prev) => {
      if (prev.energy < cost) return prev;
      const wasFull = prev.energy >= ENERGY_MAX;
      return { energy: prev.energy - cost, lastEnergyTs: wasFull ? Date.now() : prev.lastEnergyTs };
    });
  };

  const handleBossReward = (tier) => {
    const already = defeatedBosses[tier.id];
    const amount = already ? tier.repeatReward : tier.firstReward;
    setScrap((s) => s + amount);
    if (!already) setDefeatedBosses((prev) => ({ ...prev, [tier.id]: true }));
    return amount;
  };

  const handleSaveNickname = async (nickname) => {
    const updated = { ...identity, nickname };
    setIdentity(updated);
    try { await window.storage.set(IDENTITY_KEY, JSON.stringify(updated), false); } catch (e) { /* sessizce geç */ }
  };

  const handleLevelUp = (name) => {
    const animal = collection[name];
    if (!animal) return;
    const currentLevel = getAnimalLevel(animal);
    if (currentLevel >= MAX_LEVEL) return;
    const cost = levelUpCost(currentLevel);
    if (scrap < cost) return;
    setScrap((s) => s - cost);
    setCollection((prev) => {
      const a = prev[name];
      if (!a) return prev;
      const newLimbs = {};
      LIMB_TYPES.forEach((t) => {
        const limb = a.limbs[t];
        newLimbs[t] = limb.source ? { ...limb, level: (limb.level || 1) + 1 } : limb;
      });
      return { ...prev, [name]: { ...a, limbs: newLimbs } };
    });
  };

  const handleOpenChest = () => {
    if (scrap < CHEST_COST) return null;
    const baseName = rollChestAnimal();
    const newAnimal = purebred(baseName);
    const uniqueName = collection[baseName] ? `${baseName}-${String(mutantCounter).padStart(3, "0")}` : baseName;
    newAnimal.name = uniqueName;
    setMutantCounter((c) => c + 1);
    setScrap((s) => s - CHEST_COST);
    setCollection((prev) => ({ ...prev, [uniqueName]: newAnimal }));
    return { name: uniqueName, baseName };
  };

  // --- Reklam izleyerek Somun kazanma (bu ortamda simülasyon) ---
  const handleWatchAd = () => {
    if (adsWatchedToday >= ADS_PER_DAY) return;
    setAdsWatchedToday((n) => n + 1);
    setBolts((b) => b + AD_REWARD_BOLTS);
  };

  // --- Altın Sandık açma: kademeye göre birden fazla hayvan üretebilir ---
  const handleOpenGoldChest = (tierId) => {
    const tier = GOLD_CHESTS[tierId];
    if (!tier || bolts < tier.cost) return null;
    const rarities = tier.roll();
    const results = [];
    const nextCollection = { ...collection };
    let counter = mutantCounter;
    rarities.forEach((rarity) => {
      const baseName = pickRandomFromRarity(rarity);
      const animal = purebred(baseName);
      let uniqueName = baseName;
      if (nextCollection[uniqueName]) {
        uniqueName = `${baseName}-${String(counter).padStart(3, "0")}`;
        counter++;
      }
      animal.name = uniqueName;
      nextCollection[uniqueName] = animal;
      results.push({ name: uniqueName, baseName });
    });
    setBolts((b) => b - tier.cost);
    setCollection(nextCollection);
    setMutantCounter(counter);
    return results;
  };

  // --- Rotasyonlu teklif satın alma ---
  const handleBuyOffer = (kind, idx) => {
    if (!marketOffers) return;
    const price = OFFER_PRICES[kind];
    if (bolts < price) return;
    let baseName, alreadyBought;
    if (kind === "common") { baseName = marketOffers.commons[idx]; alreadyBought = marketOffers.purchased.commons[idx]; }
    else if (kind === "rare") { baseName = marketOffers.rare; alreadyBought = marketOffers.purchased.rare; }
    else { baseName = marketOffers.epic; alreadyBought = marketOffers.purchased.epic; }
    if (alreadyBought) return;

    const animal = purebred(baseName);
    const uniqueName = collection[baseName] ? `${baseName}-${String(mutantCounter).padStart(3, "0")}` : baseName;
    animal.name = uniqueName;

    setBolts((b) => b - price);
    setMutantCounter((c) => c + 1);
    setCollection((prev) => ({ ...prev, [uniqueName]: animal }));
    setMarketOffers((prev) => {
      const purchased = { ...prev.purchased, commons: [...prev.purchased.commons] };
      if (kind === "common") purchased.commons[idx] = true;
      else if (kind === "rare") purchased.rare = true;
      else purchased.epic = true;
      return { ...prev, purchased };
    });
  };

  const handleReset = async () => {
    if (!resetArmed) { setResetArmed(true); setTimeout(() => setResetArmed(false), 3000); return; }
    try { await window.storage.delete(STORAGE_KEY, false); } catch (e) { /* zaten yoksa sorun değil */ }
    const fresh = defaultPlayerState();
    setCollection(fresh.collection);
    setScrap(fresh.scrap);
    setBolts(fresh.bolts);
    setMutantCounter(fresh.mutantCounter);
    setEcon({ energy: ENERGY_MAX, lastEnergyTs: Date.now() });
    setDefeatedBosses({});
    setLabReadyAt(0);
    setSurgeryReadyAt(0);
    setAdsWatchedToday(0);
    setLastAdDate(new Date().toDateString());
    setMarketOffers(fresh.marketOffers);
    setResetArmed(false);
  };

  const energyMsLeft = econ.energy >= ENERGY_MAX ? 0 : Math.max(0, econ.lastEnergyTs + ENERGY_REGEN_MS - now);

  const TABS = [
    { id: "lab", label: "LAB" },
    { id: "surgery", label: "🔬 CERRAHİ" },
    { id: "duel", label: "⚔️ DÜELLO" },
    { id: "pve", label: "ARENA" },
    { id: "boss", label: "👑 NÖBETÇİ" },
    { id: "training", label: "ANTRENMAN" },
    { id: "market", label: "MARKET" },
    { id: "inventory", label: "ENVANTER" },
    { id: "leaderboard", label: "🏆 SIRALAMA" },
    { id: "species", label: "TÜRLER" },
    { id: "cardbook", label: "📖 KART KİTABI" },
    { id: "settings", label: "⚙️ AYARLAR" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E11] text-[#5EEAD4] flex items-center justify-center font-mono text-xs">
        // ilerleme yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#E8EDF2] p-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .font-display { font-family: 'Chakra Petch', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #2A323A; }
        @keyframes hb-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes hb-flash {
          0% { filter: brightness(1) saturate(1); }
          25% { filter: brightness(2.4) saturate(2.2); }
          100% { filter: brightness(1) saturate(1); }
        }
        @keyframes hb-float {
          0% { transform: translateY(4px); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(-32px); opacity: 0; }
        }
        .hb-shake { animation: hb-shake 0.35s ease-in-out; }
        .hb-flash { animation: hb-flash 0.4s ease-in-out; }
        .hb-float { animation: hb-float 0.9s ease-out forwards; }
      `}</style>

      {!seenIntro && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(4,6,8,0.94)" }}
        >
          <div
            className="rounded-sm p-5 max-w-sm w-full"
            style={{ background: "#151A1F", border: "1px solid #5EEAD4" }}
          >
            <div className="font-display text-lg text-[#5EEAD4] mb-3">MUTANT//LAB'A HOŞ GELDİN</div>
            <div className="text-[11px] font-mono text-[#E8EDF2] space-y-2 mb-4 leading-relaxed">
              <p>Sen bir mekatronik laboratuvarın sorumlususun. 5 hayvanla başlıyorsun: Köpek, Kaplumbağa, Arı, Boğa, Kurt.</p>
              <p><span className="text-[#5EEAD4]">🧪 LAB</span> — iki canlıyı melezle, 8 uzvun her biri ayrı şansla birleşir. İKİSİ DE tükenir, sadece yavru kalır.</p>
              <p><span className="text-[#5EEAD4]">⚔ ARENA</span> — botlarla dövüş, Hurda kazan.</p>
              <p><span className="text-[#C77DFF]">👑 NÖBETÇİ</span> — gücün yeterliyse zorlu bosslarla dövüş, büyük ödül kazan.</p>
              <p><span className="text-[#FFD166]">🔩 MARKET</span> — Hurda ile sandık aç, yeni hayvanlar bul.</p>
              <p className="text-[#7C8894]">İlerlemen otomatik kaydedilir. İyi şanslar, mühendis.</p>
            </div>
            <button
              onClick={() => setSeenIntro(true)}
              className="w-full bg-[#5EEAD4] text-[#0B0E11] font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm font-bold"
            >
              ANLADIM, BAŞLA
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3 border-b border-[#2A323A] pb-3">
          <div className="font-display text-lg tracking-wider text-[#E8EDF2]">
            MUTANT<span className="text-[#5EEAD4]">//</span>LAB
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono flex-wrap justify-end">
            <span className="text-[#FFD166]">🔩 {scrap}</span>
            <span style={{ color: "#FFD166" }}>🪙 {bolts}</span>
            <span className="text-[#5EEAD4]">
              ⚡ {econ.energy}/{ENERGY_MAX}
              {econ.energy < ENERGY_MAX && <span className="text-[#7C8894] ml-1">({formatCountdown(energyMsLeft)})</span>}
            </span>
            {now < labReadyAt && (
              <span className="text-[#FF6B4A]">🧪 {formatCountdown(labReadyAt - now)}</span>
            )}
          </div>
        </div>

        <div className="flex gap-1 mb-4 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-3 py-2 text-[10px] font-mono tracking-[0.1em] rounded-sm border transition-colors"
              style={{
                borderColor: tab === t.id ? "#5EEAD4" : "#2A323A",
                color: tab === t.id ? "#5EEAD4" : "#7C8894",
                background: tab === t.id ? "#151A1F" : "transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "lab" && <LabView pool={collection} onBreed={handleBreed} scrap={scrap} labReadyAt={labReadyAt} now={now} />}
        {tab === "surgery" && (
          <SurgeryView pool={collection} onSurgery={handleSurgery} scrap={scrap} surgeryReadyAt={surgeryReadyAt} now={now} />
        )}
        {tab === "duel" && (
          <DuelView pool={collection} energy={econ.energy} energyMsLeft={energyMsLeft} onSpendEnergy={handleSpendEnergy} />
        )}
        {tab === "pve" && (
          <PvEView pool={collection} energy={econ.energy} energyMsLeft={energyMsLeft} onSpendEnergy={handleSpendEnergy} onReward={handleReward} />
        )}
        {tab === "boss" && (
          <BossView
            pool={collection}
            energy={econ.energy}
            energyMsLeft={energyMsLeft}
            defeatedBosses={defeatedBosses}
            onSpendBossEnergy={handleSpendBossEnergy}
            onBossReward={handleBossReward}
          />
        )}
        {tab === "training" && <TrainingView pool={collection} onReward={handleReward} />}
        {tab === "market" && (
          <MarketView
            scrap={scrap}
            bolts={bolts}
            energy={econ.energy}
            labReadyAt={labReadyAt}
            now={now}
            onOpenChest={handleOpenChest}
            onBuyScrapWithBolts={handleBuyScrapWithBolts}
            onRefillEnergyWithBolts={handleRefillEnergyWithBolts}
            onClearLabWithBolts={handleClearLabWithBolts}
            adsWatchedToday={adsWatchedToday}
            onWatchAd={handleWatchAd}
            marketOffers={marketOffers}
            onBuyOffer={handleBuyOffer}
            onOpenGoldChest={handleOpenGoldChest}
          />
        )}
        {tab === "inventory" && <InventoryView pool={collection} scrap={scrap} onLevelUp={handleLevelUp} />}
        {tab === "leaderboard" && (
          <LeaderboardView pool={collection} identity={identity} onSaveNickname={handleSaveNickname} />
        )}
        {tab === "species" && <SpeciesCompendium />}
        {tab === "cardbook" && <CardCompendiumView />}
        {tab === "settings" && (
          <SettingsView
            playerState={{ scrap, bolts, collection, mutantCounter, energy: econ.energy, lastEnergyTs: econ.lastEnergyTs, defeatedBosses, labReadyAt, surgeryReadyAt, seenIntro }}
            onImport={handleImport}
            resetArmed={resetArmed}
            onReset={handleReset}
            onAddTestScrap={handleAddTestScrap}
            onAddTestEnergy={handleAddTestEnergy}
            onAddTestBolts={handleAddTestBolts}
          />
        )}

        <div className="mt-6 text-center text-[9px] font-mono text-[#2A323A]">
          // ilerlemen otomatik kaydedilir · melezleme ebeveynleri tüketir · Dodge/Kritik şimdilik devre dışı
        </div>
      </div>
    </div>
  );
}
