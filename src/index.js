import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImagesApi } from './fetchImagesApi';

const refs = {
  form: document.querySelector('#search-form'),
  divGallery: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};

const simpleligthbox = new SimpleLightbox('.gallery a', { loop: false });

let page = 1;
let totalPages = 0;
let searchQuery = '';
const imagesPerPage = 40;

const options = {
  root: null,
  rootMargin: '200px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(onLoad, options);

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

  fetchImagesApi(searchQuery, page)
    .then(({ data }) => {
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
      totalPages = Math.ceil(data.totalHits / imagesPerPage);
      if (page === totalPages) {
        console.log(page);
        Notify.info(
          `We're sorry, but you've reached the end of search results.`
        );
        observer.unobserve(refs.guard);

        return;
      }
    })
    .then(() => simpleligthbox.refresh());
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

      fetchImagesApi(searchQuery, page)
        .then(({ data }) => {
          refs.divGallery.insertAdjacentHTML(
            'beforeend',
            createMarkup(data.hits)
          );
          totalPages = Math.ceil(data.totalHits / imagesPerPage);
          if (page === totalPages) {
            console.log(page);
            Notify.info(
              `We're sorry, but you've reached the end of search results.`
            );
            observer.unobserve(refs.guard);

            return;
          }
        })
        .then(() => simpleligthbox.refresh());
    }
  });
}

function clearGalleryList() {
  refs.divGallery.innerHTML = '';
}

function resetPage() {
  page = 1;
}
