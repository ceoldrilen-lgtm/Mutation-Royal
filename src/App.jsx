import React, { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase-client.js";

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
const FLAT_GROWTH_PER_LEVEL = 0.03; // seviye başına +%3 (doğrusal) — %5 hâlâ round-bazlı sistemde çok güçlüydü
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
const LEVEL_UP_BASE_COST = 40; // eskiden 25'ti, maliyet daha da yüksek
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

// playerBonus: kazanılan mini-oyun bonusu ({ forceCrit, superCrit, extraDefense }).
// Kart etkilerinden BAĞIMSIZ olarak uygulanır — hangi kartı oynarsan oyna geçerlidir.
function buildCardEffects(card, playerBonus = {}) {
  const defIds = card ? card.defIds : [];
  const boosted = defIds.length >= 2; // füzyon kartı mı — güçlendirilmiş sayılar
  const hasForcedCrit = defIds.includes("kritik") || playerBonus.forceCrit;
  return {
    forcedCritHit: hasForcedCrit ? Math.floor(Math.random() * 3) : -1,
    critMultiplier: playerBonus.superCrit ? 4 : 2, // Kritik Oyunu kazanılırsa 4x
    forcedDodgeHit: defIds.includes("siyrilma") ? Math.floor(Math.random() * 3) : -1,
    dmgMult: defIds.includes("saldiri") ? (boosted ? 1.20 : 1.15) : 1,
    defMult: (defIds.includes("savunma") ? (boosted ? 0.83 : 0.88) : 1) * (playerBonus.extraDefense ? 0.75 : 1), // Kalkan Oyunu
    reflect: { armed: defIds.includes("yansitma"), mult: boosted ? 1.75 : 1.5 },
    lifestealPct: defIds.includes("yagma") ? (boosted ? 0.25 : 0.20) : 0,
    critImmune: false, reflectChance: 0, reflectMult: 0, // sadece diyar bosslarında doldurulur
  };
}

// Diyar bosslarının sabit özel yeteneklerini (kritik bağışıklığı, şans bazlı
// yansıtma) bir Fx nesnesinin üzerine bindirir.
function applyNodeSpecialToFx(fx, special) {
  if (!special) return fx;
  return {
    ...fx,
    critImmune: !!special.critImmune,
    reflectChance: special.reflectChance || 0,
    reflectMult: special.reflectMult || 0,
  };
}

// Tek bir vuruşu çözer (saldıran -> savunan), verilen round kartı etkileriyle.
function resolveHit(attacker, defender, attackerFx, defenderFx, hitIndex) {
  if (defenderFx.forcedDodgeHit === hitIndex) {
    return { dmg: 0, blocked: 0, crit: false, dodged: true, reflect: 0 };
  }
  let dmg = attacker.attack;
  // Hedef kritik bağışıksa (Toprak Yılanı vb.) kritik gerçekleşse bile çarpan uygulanmaz.
  const isCrit = attackerFx.forcedCritHit === hitIndex && !defenderFx.critImmune;
  if (isCrit) dmg *= attackerFx.critMultiplier;
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
  // Toprak Yılanı tarzı şans bazlı yansıtma — kritikten bağımsız, her vuruşta denenir.
  if (defenderFx.reflectChance > 0 && Math.random() < defenderFx.reflectChance) {
    const earthReflect = dmg * defenderFx.reflectMult;
    attacker.hp -= earthReflect;
    reflectDmg += earthReflect;
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
// playerBonus: mini-oyun teklifinden kazanılan bonus. blockOppCard=true ise
// rakibin kartı o round HİÇ uygulanmaz (kullanamamış gibi).
// oppSpecial: diyar bossunun sabit özel yeteneği (critImmune/reflect/vb.)
// playerFrozen: true ise (Buz Yılanı donması) oyuncu bu round HİÇ hasar veremez.
function resolveRound(playerUnit, oppUnit, playerCard, oppCard, playerBonus = {}, oppSpecial = {}, playerFrozen = false) {
  const pFx = buildCardEffects(playerCard, playerBonus);
  let oFx = buildCardEffects(playerBonus.blockOppCard ? null : oppCard, {});
  oFx = applyNodeSpecialToFx(oFx, oppSpecial);
  const log = [];
  const summary = { pDealt: 0, pBlocked: 0, oDealt: 0, oBlocked: 0, pTaken: 0, oTaken: 0 };

  for (let i = 0; i < 3; i++) {
    if (playerUnit.hp <= 0 || oppUnit.hp <= 0) break;

    if (playerFrozen) {
      log.push({ kind: "frozen", text: `${playerUnit.name} donmuş durumda — hasar veremedi!`, targetSide: "opp", dmg: 0, crit: false, dodged: false, reflect: 0, playerHpAfter: playerUnit.hp, oppHpAfter: oppUnit.hp });
    } else {
      const r1 = resolveHit(playerUnit, oppUnit, pFx, oFx, i);
      log.push({
        ...hitLogText(playerUnit.name, oppUnit.name, r1),
        targetSide: "opp", dmg: r1.dmg, crit: r1.crit, dodged: r1.dodged, reflect: r1.reflect,
        playerHpAfter: playerUnit.hp, oppHpAfter: oppUnit.hp,
      });
      if (!r1.dodged) { summary.pDealt += r1.dmg; summary.oBlocked += r1.blocked; summary.oTaken += r1.dmg; }
    }

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
const STARTING_SCRAP = 200; // ilk oturumda birkaç melezleme/seviye atlama yapabilsin diye eskiden 80'di
const NEW_PLAYER_ENERGY_BONUS = 10; // ilk enerji havuzu tavanın üstünde başlar, bir kereye mahsus (bkz. applyEnergyRegen)
const NEW_PLAYER_BOLTS = 5; // premium para birimini erkenden tattırmak için küçük bir başlangıç hediyesi

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

// --- Güç Puanı: lider tablosu sıralaması için tek bir sayı ---
function computePowerScore(animal) {
  const s = totalStats(animal);
  const lvl = getAnimalLevel(animal);
  const mut = averageMutationLevel(animal);
  return Math.round(s.hp * 0.4 + s.attack * 3 + s.armor * 1.5 + lvl * 8 + mut * 12);
}

/* ============================================================ DİYARLAR (BÖLGE SİSTEMİ) ============================================================
   NÖBETÇİ artık düz bir kademe listesi değil, hikayeli bir bölge sistemi.
   Her diyarın birden çok "yolu" var, her yolun sonunda bir büyük boss,
   ondan önce sırayla yenilmesi gereken küçük bosslar var. Bir düğümü
   yenmeden bir sonrakine geçemezsin — asıl "engel" bu sıra, ayrıca bir
   güç eşiği yok (basitlik için kaldırıldı).
*/
const REGIONS = {
  ascelding: {
    id: "ascelding",
    name: "Ascelding Diyarı",
    subtitle: "Yılan Diyarı",
    paths: [
      {
        id: "ice", label: "Buz Yolu", color: "#4FA8FF",
        nodes: [
          { id: "ice1", name: "Kırağı Fısıltısı", limbStat: stat(20, 3, 2, 0, 0), energyCost: 1, firstReward: 80, repeatReward: 15, special: { freezeEvery: 5 }, desc: "Her 5 roundda bir seni dondurur — o round hasar veremezsin (kart oynayabilirsin)." },
          { id: "ice2", name: "Buzkıran Nagini", limbStat: stat(30, 5, 3, 0, 0), energyCost: 2, firstReward: 180, repeatReward: 30, special: { freezeEvery: 4 }, desc: "Her 4 roundda bir seni dondurur." },
          { id: "ice_boss", name: "Buz Kralı Glacius", limbStat: stat(45, 7, 5, 0, 0), energyCost: 2, firstReward: 500, repeatReward: 60, special: { freezeEvery: 2 }, isBoss: true, desc: "Her 2 roundda bir seni dondurur — en tehlikeli donduran." },
        ],
      },
      {
        id: "earth", label: "Toprak Yolu", color: "#B08D57",
        nodes: [
          { id: "earth1", name: "Kum Sürüngeni Sable", limbStat: stat(28, 2, 3, 0, 0), energyCost: 1, firstReward: 80, repeatReward: 15, special: { critImmune: true, reflectChance: 0.25, reflectMult: 0.5 }, desc: "Kritik vuruşlardan etkilenmez, %25 ihtimalle aldığı hasarın yarısını sana yansıtır." },
          { id: "earth2", name: "Kaya Yılanı Bazalt", limbStat: stat(38, 3, 4, 0, 0), energyCost: 2, firstReward: 180, repeatReward: 30, special: { critImmune: true, reflectChance: 0.3, reflectMult: 0.5 }, desc: "Kritik vuruşlardan etkilenmez, %30 ihtimalle hasarın yarısını yansıtır." },
          { id: "earth_boss", name: "Toprak İmparatoru Tellun", limbStat: stat(60, 4, 7, 0, 0), energyCost: 2, firstReward: 500, repeatReward: 60, special: { critImmune: true, reflectChance: 0.4, reflectMult: 0.5 }, isBoss: true, desc: "Kritik vuruşlardan etkilenmez, %40 ihtimalle hasarın yarısını yansıtır. Canı çok, atağı az." },
        ],
      },
      {
        id: "fire", label: "Ateş Yolu", color: "#FF6B4A",
        nodes: [
          { id: "fire1", name: "Kor Yılan Ember", limbStat: stat(22, 5, 2, 0, 0), energyCost: 1, firstReward: 80, repeatReward: 15, special: {}, desc: "Sıradan bir saldırgan, özel yeteneği yok." },
          { id: "fire_boss", name: "Alev Kralı Pyrion", limbStat: stat(35, 9, 3, 0, 0), energyCost: 2, firstReward: 500, repeatReward: 60, special: { burn: true }, isBoss: true, desc: "Her round sonunda yakma hasarı verir — bu hasar her round katlanarak artar (maks 160)." },
        ],
      },
    ],
  },
};

function createRegionBossAnimal(node) {
  const limbs = {};
  const lineage = ["Diyar", node.id];
  LIMB_TYPES.forEach((t) => {
    limbs[t] = { id: `node-${node.id}-${t}`, type: t, rarity: "Destansı", source: node.name, baseStat: node.limbStat, level: 1, lineage };
  });
  return { id: `node-${node.id}`, name: node.name, limbs };
}

/* ============================================================ GÖREV SİSTEMİ ============================================================
   Oyuncuya her an "sıradaki hedef" veren zincirleme görevler. İlerleme
   questStats sayaçlarından (App'te tutulur, kalıcı) ve regionProgress'ten
   okunur. Ödüller Hurda (🔩) veya Altın Somun (🪙) olarak verilir.
*/
const QUESTS = [
  { id: "q_breed1", icon: "🧪", title: "İlk Melezleme", desc: "LAB'da iki canlıyı melezle.", stat: "breeds", target: 1, reward: { scrap: 60 } },
  { id: "q_duel3", icon: "⚔️", title: "Isınma Turları", desc: "3 düello kazan.", stat: "duelWins", target: 3, reward: { scrap: 80 } },
  { id: "q_fuse1", icon: "🔗", title: "İlk Füzyon", desc: "Savaşta 2 temel kartı birleştir.", stat: "fusions", target: 1, reward: { scrap: 60 } },
  { id: "q_minigame1", icon: "⚡", title: "Refleks Testi", desc: "Bir bonus mini-oyununu kazan.", stat: "minigameWins", target: 1, reward: { bolts: 5 } },
  { id: "q_surgery1", icon: "🔬", title: "İlk Ameliyat", desc: "Cerrahi ile tek bir uzuv naklet.", stat: "surgeries", target: 1, reward: { scrap: 80 } },
  { id: "q_ice1", icon: "❄️", title: "Buzun Fısıltısı", desc: "Ascelding'de Kırağı Fısıltısı'nı yen.", node: "ice1", reward: { scrap: 100 } },
  { id: "q_breed5", icon: "🧬", title: "Deneyci", desc: "Toplam 5 melezleme yap.", stat: "breeds", target: 5, reward: { scrap: 150 } },
  { id: "q_levelup1", icon: "📈", title: "Güçlendirme", desc: "Bir canlının seviyesini yükselt.", stat: "levelUps", target: 1, reward: { scrap: 80 } },
  { id: "q_duel10", icon: "🏟️", title: "Arena Kurdu", desc: "10 düello kazan.", stat: "duelWins", target: 10, reward: { bolts: 10 } },
  { id: "q_chest1", icon: "📦", title: "Şansını Dene", desc: "Market'ten bir Paslı Sandık aç.", stat: "chestsOpened", target: 1, reward: { scrap: 100 } },
  { id: "q_anyboss", icon: "👑", title: "Yol Hakimi", desc: "Herhangi bir yolun büyük bossunu yen.", anyNode: ["ice_boss", "earth_boss", "fire_boss"], reward: { scrap: 300 } },
  { id: "q_fuse5", icon: "🃏", title: "Kart Ustası", desc: "Toplam 5 füzyon kartı yap.", stat: "fusions", target: 5, reward: { scrap: 150 } },
  { id: "q_minigame5", icon: "🎯", title: "Keskin Refleks", desc: "5 bonus mini-oyunu kazan.", stat: "minigameWins", target: 5, reward: { bolts: 10 } },
  { id: "q_allboss", icon: "🐍", title: "Ascelding Fatihi", desc: "Üç yolun bossunu da yen.", allNodes: ["ice_boss", "earth_boss", "fire_boss"], reward: { bolts: 25 } },
];

const DEFAULT_QUEST_STATS = { breeds: 0, surgeries: 0, duelWins: 0, fusions: 0, minigameWins: 0, levelUps: 0, chestsOpened: 0 };

// Bir görevin (ilerleme, hedef, tamamlandı mı) durumunu hesaplar.
function questProgress(quest, stats, regionProgress) {
  if (quest.node) {
    const done = !!regionProgress[quest.node];
    return { value: done ? 1 : 0, target: 1, done };
  }
  if (quest.anyNode) {
    const done = quest.anyNode.some((n) => regionProgress[n]);
    return { value: done ? 1 : 0, target: 1, done };
  }
  if (quest.allNodes) {
    const value = quest.allNodes.filter((n) => regionProgress[n]).length;
    return { value, target: quest.allNodes.length, done: value >= quest.allNodes.length };
  }
  const value = Math.min(stats[quest.stat] || 0, quest.target);
  return { value, target: quest.target, done: value >= quest.target };
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
    bolts: NEW_PLAYER_BOLTS,
    energy: ENERGY_MAX + NEW_PLAYER_ENERGY_BONUS,
    lastEnergyTs: Date.now(),
    mutantCounter: 1,
    collection,
    regionProgress: {},
    speciesSeen: Object.fromEntries(STARTER_ROSTER.map((n) => [n, true])),
    questStats: DEFAULT_QUEST_STATS,
    claimedQuests: {},
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

/* ============================================================ PİKSEL SANATI CANLI + ARKAPLAN MOTORU ============================================================
   2D SVG CreatureAvatar ile AYNI mutasyon-seviyesi-rengi mantığını
   kullanan, canvas tabanlı GERÇEK piksel-sanatı render motoru (düşük
   çözünürlükte çizip büyütme + image-rendering:pixelated). Kanıt
   denemesinde onaylanan tasarım — savaş sahnelerinde (Düello + Diyar)
   kullanılıyor. WebGL gerektirmediği için 3D'nin aksine performans
   sınırı yok.
   ============================================================ */

const LIMB_PIXEL_KEY_MAP = { Kafa: "kafa", Govde: "govde", Bacak: "bacak", Ayak: "ayak", Kuyruk: "kuyruk", Pence: "pence", Goz: "goz", Zeka: "zeka" };

function limbLevelsFromAnimal(animal) {
  const levels = {};
  LIMB_TYPES.forEach((t) => {
    const limb = animal && animal.limbs ? animal.limbs[t] : null;
    levels[LIMB_PIXEL_KEY_MAP[t]] = limb ? mutationLevel(limb) : 0;
  });
  return levels;
}

const PIXEL_GRID = 32, PIXEL_PX = 6; // canlı çizim ızgarası

function hexToRgbPx(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function shadePx(hex, amount) {
  const { r, g, b } = hexToRgbPx(hex);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + amount)));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

// Bir "blob" (grid hücre kümesi) çizer: önce kalın siyah kontur, sonra düz
// renk, sonra hafif üst-sol parlaklık (cel-shade hissi). Boş uzuv (tier=null)
// soluk/yarı saydam gri olur.
function drawBlobPx(ctx, cells, level) {
  if (!cells.length) return;
  const tier = mutationTierInfo(level);
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));
  const border = new Set();
  cells.forEach(([x, y]) => {
    [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
      const k = `${x + dx},${y + dy}`;
      if (!set.has(k)) border.add(k);
    });
  });
  if (!tier) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#2A323A";
    cells.forEach(([x, y]) => ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX));
    ctx.globalAlpha = 1;
    return;
  }
  ctx.fillStyle = "#000000";
  border.forEach((k) => {
    const [x, y] = k.split(",").map(Number);
    ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX);
  });
  ctx.fillStyle = tier.color;
  cells.forEach(([x, y]) => ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX));
  if (level >= 5) {
    ctx.globalAlpha = level >= 6 ? 0.5 : 0.35;
    ctx.fillStyle = "#ffffff";
    cells.forEach(([x, y]) => ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX));
    ctx.globalAlpha = 1;
  }
  const highlight = shadePx(tier.color, 55);
  const minY = Math.min(...cells.map((c) => c[1]));
  ctx.fillStyle = highlight;
  cells.forEach(([x, y]) => { if (y <= minY + 1) ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX); });
}

