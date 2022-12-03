import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';

const refs = {
  form: document.querySelector('#search-form'),
  divGallery: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};

let page = 0;

const options = {
  root: null,
  rootMargin: '200px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(onLoad, options);

function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      getImages().then(({ data }) => {
        refs.divGallery.insertAdjacentHTML(
          'beforeend',
          createMarkup(data.hits)
        );
      });
    }
  });
}

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31766486-572375a92de9bb4d66deb6c09';

refs.form.addEventListener('submit', onFormSubmit);

function onFormSubmit(evt) {
  evt.preventDefault();

  const searchQuery = evt.currentTarget.elements.searchQuery.value.trim();

  if (!searchQuery) {
    clearGalleryList();
    return;
  }

  getImages(searchQuery).then(({ data }) => {
    if (!data.totalHits) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    // clearGalleryList();
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    refs.divGallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
    observer.observe(refs.guard);
  });
}

async function getImages(inputValue, page = 1) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${inputValue}&page=${page}&per_page=40&image_type=photo&orientation=horizontal&safesearch=true`
    );
    const { data } = response;

    return { data };
  } catch (error) {
    console.error(error);
  }
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageUR,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
  <img class="card-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
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

function clearGalleryList() {
  refs.divGallery.innerHTML = '';
}
