// ======================
// VARIABLES GLOBALES
// ======================
let books = [];
let authors = [];
let chart = null;
let editIndex = null;

// ======================
// INITIALISATION
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const storedBooks = localStorage.getItem("books");
  const storedAuthors = localStorage.getItem("authors");

  if (storedBooks) books = JSON.parse(storedBooks);
  if (storedAuthors) authors = JSON.parse(storedAuthors);

  displayBooks();
  displayAuthors();
  updateDashboard();
});

// ======================
// NAVIGATION SPA
// ======================
function showSection(id) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

// ======================
// AJOUT / MODIFICATION LIVRE
// ======================
function addBook() {
  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();

  if (title === "" || author === "") {
    alert("Veuillez remplir tous les champs");
    return;
  }

  if (editIndex !== null) {
    books[editIndex] = { title, author };
    editIndex = null;
    document.getElementById("addBtn").textContent = "Ajouter";
  } else {
    // Vérifier si le livre existe déjà
    const exists = books.some(b => b.title === title && b.author === author);
    if (exists) {
      alert("Ce livre existe déjà !");
      return;
    }
    books.push({ title, author });
  }

  titleInput.value = "";
  authorInput.value = "";

  saveBooks();
  displayBooks();
  updateDashboard();
}

// ======================
// MODIFIER LIVRE
// ======================
function editBook(index) {
  document.getElementById("title").value = books[index].title;
  document.getElementById("author").value = books[index].author;
  document.getElementById("addBtn").textContent = "Modifier";
  editIndex = index;
}

// ======================
// SUPPRIMER LIVRE
// ======================
function deleteBook(index) {
  if (confirm("Voulez-vous supprimer ce livre ?")) {
    books.splice(index, 1);
    saveBooks();
    displayBooks();
    updateDashboard();
  }
}

// ======================
// AFFICHAGE DES LIVRES
// ======================
function displayBooks(filteredBooks = books) {
  const list = document.getElementById("bookList");
  list.innerHTML = "";

  filteredBooks.forEach((book, index) => {
    list.innerHTML += `
      <li>
        ${book.title} - ${book.author}
        <div>
          <button class="btn-edit" onclick="editBook(${index})">✏️</button>
          <button class="btn-delete" onclick="deleteBook(${index})">❌</button>
        </div>
      </li>
    `;
  });
}

// ======================
// RECHERCHE LIVRES
// ======================
function searchBooks() {
  const keyword = document.getElementById("searchBook").value.toLowerCase();

  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(keyword) ||
    book.author.toLowerCase().includes(keyword)
  );

  displayBooks(filtered);
}

// ======================
// AJOUT ÉCRIVAIN MANUEL
// ======================
function addAuthor() {
  const input = document.getElementById("authorName");
  const name = input.value.trim();

  if (name === "") {
    alert("Veuillez saisir un nom");
    return;
  }

  if (authors.includes(name)) {
    alert("Cet écrivain existe déjà");
    return;
  }

  authors.push(name);
  saveAuthors();
  displayAuthors();
  updateDashboard();

  input.value = "";
}

// ======================
// AFFICHAGE ÉCRIVAINS (fusion manuelle + livres)
// ======================
function displayAuthors() {
  const list = document.getElementById("authorList");
  list.innerHTML = "";

  // Tous les auteurs uniques (livres + manuels)
  const bookAuthors = books.map(b => b.author);
  const allAuthors = [...new Set([...authors, ...bookAuthors])];

  allAuthors.forEach((author, index) => {
    list.innerHTML += `
      <li>
        ${author}
        <button class="btn-delete" onclick="deleteAuthorFromManual(${index})">❌</button>
      </li>
    `;
  });
}

// ======================
// SUPPRESSION AUTEURS MANUELS SEULEMENT
// ======================
function deleteAuthorFromManual(index) {
  if (index >= authors.length) {
    alert("Impossible de supprimer un auteur provenant d'un livre !");
    return;
  }

  if (confirm("Supprimer cet écrivain ajouté manuellement ?")) {
    authors.splice(index, 1);
    saveAuthors();
    displayAuthors();
    updateDashboard();
  }
}

// ======================
// LOCALSTORAGE
// ======================
function saveBooks() {
  localStorage.setItem("books", JSON.stringify(books));
}

function saveAuthors() {
  localStorage.setItem("authors", JSON.stringify(authors));
}

// ======================
// DASHBOARD
// ======================
function updateDashboard() {
  document.getElementById("totalBooks").textContent = books.length;

  const allAuthors = [...new Set([...authors, ...books.map(b => b.author)])];
  document.getElementById("totalAuthors").textContent = allAuthors.length;

  updateChart(allAuthors);
}

// ======================
// CHART.JS
// ======================
function updateChart(allAuthors) {
  const counts = allAuthors.map(author =>
    books.filter(book => book.author === author).length
  );

  const ctx = document.getElementById("booksChart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: allAuthors,
      datasets: [{
        label: "Nombre de livres par auteur",
        data: counts,
        backgroundColor: "rgba(88,146,26,0.8)"
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ======================
// API OPENLIBRARY
// ======================
function loadAPI() {
  fetch("https://openlibrary.org/search.json?q=javascript")
    .then(res => res.json())
    .then(data => {
      let newBooksCount = 0;

      // Créer un Set unique pour comparer les livres existants
      const existingBooksSet = new Set(
        books.map(b => (b.title + "||" + b.author).toLowerCase().trim())
      );

      data.docs.slice(0, 5).forEach(apiBook => {
        const title = (apiBook.title || "").trim();
        const author = (apiBook.author_name ? apiBook.author_name[0] : "Auteur inconnu").trim();

        const key = (title + "||" + author).toLowerCase();
        if (!existingBooksSet.has(key)) {
          books.push({ title, author });
          existingBooksSet.add(key); // Ajouter au Set pour éviter doublons multiples
          newBooksCount++;
        }
      });

      if (newBooksCount > 0) {
        saveBooks();
        displayBooks();
        displayAuthors();
        updateDashboard();
        alert(`📚 ${newBooksCount} livre(s) de l'API ajouté(s) avec succès !`);
      } else {
        alert("Les livres de l'API sont déjà présents.");
      }
    })
    .catch(() => {
      alert("Erreur lors du chargement de l'API");
    });
}