function circleCellsPx(cx, cy, r, scaleX = 1, scaleY = 1) {
  const cells = [];
  for (let x = Math.floor(cx - r * scaleX); x <= Math.ceil(cx + r * scaleX); x++) {
    for (let y = Math.floor(cy - r * scaleY); y <= Math.ceil(cy + r * scaleY); y++) {
      const dx = (x - cx) / scaleX, dy = (y - cy) / scaleY;
      if (dx * dx + dy * dy <= r * r) cells.push([x, y]);
    }
  }
  return cells;
}
function rectCellsPx(x0, y0, w, h) {
  const cells = [];
  for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) cells.push([x, y]);
  return cells;
}
function triCellsPx(cx, cy, w, h, dir) {
  const cells = [];
  for (let row = 0; row < h; row++) {
    const rowW = Math.max(1, Math.round(w * (1 - row / h)));
    for (let i = 0; i < rowW; i++) cells.push([dir < 0 ? cx - i : cx + i, cy + row]);
  }
  return cells;
}

// Gerçek canlı verisinden (limbLevelsFromAnimal) chibi oranlı bir piksel
// canlı çizer. Boş uzuvlar otomatik soluk/kesikli görünür.
function drawCreaturePixel(ctx, levels) {
  ctx.clearRect(0, 0, PIXEL_GRID * PIXEL_PX, PIXEL_GRID * PIXEL_PX);
  ctx.imageSmoothingEnabled = false;

  drawBlobPx(ctx, [...rectCellsPx(21, 19, 2, 2), ...rectCellsPx(23, 20, 2, 2), ...rectCellsPx(25, 21, 2, 2)], levels.kuyruk);
  drawBlobPx(ctx, triCellsPx(8, 17, 4, 4, -1), levels.pence);
  drawBlobPx(ctx, triCellsPx(24, 17, 4, 4, 1), levels.pence);
  drawBlobPx(ctx, rectCellsPx(11, 24, 3, 3), levels.bacak);
  drawBlobPx(ctx, rectCellsPx(18, 24, 3, 3), levels.bacak);
  drawBlobPx(ctx, rectCellsPx(10, 27, 5, 2), levels.ayak);
  drawBlobPx(ctx, rectCellsPx(17, 27, 5, 2), levels.ayak);
  drawBlobPx(ctx, circleCellsPx(16, 19, 6, 1.15, 0.85), levels.govde);
  drawBlobPx(ctx, circleCellsPx(16, 10, 7.5), levels.kafa);
  drawBlobPx(ctx, [...rectCellsPx(15, 1, 1, 3), ...circleCellsPx(16, 1, 1.3)], levels.zeka);
  drawBlobPx(ctx, circleCellsPx(12, 10, 2), levels.goz);
  drawBlobPx(ctx, circleCellsPx(20, 10, 2), levels.goz);
  if (levels.goz > 0) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(11 * PIXEL_PX, 9 * PIXEL_PX, PIXEL_PX, PIXEL_PX);
    ctx.fillRect(19 * PIXEL_PX, 9 * PIXEL_PX, PIXEL_PX, PIXEL_PX);
  }
}

// --- Diyar Bossları: Yılan Görünümü ---
// Melez canlıların aksine, diyar bossları mutasyon renk sistemini KULLANMAZ
// — her element için sabit, temaya uygun bir palet var (buz=mavi, ateş=kızıl,
// toprak=kuru/kahverengi). Gerçek bir yılan gibi görünsün diye ayrı bir çizim.
const SNAKE_PALETTES = {
  ice: { head: "#7fd8ff", body: "#2c4a72", scale1: "#eafcff", scale2: "#4FA8FF", trim: "#bfe8ff", eye: "#eafcff", mouth: "#3a6a8a" },
  fire: { head: "#c8431f", body: "#8a2f12", scale1: "#ffd85a", scale2: "#ff6a2e", trim: "#ffb56b", eye: "#fff2c4", mouth: "#ff8a5a" },
  earth: { head: "#7a9a4a", body: "#5a3a24", scale1: "#d9b06a", scale2: "#8a6a3a", trim: "#c99a5a", eye: "#e8d9a0", mouth: "#8a5a3a" },
};

function dedupeCellsPx(cells) {
  const seen = new Set(); const out = [];
  cells.forEach(([x, y]) => { const k = `${x},${y}`; if (!seen.has(k)) { seen.add(k); out.push([x, y]); } });
  return out;
}

// Blob'u SABİT bir renkle çizer (mutasyon seviyesi değil) — yılan gövdesi için.
function drawFixedBlobPx(ctx, cells, colorHex) {
  if (!cells.length) return;
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));
  const border = new Set();
  cells.forEach(([x, y]) => {
    [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
      const k = `${x + dx},${y + dy}`;
      if (!set.has(k)) border.add(k);
    });
  });
  ctx.fillStyle = "#000000";
  border.forEach((k) => {
    const [x, y] = k.split(",").map(Number);
    ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX);
  });
  ctx.fillStyle = colorHex;
  cells.forEach(([x, y]) => ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX));
}

// Sinüs benzeri bir S-eğrisi boyunca küçülen daireler zinciriyle yılan gövdesi.
function drawSnakeBossPixel(ctx, element) {
  const p = SNAKE_PALETTES[element] || SNAKE_PALETTES.earth;
  ctx.clearRect(0, 0, PIXEL_GRID * PIXEL_PX, PIXEL_GRID * PIXEL_PX);
  ctx.imageSmoothingEnabled = false;

  // Omurga: kafadan (sol üst, kalın) başlayıp sağa-aşağı-sola kıvrılan bir
  // İLMEK çizer, kuyrukta incelip ilmeğin ortasını BOŞ bırakacak şekilde
  // kapanır (referans görseldeki "2" biçimi).
  const spine = [
    [9, 8, 4.3], [13, 9, 3.9], [17.5, 10, 3.7], [21.5, 11.5, 3.5],
    [24.5, 14.5, 3.4], [25.5, 18, 3.3], [24.5, 22, 3.3], [21, 25, 3.2],
    [17, 26.5, 3.0], [13, 25, 2.8], [11, 21, 2.5], [12, 17, 2.1], [14, 14, 1.6],
  ];
  let bodyCells = [];
  spine.forEach(([cx, cy, r]) => bodyCells.push(...circleCellsPx(cx, cy, r)));
  bodyCells.push(...rectCellsPx(2, 8, 5, 4)); // sivri burun
  bodyCells = dedupeCellsPx(bodyCells);
  drawFixedBlobPx(ctx, bodyCells, p.body);
  const bodySet = new Set(bodyCells.map(([x, y]) => `${x},${y}`));

  // Baş + iç kavis şeridi: kafa rengiyle, gövdenin iç (üst-sol) tarafını kaplar.
  ctx.fillStyle = p.head;
  spine.slice(0, 3).forEach(([cx, cy, r]) => {
    circleCellsPx(cx, cy, r * 0.92).forEach(([x, y]) => {
      if (bodySet.has(`${x},${y}`)) ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX);
    });
  });
  rectCellsPx(2, 8, 5, 4).forEach(([x, y]) => {
    if (bodySet.has(`${x},${y}`)) ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX);
  });
  spine.slice(3).forEach(([cx, cy, r]) => {
    circleCellsPx(cx - r * 0.35, cy - r * 0.45, r * 0.42).forEach(([x, y]) => {
      if (bodySet.has(`${x},${y}`)) ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX);
    });
  });

  // Baklava (elmas) pul deseni — gövdenin dış (kafa renginde olmayan) kısmına, 2 tonlu.
  const diamondSpots = [[19, 12], [22, 13], [24, 16], [25, 20], [22, 23], [18, 25.5], [14, 24], [11, 20], [11, 16], [20, 9.5]];
  diamondSpots.forEach(([px, py], i) => {
    ctx.fillStyle = i % 2 === 0 ? p.scale1 : p.scale2;
    circleCellsPx(px, py, 1.3).forEach(([x, y]) => {
      if (bodySet.has(`${x},${y}`)) ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX);
    });
  });

  // İnce kenar şeridi (trim) — dış hatta yakın ince vurgu çizgisi
  ctx.fillStyle = p.trim;
  spine.forEach(([cx, cy, r]) => {
    const x = Math.round(cx), y = Math.round(cy - r * 0.88);
    if (bodySet.has(`${x},${y}`)) ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX);
  });

  // Ağız: sivri burun altında açık boşluk + iki küçük diş
  ctx.fillStyle = p.mouth;
  rectCellsPx(2, 10, 5, 2).forEach(([x, y]) => ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX));
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(3 * PIXEL_PX, 9 * PIXEL_PX, PIXEL_PX, PIXEL_PX);
  ctx.fillRect(4 * PIXEL_PX, 12 * PIXEL_PX, PIXEL_PX, PIXEL_PX);

  // Göz — element rengi + siyah bebek
  ctx.fillStyle = p.eye;
  circleCellsPx(8, 6, 1.3).forEach(([x, y]) => ctx.fillRect(x * PIXEL_PX, y * PIXEL_PX, PIXEL_PX, PIXEL_PX));
  ctx.fillStyle = "#000000";
  ctx.fillRect(8 * PIXEL_PX, 6 * PIXEL_PX, PIXEL_PX, PIXEL_PX);
}

