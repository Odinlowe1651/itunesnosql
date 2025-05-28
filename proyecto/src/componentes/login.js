// src/componentes/login.js

import { auth } from '../firebaseConfig.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import mostrarRegistro from './registro.js';

export default function mostrarLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-container">
      <h2>Iniciar Sesión</h2>
      <input type="email" id="email" placeholder="Correo electrónico" />
      <input type="password" id="password" placeholder="Contraseña" />
      <button id="login-btn">Entrar</button>
      <p>¿No tienes cuenta? <a href="#" id="go-register">Regístrate</a></p>
    </div>
  `;

  // Evento para el botón de login
  document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  });

  // Enlace para ir a registro
  document.getElementById('go-register').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarRegistro();
  });
}
