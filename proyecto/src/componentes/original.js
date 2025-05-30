import { auth, db } from '../firebaseConfig.js';
import { doc, collection, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Módulo para registrar y mostrar las últimas canciones reproducidas por el usuario
const app = document.getElementById('app');
let uid = null;

function createElement(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'className') el.className = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child instanceof Node) el.appendChild(child);
  }
  return el;
}

async function guardarReproduccion(cancion) {
  if (!uid) return;
  const fecha = new Date().toISOString();
  const ref = doc(db, 'usuarios', uid, 'reproducciones', fecha);
  try {
    await setDoc(ref, {
      trackId: cancion.trackId,
      nombre: cancion.trackName || cancion.collectionName,
      artwork: cancion.artworkUrl100,
      preview: cancion.previewUrl || null,
      fecha
    });
  } catch (e) {
    console.error('Error guardando reproducción:', e);
  }
}

function render(reproducciones = []) {
  app.innerHTML = '';
  const title = createElement('h1', {}, 'Últimas reproducciones');
  app.appendChild(title);

  if (reproducciones.length === 0) {
    app.appendChild(createElement('p', { style: 'color:#888;text-align:center;margin-top:50px;' }, 'Aún no has reproducido canciones.'));  
    return;
  }

  const listDiv = createElement('div', { className: 'list' });
  reproducciones.forEach(item => {
    const card = createElement('div', { className: 'item' },
      createElement('img', { src: item.artwork, alt: item.nombre }),
      createElement('p', {}, item.nombre),
      item.preview ? createElement('audio', { controls: true, src: item.preview }) : null
    );
    listDiv.appendChild(card);
  });
  app.appendChild(listDiv);
}

export default function mostrarOriginal() {
  onAuthStateChanged(auth, user => {
    if (user) {
      uid = user.uid;
      const colRef = collection(db, 'usuarios', uid, 'reproducciones');
      // Escucha en tiempo real las últimas 10 reproducciones
      onSnapshot(colRef, snapshot => {
        const docs = snapshot.docs
          .sort((a, b) => b.id.localeCompare(a.id))
          .slice(0, 10)
          .map(doc => doc.data());
        render(docs);
      });

      // Interceptar clicks en controles de audio para guardar reproducción
      document.body.addEventListener('click', ev => {
        if (ev.target.tagName === 'AUDIO' || ev.target.closest('audio')) {
          const audio = ev.target.tagName === 'AUDIO' ? ev.target : ev.target.closest('audio');
          const itemDiv = audio.closest('.item');
          if (itemDiv && audio.src) {
            const cancion = {
              trackId: itemDiv.dataset.trackid,
              trackName: itemDiv.querySelector('p')?.textContent,
              artworkUrl100: itemDiv.querySelector('img')?.src,
              previewUrl: audio.src
            };
            guardarReproduccion(cancion);
          }
        }
      });
    } else {
      app.innerHTML = '<p>Inicia sesión para ver tus reproducciones.</p>';
    }
  });
}
