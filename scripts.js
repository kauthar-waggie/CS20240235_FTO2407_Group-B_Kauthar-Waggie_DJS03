import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books

// Creating book and author data structures
const Book = (id, author, image, title, genres, published, description) => ({
    id, author, image, title, genres, published, description
});

const Author = (id, name) => ({ id, name });
const Genre = (id, name) => ({ id, name });

// Rendering the book list
function renderBookList(bookList) {
    const fragment = document.createDocumentFragment();
    bookList.slice(0, BOOKS_PER_PAGE).forEach(({ author, id, image, title }) => {
        const element = document.createElement('button');
        element.classList.add('preview');
        element.setAttribute('data-preview', id);
        element.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;
        fragment.appendChild(element);
    });
    document.querySelector('[data-list-items]').appendChild(fragment);
}

// Populating dropdowns for genres and authors
function populateDropdown(selectElement, options, defaultOptionText) {
    const fragment = document.createDocumentFragment();
    const firstOption = document.createElement('option');
    firstOption.value = 'any';
    firstOption.innerText = defaultOptionText;
    fragment.appendChild(firstOption);

    Object.entries(options).forEach(([id, name]) => {
        const optionElement = document.createElement('option');
        optionElement.value = id;
        optionElement.innerText = name;
        fragment.appendChild(optionElement);
    });

    selectElement.appendChild(fragment);
}

// Theme setting 
function setTheme(theme) {
    const colors = theme === 'night'
        ? { dark: '255, 255, 255', light: '10, 10, 20' }
        : { dark: '10, 10, 20', light: '255, 255, 255' };

    document.documentElement.style.setProperty('--color-dark', colors.dark);
    document.documentElement.style.setProperty('--color-light', colors.light);
}

// Toggle overlay visibility
function toggleOverlay(selector, isOpen) {
    document.querySelector(selector).open = isOpen;
}

// Filtering logic
function filterBooks(filters) {
    return books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;
        return genreMatch && titleMatch && authorMatch;
    });
}

// Handles search functionality
function handleSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    matches = filterBooks(filters);

    page = 1;
    document.querySelector('[data-list-items]').innerHTML = '';
    renderBookList(matches);

    document.querySelector('[data-list-button]').disabled = matches.length <= page * BOOKS_PER_PAGE;
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', matches.length < 1);
    toggleOverlay('[data-search-overlay]', false);
}

// Handles theme change
function handleThemeChange(event) {
    event.preventDefault();
    const theme = new FormData(event.target).get('theme');
    setTheme(theme);
    toggleOverlay('[data-settings-overlay]', false);
}

// Event listeners
function setupEventListeners() {
    document.querySelector('[data-search-cancel]').addEventListener('click', () => toggleOverlay('[data-search-overlay]', false));
    document.querySelector('[data-settings-cancel]').addEventListener('click', () => toggleOverlay('[data-settings-overlay]', false));
    document.querySelector('[data-header-search]').addEventListener('click', () => {
        toggleOverlay('[data-search-overlay]', true);
        document.querySelector('[data-search-title]').focus();
    });
    document.querySelector('[data-header-settings]').addEventListener('click', () => toggleOverlay('[data-settings-overlay]', true));
    document.querySelector('[data-list-close]').addEventListener('click', () => toggleOverlay('[data-list-active]', false));
    document.querySelector('[data-settings-form]').addEventListener('submit', handleThemeChange);
    document.querySelector('[data-search-form]').addEventListener('submit', handleSearch);
    document.querySelector('[data-list-button]').addEventListener('click', handleShowMore);
    document.querySelector('[data-list-items]').addEventListener('click', (event) => {
        const pathArray = Array.from(event.composedPath());
        const previewButton = pathArray.find(node => node.dataset?.preview);
        if (previewButton) displayActiveBook(previewButton.dataset.preview);
    });
}

// Load more books on click
function handleShowMore() {
    const fragment = document.createDocumentFragment();

    matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE).forEach(({ author, id, image, title }) => {
        const element = document.createElement('button');
        element.classList.add('preview');
        element.setAttribute('data-preview', id);
        element.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;
        fragment.appendChild(element);
    });

    document.querySelector('[data-list-items]').appendChild(fragment);
    page += 1;
}

// Display active book details
function displayActiveBook(bookId) {
    const activeBook = books.find(book => book.id === bookId);
    if (activeBook) {
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = activeBook.image;
        document.querySelector('[data-list-image]').src = activeBook.image;
        document.querySelector('[data-list-title]').innerText = activeBook.title;
        document.querySelector('[data-list-subtitle]').innerText = `${authors[activeBook.author]} (${new Date(activeBook.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = activeBook.description;
    }
}

// Initial setup
function initialize() {
    renderBookList(matches);
    populateDropdown(document.querySelector('[data-search-genres]'), genres, 'All Genres');
    populateDropdown(document.querySelector('[data-search-authors]'), authors, 'All Authors');
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day');
    document.querySelector('[data-list-button]').innerText = `Show more (${books.length - BOOKS_PER_PAGE})`;
    setupEventListeners();
}

// Start the application
initialize();