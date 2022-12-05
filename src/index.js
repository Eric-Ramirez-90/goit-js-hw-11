import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const refs = {
  form: document.querySelector('#search-form'),
  divGallery: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};

const simpleligthbox = new SimpleLightbox('.gallery a', { loop: false });

let page = 1;
let searchQuery = '';
let totalImages = 0;

const options = {
  root: null,
  rootMargin: '200px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(onLoad, options);

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31766486-572375a92de9bb4d66deb6c09';

refs.form.addEventListener('submit', onFormSubmit);

function onFormSubmit(evt) {
  evt.preventDefault();

  searchQuery = evt.currentTarget.elements.searchQuery.value.trim();

  resetPage();

  if (!searchQuery) {
    clearGalleryList();
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  getImages(searchQuery, page).then(({ data }) => {
    if (!data.totalHits) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      clearGalleryList();
      return;
    }

    clearGalleryList();
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    refs.divGallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
    observer.observe(refs.guard);
  });
}

async function getImages(searchQuery, page = 1) {
  const response = await axios.get(
    `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&page=${page}&per_page=40&image_type=photo&orientation=horizontal&safesearch=true`
  );
  const { data } = response;

  return { data };
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
      <div class="photo-card">
      <div class="thumb"><a class="gallery-item" href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" /></a></div>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads </b>${downloads}
    </p>
  </div>
</div>`
    )
    .join('');
}

function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      getImages(searchQuery, page)
        .then(({ data }) => {
          refs.divGallery.insertAdjacentHTML(
            'beforeend',
            createMarkup(data.hits)
          );
        })
        .then(() => simpleligthbox.refresh())
        .catch(error => {
          Notify.info(
            `We're sorry, but you've reached the end of search results.`
          );
          observer.unobserve(refs.guard);
        });
    }
  });
}

function clearGalleryList() {
  refs.divGallery.innerHTML = '';
}

function resetPage() {
  page = 1;
}
