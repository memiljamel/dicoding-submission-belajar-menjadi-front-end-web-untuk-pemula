/**
 * [
 *    {
 *      id: <string|int>
 *      title: <string>
 *      author: <string>
 *      year: <int>
 *      isComplete: <boolean>
 *    }
 * ]
 */
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function isStorageExists() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }

  return true;
}

function saveData() {
  if (isStorageExists()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const textTitle = document.createElement('h3');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = author;

  const textYear = document.createElement('p');
  textYear.innerText = year;

  const undoButton = document.createElement('button');
  undoButton.setAttribute('type', 'button');
  undoButton.classList.add('green');

  if (isComplete) {
    undoButton.innerText = 'Belum selesai di Baca';

    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(id);
    });
  } else {
    undoButton.innerText = 'Selesai dibaca';

    undoButton.addEventListener('click', function () {
      addBookToCompleted(id);
    });
  }

  const updateButton = document.createElement('button');
  updateButton.setAttribute('type', 'button');
  updateButton.classList.add('yellow');
  updateButton.innerText = 'Edit buku';

  updateButton.addEventListener('click', function () {
    updateBookFromCompleted(id);
  });

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('type', 'button');
  deleteButton.classList.add('red');
  deleteButton.innerText = 'Hapus buku';

  deleteButton.addEventListener('click', function () {
    removeBookFromCompleted(id);
  });

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('action');
  buttonContainer.append(undoButton, updateButton, deleteButton);

  const container = document.createElement('article');
  container.classList.add('book_item');
  container.append(textTitle, textAuthor, textYear, buttonContainer);
  container.setAttribute('id', `book-${id}`);

  return container;
}

function makeMessage(message) {
  const textMessage = document.createElement('p');
  textMessage.innerText = message;

  const container = document.createElement('div');
  container.classList.add('book_item');
  container.append(textMessage);

  return container;
}

function addBook() {
  const inputBookForm = document.getElementById('inputBook');
  const bookId = inputBookForm.dataset.editingId;

  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = document.getElementById('inputBookYear').value;
  const checkbox = document.getElementById('inputBookIsComplete').checked;

  if (bookId !== undefined) {
    const bookTarget = findBookIndex(Number(bookId));

    if (bookTarget === -1) return;

    books[bookTarget] = generateBookObject(Number(bookId), title, author, year, checkbox);
    delete inputBookForm.dataset.editingId;
  } else {
    const id = generateId();
    const bookObject = generateBookObject(id, title, author, year, checkbox);
    books.push(bookObject);
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function filterBook() {
  const title = document.getElementById('searchBookTitle').value;

  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);

  const bookObject = data.filter(
    (book) => book.title.toLowerCase().includes(title.toLowerCase())
  );
  books.length = 0;
  books.push(...bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function updateBookFromCompleted(bookId) {
  const inputBookForm = document.getElementById('inputBook');
  const title = document.getElementById('inputBookTitle');
  const author = document.getElementById('inputBookAuthor');
  const year = document.getElementById('inputBookYear');
  const checkbox = document.getElementById('inputBookIsComplete');

  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  title.value = bookTarget.title;
  author.value = bookTarget.author;
  year.value = bookTarget.year;
  checkbox.checked = bookTarget.isComplete;

  inputBookForm.dataset.editingId = bookId;

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function removeBookFromCompleted(bookId) {
  Swal.fire({
    title: 'Apa kamu yakin?',
    text: 'Anda tidak akan dapat mengembalikan ini!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085D6',
    cancelButtonColor: '#D33333',
    confirmButtonText: 'Ya, hapus!'
  }).then((result) => {
    if (result.isConfirmed) {
      const bookTarget = findBookIndex(bookId);

      if (bookTarget === -1) return;

      books.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();

      Swal.fire({
        title: 'Dihapus!',
        text: 'Data Anda telah dihapus.',
        icon: 'success'
      });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: 'Dibatalkan',
        text: 'Data Anda aman :)',
        icon: 'error'
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const inputBookForm = document.getElementById('inputBook');
  inputBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  const searchBookForm = document.getElementById('searchBook');
  searchBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    filterBook();
  });

  if (isStorageExists()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, function () {
  Swal.fire({
    title: 'Disimpan!',
    text: 'Data Anda telah disimpan.',
    icon: 'success'
  });
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById('incompleteBookshelfList');
  uncompletedBOOKList.innerHTML = '';

  const completedBOOKList = document.getElementById('completeBookshelfList');
  completedBOOKList.innerHTML = '';

  const uncompletedBooks = books.filter((book) => !book.isComplete);

  if (uncompletedBooks.length > 0) {
    for (const bookItem of uncompletedBooks) {
      const bookElement = makeBook(bookItem);
      uncompletedBOOKList.append(bookElement);
    }
  } else {
    const uncompletedMessageElement = makeMessage('Tidak ada data yang tersedia.');
    uncompletedBOOKList.append(uncompletedMessageElement);
  }

  const completedBooks = books.filter((book) => book.isComplete);

  if (completedBooks.length > 0) {
    for (const bookItem of completedBooks) {
      const bookElement = makeBook(bookItem);
      completedBOOKList.append(bookElement);
    }
  } else {
    const completedMessageElement = makeMessage('Tidak ada data yang tersedia.');
    completedBOOKList.append(completedMessageElement);
  }
});
