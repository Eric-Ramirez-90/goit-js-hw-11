import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31766486-572375a92de9bb4d66deb6c09';

export default async function getImages() {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=dog&page=1&per_page=40&image_type=photo&orientation=horizontal&safesearch=true`
    );
    console.log(response.data.hits);
  } catch (error) {
    console.error(error);
  }
}

getImages();
