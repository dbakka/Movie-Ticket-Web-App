// Constants
const BASE_URL = 'http://localhost:3000';
const FILMS_URL = `${BASE_URL}/films`;
const TICKETS_URL = `${BASE_URL}/tickets`;

// DOM Elements
const filmsList = document.getElementById('films');
const movieDetails = document.getElementById('showing');

// State
let currentFilm = null;

// Fetch first film and all films when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchFirstFilm();
    fetchAllFilms();
});

// Fetch first film
function fetchFirstFilm() {
    fetch(`${FILMS_URL}/1`)
        .then(response => response.json())
        .then(film => {
            currentFilm = film;
            renderFilmDetails(film);
        });
}

// Fetch all films
function fetchAllFilms() {
    fetch(FILMS_URL)
        .then(response => response.json())
        .then(films => {
            filmsList.innerHTML = '';
            films.forEach(film => {
                const li = document.createElement('li');
                li.classList.add('film', 'item');
                li.textContent = film.title;
                li.addEventListener('click', () => fetchFilmDetails(film.id));
                
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-btn');
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteFilm(film.id);
                });
                
                li.appendChild(deleteButton);
                filmsList.appendChild(li);
            });
        });
}

// Fetch film details
function fetchFilmDetails(id) {
    fetch(`${FILMS_URL}/${id}`)
        .then(response => response.json())
        .then(film => {
            currentFilm = film;
            renderFilmDetails(film);
        });
}

// Render film details
function renderFilmDetails(film) {
    const availableTickets = film.capacity - film.tickets_sold;
    document.getElementById('poster').src = film.poster;
    document.getElementById('title').textContent = film.title;
    document.getElementById('runtime').textContent = `${film.runtime} minutes`;
    document.getElementById('film-info').textContent = film.description;
    document.getElementById('showtime').textContent = film.showtime;
    document.getElementById('ticket-num').textContent = availableTickets;
    
    const buyTicketButton = document.getElementById('buy-ticket');
    buyTicketButton.textContent = availableTickets === 0 ? 'Sold Out' : 'Buy Ticket';
    buyTicketButton.disabled = availableTickets === 0;
    
    buyTicketButton.onclick = buyTicket;

    updateFilmListItem(film.id, availableTickets === 0);
}

// Buy ticket
function buyTicket() {
    if (currentFilm.tickets_sold < currentFilm.capacity) {
        currentFilm.tickets_sold++;
        updateFilm(currentFilm)
            .then(() => {
                postTicket(currentFilm.id);
                renderFilmDetails(currentFilm);
            });
    }
}

// Update film on server
function updateFilm(film) {
    return fetch(`${FILMS_URL}/${film.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickets_sold: film.tickets_sold }),
    }).then(response => response.json());
}

// Post new ticket
function postTicket(filmId) {
    return fetch(TICKETS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ film_id: filmId, number_of_tickets: 1 }),
    }).then(response => response.json());
}

// Delete film
function deleteFilm(id) {
    fetch(`${FILMS_URL}/${id}`, {
        method: 'DELETE',
    }).then(() => {
        const filmItem = filmsList.querySelector(`li:contains("${currentFilm.title}")`);
        if (filmItem) {
            filmItem.remove();
        }
        if (currentFilm && currentFilm.id === id) {
            movieDetails.innerHTML = '<p>Select a movie from the list.</p>';
            currentFilm = null;
        }
        fetchAllFilms(); // Refresh the film list
    });
}

// Update film list item
function updateFilmListItem(id, soldOut) {
    const filmItem = filmsList.querySelector(`li:contains("${currentFilm.title}")`);
    if (filmItem) {
        if (soldOut) {
            filmItem.classList.add('sold-out');
        } else {
            filmItem.classList.remove('sold-out');
        }
    }
}