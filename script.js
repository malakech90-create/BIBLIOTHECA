let books = [];

function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;

  if (title === "" || author === "") {
    alert("Veuillez remplir tous les champs");
    return;
  }

  const book = {
    title: title,
    author: author
  };

  books.push(book);
  displayBooks();

  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
}

function displayBooks() {
  const list = document.getElementById("bookList");
  list.innerHTML = "";

  books.forEach(function (book, index) {
    const li = document.createElement("li");
    li.textContent = book.title + " - " + book.author;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Supprimer";
    deleteBtn.onclick = function () {
      books.splice(index, 1);
      displayBooks();
    };

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}