console.log('Hello World!');

const form = document.querySelector('form'); // grabbing an element on the page
const errorElement = document.querySelector('.error-message');
const loadingElement = document.querySelector('.loading');
const mewsElement = document.querySelector('.mews');
const loadMoreElement = document.querySelector('#loadMore');

// const API_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') ? 'http://localhost:5000/v2/mews' : 'https://meower-api.now.sh/v2/mews';
const API_URL = "http://localhost:5000"
let skip = 0;
let limit = 5;
let loading = false;
let finished = false;

errorElement.style.display = 'none';

function loadMore() {
    skip += limit;
    listAllMews(false);
  }

document.addEventListener('scroll', () => {
  const rect = loadMoreElement.getBoundingClientRect();
  if (rect.top < window.innerHeight && !loading && !finished) {
    loadMore();
  }
});


function listAllMews(reset = true) {
    loading = true;
    if (reset) {
      mewsElement.innerHTML = '';
      skip = 0;
      finished = false;
    }

listAllMews();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = formData.get('name');
  const content = formData.get('content');

  if (name.trim() && content.trim()) {
    errorElement.style.display = 'none';
    form.style.display = 'none';
    loadingElement.style.display = '';

    const mew = {
      name,
      content
    };
    
    


}


  
//   fetch(`${API_URL}?skip=${skip}&limit=${limit}`)
//     .then(response => response.json())
//     .then(result => {
//       result.mews.forEach(mew => {
//         const div = document.createElement('div');
//         console.log(result)

//         const header = document.createElement('h3');
//         header.textContent = mew.name;

//         const contents = document.createElement('p');
//         contents.textContent = mew.content;

//         const date = document.createElement('small');
//         date.textContent = new Date(mew.created);

//         div.appendChild(header);
//         div.appendChild(contents);
//         div.appendChild(date);

//         mewsElement.appendChild(div);
//       });
//       loadingElement.style.display = 'none';
//       if (!result.meta.has_more) {
//         loadMoreElement.style.visibility = 'hidden';
//         finished = true;
//       } else {
//         loadMoreElement.style.visibility = 'visible';
//       }
//       loading = false;
//     });
// }