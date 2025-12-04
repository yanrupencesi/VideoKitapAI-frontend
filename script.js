// ----------------- BACKEND URL'İ -----------------
const API_BASE = "https://videokitapai-backend-1.onrender.com"; 
// Render'dan alacağın URL'yi buraya yazacaksın. 
// Lokalde test ederken: "http://127.0.0.1:8000" kullanabilirsin.

// Her kitap için kapak dosyası
const COVER_MAP = {
  1: "atomic.png",
  2: "savas.png",
  3: "akis.png",
  4: "zenginbaba.png",
};

// ------------ ANA SAYFA: KİTAPLARI LİSTELE ------------
async function loadBooks() {
  const grid = document.getElementById("bookGrid");
  if (!grid) return; // reader.html'deysek çalışmasın

  const res = await fetch(`${API_BASE}/books`);
  const books = await res.json();

  books.forEach(book => {
    const div = document.createElement("div");
    div.className = "book-card";

    const img = document.createElement("img");
    const coverFile = COVER_MAP[book.id];
    if (coverFile) {
      img.src = coverFile; // aynı klasördeki png
    } else {
      img.src = `https://via.placeholder.com/300x260?text=${encodeURIComponent(book.title)}`;
    }
    img.alt = book.title;

    const title = document.createElement("h3");
    title.textContent = book.title;

    const desc = document.createElement("p");
    desc.textContent = book.description;

    div.appendChild(img);
    div.appendChild(title);
    div.appendChild(desc);

    div.onclick = () => {
      localStorage.setItem("selectedBookId", String(book.id));
      localStorage.setItem("selectedBookTitle", book.title);
      window.location.href = "reader.html";
    };

    grid.appendChild(div);
  });
}

// ------------ READER SAYFASI: KİTAP ADINI YÜKLE ------------
function initReader() {
  if (!window.location.pathname.endsWith("reader.html")) return;

  const title = localStorage.getItem("selectedBookTitle") || "Seçilen Kitap";
  document.getElementById("bookTitle").textContent = title;
}

// ------------ YAPAY ZEKAYA SORU GÖNDER ------------
async function askAI() {
  const questionInput = document.getElementById("userQuestion");
  const responseBox = document.getElementById("aiResponse");

  const question = questionInput.value.trim();
  const bookId = parseInt(localStorage.getItem("selectedBookId") || "0", 10);

  if (!bookId) {
    responseBox.textContent = "Önce anasayfadan bir kitap seçmelisin.";
    return;
  }

  if (!question) {
    responseBox.textContent = "Lütfen kitaba dair bir soru yaz (örneğin: 'Bu kitap ne anlatıyor?').";
    return;
  }

  responseBox.textContent = "Yapay zeka düşünürken lütfen bekle...";

  try {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: bookId,
        question: question
      }),
    });

    const data = await res.json();
    responseBox.textContent = data.answer || "Boş cevap döndü.";
  } catch (err) {
    console.error(err);
    responseBox.textContent = "Bir hata oluştu. Backend çalışıyor mu?";
  }
}

// Sayfa yüklendiğinde uygun fonksiyonları çalıştır
window.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  initReader();
});
