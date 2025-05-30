// src/main.js
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig.js';
import { hideTabNavigation } from './componentes/navegacion.js';

import mostrarHome from './componentes/home.js';
import mostrarOriginal from './componentes/original.js';
import mostrarPerfil from './componentes/perfil.js';
import mostrarLogout from './componentes/logout.js';
import mostrarLogin from './componentes/login.js';
import mostrarRegistro from './componentes/registro.js';

function renderMenu(usuario) {
  const menu = document.getElementById("menu");
  menu.innerHTML = "";

  let botones = [];

  if (usuario) {
    botones = [
      { texto: "iTunes", fn: mostrarHome },
      { texto: "Original", fn: mostrarOriginal },
      { texto: "Perfil", fn: mostrarPerfil },
      { texto: "Logout", fn: mostrarLogout },
    ];
  } else {
    botones = [
      { texto: "Login", fn: mostrarLogin },
      { texto: "Registro", fn: mostrarRegistro },
    ];
  }

  botones.forEach(({ texto, fn }) => {
    const btn = document.createElement("button");
    btn.textContent = texto;
    btn.onclick = () => {
      // Limpiar estados activos del menú
      menu.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Si no es iTunes, ocultar tabs
      if (texto !== 'iTunes') {
        hideTabNavigation();
      }
      
      fn();
    };
    menu.appendChild(btn);
  });

  // Activar primer botón por defecto
  if (botones.length > 0) {
    menu.querySelector('button').classList.add('active');
  }
}

onAuthStateChanged(auth, (user) => {
  renderMenu(user);
  if (user) {
    mostrarHome();
  } else {
    hideTabNavigation();
    mostrarLogin();
  }
});