// --- Atmosferik pikselli manzara arkaplanları ---
const BG_THEMES = {
  gunbatimi: {
    label: "Gün Batımı Gölü",
    sky: ["#3a2a52", "#7a4a6e", "#e8955a", "#ffd98a"],
    sun: "#fff2c4", sunGlow: "#ffb56b",
    mountain: "#4a3a5c", mountainFar: "#2f2440",
    tree: "#1c2a1e", treeFar: "#26352a",
    water: "#3a5570", waterLine: "#c9a86a",
    stars: true,
  },
  buz: {
    label: "Buz Vadisi",
    sky: ["#0c1830", "#16264a", "#2c4a72", "#5f86ad"],
    sun: "#dff3ff", sunGlow: "#7fd8ff",
    mountain: "#3a5570", mountainFar: "#22344a",
    tree: "#16232e", treeFar: "#1e2f3c",
    water: "#1e3a52", waterLine: "#8fd9ff",
    stars: true,
  },
  atesi: {
    label: "Ateş Diyarı",
    sky: ["#1a0a08", "#4a1508", "#8a2f12", "#d8631f"],
    sun: "#ffdca0", sunGlow: "#ff6a2e",
    mountain: "#3a1810", mountainFar: "#220d08",
    tree: "#1c0d08", treeFar: "#2a140c",
    water: "#3a1810", waterLine: "#ff8a3d",
    stars: false,
  },
  toprak: {
    label: "Toprak Vadisi",
    sky: ["#2a1810", "#5a3018", "#a8622c", "#d9a15c"],
    sun: "#ffe0a8", sunGlow: "#e08a3a",
    mountain: "#5a3a24", mountainFar: "#3a2416",
    tree: "#2a1a10", treeFar: "#3a2818",
    water: "#8a6a3a", waterLine: "#d9b06a",
    stars: false,
  },
};
const BG_THEME_KEYS = Object.keys(BG_THEMES);
// Diyar yolu -> sabit arkaplan eşlemesi (hikaye tutarlılığı için rastgele değil).
const REGION_PATH_BG = { ice: "buz", earth: "toprak", fire: "atesi" };

const BGX = 64, BGY = 64, BGPX = 4;

