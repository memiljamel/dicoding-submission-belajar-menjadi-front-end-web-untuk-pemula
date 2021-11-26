const book = {
    inputBook: {
        formSubmit: document.getElementById('inputBook'),
        title: document.getElementById('inputBookTitle'),
        author: document.getElementById('inputBookAuthor'),
        year: document.getElementById('inputBookYear'),
        checkbox: document.getElementById('inputBookIsComplete'),
        buttonSubmit: document.getElementById('bookSubmit'),
        getInputBook: function(){
            const idNumber = new Date();
            return {
                id: idNumber.getTime(),
                title: this.title.value,
                author: this.author.value,
                year: this.year.value,
                isComplete: this.checkbox.checked
            }
        },
        setInputBook: function(){
            this.title.value='';
            this.author.value='';
            this.year.value='';
            this.checkbox.checked = false;
        },
        changeValueCheckBox: function(){
            this.checkbox.addEventListener('change', ()=>{
                const status = this.buttonSubmit.querySelector('span');
                const button = this.checkbox;
                if(button.checked==true){
                    status.textContent="Selesai dibaca";
                }else{
                    status.textContent="Belum selesai dibaca";
                }
            })
        },
        buttonTrigger: function(){
           this.buttonSubmit.addEventListener('click', (e)=>{
                e.preventDefault();
                if(this.formSubmit.checkValidity()==true){
                    book.localHost.insertToLocalHost();
                    book.bookShelf.setBookList();
                    this.setInputBook();
                }else{
                    this.formSubmit.reportValidity();
                }
            })
        }
    },
    localHost: {
        getLocalHostData: function(){
            return JSON.parse(window.localStorage.getItem('Data'));
        },
        setLocalHost: function(data){
            window.localStorage.setItem("Data", JSON.stringify(data));
        },
        changeLocalHost: function(target){
            const data = book.localHost.getLocalHostData();
            const targetId = target.parentElement.getAttribute('data-id');
            let newData = [];
            data.forEach(book => {
                if(book.id==targetId){
                    if(book.isComplete==false){
                        book.isComplete= true;
                    }else{
                        book.isComplete= false;
                    }
                }
                newData.push(book);
            });
            this.setLocalHost(newData);
            book.bookShelf.setBookList();
        },
        deleteLocalHost: function(target){
            const data = book.localHost.getLocalHostData();
            const targetId = target.parentElement.getAttribute('data-id');
            let newData = [];
            console.log(data);
            console.log(targetId);
            data.forEach( book => {
                if(book.id!=targetId){
                    newData.push(book);
                }
            });
            this.setLocalHost(newData);
            book.bookShelf.setBookList();
        },
        insertToLocalHost: function(){
            const books = book.inputBook.getInputBook();
            if(window.localStorage.hasOwnProperty("Data")===true){
                let data = this.getLocalHostData();
                data.push(books);
                this.setLocalHost(data);
            }else{
                this.setLocalHost([books]);
            }
        }
    },
    searchBook: {
        inputSearch: document.getElementById('searchBookTitle'),
        buttonSearch: document.getElementById('searchSubmit'),
        getInputSearch: function(){
            return this.inputSearch.value;
        },
        setInputSearch: function(){
            this.inputSearch.value='';
        },
        filterSearch: function(data, input){
            let result = [];
            data.forEach(el => {
                let item = el.title.toLowerCase();
                if(item.includes(input.toLowerCase())){
                    result.push(el);
                }
            });
            return result;
        },
        buttonTrigger: function(){
            this.buttonSearch.addEventListener('click', (e)=>{
                e.preventDefault();
                let input = this.getInputSearch();
                let data = book.localHost.getLocalHostData();
                let result =  this.filterSearch(data,input);
                if(input!==''){
                    book.bookShelf.setBookList(result);
                }else{
                    book.bookShelf.setBookList(data);
                }
            })
        }
    },
    bookShelf: {
        getBookList: function(){
            return document.querySelectorAll('.book_list');
        },
        setBookList: function(refData){
            if(window.localStorage.hasOwnProperty("Data")===true){
                const data = refData||book.localHost.getLocalHostData();
                const bookList = this.getBookList();
                let inCom = '';
                let com = '';
                data.forEach(book => {
                    if(book.isComplete==true){
                        com+=this.buildBookList('Belum selesai dibaca',book);
                    }else{
                        inCom+=this.buildBookList('Selesai dibaca',book);
                    }
                });
                bookList[0].innerHTML= inCom;
                bookList[1].innerHTML= com;
            }
        },
        buttonTrigger(){
            let bookList = this.getBookList();
            bookList.forEach( list => {
                list.addEventListener('click', function(e){
                    if(e.target.className=='green'){
                            book.localHost.changeLocalHost(e.target);
                    }else if(e.target.className=='red'){
                            book.localHost.deleteLocalHost(e.target);
                    }
                })
            });
        },
        buildBookList: function(status,data){
            return `
                <article class="book_item">
                <h3>${data.title}</h3>
                <p>${data.author}</p>
                <p>${data.year}</p>
                <div data-id='${data.id}' class="action">
                <button class="green">${status}</button><button class="red">Hapus buku</button>
                </article>
            `
        }
    }
}

//Merubah Status tombol melalui perubahan checkbox
book.inputBook.changeValueCheckBox();
//untuk memasukan data
book.inputBook.buttonTrigger();
//untuk clear input data
book.inputBook.setInputBook();
//Untuk filter pencarian
book.searchBook.buttonTrigger();
//untuk clear input pencarian
book.searchBook.setInputSearch();
//Untuk menghapus atau mengubah buku yang sudah di input
book.bookShelf.buttonTrigger();
//Memasukan data ke html
book.bookShelf.setBookList();