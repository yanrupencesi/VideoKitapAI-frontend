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
  if (!grid) return; // reader.html'deysek çalışmasın

  try {
    const res = await fetch(`${API_BASE}/books`);
    const books = await res.json();

    books.forEach((book) => {
      const div = document.createElement("div");
      div.className = "book-card";

      const img = document.createElement("img");
      const coverFile = COVER_MAP[book.id];
      if (coverFile) {
        img.src = coverFile; // aynı klasördeki png
      } else {
        img.src = `https://via.placeholder.com/300x260?text=${encodeURIComponent(
          book.title
        )}`;
      }
      img.alt = book.title;

      const title = document.createElement("h3");
      title.textContent = book.title;

      // Sadece görsel + başlık, tıklama yok
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

  // Profil bilgilerini daha sonra da kullanacağız
  localStorage.setItem("profileGoal", goal);
  localStorage.setItem("profileChallenge", challenge);
  localStorage.setItem("profileTimePerDay", timePerDay);

  try {
    const res = await fetch(`${API_BASE}/profile/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal: goal,
        challenge: challenge,
        time_per_day: timePerDay,
      }),
    });

    const data = await res.json();

    // Backend'in önerdiği kitap ve sorular:
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
      // Yine de temizleyelim
      localStorage.removeItem("q1");
      localStorage.removeItem("q2");
      localStorage.removeItem("q3");
    }

    // reader.html sayfasına geç
    window.location.href = "reader.html";
  } catch (err) {
    console.error("Profil gönderirken hata:", err);
    alert(
      "Bilgilerini gönderirken bir hata oluştu. Lütfen daha sonra tekrar dene."
    );
  }
}

// Eğer index.html içinde eski alışkanlıkla onsubmit="saveProfileFromHome(event)" yazılıysa bozulmasın diye:
function saveProfileFromHome(event) {
  return handleProfileSubmit(event);
}

// ------------ READER SAYFASI: VERİLERİ YÜKLE ------------
function initReader() {
  // Sadece reader.html'de çalışsın
  if (!window.location.pathname.endsWith("reader.html")) return;

  const title =
    localStorage.getItem("selectedBookTitle") || "Senin İçin Önerilen Kitap";
  const bookId = parseInt(
    localStorage.getItem("selectedBookId") || "0",
    10
  );

  const titleEl = document.getElementById("bookTitle");
  if (titleEl) {
    titleEl.textContent = title;
  }

  // Profil bilgilerini doldur
  const goalStored = localStorage.getItem("profileGoal") || "";
  const challengeStored = localStorage.getItem("profileChallenge") || "";
  const timeStored = localStorage.getItem("profileTimePerDay") || "15dk";

  const goalEl = document.getElementById("goal");
  const challengeEl = document.getElementById("challenge");
  const timeEl = document.getElementById("timePerDay");

  if (goalEl) goalEl.value = goalStored;
  if (challengeEl) challengeEl.value = challengeStored;
  if (timeEl) timeEl.value = timeStored;

  // Önerilen soruları doldur (varsa)
  const q1Stored = localStorage.getItem("q1") || "";
  const q2Stored = localStorage.getItem("q2") || "";
  const q3Stored = localStorage.getItem("q3") || "";

  const q1El = document.getElementById("q1");
  const q2El = document.getElementById("q2");
  const q3El = document.getElementById("q3");

  if (q1El && q2El && q3El) {
    if (q1Stored || q2Stored || q3Stored) {
      q1El.value = q1Stored;
      q2El.value = q2Stored;
      q3El.value = q3Stored;
    } else if (bookId) {
      // Eğer backend'ten soru gelmediyse kitaba göre varsayılan soruları doldur
      fillDefaultQuestions(bookId);
    }
  }
}

// ------------ KİTAPLARA GÖRE VARSAYILAN SORULAR ------------
function fillDefaultQuestions(bookId) {
  const q1 = document.getElementById("q1");
  const q2 = document.getElementById("q2");
  const q3 = document.getElementById("q3");
  if (!q1 || !q2 || !q3) return;

  if (bookId === 1) {
    // Atomik Alışkanlıklar
    q1.value =
      "Hedefime ulaşmak için hangi küçük alışkanlıklarla başlayabilirim?";
    q2.value =
      "Erteleme sorunumu bu kitabı kullanarak nasıl çözebilirim?";
    q3.value =
      "Bugün uygulayabileceğim 3 küçük alışkanlık önerir misin?";
  } else if (bookId === 2) {
    // Savaş Sanatı
    q1.value =
      "Stratejik düşünme becerimi geliştirmek için nereden başlamalıyım?";
    q2.value =
      "Şu an yaşadığım zorluklara hangi stratejiler daha uygun olur?";
    q3.value =
      "Bugün uygulayabileceğim 2-3 basit strateji örneği verebilir misin?";
  } else if (bookId === 3) {
    // Akış (Flow)
    q1.value =
      "Akış hali nedir ve benim hayatımda daha çok akış yaşayabilmem için nereden başlamalıyım?";
    q2.value =
      "Odaklanma veya motivasyon düşüşü yaşadığımda akış haline dönmek için neler yapabilirim?";
    q3.value =
      "Bugün akış haline yaklaşmak için yapabileceğim 2-3 küçük egzersiz ne?";
  } else if (bookId === 4) {
    // Zengin Baba Yoksul Baba
    q1.value =
      "Bu kitap, para ve zenginlik hakkında bakış açımı nasıl değiştirebilir?";
    q2.value =
      "Finansal özgürlük için bugün başlayabileceğim en basit adımlar neler?";
    q3.value =
      "Gelirimi artırmak veya daha bilinçli harcama yapmak için bu kitaptan hangi prensipleri uygulayabilirim?";
  } else if (bookId === 5) {
    // Düşün ve Zengin Ol
    q1.value =
      "Bu kitap, hedef belirleme konusunda bana nasıl yardımcı olabilir?";
    q2.value =
      "Düşünce gücünü kullanarak motivasyonumu nasıl artırabilirim?";
    q3.value =
      "Başarı için bugün uygulayabileceğim 3 adımı söyleyebilir misin?";
  } else if (bookId === 6) {
    // Alışkanlıkların Gücü
    q1.value =
      "Bu kitap, alışkanlık döngüsünü (ipucu–rutin–ödül) anlamamda nasıl yardımcı olabilir?";
    q2.value =
      "İş ve özel hayatımdaki kötü alışkanlıkları değiştirmek için hangi adımları uygulamalıyım?";
    q3.value =
      "Bugün hayatımda test edebileceğim küçük bir alışkanlık deneyi önerir misin?";
  } else if (bookId === 7) {
    // İknanın Psikolojisi
    q1.value =
      "İknanın Psikolojisi'ndeki temel ikna prensiplerini günlük hayatımda nasıl kullanabilirim?";
    q2.value =
      "Satış veya pazarlama alanında çalışıyorum, bu kitap bana müşterilerle iletişimde nasıl avantaj sağlar?";
    q3.value =
      "İnsanları manipüle etmeden, etik şekilde daha etkileyici olmak için neler yapabilirim?";
  } else if (bookId === 8) {
    // Pür Dikkat (Deep Work)
    q1.value =
      "Bu kitap, dağılmış dikkatimi toparlayıp daha derin çalışmam için bana nasıl yol gösterir?";
    q2.value =
      "Sosyal medya ve bildirimler yüzünden odaklanamıyorum, Pür Dikkat'e göre nereden başlamalıyım?";
    q3.value =
      "Bugün uygulayabileceğim 2–3 'derin çalışma' seansı planı verebilir misin?";
  } else {
    // Genel kişisel gelişim soruları
    q1.value =
      "Bu kitap benim hedeflerime ulaşmamda nasıl yardımcı olabilir?";
    q2.value =
      "Şu an yaşadığım en büyük zorlanmayı çözmek için bu kitaptan hangi bölümler işime yarar?";
    q3.value =
      "Bu kitaptan bugün uygulayabileceğim en basit 3 adımı söyler misin?";
  }
}

// ------------ YAPAY ZEKAYA TEK SORU GÖNDER (/ai/ask) ------------
async function askAI() {
  const questionInput = document.getElementById("userQuestion");
  const responseBox = document.getElementById("aiResponse");

  if (!questionInput || !responseBox) return;

  const question = questionInput.value.trim();
  const bookId = parseInt(
    localStorage.getItem("selectedBookId") || "0",
    10
  );

  if (!bookId) {
    responseBox.textContent =
      "Önce anasayfadaki formu doldurup sana uygun kitabı seçtirmelisin.";
    return;
  }

  if (!question) {
    responseBox.textContent =
      "Lütfen kitaba dair bir soru yaz (örneğin: 'Bu kitap ne anlatıyor ve benim hayatıma nasıl uyarlanabilir?').";
    return;
  }

  responseBox.textContent = "Yapay zeka düşünürken lütfen bekle...";

  try {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: bookId,
        question: question,
      }),
    });

    const data = await res.json();
    responseBox.textContent = data.answer || "Boş cevap döndü.";
  } catch (err) {
    console.error(err);
    responseBox.textContent =
      "Bir hata oluştu. Backend (VideoKitapAI backend) çalışıyor mu, kontrol et.";
  }
}

// ------------ SAYFA YÜKLENİNCE ÇALIŞACAKLAR ------------
window.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  initReader();

  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileSubmit);
  }
});