function drawBackgroundPixel(ctx, theme) {
  const t = BG_THEMES[theme] || BG_THEMES.gunbatimi;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, BGX * BGPX, BGY * BGPX);

  const skyBands = t.sky.length;
  for (let y = 0; y < 34; y++) {
    ctx.fillStyle = t.sky[Math.min(skyBands - 1, Math.floor((y / 34) * skyBands))];
    ctx.fillRect(0, y * BGPX, BGX * BGPX, BGPX);
  }

  if (t.stars) {
    ctx.fillStyle = "#ffffff";
    [[4, 3], [10, 6], [18, 2], [25, 8], [33, 4], [40, 10], [48, 3], [55, 7], [60, 5], [15, 12], [45, 14], [8, 15]]
      .forEach(([x, y]) => ctx.fillRect(x * BGPX, y * BGPX, BGPX, BGPX));
  }

  const sunCx = 22, sunCy = 16, sunR = 5;
  ctx.fillStyle = t.sunGlow;
  ctx.globalAlpha = 0.35;
  for (let x = sunCx - sunR - 2; x <= sunCx + sunR + 2; x++) {
    for (let y = sunCy - sunR - 2; y <= sunCy + sunR + 2; y++) {
      const d = Math.hypot(x - sunCx, y - sunCy);
      if (d <= sunR + 2 && d > sunR) ctx.fillRect(x * BGPX, y * BGPX, BGPX, BGPX);
    }
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = t.sun;
  for (let x = sunCx - sunR; x <= sunCx + sunR; x++) {
    for (let y = sunCy - sunR; y <= sunCy + sunR; y++) {
      if (Math.hypot(x - sunCx, y - sunCy) <= sunR) ctx.fillRect(x * BGPX, y * BGPX, BGPX, BGPX);
    }
  }

  ctx.fillStyle = t.mountainFar;
  drawRidgePx(ctx, [[0, 30], [8, 22], [16, 28], [26, 18], [36, 26], [46, 20], [56, 27], [64, 24]], 36);
  ctx.fillStyle = t.mountain;
  drawRidgePx(ctx, [[0, 34], [10, 26], [20, 33], [30, 24], [42, 32], [52, 27], [64, 33]], 40);

  ctx.fillStyle = t.treeFar;
  for (let x = 0; x < BGX; x += 3) drawTreePx(ctx, x, 37, 2 + (x % 3));
  ctx.fillStyle = t.tree;
  for (let x = -1; x < BGX; x += 4) drawTreePx(ctx, x + (x % 2), 41, 3 + (x % 3));

  ctx.fillStyle = t.water;
  ctx.fillRect(0, 44 * BGPX, BGX * BGPX, (BGY - 44) * BGPX);
  ctx.fillStyle = t.waterLine;
  ctx.globalAlpha = 0.5;
  for (let x = 0; x < BGX; x += 2) ctx.fillRect(x * BGPX, (46 + (x % 5)) * BGPX, BGPX, BGPX);
  ctx.globalAlpha = 1;
}
function drawRidgePx(ctx, points, baseY) {
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i], [x1, y1] = points[i + 1];
    const steps = Math.max(1, x1 - x0);
    for (let s = 0; s <= steps; s++) {
      const x = x0 + s;
      const y = Math.round(y0 + (y1 - y0) * (s / steps));
      for (let fy = y; fy < baseY; fy++) ctx.fillRect(x * BGPX, fy * BGPX, BGPX, BGPX);
    }
  }
}
function drawTreePx(ctx, x, groundY, h) {
  for (let row = 0; row < h; row++) {
    const w = Math.max(1, h - row);
    for (let i = 0; i < w; i++) ctx.fillRect((x - w / 2 + i) * BGPX, (groundY - h + row) * BGPX, BGPX, BGPX);
  }
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


// --- Bonus Mini-Oyun Sistemi ---
// Round başında rastgele (ortalama her ~3.5 roundda bir, 3-5 arası değişken)
// bir "bonus fırsat" teklifi çıkar. Oyuncunun 6 saniyesi vardır, 3 mini-oyundan
// birini seçebilir ya da hiçbirini seçmeyip normal devam edebilir. Seçilen
// oyun kazanılırsa o round'a özel bir avantaj kazanılır. SADECE oyuncu için —
// rakip/bot/boss bu sistemden hiç etkilenmez.
const MINIGAME_CHANCE = 0.28; // ~ortalama her 3-4 roundda bir teklif (bazen 5)
const MINIGAME_OFFER_SECONDS = 6;

const MINIGAME_TYPES = {
  kritik: { id: "kritik", label: "Kritik Oyunu", icon: "🎯", color: "#FF6B4A",
    desc: "Kazanırsan bu round 1 vuruşun KESİN 4x kritik atar." },
  kalkan: { id: "kalkan", label: "Kalkan Oyunu", icon: "🛡️", color: "#4FA8FF",
    desc: "Kazanırsan bu round aldığın hasar ekstra %25 azalır." },
  blok: { id: "blok", label: "Engelleme Oyunu", icon: "🚫", color: "#C77DFF",
    desc: "Kazanırsan rakip bu round kartını KULLANAMAZ." },
};

// Round başında çıkan, 3 mini-oyundan birini seçtiren teklif ekranı.
function MinigameOfferModal({ onChoose, onTimeout }) {
  const [secondsLeft, setSecondsLeft] = useState(MINIGAME_OFFER_SECONDS);
  const timedOutRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          if (!timedOutRef.current) { timedOutRef.current = true; onTimeout(); }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChoose = (id) => {
    if (timedOutRef.current) return;
    timedOutRef.current = true;
    onChoose(id);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(4,6,8,0.94)" }}>
      <div className="rounded-sm p-5 max-w-sm w-full text-center" style={{ background: "#151A1F", border: "1px solid #FFD166" }}>
        <div className="font-display text-base mb-1" style={{ color: "#FFD166" }}>⚡ BONUS FIRSAT! ({secondsLeft}sn)</div>
        <div className="text-[9px] font-mono text-[#7C8894] mb-4">Bir mini-oyun seç, kazanırsan bu round avantaj kazanırsın. Seçmezsen normal devam eder.</div>
        <div className="space-y-2">
          {Object.values(MINIGAME_TYPES).map((m) => (
            <button
              key={m.id}
              onClick={() => handleChoose(m.id)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-sm border text-left"
              style={{ borderColor: m.color }}
            >
              <span className="text-[18px]">{m.icon}</span>
              <span className="flex-1">
                <span className="block text-[10px] font-mono" style={{ color: m.color }}>{m.label}</span>
                <span className="block text-[8px] font-mono text-[#7C8894] mt-0.5">{m.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Genel zamanlama mini-oyunu: ileri-geri hareket eden gösterge yeşil
// bölgedeyken ekrana dokunursan kazanırsın. Her sekmede/geri dönüşte hız
// yeniden rastgele belirlenir (ivme değişken) — ezberlenmesin diye.
function TimingMiniGame({ type, onResult }) {
  const meta = MINIGAME_TYPES[type];
  const [position, setPosition] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [success, setSuccess] = useState(false);
  const dirRef = useRef(1);
  const posRef = useRef(0);
  const speedRef = useRef(2.4 + Math.random() * 2.2);
  const resolvedRef = useRef(false);
  const intervalRef = useRef(null);
  const ZONE_START = 38, ZONE_END = 62;

  const handleTap = () => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    clearInterval(intervalRef.current);
    const hit = posRef.current >= ZONE_START && posRef.current <= ZONE_END;
    setSuccess(hit);
    setResolved(true);
    setTimeout(() => onResult(hit), 700);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      posRef.current += dirRef.current * speedRef.current;
      if (posRef.current >= 100) { posRef.current = 100; dirRef.current = -1; speedRef.current = 2.2 + Math.random() * 2.8; }
      if (posRef.current <= 0) { posRef.current = 0; dirRef.current = 1; speedRef.current = 2.2 + Math.random() * 2.8; }
      setPosition(posRef.current);
    }, 16);
    const timeout = setTimeout(() => handleTap(), 4500);
    return () => { clearInterval(intervalRef.current); clearTimeout(timeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(4,6,8,0.94)" }}
      onClick={handleTap}
    >
      <div className="rounded-sm p-5 max-w-sm w-full text-center" style={{ background: "#151A1F", border: `1px solid ${meta.color}` }}>
        <div className="font-display text-base mb-1" style={{ color: meta.color }}>{meta.icon} ZAMANLAMA</div>
        <div className="text-[9px] font-mono text-[#7C8894] mb-4">
          {resolved ? (success ? `TUTTU! ${meta.desc}` : "Kaçırdın — bonus yok, round normal devam edecek.") : "Gösterge YEŞİL bölgedeyken EKRANA DOKUN"}
        </div>
        <div className="relative h-8 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden">
          <div className="absolute top-0 bottom-0" style={{ left: `${38}%`, width: `${62 - 38}%`, background: "#5EEAD4", opacity: 0.35 }} />
          <div
            className="absolute top-0 bottom-0 w-1.5"
            style={{ left: `${position}%`, background: resolved ? (success ? "#5EEAD4" : "#FF6B4A") : "#E8EDF2", transition: "background 0.2s" }}
          />
        </div>
        {!resolved && <div className="text-[8px] font-mono text-[#2A323A] mt-3">(dokunmazsan birkaç saniye içinde otomatik değerlendirilir)</div>}
        {resolved && <div className="text-[22px] mt-3">{success ? "💥💥" : "💥"}</div>}
      </div>
    </div>
  );
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 2) Hafıza Eşleştirme: 4 çift sembol, 13sn içinde hepsini bul. Konumlar
// her seferinde karılır ki ezbere bilinmesin.
const MEMORY_SYMBOLS = ["⚔️", "🛡️", "❤️", "⚡"];
function MemoryMatchGame({ meta, onResult }) {
  const [cards] = useState(() => shuffleArray([...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]).map((sym, i) => ({ id: i, sym })));
  const [flipped, setFlipped] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [timeLeft, setTimeLeft] = useState(13);
  const [done, setDone] = useState(false);
  const [successFlag, setSuccessFlag] = useState(false);
  const lockRef = useRef(false);
  const resolvedRef = useRef(false);

  const finish = (ok) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setSuccessFlag(ok);
    setDone(true);
    setTimeout(() => onResult(ok), 700);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); finish(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (matchedIds.length === cards.length) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedIds]);

  const handleFlip = (idx) => {
    if (lockRef.current || done || flipped.includes(idx) || matchedIds.includes(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      lockRef.current = true;
      const [a, b] = next;
      if (cards[a].sym === cards[b].sym) {
        setMatchedIds((prev) => [...prev, a, b]);
        setFlipped([]);
        lockRef.current = false;
      } else {
        setTimeout(() => { setFlipped([]); lockRef.current = false; }, 550);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(4,6,8,0.94)" }}>
      <div className="rounded-sm p-5 max-w-sm w-full text-center" style={{ background: "#151A1F", border: `1px solid ${meta.color}` }}>
        <div className="font-display text-base mb-1" style={{ color: meta.color }}>{meta.icon} HAFIZA EŞLEŞTİRME</div>
        <div className="text-[9px] font-mono text-[#7C8894] mb-2">Kalan süre: {timeLeft}sn — tüm çiftleri bul</div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {cards.map((c, idx) => {
            const isUp = flipped.includes(idx) || matchedIds.includes(idx);
            return (
              <button
                key={c.id}
                onClick={() => handleFlip(idx)}
                className="aspect-square rounded-sm border flex items-center justify-center text-[18px]"
                style={{ borderColor: matchedIds.includes(idx) ? "#5EEAD4" : "#2A323A", background: isUp ? "#0B0E11" : "#1c2329" }}
              >
                {isUp ? c.sym : ""}
              </button>
            );
          })}
        </div>
        {done && <div className="text-[10px] font-mono" style={{ color: successFlag ? "#5EEAD4" : "#FF6B4A" }}>{successFlag ? "TÜMÜNÜ BULDUN!" : "SÜRE DOLDU!"}</div>}
      </div>
    </div>
  );
}

// 3) Sıralı Basma: 3 renkli buton ekranda rastgele konumlarda belirir, her
// birinin üzerinde 1-3 arası basılma sayısı yazar. Alttaki sıra (soldan
// sağa) hangi renkle başlanacağını gösterir. Süre sayısal değil, azalan
// bir çubukla gösterilir (dikkat dağıtmasın diye).
const SEQ_COLORS = [{ id: "a", color: "#FF6B4A" }, { id: "b", color: "#5EEAD4" }, { id: "c", color: "#4FA8FF" }];
function ColorSequenceGame({ meta, onResult }) {
  const DURATION = 8000;
  const [order] = useState(() => shuffleArray(SEQ_COLORS));
  const [targets] = useState(() => order.map((c) => ({ ...c, need: 1 + Math.floor(Math.random() * 3) })));
  const [positions] = useState(() => targets.map(() => ({ x: 8 + Math.random() * 72, y: 12 + Math.random() * 50 })));
  const [progress, setProgress] = useState(() => targets.map(() => 0));
  const [stepIdx, setStepIdx] = useState(0);
  const [gaugePct, setGaugePct] = useState(100);
  const [done, setDone] = useState(false);
  const [successFlag, setSuccessFlag] = useState(false);
  const resolvedRef = useRef(false);

  const finish = (ok) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setSuccessFlag(ok);
    setDone(true);
    setTimeout(() => onResult(ok), 600);
  };

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const pct = Math.max(0, 100 - ((Date.now() - start) / DURATION) * 100);
      setGaugePct(pct);
      if (pct <= 0) { clearInterval(id); finish(false); }
    }, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePress = (idx) => {
    if (done || idx !== stepIdx) return;
    setProgress((prev) => {
      const next = [...prev];
      next[idx] += 1;
      if (next[idx] >= targets[idx].need) {
        if (idx === targets.length - 1) finish(true);
        else setStepIdx(idx + 1);
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(4,6,8,0.94)" }}>
      <div className="rounded-sm p-5 max-w-sm w-full" style={{ background: "#151A1F", border: `1px solid ${meta.color}` }}>
        <div className="font-display text-base mb-1 text-center" style={{ color: meta.color }}>{meta.icon} SIRALI BASMA</div>
        <div className="text-[9px] font-mono text-[#7C8894] mb-2 text-center">Soldan sağa renk sırasıyla, üzerindeki sayı kadar bas</div>
        <div className="h-1.5 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden mb-3">
          <div className="h-full transition-all" style={{ width: `${gaugePct}%`, background: meta.color }} />
        </div>
        <div className="flex justify-center gap-2 mb-4">
          {targets.map((t, i) => (
            <div key={t.id} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-mono font-bold" style={{ background: t.color, opacity: i < stepIdx ? 0.3 : 1, color: "#0B0E11", boxShadow: i === stepIdx ? "0 0 0 2px #E8EDF2" : "none" }}>
              {i + 1}
            </div>
          ))}
        </div>
        <div className="relative" style={{ height: 160 }}>
          {targets.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => handlePress(idx)}
              disabled={done}
              className="absolute rounded-full flex items-center justify-center text-[11px] font-mono font-bold"
              style={{
                left: `${positions[idx].x}%`, top: `${positions[idx].y}%`,
                width: 46, height: 46, background: t.color, color: "#0B0E11",
                opacity: idx < stepIdx ? 0.25 : 1,
                boxShadow: idx === stepIdx ? "0 0 0 3px #E8EDF2" : "none",
              }}
            >
              {Math.max(0, t.need - progress[idx])}
            </button>
          ))}
        </div>
        {done && <div className="text-[10px] font-mono text-center mt-2" style={{ color: successFlag ? "#5EEAD4" : "#FF6B4A" }}>{successFlag ? "TAMAMLADIN!" : "SÜRE DOLDU!"}</div>}
      </div>
    </div>
  );
}

// 4) Hızlı Şarj: barı dolana kadar hızlıca dokun (5sn).
function MashMeterGame({ meta, onResult }) {
  const [charge, setCharge] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [done, setDone] = useState(false);
  const [successFlag, setSuccessFlag] = useState(false);
  const resolvedRef = useRef(false);
  const chargeRef = useRef(0);

  const finish = (ok) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setSuccessFlag(ok);
    setDone(true);
    setTimeout(() => onResult(ok), 600);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) { clearInterval(id); finish(chargeRef.current >= 100); return 0; }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTap = () => {
    if (done) return;
    chargeRef.current = Math.min(100, chargeRef.current + 6.5);
    setCharge(chargeRef.current);
    if (chargeRef.current >= 100) finish(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(4,6,8,0.94)" }} onClick={handleTap}>
      <div className="rounded-sm p-5 max-w-sm w-full text-center" style={{ background: "#151A1F", border: `1px solid ${meta.color}` }}>
        <div className="font-display text-base mb-1" style={{ color: meta.color }}>{meta.icon} HIZLI ŞARJ</div>
        <div className="text-[9px] font-mono text-[#7C8894] mb-3">Barı dolana kadar hızlıca dokun!</div>
        <div className="h-6 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden mb-2">
          <div className="h-full transition-all duration-75" style={{ width: `${charge}%`, background: meta.color }} />
        </div>
        <div className="text-[9px] font-mono text-[#2A323A]">{Math.ceil(timeLeft)}sn kaldı</div>
        {done && <div className="text-[10px] font-mono mt-2" style={{ color: successFlag ? "#5EEAD4" : "#FF6B4A" }}>{successFlag ? "DOLDU!" : "YETİŞEMEDİN!"}</div>}
      </div>
    </div>
  );
}

// 5) Anlık Yakala: 3x3 ızgarada rastgele yanan kareyi hızlıca yakala,
// 5 kez doğru yakalarsan kazanırsın (10sn).
function ReflexGridGame({ meta, onResult }) {
  const NEEDED = 5;
  const [litIdx, setLitIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [done, setDone] = useState(false);
  const [successFlag, setSuccessFlag] = useState(false);
  const resolvedRef = useRef(false);
  const hitsRef = useRef(0);
  const relightRef = useRef(null);

  const finish = (ok) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setSuccessFlag(ok);
    setDone(true);
    clearTimeout(relightRef.current);
    setTimeout(() => onResult(ok), 600);
  };

  const relight = () => {
    setLitIdx(Math.floor(Math.random() * 9));
    clearTimeout(relightRef.current);
    relightRef.current = setTimeout(relight, 850);
  };

  useEffect(() => {
    relight();
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); finish(hitsRef.current >= NEEDED); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(id); clearTimeout(relightRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTap = (idx) => {
    if (done || idx !== litIdx) return;
    hitsRef.current += 1;
    setHits(hitsRef.current);
    if (hitsRef.current >= NEEDED) finish(true);
    else relight();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(4,6,8,0.94)" }}>
      <div className="rounded-sm p-5 max-w-sm w-full text-center" style={{ background: "#151A1F", border: `1px solid ${meta.color}` }}>
        <div className="font-display text-base mb-1" style={{ color: meta.color }}>{meta.icon} ANLIK YAKALA</div>
        <div className="text-[9px] font-mono text-[#7C8894] mb-2">{hits}/{NEEDED} · {timeLeft}sn — yanan kareye hızlıca dokun</div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleTap(idx)}
              className="aspect-square rounded-sm border"
              style={{ borderColor: "#2A323A", background: idx === litIdx && !done ? meta.color : "#0B0E11" }}
            />
          ))}
        </div>
        {done && <div className="text-[10px] font-mono mt-2" style={{ color: successFlag ? "#5EEAD4" : "#FF6B4A" }}>{successFlag ? "YAKALADIN!" : "SÜRE DOLDU!"}</div>}
      </div>
    </div>
  );
}

// 6) Renk Eşleştir: üstteki hedef renge hızlıca dokun, 5 tur (10sn).
const MATCH_COLORS = ["#FF6B4A", "#5EEAD4", "#4FA8FF", "#FFD166"];
function ColorMatchGame({ meta, onResult }) {
  const ROUNDS_NEEDED = 5;
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => MATCH_COLORS[Math.floor(Math.random() * MATCH_COLORS.length)]);
  const [options, setOptions] = useState(() => shuffleArray(MATCH_COLORS));
  const [timeLeft, setTimeLeft] = useState(10);
  const [done, setDone] = useState(false);
  const [successFlag, setSuccessFlag] = useState(false);
  const resolvedRef = useRef(false);
  const roundRef = useRef(0);

  const finish = (ok) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setSuccessFlag(ok);
    setDone(true);
    setTimeout(() => onResult(ok), 600);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); finish(roundRef.current >= ROUNDS_NEEDED); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextRound = () => {
    setTarget(MATCH_COLORS[Math.floor(Math.random() * MATCH_COLORS.length)]);
    setOptions(shuffleArray(MATCH_COLORS));
  };

  const handlePick = (color) => {
    if (done || color !== target) return;
    roundRef.current += 1;
    setRound(roundRef.current);
    if (roundRef.current >= ROUNDS_NEEDED) finish(true);
    else nextRound();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(4,6,8,0.94)" }}>
      <div className="rounded-sm p-5 max-w-sm w-full text-center" style={{ background: "#151A1F", border: `1px solid ${meta.color}` }}>
        <div className="font-display text-base mb-1" style={{ color: meta.color }}>{meta.icon} RENK EŞLEŞTİR</div>
        <div className="text-[9px] font-mono text-[#7C8894] mb-2">{round}/{ROUNDS_NEEDED} · {timeLeft}sn — üstteki renge dokun</div>
        <div className="w-12 h-12 rounded-full mx-auto mb-3" style={{ background: target }} />
        <div className="grid grid-cols-4 gap-2">
          {options.map((c, i) => (
            <button key={i} onClick={() => handlePick(c)} disabled={done} className="aspect-square rounded-sm" style={{ background: c }} />
          ))}
        </div>
        {done && <div className="text-[10px] font-mono mt-2" style={{ color: successFlag ? "#5EEAD4" : "#FF6B4A" }}>{successFlag ? "TAMAMLADIN!" : "SÜRE DOLDU!"}</div>}
      </div>
    </div>
  );
}

// Dağıtıcı: hangi bonus efekti seçilirse seçilsin, 6 mekanikten rastgele
// birini gösterir — aynı efekt bile her seferinde farklı bir oyunla gelebilir.
const MINIGAME_MECHANICS = ["timing", "memory", "sequence", "mash", "reflex", "colormatch"];
function MinigameStage({ effectType, onResult }) {
  const mechanicRef = useRef(MINIGAME_MECHANICS[Math.floor(Math.random() * MINIGAME_MECHANICS.length)]);
  const meta = MINIGAME_TYPES[effectType];
  switch (mechanicRef.current) {
    case "memory": return <MemoryMatchGame meta={meta} onResult={onResult} />;
    case "sequence": return <ColorSequenceGame meta={meta} onResult={onResult} />;
    case "mash": return <MashMeterGame meta={meta} onResult={onResult} />;
    case "reflex": return <ReflexGridGame meta={meta} onResult={onResult} />;
    case "colormatch": return <ColorMatchGame meta={meta} onResult={onResult} />;
    default: return <TimingMiniGame type={effectType} onResult={onResult} />;
  }
}

/* ============================================================ DİYAR (BÖLGE) ARAYÜZÜ ============================================================ */

// Bir düğümün (küçük boss / büyük boss) o yoldaki sırasına göre kilitli olup
// olmadığını hesaplar — bir öncekini yenmeden bir sonrakine geçilemez.
function isNodeUnlocked(path, nodeIdx, regionProgress) {
  if (nodeIdx === 0) return true;
  const prevNode = path.nodes[nodeIdx - 1];
  return !!regionProgress[prevNode.id];
}

function RegionHubView({ onSelectRegion, regionProgress }) {
  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono text-[#7C8894]">
        Farklı diyarlarda, kendi hikayesi ve özel yetenekleri olan bosslarla karşılaşacaksın.
      </div>
      {Object.values(REGIONS).map((region) => {
        const allNodes = region.paths.flatMap((p) => p.nodes);
        const defeated = allNodes.filter((n) => regionProgress[n.id]).length;
        return (
          <button
            key={region.id}
            onClick={() => onSelectRegion(region.id)}
            className="w-full text-left bg-[#151A1F] border border-[#2A323A] rounded-sm p-4 hover:border-[#5EEAD4] transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="font-display text-base text-[#E8EDF2]">{region.name}</div>
              <div className="text-[9px] font-mono" style={{ color: defeated === allNodes.length ? "#5EEAD4" : "#7C8894" }}>{defeated}/{allNodes.length} 👑</div>
            </div>
            <div className="text-[9px] font-mono text-[#7C8894] mt-1">{region.subtitle}</div>
            <div className="flex gap-2 mt-2">
              {region.paths.map((p) => (
                <span key={p.id} className="text-[8px] font-mono px-2 py-1 rounded-sm border" style={{ borderColor: p.color, color: p.color }}>{p.label}</span>
              ))}
            </div>
          </button>
        );
      })}
      <div className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-4 text-center text-[9px] font-mono text-[#2A323A]">
        🔒 Yeni diyarlar yakında...
      </div>
    </div>
  );
}

function RegionPathMap({ region, regionProgress, onBack, onSelectNode }) {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-[9px] font-mono text-[#7C8894]">← Diyarlara dön</button>
      <div className="text-center">
        <div className="font-display text-lg text-[#E8EDF2]">{region.name}</div>
        <div className="text-[9px] font-mono text-[#7C8894]">{region.subtitle}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {region.paths.map((path) => (
          <div key={path.id} className="flex flex-col items-center gap-2">
            <div className="text-[8px] font-mono tracking-wide" style={{ color: path.color }}>{path.label}</div>
            {/* Yol düğümleri BOSS'tan (üstte) safkana (altta) doğru değil,
                başlangıçtan (üstte) boss'a (altta) doğru sırayla listelenir. */}
            {path.nodes.map((node, idx) => {
              const unlocked = isNodeUnlocked(path, idx, regionProgress);
              const cleared = !!regionProgress[node.id];
              return (
                <React.Fragment key={node.id}>
                  {idx > 0 && <div className="w-0.5 h-3" style={{ background: unlocked ? path.color : "#2A323A" }} />}
                  <button
                    onClick={() => unlocked && onSelectNode(path, node)}
                    disabled={!unlocked}
                    className="relative w-14 h-14 rounded-full border-2 flex items-center justify-center text-[18px] disabled:opacity-30"
                    style={{ borderColor: cleared ? "#5EEAD4" : (unlocked ? path.color : "#2A323A"), background: "#151A1F" }}
                  >
                    {!unlocked ? "🔒" : node.isBoss ? "👑" : "🐍"}
                    {cleared && <span className="absolute -top-1 -right-1 text-[10px]">✓</span>}
                  </button>
                  <div className="text-[7px] font-mono text-[#7C8894] text-center leading-tight">{node.name}</div>
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function RegionBossFightView({ pool, node, path, energy, energyMsLeft, onSpendEnergy, onNodeReward, onQuestStat, onBack }) {
  const names = Object.keys(pool);
  const [fighterName, setFighterName] = useState(names[0]);
  const [duel, setDuel] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rewardMsg, setRewardMsg] = useState(null);
  const [revealIndex, setRevealIndex] = useState(0);
  const [revealToken, setRevealToken] = useState(0);
  const [shakeSide, setShakeSide] = useState(null);
  const [floatTexts, setFloatTexts] = useState([]);
  const [hitEvent, setHitEvent] = useState(null); // savaş sahnesini beslemek için
  const [showDefeatFx, setShowDefeatFx] = useState(false);
  const [showVictoryFx, setShowVictoryFx] = useState(false);
  const fxTriggeredRef = useRef(false);
  const [offerActive, setOfferActive] = useState(false);
  const [activeMinigame, setActiveMinigame] = useState(null);
  const [pendingBonus, setPendingBonus] = useState(null);
  const offeredRoundRef = useRef(0);
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

  useEffect(() => {
    if (!duel || duel.phase !== "choosing") return;
    if (offeredRoundRef.current === duel.round) return;
    offeredRoundRef.current = duel.round;
    if (Math.random() < MINIGAME_CHANCE) setOfferActive(true);
  }, [duel?.round, duel?.phase]);

  const handleOfferChoose = (type) => { setOfferActive(false); setActiveMinigame(type); };
  const handleOfferTimeout = () => setOfferActive(false);
  const handleMinigameResult = (success) => {
    const type = activeMinigame;
    setActiveMinigame(null);
    if (success) { setPendingBonus(type); onQuestStat?.("minigameWins"); }
  };

  // Round çözüldükten sonra vuruş-vuruş açılım: her vuruşta hedefi salla,
  // uçan hasar sayısı göster, en sonunda gerçek round sonucunu uygula.
  // (Bu efekt daha önce eksikti — round "ÇÖZÜLÜYOR" ekranında sonsuza kadar
  // takılı kalıyordu. Diyar dövüşleri için kritik bir düzeltme.)
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
        setHitEvent({ id: `${revealToken}-${i}`, targetSide: entry.targetSide, dmg: entry.dmg, crit: entry.crit, dodged: entry.dodged });
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

  // Round bitince (finished) kazanç/kayıp efektini tetikler — her "finished"
  // durumu için sadece bir kez (fxTriggeredRef ile korunuyor).
  useEffect(() => {
    if (duel?.phase === "finished" && !fxTriggeredRef.current) {
      fxTriggeredRef.current = true;
      const won = duel.winner === duel.playerUnit.name;
      if (won) setShowVictoryFx(true);
      else setShowDefeatFx(true);
    }
    if (duel?.phase !== "finished") fxTriggeredRef.current = false;
  }, [duel?.phase, duel?.winner]);

  const nodePreview = React.useMemo(() => createRegionBossAnimal(node), [node]);
  const nodeStats = totalStats(nodePreview);

  const startFight = () => {
    if (energy < node.energyCost || !fighterName) return;
    onSpendEnergy(node.energyCost);
    const fighter = pool[fighterName];
    const s1 = totalStats(fighter);
    const boss = createRegionBossAnimal(node);
    const s2 = totalStats(boss);
    setSelectedIds([]);
    setHistoryOpen(false);
    setRewardMsg(null);
    setFloatTexts([]);
    setShakeSide(null);
    setOfferActive(false);
    setActiveMinigame(null);
    setPendingBonus(null);
    setShowDefeatFx(false);
    setShowVictoryFx(false);
    fxTriggeredRef.current = false;
    offeredRoundRef.current = 0;
    setDuel({
      playerUnit: { name: fighter.name, hp: s1.hp, maxHp: s1.hp, attack: s1.attack, armor: s1.armor, armorUsed: false },
      oppUnit: { name: boss.name, hp: s2.hp, maxHp: s2.hp, attack: s2.attack, armor: s2.armor, armorUsed: false },
      round: 1,
      hand: [dealCard()],
      log: [],
      history: [],
      phase: "choosing",
      winner: null,
      pending: null,
      fireBurn: 0,
    });
  };

  const toggleSelect = (cardId) => {
    setSelectedIds((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId);
      if (prev.length >= 2) return prev;
      return [...prev, cardId];
    });
  };

  const handleFuse = () => {
    let fusedOk = false;
    setDuel((d) => {
      if (!d) return d;
      const selected = d.hand.filter((c) => selectedIds.includes(c.id));
      if (selected.length !== 2 || selected.some((c) => c.defIds.length > 1)) return d;
      const remaining = d.hand.filter((c) => !selectedIds.includes(c.id));
      const fused = fuseCards(selected);
      fusedOk = true;
      return { ...d, hand: capHand([...remaining, fused]) };
    });
    if (fusedOk) onQuestStat?.("fusions");
    setSelectedIds([]);
  };

  const initiateRound = () => {
    if (!duel || duel.phase !== "choosing") return;
    const playerCard = duel.hand.find((c) => selectedIds.includes(c.id)) || null;
    executeRound(playerCard);
  };

  const executeRound = (playerCard) => {
    const bonusType = pendingBonus;
    const playerBonus = bonusType === "kritik" ? { forceCrit: true, superCrit: true }
      : bonusType === "kalkan" ? { extraDefense: true }
      : bonusType === "blok" ? { blockOppCard: true }
      : {};
    setPendingBonus(null);
    setDuel((d) => {
      if (!d || d.phase !== "choosing") return d;
      const remainingHand = d.hand.filter((c) => c.id !== playerCard?.id);
      const oppCard = dealCard();

      const playerUnit = { ...d.playerUnit };
      const oppUnit = { ...d.oppUnit };
      const playerFrozen = !!(node.special.freezeEvery && d.round % node.special.freezeEvery === 0);
      const { log, summary } = resolveRound(playerUnit, oppUnit, playerCard, oppCard, playerBonus, node.special, playerFrozen);

      // Ateş Yılanı: her round sonunda katlanarak artan yakma hasarı.
      let fireBurn = d.fireBurn || 0;
      let burnApplied = 0;
      if (node.special.burn && summary.oDealt > 0 && playerUnit.hp > 0) {
        const baseline = Math.round(summary.oDealt * 0.2);
        fireBurn = fireBurn > 0 ? Math.min(160, fireBurn * 2) : baseline;
        burnApplied = fireBurn;
        playerUnit.hp -= burnApplied;
        log.push({ kind: "crit", text: `🔥 ${oppUnit.name} yakma hasarı verdi: ${burnApplied.toFixed(1)}`, targetSide: "player", dmg: burnApplied, crit: false, dodged: false, reflect: 0, playerHpAfter: playerUnit.hp, oppHpAfter: oppUnit.hp });
      }

      const finished = playerUnit.hp <= 0 || oppUnit.hp <= 0;
      const winner = finished ? (playerUnit.hp > 0 ? playerUnit.name : oppUnit.name) : null;

      if (finished) {
        const won = winner === playerUnit.name;
        if (won) {
          const amount = onNodeReward(node);
          setRewardMsg(`👑 ${node.name} DÜŞTÜ! +${amount} HURDA`);
        } else {
          setRewardMsg(`${node.name} seni geri püskürttü. Daha güçlü dön.`);
        }
      }

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
        fireBurn,
        pending: {
          log, finished, winner, historyEntry,
          finalPlayerUnit: playerUnit, finalOppUnit: oppUnit,
          newHand: finished ? remainingHand : capHand([...remainingHand, dealCard()]),
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
  const safeRevealIndex = revealing ? Math.min(revealIndex, duel.pending.log.length) : 0;
  const revealSnapshot = revealing && safeRevealIndex > 0 ? duel.pending.log[safeRevealIndex - 1] : null;
  const displayedPlayerHp = revealing ? (revealSnapshot ? revealSnapshot.playerHpAfter : duel.playerUnit.hp) : duel?.playerUnit.hp ?? 0;
  const displayedOppHp = revealing ? (revealSnapshot ? revealSnapshot.oppHpAfter : duel.oppUnit.hp) : duel?.oppUnit.hp ?? 0;
  const visibleLog = revealing ? duel.pending.log.slice(0, safeRevealIndex) : (duel?.log ?? []);

  return (
    <div className="space-y-4">
      {offerActive && <MinigameOfferModal onChoose={handleOfferChoose} onTimeout={handleOfferTimeout} />}
      {activeMinigame && <MinigameStage effectType={activeMinigame} onResult={handleMinigameResult} />}

      <button onClick={onBack} className="text-[9px] font-mono text-[#7C8894]">← Haritaya dön</button>

      <div className="bg-[#151A1F] border rounded-sm p-4" style={{ borderColor: path.color }}>
        <div className="flex gap-3">
          <div className="flex-shrink-0 bg-[#0B0E11] border rounded-sm p-1" style={{ borderColor: path.color }}>
            <CreatureAvatar animal={nodePreview} size={56} />
          </div>
          <div>
            <div className="font-display text-base" style={{ color: path.color }}>{node.isBoss ? "👑" : "🐍"} {node.name}</div>
            <div className="text-[9px] text-[#7C8894] font-mono mt-1">{node.desc}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-[#7C8894] mt-2">
          <div>HP <span className="text-[#E8EDF2]">{nodeStats.hp.toFixed(0)}</span></div>
          <div>ATK <span className="text-[#E8EDF2]">{nodeStats.attack.toFixed(0)}</span></div>
          <div>ZIRH <span className="text-[#E8EDF2]">{nodeStats.armor.toFixed(0)}</span></div>
        </div>
      </div>

      {!duel && (
        <>
          <AnimalPicker label="ŞAMPİYONUN" value={fighterName} onChange={setFighterName} options={names} />
          <button
            onClick={startFight}
            disabled={energy < node.energyCost || !fighterName}
            className="w-full font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm transition-colors font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: path.color, color: "#0B0E11" }}
          >
            ⚔ MEYDAN OKU ({node.energyCost} ⚡)
          </button>
          {energy < node.energyCost && (
            <div className="text-[10px] font-mono text-[#7C8894] text-center -mt-2">Yetersiz enerji · dolum: {formatCountdown(energyMsLeft)}</div>
          )}
        </>
      )}

      {rewardMsg && (
        <div className="text-center text-[11px] font-mono py-1 rounded-sm border border-[#2A323A]" style={{ color: path.color }}>{rewardMsg}</div>
      )}

      {duel && (
        <>
          {showVictoryFx && (
            <SnakeFleeCutscene element={path.id} onDone={() => setShowVictoryFx(false)} />
          )}
          {showDefeatFx && <DefeatShatterOverlay onDone={() => setShowDefeatFx(false)} />}
          <PixelBattleStage
            playerName={duel.playerUnit.name} playerHp={displayedPlayerHp} playerMaxHp={duel.playerUnit.maxHp}
            playerArmorUsed={duel.playerUnit.armorUsed} playerAvatar={pool[fighterName] || duel.playerUnit}
            oppName={duel.oppUnit.name} oppHp={displayedOppHp} oppMaxHp={duel.oppUnit.maxHp}
            oppArmorUsed={duel.oppUnit.armorUsed} oppAvatar={nodePreview}
            vsColor={path.color} oppBarColor={path.color} hitEvent={hitEvent}
            bgTheme={REGION_PATH_BG[path.id] || "gunbatimi"}
            oppKind="snake" oppElement={path.id}
          />

          <div className="text-center text-[10px] font-mono" style={{ color: path.color }}>ROUND {duel.round}</div>

          {pendingBonus && (
            <div className="text-center text-[10px] font-mono py-1.5 rounded-sm border" style={{ borderColor: MINIGAME_TYPES[pendingBonus].color, color: MINIGAME_TYPES[pendingBonus].color }}>
              {MINIGAME_TYPES[pendingBonus].icon} {MINIGAME_TYPES[pendingBonus].label} AKTİF — bu round oynadığında uygulanacak
            </div>
          )}

          {duel.phase === "choosing" && (
            <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3">
              <div className="text-[9px] font-mono text-[#7C8894] mb-2">
                ELİNDEKİ KARTLAR ({duel.hand.length}/{MAX_HAND_SIZE}) — en fazla 2 seç, birleştirmek için
              </div>
              <CardRail hand={duel.hand} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
              {selectedIds.length === 2 ? (
                canFuse ? (
                  <button onClick={handleFuse} className="w-full font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm font-bold mt-3" style={{ background: "#C77DFF", color: "#0B0E11" }}>
                    🔗 BİRLEŞTİR (oynamaz, ele eklenir)
                  </button>
                ) : (
                  <div className="text-[9px] text-[#FF6B4A] font-mono text-center mt-3">Sadece iki TEMEL kart birleştirilebilir.</div>
                )
              ) : (
                <button
                  onClick={initiateRound}
                  className="w-full font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm font-bold mt-3"
                  style={{ background: selectedIds.length > 0 ? path.color : "#151A1F", color: selectedIds.length > 0 ? "#0B0E11" : "#7C8894", border: "1px solid #2A323A" }}
                >
                  {playButtonLabel}
                </button>
              )}
            </div>
          )}

          {duel.phase === "revealing" && (
            <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3 text-center">
              <div className="font-mono text-[11px]" style={{ color: path.color }}>⚔ ROUND ÇÖZÜLÜYOR...</div>
            </div>
          )}

          {duel.phase === "waiting" && (
            <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm p-3 text-center">
              <div className="font-mono text-[11px] mb-2" style={{ color: path.color }}>✓ ROUND {duel.round - 1} BİTTİ</div>
              <button onClick={skipWait} className="text-[9px] font-mono px-3 py-1.5 rounded-sm border border-[#2A323A] text-[#7C8894]">⏩ HEMEN DEVAM ET</button>
            </div>
          )}

          {duel.phase === "finished" && (
            <div className="border rounded-sm p-4 text-center" style={{ borderColor: duel.winner === duel.playerUnit.name ? "#5EEAD4" : "#FF6B4A" }}>
              <div className="font-mono text-sm font-bold" style={{ color: duel.winner === duel.playerUnit.name ? "#5EEAD4" : "#FF6B4A" }}>
                {duel.winner === duel.playerUnit.name ? "🏆 KAZANDIN" : "💀 KAYBETTİN"}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setDuel(null)} className="flex-1 text-[10px] font-mono px-4 py-2 rounded-sm border border-[#2A323A] text-[#E8EDF2]">TEKRAR DÖVÜŞ</button>
                <button onClick={onBack} className="flex-1 text-[10px] font-mono px-4 py-2 rounded-sm border border-[#2A323A] text-[#E8EDF2]">HARİTAYA DÖN</button>
              </div>
            </div>
          )}

          <button onClick={() => setHistoryOpen((v) => !v)} className="w-full flex justify-between items-center text-[10px] font-mono px-3 py-2 rounded-sm border border-[#2A323A] text-[#7C8894]">
            <span>⚔️ Round Geçmişi ({duel.history.length})</span>
            <span>{historyOpen ? "▲" : "▼"}</span>
          </button>
          {historyOpen && (
            <div className="space-y-2">
              {duel.history.map((h, i) => (
                <div key={i} className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-2 text-[9px] font-mono">
                  <div className="mb-1" style={{ color: path.color }}>ROUND {h.round}</div>
                  <div className="text-[#7C8894]">Sen: {h.summary.pDealt.toFixed(1)} verdi / {h.summary.pBlocked.toFixed(1)} bloklandı / {h.summary.pTaken.toFixed(1)} aldı{h.playerCard && <span> · kart: {cardDisplay(h.playerCard).name}</span>}</div>
                  <div className="text-[#7C8894]">Rakip: {h.summary.oDealt.toFixed(1)} verdi / {h.summary.oBlocked.toFixed(1)} bloklandı / {h.summary.oTaken.toFixed(1)} aldı{h.oppCard && <span> · kart: {cardDisplay(h.oppCard).name}</span>}</div>
                  <div className="text-[#2A323A] mt-1">Round sonu can: Sen {h.playerHpAfter.toFixed(0)} — Rakip {h.oppHpAfter.toFixed(0)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#0B0E11] border border-[#2A323A] rounded-sm p-3 h-40 overflow-y-auto font-mono text-[10px]">
            {visibleLog.map((entry, i) => (
              <div key={i} className="py-0.5" style={{ color: entry.kind === "crit" ? "#FF6B4A" : entry.kind === "dodge" ? "#5EEAD4" : entry.kind === "frozen" ? "#4FA8FF" : "#E8EDF2" }}>
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

// Piksel Savaş Sahnesi — iki canlıyı gerçek canvas piksel-sanatı render'ıyla
// (bkz. kanıt denemesi) karşı karşıya gösterir. "hitEvent" ({id, targetSide,
// dmg, crit, dodged}) her yeni vuruşta değişir ve animasyonu tetikler.
// "bgTheme" (BG_THEMES anahtarı) atmosferik arkaplanı belirler. WebGL
// gerektirmediği için performans sınırı yok — Düello ve Diyar dövüşlerinde
// kullanılıyor.
function PixelBattleStage({
  playerName, playerHp, playerMaxHp, playerArmorUsed, playerAvatar,
  oppName, oppHp, oppMaxHp, oppArmorUsed, oppAvatar,
  vsColor, oppBarColor, hitEvent, bgTheme, oppKind = "creature", oppElement,
}) {
  const bgCanvasRef = useRef(null);
  const playerCanvasRef = useRef(null);
  const oppCanvasRef = useRef(null);
  const [shakeSide, setShakeSide] = useState(null);
  const [floatTexts, setFloatTexts] = useState([]);
  const lastHitIdRef = useRef(null);
  const shakeTimerRef = useRef(null);

  useEffect(() => {
    if (bgCanvasRef.current) drawBackgroundPixel(bgCanvasRef.current.getContext("2d"), bgTheme);
  }, [bgTheme]);

  useEffect(() => {
    if (playerCanvasRef.current) drawCreaturePixel(playerCanvasRef.current.getContext("2d"), limbLevelsFromAnimal(playerAvatar));
  }, [playerAvatar]);
  useEffect(() => {
    if (!oppCanvasRef.current) return;
    const ctx = oppCanvasRef.current.getContext("2d");
    if (oppKind === "snake") drawSnakeBossPixel(ctx, oppElement);
    else drawCreaturePixel(ctx, limbLevelsFromAnimal(oppAvatar));
  }, [oppAvatar, oppKind, oppElement]);

  useEffect(() => {
    if (!hitEvent || hitEvent.id === lastHitIdRef.current) return;
    lastHitIdRef.current = hitEvent.id;
    if (hitEvent.dodged) {
      setFloatTexts((prev) => [...prev.slice(-4), { id: Math.random().toString(36).slice(2), side: hitEvent.targetSide, text: "MISS", color: "#5EEAD4" }]);
      return;
    }
    setShakeSide(hitEvent.targetSide);
    clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => setShakeSide(null), 380);
    const color = hitEvent.crit ? "#FF6B4A" : "#E8EDF2";
    setFloatTexts((prev) => [...prev.slice(-4), { id: Math.random().toString(36).slice(2), side: hitEvent.targetSide, text: `-${hitEvent.dmg.toFixed(1)}${hitEvent.crit ? " 💥" : ""}`, color }]);
  }, [hitEvent]);

  useEffect(() => () => clearTimeout(shakeTimerRef.current), []);

  return (
    <div>
      <div className="flex justify-between text-[10px] font-mono text-[#7C8894] mb-1">
        <span>{playerName}</span>
        <span style={{ color: vsColor }}>VS</span>
        <span>{oppName}</span>
      </div>
      <div style={{ position: "relative", width: "100%", aspectRatio: "1.5 / 1", borderRadius: 4, overflow: "hidden", border: "1px solid #2A323A", background: "#0B0E11" }}>
        <canvas
          ref={bgCanvasRef}
          width={BGX * BGPX}
          height={BGY * BGPX}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", imageRendering: "pixelated" }}
        />
        <div className={`absolute ${shakeSide === "player" ? "hb-shake" : ""}`} style={{ left: "14%", bottom: "4%", width: "34%", aspectRatio: "1/1" }}>
          <div className={shakeSide === "player" ? "hb-flash" : ""} style={{ width: "100%", height: "100%", position: "relative" }}>
            <canvas ref={playerCanvasRef} width={PIXEL_GRID * PIXEL_PX} height={PIXEL_GRID * PIXEL_PX} style={{ width: "100%", height: "100%", imageRendering: "pixelated" }} />
          </div>
          {floatTexts.filter((f) => f.side === "player").map((f) => (
            <div key={f.id} className="hb-float absolute left-1/2 top-0 -translate-x-1/2 text-[11px] font-mono font-bold whitespace-nowrap pointer-events-none" style={{ color: f.color }}>
              {f.text}
            </div>
          ))}
        </div>
        <div className={`absolute ${shakeSide === "opp" ? "hb-shake" : ""}`} style={{ right: "14%", bottom: "4%", width: "34%", aspectRatio: "1/1" }}>
          <div className={shakeSide === "opp" ? "hb-flash" : ""} style={{ width: "100%", height: "100%", position: "relative", transform: oppKind === "snake" ? "none" : "scaleX(-1)" }}>
            <canvas ref={oppCanvasRef} width={PIXEL_GRID * PIXEL_PX} height={PIXEL_GRID * PIXEL_PX} style={{ width: "100%", height: "100%", imageRendering: "pixelated" }} />
          </div>
          {floatTexts.filter((f) => f.side === "opp").map((f) => (
            <div key={f.id} className="hb-float absolute left-1/2 top-0 -translate-x-1/2 text-[11px] font-mono font-bold whitespace-nowrap pointer-events-none" style={{ color: f.color }}>
              {f.text}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <div className="flex-1">
          <div className="h-2.5 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden">
            <div className="h-full bg-[#5EEAD4] transition-all duration-300" style={{ width: `${Math.max(0, playerHp / playerMaxHp) * 100}%` }} />
          </div>
          <div className="h-1 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden mt-0.5">
            <div className="h-full bg-[#4FA8FF] transition-all duration-300" style={{ width: playerArmorUsed ? "0%" : "100%" }} />
          </div>
          <div className="text-[8px] font-mono text-[#7C8894] mt-0.5">{Math.max(0, playerHp).toFixed(0)}/{playerMaxHp.toFixed(0)}</div>
        </div>
        <div className="flex-1">
          <div className="h-2.5 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden">
            <div className="h-full transition-all duration-300 ml-auto" style={{ width: `${Math.max(0, oppHp / oppMaxHp) * 100}%`, background: oppBarColor }} />
          </div>
          <div className="h-1 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden mt-0.5">
            <div className="h-full bg-[#4FA8FF] transition-all duration-300 ml-auto" style={{ width: oppArmorUsed ? "0%" : "100%" }} />
          </div>
          <div className="text-[8px] font-mono text-[#7C8894] mt-0.5 text-right">{Math.max(0, oppHp).toFixed(0)}/{oppMaxHp.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}


// Yenilgi efekti: 2 saniyeliğine kırmızı "YOU LOST" yazısı + oyuncunun
// mekanik parçalarının etrafa savrulması. Süre dolunca onDone çağrılır
// (normal "KAYBETTİN" paneli o zaman gösterilir).
function DefeatShatterOverlay({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shards = React.useMemo(() => {
    const colors = ["#8B95A1", "#4FA8FF", "#6FBF9E", "#E4E8ED", "#C77DFF", "#7C8894"];
    return Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 90 + Math.random() * 140;
      return {
        id: i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 30,
        rot: Math.random() * 360 - 180,
        size: 5 + Math.random() * 9,
        color: colors[i % colors.length],
        delay: Math.random() * 0.15,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" style={{ background: "rgba(80,10,10,0.3)" }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0 }}>
        {shards.map((s) => (
          <div
            key={s.id}
            style={{
              position: "absolute", left: 0, top: 0, width: s.size, height: s.size, background: s.color,
              "--dx": `${s.dx}px`, "--dy": `${s.dy}px`, "--rot": `${s.rot}deg`,
              animation: `hb-shatter 1.1s ease-out ${s.delay}s forwards`,
            }}
          />
        ))}
      </div>
      <div
        className="font-display"
        style={{ fontSize: 34, color: "#FF3B3B", letterSpacing: 5, textShadow: "0 0 16px rgba(255,59,59,0.9)", animation: "hb-defeatpop 0.4s ease-out" }}
      >
        YOU LOST
      </div>
    </div>
  );
}

// Zafer ara sahnesi (SADECE Diyar/yılan dövüşleri için): savaş ekranının
// üstünde değil, TAM EKRAN ayrı bir sahne olarak — yılan uzaklaşarak küçülüp
// kaçar. Süre dolunca onDone çağrılır.
function SnakeFleeCutscene({ element, onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) drawSnakeBossPixel(canvasRef.current.getContext("2d"), element);
  }, [element]);

  useEffect(() => {
    const t = setTimeout(() => onDone(), 2400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: "#0B0E11" }}>
      <div className="font-display text-lg text-[#5EEAD4] mb-4" style={{ letterSpacing: 3 }}>ZAFER</div>
      <div style={{ position: "relative", width: "55%", maxWidth: 260, aspectRatio: "1/1", overflow: "visible" }}>
        <canvas
          ref={canvasRef}
          width={PIXEL_GRID * PIXEL_PX}
          height={PIXEL_GRID * PIXEL_PX}
          style={{ width: "100%", height: "100%", imageRendering: "pixelated", animation: "hb-snakeflee 2.2s ease-in forwards" }}
        />
      </div>
      <div className="font-mono text-[10px] text-[#7C8894] mt-6" style={{ letterSpacing: 1 }}>Düşman uzaklara doğru kaçtı...</div>
    </div>
  );
}

function DuelView({ pool, energy, energyMsLeft, onSpendEnergy, onQuestStat }) {
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
  const [hitEvent, setHitEvent] = useState(null); // savaş sahnesini beslemek için
  const [bgTheme, setBgTheme] = useState("gunbatimi");
  const [showDefeatFx, setShowDefeatFx] = useState(false);
  const fxTriggeredRef = useRef(false);
  const [offerActive, setOfferActive] = useState(false);
  const [activeMinigame, setActiveMinigame] = useState(null);
  const [pendingBonus, setPendingBonus] = useState(null);
  const offeredRoundRef = useRef(0);
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
        setHitEvent({ id: `${revealToken}-${i}`, targetSide: entry.targetSide, dmg: entry.dmg, crit: entry.crit, dodged: entry.dodged });
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

  // Round bitince (finished) yenilgi efektini tetikler — her "finished"
  // durumu için sadece bir kez.
  useEffect(() => {
    if (duel?.phase === "finished" && !fxTriggeredRef.current) {
      fxTriggeredRef.current = true;
      const won = duel.winner === duel.playerUnit.name;
      if (!won) setShowDefeatFx(true);
    }
    if (duel?.phase !== "finished") fxTriggeredRef.current = false;
  }, [duel?.phase, duel?.winner]);

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
    setOfferActive(false);
    setActiveMinigame(null);
    setPendingBonus(null);
    setShowDefeatFx(false);
    fxTriggeredRef.current = false;
    offeredRoundRef.current = 0;
    setBgTheme(BG_THEME_KEYS[Math.floor(Math.random() * BG_THEME_KEYS.length)]);
    setDuel({
      playerUnit: { name: fighter.name, hp: s1.hp, maxHp: s1.hp, attack: s1.attack, armor: s1.armor, armorUsed: false },
      oppUnit: { name: bot.name, hp: s2.hp, maxHp: s2.hp, attack: s2.attack, armor: s2.armor, armorUsed: false },
      oppAnimal: bot,
      round: 1,
      hand: [dealCard()],
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
    let fusedOk = false;
    setDuel((d) => {
      if (!d) return d;
      const selected = d.hand.filter((c) => selectedIds.includes(c.id));
      if (selected.length !== 2 || selected.some((c) => c.defIds.length > 1)) return d;
      const remaining = d.hand.filter((c) => !selectedIds.includes(c.id));
      const fused = fuseCards(selected);
      fusedOk = true;
      return { ...d, hand: capHand([...remaining, fused]) };
    });
    if (fusedOk) onQuestStat?.("fusions");
    setSelectedIds([]);
  };

  // Round oynama artık 2 aşamalı: eğer oynanan kart Kritik içeriyorsa önce
  // zamanlama mini-oyunu açılır (4x mi 2x mi olacağını belirler), sonra
  // gerçek round matematiği çalışır.
  // Round başına 1 kez: rastgele bonus mini-oyun teklifi çıkabilir.
  useEffect(() => {
    if (!duel || duel.phase !== "choosing") return;
    if (offeredRoundRef.current === duel.round) return;
    offeredRoundRef.current = duel.round;
    if (Math.random() < MINIGAME_CHANCE) setOfferActive(true);
  }, [duel?.round, duel?.phase]);

  const handleOfferChoose = (type) => { setOfferActive(false); setActiveMinigame(type); };
  const handleOfferTimeout = () => setOfferActive(false);
  const handleMinigameResult = (success) => {
    const type = activeMinigame;
    setActiveMinigame(null);
    if (success) { setPendingBonus(type); onQuestStat?.("minigameWins"); }
  };

  const initiateRound = () => {
    if (!duel || duel.phase !== "choosing") return;
    const playerCard = duel.hand.find((c) => selectedIds.includes(c.id)) || null;
    executeRound(playerCard);
  };

  const executeRound = (playerCard) => {
    const bonusType = pendingBonus;
    const playerBonus = bonusType === "kritik" ? { forceCrit: true, superCrit: true }
      : bonusType === "kalkan" ? { extraDefense: true }
      : bonusType === "blok" ? { blockOppCard: true }
      : {};
    setPendingBonus(null);
    setDuel((d) => {
      if (!d || d.phase !== "choosing") return d;
      const remainingHand = d.hand.filter((c) => c.id !== playerCard?.id);

      const oppCard = dealCard(); // rakip round başına 1 kart alır, direkt oynar

      const playerUnit = { ...d.playerUnit };
      const oppUnit = { ...d.oppUnit };
      const { log, summary } = resolveRound(playerUnit, oppUnit, playerCard, oppCard, playerBonus);

      const finished = playerUnit.hp <= 0 || oppUnit.hp <= 0;
      const winner = finished ? (playerUnit.hp > 0 ? playerUnit.name : oppUnit.name) : null;
      if (finished && winner === playerUnit.name) onQuestStat?.("duelWins");

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
          newHand: finished ? remainingHand : capHand([...remainingHand, dealCard()]),
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
      {offerActive && <MinigameOfferModal onChoose={handleOfferChoose} onTimeout={handleOfferTimeout} />}
      {activeMinigame && <MinigameStage effectType={activeMinigame} onResult={handleMinigameResult} />}
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
            Düello, round bazlı kart sistemiyle oynanır: her round 1 kart alırsın, hemen oynayabilir ya da saklayıp
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
          {showDefeatFx && <DefeatShatterOverlay onDone={() => setShowDefeatFx(false)} />}
          <PixelBattleStage
            playerName={duel.playerUnit.name} playerHp={displayedPlayerHp} playerMaxHp={duel.playerUnit.maxHp}
            playerArmorUsed={duel.playerUnit.armorUsed} playerAvatar={pool[fighterName] || duel.playerUnit}
            oppName={duel.oppUnit.name} oppHp={displayedOppHp} oppMaxHp={duel.oppUnit.maxHp}
            oppArmorUsed={duel.oppUnit.armorUsed} oppAvatar={duel.oppAnimal}
            vsColor="#C77DFF" oppBarColor="#FF6B4A" hitEvent={hitEvent} bgTheme={bgTheme}
          />

          <div className="text-center text-[10px] font-mono text-[#C77DFF]">ROUND {duel.round}</div>

          {pendingBonus && (
            <div className="text-center text-[10px] font-mono py-1.5 rounded-sm border" style={{ borderColor: MINIGAME_TYPES[pendingBonus].color, color: MINIGAME_TYPES[pendingBonus].color }}>
              {MINIGAME_TYPES[pendingBonus].icon} {MINIGAME_TYPES[pendingBonus].label} AKTİF — bu round oynadığında uygulanacak
            </div>
          )}

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
                  onClick={initiateRound}
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

function SpeciesCompendium({ speciesSeen }) {
  const names = Object.keys(ANIMALS);
  const seenCount = names.filter((n) => speciesSeen[n]).length;
  return (
    <div className="bg-[#151A1F] border border-[#2A323A] rounded-sm overflow-x-auto">
      <div className="p-3 text-[9px] font-mono text-[#7C8894] border-b border-[#2A323A] flex justify-between items-center">
        <span>// TÜR ANSİKLOPEDİSİ — safkan referans statları</span>
        <span style={{ color: seenCount === names.length ? "#5EEAD4" : "#FFD166" }}>{seenCount}/{names.length} KEŞFEDİLDİ</span>
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
            const discovered = !!speciesSeen[name];
            if (!discovered) {
              return (
                <tr key={name} className="border-b border-[#1c2329]">
                  <td className="p-2 text-[#2A323A]">???</td>
                  <td className="p-2 text-[#2A323A]">🔒 keşfedilmedi</td>
                  <td className="p-2 text-right text-[#2A323A]">?</td>
                  <td className="p-2 text-right text-[#2A323A]">?</td>
                  <td className="p-2 text-right text-[#2A323A]">?</td>
                </tr>
              );
            }
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

// Görev listesi: her görev ilerleme çubuğu + tamamlanınca TOPLA butonu
// gösterir. Ödül toplandıysa soluk "✓" olarak kalır.
function QuestsView({ questStats, regionProgress, claimedQuests, onClaim }) {
  const claimableCount = QUESTS.filter((q) => !claimedQuests[q.id] && questProgress(q, questStats, regionProgress).done).length;
  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono text-[#7C8894]">
        Görevleri tamamla, Hurda ve Altın Somun kazan.
        {claimableCount > 0 && <span className="text-[#FFD166]"> {claimableCount} ödül toplamaya hazır!</span>}
      </div>
      {QUESTS.map((q) => {
        const p = questProgress(q, questStats, regionProgress);
        const claimed = !!claimedQuests[q.id];
        const rewardText = q.reward.scrap ? `+${q.reward.scrap} 🔩` : `+${q.reward.bolts} 🪙`;
        return (
          <div
            key={q.id}
            className="bg-[#151A1F] border rounded-sm p-3"
            style={{ borderColor: claimed ? "#2A323A" : p.done ? "#FFD166" : "#2A323A", opacity: claimed ? 0.45 : 1 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[16px]">{q.icon}</span>
              <div className="flex-1">
                <div className="text-[11px] font-mono text-[#E8EDF2]">{q.title} {claimed && "✓"}</div>
                <div className="text-[9px] font-mono text-[#7C8894]">{q.desc}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono" style={{ color: q.reward.bolts ? "#FFD166" : "#5EEAD4" }}>{rewardText}</div>
                <div className="text-[8px] font-mono text-[#7C8894]">{p.value}/{p.target}</div>
              </div>
            </div>
            <div className="h-1.5 bg-[#0B0E11] border border-[#2A323A] rounded-sm overflow-hidden mt-2">
              <div className="h-full transition-all" style={{ width: `${(p.value / p.target) * 100}%`, background: claimed ? "#2A323A" : p.done ? "#FFD166" : "#5EEAD4" }} />
            </div>
            {p.done && !claimed && (
              <button
                onClick={() => onClaim(q)}
                className="w-full mt-2 font-mono text-[10px] tracking-[0.15em] py-2 rounded-sm font-bold"
                style={{ background: "#FFD166", color: "#0B0E11" }}
              >
                🎁 ÖDÜLÜ TOPLA
              </button>
            )}
          </div>
        );
      })}
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
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("score", { ascending: false })
        .limit(LEADERBOARD_MAX);
      if (error) throw error;
      setBoard(data.map((row) => ({ id: row.player_id, nickname: row.nickname, mutantName: row.mutant_name, score: row.score })));
    } catch (e) {
      console.error("Lider tablosu yüklenemedi:", e);
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

    try {
      // Skoru artık İSTEMCİ HESAPLAMIYOR — ham canlı verisini sunucuya
      // gönderiyoruz, gerçek skor orada (submit-score Edge Function'ında)
      // aynı formülle yeniden hesaplanıp veritabanına o şekilde yazılıyor.
      // Bu sayede tarayıcı konsolundan sahte skor göndermek artık mümkün değil.
      const { data, error } = await supabase.functions.invoke("submit-score", {
        body: { playerId: identity.id, nickname: identity.nickname, mutantName: animal.name, animal },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await loadBoard();
      setMsg(`Gönderildi! Güç Puanı: ${data.score}`);
    } catch (e) {
      console.error("Gönderim hatası:", e);
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
  const [regionProgress, setRegionProgress] = useState({}); // { nodeId: true } — yenilen diyar düğümleri
  const [questStats, setQuestStats] = useState(DEFAULT_QUEST_STATS); // görev sayaçları
  const [speciesSeen, setSpeciesSeen] = useState(() => Object.fromEntries(STARTER_ROSTER.map((n) => [n, true]))); // { hayvanAdı: true } — Tür Ansiklopedisi keşfi
  const [claimedQuests, setClaimedQuests] = useState({}); // { questId: true } — ödülü alınanlar
  const [regionNav, setRegionNav] = useState({ regionId: null, pathId: null, nodeId: null });
  const [identity, setIdentity] = useState({ id: null, nickname: null });
  const [labReadyAt, setLabReadyAt] = useState(0);
  const [surgeryReadyAt, setSurgeryReadyAt] = useState(0);
  const [seenIntro, setSeenIntro] = useState(true);
  const [introPage, setIntroPage] = useState(0);
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
        setRegionProgress(base.regionProgress || {});
        setSpeciesSeen({ ...Object.fromEntries(STARTER_ROSTER.map((n) => [n, true])), ...(base.speciesSeen || {}) });
        setQuestStats({ ...DEFAULT_QUEST_STATS, ...(base.questStats || {}) });
        setClaimedQuests(base.claimedQuests || {});
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
        regionProgress, speciesSeen, questStats, claimedQuests, labReadyAt, surgeryReadyAt, seenIntro,
        adsWatchedToday, lastAdDate, marketOffers,
      });
      window.storage.set(STORAGE_KEY, payload, false).catch((e) => console.error("Kayıt başarısız:", e));
    }, 600);
    return () => clearTimeout(handle);
  }, [scrap, bolts, collection, mutantCounter, econ, regionProgress, speciesSeen, questStats, claimedQuests, labReadyAt, surgeryReadyAt, seenIntro, adsWatchedToday, lastAdDate, marketOffers, loading]);

  // --- Melezleme: ebeveynleri TÜKETİR, laboratuvar ücreti + bekleme uygular, yavruyu ekler ---
  const bumpQuestStat = (key, amount = 1) => setQuestStats((prev) => ({ ...prev, [key]: (prev[key] || 0) + amount }));

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
    bumpQuestStat("breeds");

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
    bumpQuestStat("surgeries");

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

  // --- İlerlemeyi içe aktar: mevcut her şeyin üzerine yazar ---
  const handleImport = (decoded) => {
    setCollection(decoded.collection || {});
    setScrap(decoded.scrap ?? STARTING_SCRAP);
    setBolts(decoded.bolts ?? 0);
    setMutantCounter(decoded.mutantCounter ?? 1);
    const regen = applyEnergyRegen(decoded.energy ?? ENERGY_MAX, decoded.lastEnergyTs ?? Date.now());
    setEcon({ energy: regen.energy, lastEnergyTs: regen.lastTs });
    setRegionProgress(decoded.regionProgress || {});
    setSpeciesSeen({ ...Object.fromEntries(STARTER_ROSTER.map((n) => [n, true])), ...(decoded.speciesSeen || {}) });
    setQuestStats({ ...DEFAULT_QUEST_STATS, ...(decoded.questStats || {}) });
    setClaimedQuests(decoded.claimedQuests || {});
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

  const handleNodeReward = (node) => {
    const already = regionProgress[node.id];
    const amount = already ? node.repeatReward : node.firstReward;
    setScrap((s) => s + amount);
    if (!already) setRegionProgress((prev) => ({ ...prev, [node.id]: true }));
    return amount;
  };

  const handleClaimQuest = (quest) => {
    if (claimedQuests[quest.id]) return;
    const p = questProgress(quest, questStats, regionProgress);
    if (!p.done) return;
    if (quest.reward.scrap) setScrap((s) => s + quest.reward.scrap);
    if (quest.reward.bolts) setBolts((b) => b + quest.reward.bolts);
    setClaimedQuests((prev) => ({ ...prev, [quest.id]: true }));
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
    bumpQuestStat("levelUps");
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
    setSpeciesSeen((prev) => (prev[baseName] ? prev : { ...prev, [baseName]: true }));
    bumpQuestStat("chestsOpened");
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
    setSpeciesSeen((prev) => {
      const next = { ...prev };
      let changed = false;
      results.forEach(({ baseName }) => { if (!next[baseName]) { next[baseName] = true; changed = true; } });
      return changed ? next : prev;
    });
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
    setSpeciesSeen((prev) => (prev[baseName] ? prev : { ...prev, [baseName]: true }));
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
    setRegionProgress({});
    setSpeciesSeen(Object.fromEntries(STARTER_ROSTER.map((n) => [n, true])));
    setQuestStats(DEFAULT_QUEST_STATS);
    setClaimedQuests({});
    setLabReadyAt(0);
    setSurgeryReadyAt(0);
    setAdsWatchedToday(0);
    setLastAdDate(new Date().toDateString());
    setMarketOffers(fresh.marketOffers);
    setResetArmed(false);
  };

  const energyMsLeft = econ.energy >= ENERGY_MAX ? 0 : Math.max(0, econ.lastEnergyTs + ENERGY_REGEN_MS - now);

  const claimableQuestCount = QUESTS.filter((q) => !claimedQuests[q.id] && questProgress(q, questStats, regionProgress).done).length;

  const TABS = [
    { id: "quests", label: "📋 GÖREVLER" },
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
        @keyframes hb-shatter {
          0% { transform: translate(-50%,-50%) rotate(0deg); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes hb-defeatpop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes hb-snakeflee {
          0% { transform: scale(1) translateX(0) translateY(0); opacity: 1; }
          100% { transform: scale(0.15) translateX(170%) translateY(-20%); opacity: 0; }
        }
        .hb-shake { animation: hb-shake 0.35s ease-in-out; }
        .hb-flash { animation: hb-flash 0.4s ease-in-out; }
        .hb-float { animation: hb-float 0.9s ease-out forwards; }
      `}</style>

      {!seenIntro && (() => {
        const INTRO_PAGES = [
          {
            title: "MUTANT//LAB'A HOŞ GELDİN",
            body: [
              "Sen bir mekatronik laboratuvarın sorumlususun. 5 hayvanla başlıyorsun: Köpek, Kaplumbağa, Arı, Boğa, Kurt.",
              "Her hayvan 8 uzuvdan oluşur (Kafa, Gövde, Bacak, Ayak, Kuyruk, Pençe, Göz, Zeka). Bu uzuvları melezleyerek kendi mutantlarını yaratacaksın.",
              "📋 Emin olmadığında GÖREVLER sekmesine bak — sırada ne yapman gerektiğini ve ödülünü orada görürsün.",
            ],
          },
          {
            title: "🧪 LAB — MELEZLEME",
            body: [
              "İki canlıyı melezlediğinde 8 uzvun her biri ayrı ayrı şansla birleşir — bazısı Süper Birleşim, bazısı Baskın Gen, bazısı Mutasyon (kayıp) olabilir.",
              "⚠️ İKİ EBEVEYN DE tükenir, geriye sadece yavru kalır. Melezleme bir Laboratuvar Ücreti (Hurda) ve bekleme süresi gerektirir — ne kadar 'karışık' (mutasyonlu) uzuvları birleştirirsen o kadar pahalı olur.",
              "🔬 CERRAHİ sekmesinde tüm hayvanı feda etmeden, sadece TEK bir uzvu onarabilir/değiştirebilirsin — bağışçı canlı yaşar, sadece o uzvunu kaybeder.",
            ],
          },
          {
            title: "⚔️ DÜELLO — KART SAVAŞI",
            body: [
              "Düello round bazlı: her canlı bir round'da 3'er kez birbirine vurur. Round başı 1 kart alırsın — hemen oynayabilir ya da elde biriktirip 2 temel kartı birleştirerek daha güçlü bir füzyon kartı yapabilirsin (6 temel + 15 füzyon = 21 kart, Kart Kitabı'nda hepsini görebilirsin).",
              "Bazı round'larda ⚡ BONUS FIRSAT çıkar — 6 farklı mini-oyundan biriyle (zamanlama, hafıza, refleks vb.) Kritik/Kalkan/Engelleme bonusu kazanabilirsin. 6 saniyen var, seçmezsen bonus olmadan devam eder.",
            ],
          },
          {
            title: "👑 DİYARLAR — HİKAYELİ BOSSLAR",
            body: [
              "NÖBETÇİ artık bir bölge haritası. Ascelding Diyarı'nda 3 yol var: Buz, Toprak, Ateş — her yolda küçük bosslar var, sonunda bir büyük boss. Bir düğümü yenmeden bir sonrakine geçemezsin.",
              "Her yolun kendi özel yeteneği var: Buz seni dondurup hasar vermeni engeller, Toprak kritiklerden etkilenmez ve hasar yansıtır, Ateş her round katlanan yakma hasarı verir.",
            ],
          },
          {
            title: "🔩🪙⚡ EKONOMİ",
            body: [
              "Hurda (🔩) savaşlardan kazanılır — melezleme, seviye atlama ve Paslı Sandık için kullanılır. Enerji (⚡) dövüşmek için gerekir, zamanla dolar.",
              "Altın Somun (🪙) premium para — reklam izleyerek (günde sınırlı) ya da Market'teki rotasyonlu tekliflerden kazanılır. Somun ile büyük sandıklar açabilir, enerji/laboratuvar beklemesini anında çözebilirsin.",
              "ENVANTER'de hayvanlarını Hurda ile seviye atlatabilirsin — istatistikleri güçlenir.",
            ],
          },
          {
            title: "🏆 SON NOTLAR",
            body: [
              "SIRALAMA sekmesinde bir takma ad kaydedip en güçlü mutantını gerçek, herkese açık bir lider tablosuna gönderebilirsin.",
              "AYARLAR'dan ilerlemeni dışa/içe aktarabilir, istersen sıfırlayabilirsin. İlerlemen otomatik kaydedilir.",
              "İyi şanslar, mühendis. 🧬",
            ],
          },
        ];
        const page = INTRO_PAGES[introPage];
        const isLast = introPage === INTRO_PAGES.length - 1;
        return (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(4,6,8,0.94)" }}>
            <div className="rounded-sm p-5 max-w-sm w-full" style={{ background: "#151A1F", border: "1px solid #5EEAD4" }}>
              <div className="font-display text-base text-[#5EEAD4] mb-3">{page.title}</div>
              <div className="text-[11px] font-mono text-[#E8EDF2] space-y-2 mb-4 leading-relaxed">
                {page.body.map((line, i) => <p key={i}>{line}</p>)}
              </div>
              <div className="flex justify-center gap-1.5 mb-4">
                {INTRO_PAGES.map((_, i) => (
                  <span key={i} className="rounded-full" style={{ width: 6, height: 6, background: i === introPage ? "#5EEAD4" : "#2A323A" }} />
                ))}
              </div>
              <div className="flex gap-2">
                {introPage > 0 && (
                  <button onClick={() => setIntroPage((p) => p - 1)} className="flex-1 text-[10px] font-mono px-3 py-2.5 rounded-sm border border-[#2A323A] text-[#7C8894]">
                    ← GERİ
                  </button>
                )}
                <button
                  onClick={() => (isLast ? setSeenIntro(true) : setIntroPage((p) => p + 1))}
                  className="flex-1 bg-[#5EEAD4] text-[#0B0E11] font-mono text-xs tracking-[0.15em] py-2.5 rounded-sm font-bold"
                >
                  {isLast ? "ANLADIM, BAŞLA" : "İLERİ →"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
              className="relative px-3 py-2 text-[10px] font-mono tracking-[0.1em] rounded-sm border transition-colors"
              style={{
                borderColor: tab === t.id ? "#5EEAD4" : "#2A323A",
                color: tab === t.id ? "#5EEAD4" : "#7C8894",
                background: tab === t.id ? "#151A1F" : "transparent",
              }}
            >
              {t.label}
              {t.id === "quests" && claimableQuestCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full font-bold"
                  style={{ width: 15, height: 15, fontSize: 8, background: "#FFD166", color: "#0B0E11" }}
                >
                  {claimableQuestCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "quests" && (
          <QuestsView questStats={questStats} regionProgress={regionProgress} claimedQuests={claimedQuests} onClaim={handleClaimQuest} />
        )}
        {tab === "lab" && <LabView pool={collection} onBreed={handleBreed} scrap={scrap} labReadyAt={labReadyAt} now={now} />}
        {tab === "surgery" && (
          <SurgeryView pool={collection} onSurgery={handleSurgery} scrap={scrap} surgeryReadyAt={surgeryReadyAt} now={now} />
        )}
        {tab === "duel" && (
          <DuelView pool={collection} energy={econ.energy} energyMsLeft={energyMsLeft} onSpendEnergy={handleSpendEnergy} onQuestStat={bumpQuestStat} />
        )}
        {tab === "pve" && (
          <PvEView pool={collection} energy={econ.energy} energyMsLeft={energyMsLeft} onSpendEnergy={handleSpendEnergy} onReward={handleReward} />
        )}
        {tab === "boss" && !regionNav.regionId && (
          <RegionHubView onSelectRegion={(regionId) => setRegionNav({ regionId, pathId: null, nodeId: null })} regionProgress={regionProgress} />
        )}
        {tab === "boss" && regionNav.regionId && !regionNav.nodeId && (
          <RegionPathMap
            region={REGIONS[regionNav.regionId]}
            regionProgress={regionProgress}
            onBack={() => setRegionNav({ regionId: null, pathId: null, nodeId: null })}
            onSelectNode={(path, node) => setRegionNav({ regionId: regionNav.regionId, pathId: path.id, nodeId: node.id })}
          />
        )}
        {tab === "boss" && regionNav.nodeId && (() => {
          const region = REGIONS[regionNav.regionId];
          const path = region.paths.find((p) => p.id === regionNav.pathId);
          const node = path.nodes.find((n) => n.id === regionNav.nodeId);
          return (
            <RegionBossFightView
              pool={collection}
              node={node}
              path={path}
              energy={econ.energy}
              energyMsLeft={energyMsLeft}
              onSpendEnergy={handleSpendBossEnergy}
              onNodeReward={handleNodeReward}
              onQuestStat={bumpQuestStat}
              onBack={() => setRegionNav({ regionId: regionNav.regionId, pathId: null, nodeId: null })}
            />
          );
        })()}
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
        {tab === "species" && <SpeciesCompendium speciesSeen={speciesSeen} />}
        {tab === "cardbook" && <CardCompendiumView />}
        {tab === "settings" && (
          <SettingsView
            playerState={{ scrap, bolts, collection, mutantCounter, energy: econ.energy, lastEnergyTs: econ.lastEnergyTs, regionProgress, speciesSeen, questStats, claimedQuests, labReadyAt, surgeryReadyAt, seenIntro }}
            onImport={handleImport}
            resetArmed={resetArmed}
            onReset={handleReset}
          />
        )}

        <div className="mt-6 text-center text-[9px] font-mono text-[#2A323A]">
          // ilerlemen otomatik kaydedilir · melezleme ebeveynleri tüketir · Dodge/Kritik şimdilik devre dışı
        </div>
      </div>
    </div>
  );
}
