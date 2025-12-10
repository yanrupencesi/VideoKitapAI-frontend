// ----------------- BACKEND URL'İ -----------------
const API_BASE = "https://videokitapai-backend-1.onrender.com";
// Lokalde test: "http://127.0.0.1:8000"

// Her kitap için kapak dosyası
const COVER_MAP = {
  1: "atomic.png",
  2: "savas.png",
  3: "akis.png",
  4: "zenginbaba.png",
  5: "dusunvezenginol.png",
  6: "aliskanliklargucu.png",
  7: "iknapsikolojisi.png",
  8: "purdikkat.png",
};

// ------------ ANA SAYFA: KİTAPLARI LİSTELE (SADECE GÖRSEL) ------------
async function loadBooks() {
  const grid = document.getElementById("bookGrid");
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/books`);
    const books = await res.json();

    books.forEach((book) => {
      const div = document.createElement("div");
      div.className = "book-card";

      const img = document.createElement("img");
      const coverFile = COVER_MAP[book.id];
      img.src = coverFile || `https://via.placeholder.com/300x260?text=${encodeURIComponent(book.title)}`;
      img.alt = book.title;

      const title = document.createElement("h3");
      title.textContent = book.title;

      div.appendChild(img);
      div.appendChild(title);

      grid.appendChild(div);
    });
  } catch (err) {
    console.error("Kitapları çekerken hata:", err);
  }
}

