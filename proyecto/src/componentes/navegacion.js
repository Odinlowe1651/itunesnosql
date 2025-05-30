// src/componentes/navegacion.js

let currentTab = 'home';
let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');

export function initTabNavigation() {
  const tabBar = document.getElementById('tab-bar');
  const tabButtons = tabBar.querySelectorAll('button[data-tab]');
  
  // Mostrar tab bar
  tabBar.style.display = 'flex';
  
  // Event listeners para las pestañas
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      switchTab(tabId);
    });
  });
  
  // Mostrar tab inicial
  switchTab('home');
}

export function hideTabNavigation() {
  const tabBar = document.getElementById('tab-bar');
  tabBar.style.display = 'none';
}

function switchTab(tabId) {
  // Actualizar botones activos
  const tabButtons = document.querySelectorAll('#tab-bar button[data-tab]');
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  
  currentTab = tabId;
  
  // Renderizar contenido según la pestaña
  switch(tabId) {
    case 'home':
      renderHomeTab();
      break;
    case 'music':
      renderMusicTab();
      break;
    case 'movies':
      renderMoviesTab();
      break;
    case 'tones':
      renderTonesTab();
      break;
    case 'charts':
      renderChartsTab();
      break;
    case 'favoritos':
      renderFavoritosTab();
      break;
  }
}

async function renderHomeTab() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Destacados</h1>
    <div class="list" id="home-list"></div>
  `;
  
  try {
    await fetchAndRender('/search', 'home-list', { term: 'top songs', media: 'music', limit: 20 });
  } catch (error) {
    console.error('Error cargando destacados:', error);
  }
}

async function renderMusicTab() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Búsqueda de Música</h1>
    <div class="search-filter">
      <input type="text" id="search-input" placeholder="Buscar música...">
      <select id="media-filter">
        <option value="">Todos</option>
        <option value="music">Música</option>
        <option value="album">Álbum</option>
      </select>
    </div>
    <div class="list" id="music-list"></div>
  `;
  
  // Event listeners para búsqueda
  const searchInput = document.getElementById('search-input');
  const filterSelect = document.getElementById('media-filter');
  let debounceTimeout;
  
  const performSearch = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const term = searchInput.value.trim();
      const media = filterSelect.value;
      if (term) {
        fetchAndRender('/search', 'music-list', { term, media, limit: 20 });
      }
    }, 400);
  };
  
  searchInput.addEventListener('input', performSearch);
  filterSelect.addEventListener('change', performSearch);
  
  // Búsqueda inicial
  await fetchAndRender('/search', 'music-list', { term: 'pop', media: 'music', limit: 20 });
}

async function renderMoviesTab() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Películas</h1>
    <div class="list" id="movies-list"></div>
  `;
  
  await fetchAndRender('/search', 'movies-list', { term: 'action', media: 'movie', limit: 20 });
}

async function renderTonesTab() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Tonos</h1>
    <div class="list" id="tones-list"></div>
  `;
  
  await fetchAndRender('/search', 'tones-list', { term: 'ringtone', entity: 'ringtone', limit: 20 });
}

async function renderChartsTab() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Charts</h1>
    <div class="list" id="charts-list"></div>
  `;
  
  await fetchAndRender('/search', 'charts-list', { term: 'top hits', media: 'music', limit: 20 });
}

function renderFavoritosTab() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Favoritos</h1>
    <div class="list" id="favorites-list"></div>
  `;
  
  const favoritesList = document.getElementById('favorites-list');
  
  if (favoritos.length === 0) {
    favoritesList.innerHTML = '<p style="color:#888;text-align:center;">Aún no tienes favoritos</p>';
    return;
  }
  
  favoritesList.innerHTML = favoritos.map(item => `
    <div class="item">
      <img src="${item.artworkUrl100}" alt="${item.trackName || item.collectionName}" />
      <p>${item.trackName || item.collectionName}</p>
      ${item.previewUrl ? `<audio controls src="${item.previewUrl}"></audio>` : ''}
    </div>
  `).join('');
}

async function fetchAndRender(endpoint, containerId, params = {}) {
  const API_BASE = 'https://itunes.apple.com';
  const url = new URL(`${API_BASE}${endpoint}`);
  
  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.append(k, v);
  });
  
  try {
    const res = await fetch(url);
    const { results } = await res.json();
    const container = document.getElementById(containerId);
    
    if (!results || !results.length) {
      container.innerHTML = '<p style="color:#888; text-align:center;">No hay resultados disponibles</p>';
      return;
    }
    
    container.innerHTML = results.map((item, i) => `
      <div class="item">
        <img src="${item.artworkUrl100}" alt="${item.trackName || item.collectionName}" />
        <button class="favorite-btn" data-item='${JSON.stringify(item)}' title="Agregar a favoritos">★</button>
        <p>${item.trackName || item.collectionName}</p>
        ${item.previewUrl ? `<audio controls src="${item.previewUrl}"></audio>` : ''}
      </div>
    `).join('');
    
    // Event listeners para favoritos
    container.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const item = JSON.parse(btn.dataset.item);
        addToFavorites(item);
      });
    });
    
  } catch (error) {
    console.error('Error fetching data:', error);
    const container = document.getElementById(containerId);
    container.innerHTML = '<p style="color:#888; text-align:center;">Error al cargar contenido</p>';
  }
}

function addToFavorites(item) {
  if (!favoritos.some(f => f.trackId === item.trackId)) {
    favoritos.push(item);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    
    // Mostrar feedback
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      background: #1DB954;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = 'Agregado a favoritos';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  }
}