function libraryApp() {
    return {
      searchQuery: '',
      modalOpen: false,
      selectedBook: {},
      categories: ['All', 'Fiction', 'Non-Fiction', 'Science', 'History'],
      selectedCategory: 'All',
      books: [],
      filteredBooks: [],
      paginatedBooks: [],
      currentPage: 1,
      itemsPerPage: 6, 
      totalPages: 1,
      noBooksAvailable: false,


      init() {
        this.loadBooks();
      },

      loadBooks() {
        fetch("books.json")
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            this.books = data;
            this.filteredBooks = this.books; 
            this.updatePagination();
            this.fetchCovers();
          })
          .catch((error) => {
            console.error("Unable to load books:", error);
          });
      },

      filterBooks() {
        this.filteredBooks = this.books.filter(book =>
          book.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
        this.noBooksAvailable = this.filteredBooks.length === 0;
        this.updatePagination();
      },

      filterByCategory(category) {
        this.filteredBooks = category === 'All'
          ? this.books
          : this.books.filter(book => book.genre === category);
        this.updatePagination();
        this.noBooksAvailable = this.filteredBooks.length === 0;
        this.selectedCategory = category;
      },

      updatePagination() {
        this.totalPages = Math.ceil(this.filteredBooks.length / this.itemsPerPage);
        this.paginatedBooks = this.filteredBooks.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );
      },

      goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.updatePagination();
      },

      fetchCovers() {
        this.books.forEach(book => {
          const localImagePath = `assets/images/covers/${book.isbn}.jpg`; 
          const fallbackImage = 'https://via.placeholder.com/150?text=No+Cover'; 
          const remoteImageUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`; 
      
          const img = new Image();
          img.onload = () => {
            this.isImageEmpty(localImagePath).then(isEmpty => {
                if (isEmpty) {
                    img.onerror(); 
                } else {
                    book.cover = localImagePath;
                    book.imageLoaded = true;
                }
              });

           
          };
          img.onerror = () => {
            fetch(remoteImageUrl)
              .then(response => {
                if (response.ok && response.redirected) {
                  book.cover = response.url;
                } else {
                  book.cover = fallbackImage;
                }
                book.imageLoaded = true;
              })
              .catch(() => {
                book.cover = fallbackImage;
                book.imageLoaded = true;
              });
          };
          img.src = localImagePath;
        });
      },


      isImageEmpty(url) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous'; 
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
      
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
      
            const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const isEmpty = pixels.every(value => value === pixels[0]); 
            resolve(isEmpty);
          };
          img.onerror = () => reject();
          img.src = url;
        });
      },

      showModal(book) {

      this.selectedBook = { ...book, description: 'Loading description...' }; 
      this.modalOpen = true;

      fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}`)
        .then(response => response.json())
        .then(data => {
          if (data.items && data.items.length > 0) {
            const description = data.items[0].volumeInfo.description;
            const link = data.items[0].volumeInfo.previewLink; 
            const wordsLimit = 500;
            this.selectedBook.description = this.truncateString(description, wordsLimit, link) || 'No description available.';
          } else {
            this.selectedBook.description = 'No description available.';
          }
        })
        .catch(() => {
          this.selectedBook.description = 'Error fetching description.';
        });
      },

      truncateString(str, num, link) {
        const truncated = str.length > num ? str.slice(0, num) : str;

        return (
            truncated +
            `<br><a href="${link}" target="_blank" target="_blank" class="text-blue-600 visited:text-purple-600"> Read more...</a>`
          );
      },

      fetchCoversAndDownloadZip() {
        const zip = new JSZip();
        const imagesFolder = zip.folder("book-covers");
        const fetchPromises = []; 
      
        this.books.forEach((book, index) => {
          const imageUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
          const defaultFilename = `${book.isbn || `book-cover-${index + 1}`}.jpg`;
      
          const fetchPromise = fetch(imageUrl)
            .then(response => {
              if (!response.ok) throw new Error(`Failed to fetch ${imageUrl}`);
              return response.blob(); 
            })
            .then(blob => {
              imagesFolder.file(defaultFilename, blob); 
              console.log(`Added ${defaultFilename} to ZIP`);
            })
            .catch(error => {
              console.error(error.message);
            });
      
          fetchPromises.push(fetchPromise);
        });
      
        Promise.all(fetchPromises)
          .then(() => {
            return zip.generateAsync({ type: "blob" });
          })
          .then(zipBlob => {
            saveAs(zipBlob, "book-covers.zip");
            console.log("Downloaded ZIP file!");
          })
          .catch(error => {
            console.error("Error creating ZIP file:", error);
          });
      }

    };
    
  }