// ------------ ANA SAYFA: PROFİL FORMUNU GÖNDER (RECOMMEND) ------------
async function handleProfileSubmit(event) {
  event.preventDefault();

  const goal = document.getElementById("goalHome")?.value || "";
  const challenge = document.getElementById("challengeHome")?.value || "";
  const timePerDay = document.getElementById("timePerDayHome")?.value || "15dk";

  localStorage.setItem("profileGoal", goal);
  localStorage.setItem("profileChallenge", challenge);
  localStorage.setItem("profileTimePerDay", timePerDay);

  try {
    const res = await fetch(`${API_BASE}/profile/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal,
        challenge,
        time_per_day: timePerDay,
      }),
    });

    const data = await res.json();

    const bookId = data.recommended_book_id;
    const bookTitle = data.book_title;
    const qList = data.questions || [];

    if (bookId) {
      localStorage.setItem("selectedBookId", String(bookId));
      localStorage.setItem("selectedBookTitle", bookTitle || "Seçilen Kitap");
    }

    if (qList.length >= 3) {
      localStorage.setItem("q1", qList[0]);
      localStorage.setItem("q2", qList[1]);
      localStorage.setItem("q3", qList[2]);
    } else {
      localStorage.removeItem("q1");
      localStorage.removeItem("q2");
      localStorage.removeItem("q3");
    }

    window.location.href = "reader.html";
  } catch (err) {
    console.error("Profil gönderirken hata:", err);
    alert("Bilgilerini gönderirken bir hata oluştu. Lütfen daha sonra tekrar dene.");
  }
}

function saveProfileFromHome(event) {
  return handleProfileSubmit(event);
}

// ------------ READER SAYFASI: VERİLERİ YÜKLE ------------
function initReader() {
  if (!window.location.pathname.endsWith("reader.html")) return;

  const title = localStorage.getItem("selectedBookTitle") || "Senin İçin Önerilen Kitap";
  const bookId = parseInt(localStorage.getItem("selectedBookId") || "0");

  const titleEl = document.getElementById("bookTitle");
  if (titleEl) titleEl.textContent = title;

  const goalStored = localStorage.getItem("profileGoal") || "";
  const challengeStored = localStorage.getItem("profileChallenge") || "";
  const timeStored = localStorage.getItem("profileTimePerDay") || "15dk";

  const goalEl = document.getElementById("goal");
  const challengeEl = document.getElementById("challenge");
  const timeEl = document.getElementById("timePerDay");

  if (goalEl) goalEl.value = goalStored;
  if (challengeEl) challengeEl.value = challengeStored;
  if (timeEl) timeEl.value = timeStored;

  const q1Stored = localStorage.getItem("q1") || "";
  const q2Stored = localStorage.getItem("q2") || "";
  const q3Stored = localStorage.getItem("q3") || "";

  const q1El = document.getElementById("q1");
  const q2El = document.getElementById("q2");
  const q3El = document.getElementById("q3");

  if (q1Stored || q2Stored || q3Stored) {
    q1El.value = q1Stored;
    q2El.value = q2Stored;
    q3El.value = q3Stored;
  } else if (bookId) {
    fillDefaultQuestions(bookId);
  }
}

// ------------ KİTAPLARA GÖRE VARSAYILAN SORULAR ------------
function fillDefaultQuestions(bookId) {
  const q1 = document.getElementById("q1");
  const q2 = document.getElementById("q2");
  const q3 = document.getElementById("q3");
  if (!q1 || !q2 || !q3) return;

  if (bookId === 1) {
    q1.value = "Hedefime ulaşmak için hangi küçük alışkanlıklarla başlayabilirim?";
    q2.value = "Erteleme sorunumu bu kitabı kullanarak nasıl çözebilirim?";
    q3.value = "Bugün uygulayabileceğim 3 küçük alışkanlık önerir misin?";
  } else if (bookId === 2) {
    q1.value = "Stratejik düşünme becerimi geliştirmek için nereden başlamalıyım?";
    q2.value = "Şu an yaşadığım zorluklara hangi stratejiler daha uygun olur?";
    q3.value = "Bugün uygulayabileceğim 2-3 basit strateji örneği verebilir misin?";
  } else if (bookId === 3) {
    q1.value = "Akış hali nedir ve hayatımda daha çok akış yaratmak için nereden başlamalıyım?";
    q2.value = "Odaklanma sorunu yaşadığımda akış haline nasıl dönebilirim?";
    q3.value = "Bugün akışa yaklaşmak için yapabileceğim 2–3 egzersiz önerir misin?";
  } else if (bookId === 4) {
    q1.value = "Bu kitap, para ve zenginlik bakış açımı nasıl değiştirebilir?";
    q2.value = "Finansal özgürlüğe başlamak için hangi küçük adımı uygulamalıyım?";
    q3.value = "Gelirimi artırmak için hangi prensipleri bugün kullanabilirim?";
  } else if (bookId === 5) {
    q1.value = "Zengin olma hedefime ulaşmak için bu kitap hangi adımları öneriyor?";
    q2.value = "Düşünce gücünü günlük hayatıma nasıl uygularım?";
    q3.value = "Bugün finansal gelişim için uygulayabileceğim 3 adım verebilir misin?";
  } else if (bookId === 6) {
    q1.value = "Alışkanlık döngüsünü (ipucu–rutin–ödül) kendi hayatımda nasıl kurabilirim?";
    q2.value = "Kötü alışkanlıklarımı değiştirmek için nereden başlamalıyım?";
    q3.value = "Bugün test edebileceğim küçük bir alışkanlık deneyi önerir misin?";
  } else if (bookId === 7) {
    q1.value = "Kitaptaki ikna prensiplerini günlük hayatımda nasıl kullanabilirim?";
    q2.value = "Bu prensipler iş ilişkilerimde bana nasıl avantaj sağlar?";
    q3.value = "Etik şekilde daha etkileyici olmak için hangi adımları uygulamalıyım?";
  } else if (bookId === 8) {
    q1.value = "Odaklanma becerimi geliştirmek için bugün ne yapabilirim?";
    q2.value = "Dikkat dağıtıcıları azaltmak için kitap ne öneriyor?";
    q3.value = "Derin çalışmaya başlamak için uygulayabileceğim bir günlük plan verebilir misin?";
  } else {
    q1.value = "Bu kitap hedeflerime ulaşmamda nasıl yardımcı olabilir?";
    q2.value = "Yaşadığım zorlanmayı çözmek için hangi bölümler işe yarar?";
    q3.value = "Bu kitaptan bugün uygulayabileceğim 3 adım söyler misin?";
  }
}

// ------------ YAPAY ZEKAYA TEK SORU GÖNDER (/ai/ask) ------------
async function askAI() {
  const questionInput = document.getElementById("userQuestion");
  const responseBox = document.getElementById("aiResponse");

  if (!questionInput || !responseBox) return;

  const question = questionInput.value.trim();
  const bookId = parseInt(localStorage.getItem("selectedBookId") || "0");

  if (!bookId) {
    responseBox.textContent = "Önce anasayfadaki formu doldurmalısın.";
    return;
  }

  if (!question) {
    responseBox.textContent =
      "Lütfen bir soru yaz (örnek: Bu kitap hedefime ulaşmamda nasıl yardımcı olabilir?)";
    return;
  }

  responseBox.textContent = "Yapay zeka yanıt üretiyor, lütfen bekle...";

  try {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: bookId,
        question,
      }),
    });

    const data = await res.json();
    responseBox.textContent = data.answer || "Boş bir cevap döndü.";
  } catch (err) {
    console.error(err);
    responseBox.textContent =
      "Hata oluştu. Backend çalışıyor mu kontrol et.";
  }
}

// ------------ SAYFA YÜKLENİNCE ------------
window.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  initReader();

  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileSubmit);
  }
});
