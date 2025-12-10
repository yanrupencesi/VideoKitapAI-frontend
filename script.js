// ----------------- BACKEND URL'İ -----------------
const API_BASE = "https://videokitapai-backend-1.onrender.com";
// Lokalde test: "http://127.0.0.1:8000"

// Her kitap için kapak dosyası (sadece görsel, tıklanabilir değil)
const COVER_MAP = {
  1: "atomic.png",
  2: "savas.png",
  3: "akis.png",
  4: "zenginbaba.png",
  5: "dusunvezenginol.png",
};

// ------------ ANASAYFA: PROFİL FORMUNU KAYDET + ÖNERİ AL ------------

async function saveProfileFromHome(event) {
  event.preventDefault();

  const goal = document.getElementById("goalHome")?.value.trim() || "";
  const challenge =
    document.getElementById("challengeHome")?.value.trim() || "";
  const timePerDay =
    document.getElementById("timePerDayHome")?.value.trim() || "";

  // Profil bilgilerini localStorage'a kaydediyoruz (reader sayfasında göstereceğiz)
  localStorage.setItem("profileGoal", goal);
  localStorage.setItem("profileChallenge", challenge);
  localStorage.setItem("profileTimePerDay", timePerDay);

  // Backend'den kitap + soru önerisi al
  try {
    const res = await fetch(`${API_BASE}/profile/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal,
        challenge,
        time_per_day: timePerDay || null,
      }),
    });

    const data = await res.json();

    if (data && data.book_id) {
      // Önerilen kitabı ve soruları kaydet
      localStorage.setItem("selectedBookId", String(data.book_id));
      localStorage.setItem("selectedBookTitle", data.book_title || "");

      if (Array.isArray(data.questions)) {
        localStorage.setItem(
          "suggestedQuestions",
          JSON.stringify(data.questions)
        );
      } else {
        localStorage.removeItem("suggestedQuestions");
      }

      // Doğrudan reader sayfasına geç
      window.location.href = "reader.html";
    } else {
      alert(
        "Kitap önerisi üretilemedi. Lütfen hedef ve zorluk kısmını mümkün olduğunca net yaz."
      );
    }
  } catch (err) {
    console.error(err);
    alert(
      "Profil bilgilerin kaydedildi ama kitap önerisi alınırken bir hata oluştu."
    );
  }
}

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
        img.src = coverFile;
      } else {
        img.src = `https://via.placeholder.com/300x260?text=${encodeURIComponent(
          book.title
        )}`;
      }
      img.alt = book.title;

      const title = document.createElement("h3");
      title.textContent = book.title;

      // Özet yok, tıklama yok → sadece görsel
      div.appendChild(img);
      div.appendChild(title);

      grid.appendChild(div);
    });
  } catch (err) {
    console.error("Kitaplar yüklenirken hata:", err);
  }
}

// ------------ READER SAYFASI: BAŞLIK + PROFİL + SORULARI YÜKLE ------------

function initReader() {
  if (!window.location.pathname.endsWith("reader.html")) return;

  const title =
    localStorage.getItem("selectedBookTitle") || "Senin için önerilen kitap";
  const bookId = parseInt(
    localStorage.getItem("selectedBookId") || "0",
    10
  );

  const titleEl = document.getElementById("bookTitle");
  if (titleEl) {
    titleEl.textContent = title;
  }

  // Profil bilgilerini forma geri doldur
  const goalStored = localStorage.getItem("profileGoal") || "";
  const challengeStored = localStorage.getItem("profileChallenge") || "";
  const timeStored = localStorage.getItem("profileTimePerDay") || "";

  const goalEl = document.getElementById("goal");
  const challengeEl = document.getElementById("challenge");
  const timeEl = document.getElementById("timePerDay");

  if (goalEl) goalEl.value = goalStored;
  if (challengeEl) challengeEl.value = challengeStored;
  if (timeEl) timeEl.value = timeStored;

  // Önerilen sorular varsa bunları q1/q2/q3 alanlarına yaz
  const suggestedStr = localStorage.getItem("suggestedQuestions");
  if (suggestedStr) {
    try {
      const arr = JSON.parse(suggestedStr);
      const q1 = document.getElementById("q1");
      const q2 = document.getElementById("q2");
      const q3 = document.getElementById("q3");

      if (q1 && arr[0]) q1.value = arr[0];
      if (q2 && arr[1]) q2.value = arr[1];
      if (q3 && arr[2]) q3.value = arr[2];
    } catch (e) {
      console.error("suggestedQuestions parse edilemedi:", e);
      // Hata olursa eski fallback sistemine geç
      fillDefaultQuestions(bookId);
    }
  } else {
    // Eğer localStorage'da soru yoksa kitaba göre varsayılan doldur
    fillDefaultQuestions(bookId);
  }
}

// Kitaba göre q1/q2/q3 alanlarını varsayılan sorularla doldurur (yeni profil sistemi çalışmazsa fallback)
function fillDefaultQuestions(bookId) {
  const q1 = document.getElementById("q1");
  const q2 = document.getElementById("q2");
  const q3 = document.getElementById("q3");

  if (!q1 || !q2 || !q3) return;

  if (bookId === 1) {
    q1.value =
      "Bu kitap, günlük alışkanlıklarımı daha disiplinli hale getirmem için bana nasıl yardımcı olabilir?";
    q2.value =
      "Şu an sürekli ertelediğim işler için bu kitaptan hangi küçük adımları uygulayabilirim?";
    q3.value =
      "Bu kitaptan bugün başlayabileceğim en basit 3 alışkanlık ne olabilir?";
  } else if (bookId === 2) {
    q1.value =
      "Savaş Sanatı'ndaki strateji prensiplerini iş ve kariyerime nasıl uyarlayabilirim?";
    q2.value =
      "Rakiplerimi veya zorlukları daha iyi analiz etmek için bu kitaptan hangi fikirleri kullanabilirim?";
    q3.value =
      "Günlük hayatta uygulayabileceğim 2-3 basit strateji önerir misin?";
  } else if (bookId === 3) {
    q1.value =
      "Akış hali nedir ve benim hayatımda daha çok akış yaşayabilmem için nereden başlamalıyım?";
    q2.value =
      "Odaklanma sorunu yaşıyorum, bu kitap bunu çözmemde nasıl yardımcı olabilir?";
    q3.value =
      "Bugün akış haline yaklaşmak için yapabileceğim 2-3 küçük egzersiz ne?";
  } else if (bookId === 4) {
    q1.value =
      "Bu kitap, para ve zenginlik hakkında bakış açımı nasıl değiştirebilir?";
    q2.value =
      "Finansal özgürlük için bugün başlayabileceğim en basit adımlar neler?";
    q3.value =
      "Gelirimi artırmak veya daha bilinçli harcama yapmak için bu kitaptan hangi prensipleri uygulayabilirim?";
  } else {
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

  const question = questionInput ? questionInput.value.trim() : "";
  const bookId = parseInt(
    localStorage.getItem("selectedBookId") || "0",
    10
  );

  if (!responseBox) return;

  if (!bookId) {
    responseBox.textContent =
      "Önce anasayfadaki formu doldurarak senin için bir kitap seçtirmelisin.";
    return;
  }

  if (!question) {
    responseBox.textContent =
      "Lütfen kitaba dair bir soru yaz (örneğin: 'Bu kitap ne anlatıyor?').";
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
    responseBox.textContent = "Bir hata oluştu. Backend çalışıyor mu?";
  }
}

// ------------ Sayfa yüklendiğinde ------------

window.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  initReader();
});
