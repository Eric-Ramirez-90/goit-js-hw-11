import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31766486-572375a92de9bb4d66deb6c09';

export async function fetchImagesApi(searchQuery, page = 1) {
  const response = await axios.get(
    `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&page=${page}&per_page=40&image_type=photo&orientation=horizontal&safesearch=true`
  );
  const { data } = response;

  return { data };
}
