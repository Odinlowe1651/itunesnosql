export default async function mostrarHome() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>Destacados</h2>
    <div id="lista" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; padding: 10px;"></div>
  `;

  const lista = document.getElementById("lista");

  try {
    // Fetch desde la API de iTunes
    const res = await fetch("https://itunes.apple.com/search?term=top+songs&media=music&limit=20");
    const json = await res.json();
    const data = json.results;

    data.forEach((item, index) => {
      const name = item.trackName || item.collectionName || 'Sin título';
      const artwork = item.artworkUrl100;
      const preview = item.previewUrl;
      const container = document.createElement("div");

      container.className = "item";
      container.innerHTML = `
        <img src="${artwork}" alt="${name}" style="width: 100px; height: 100px; border-radius: 4px;" />
        <p>${index + 1} - ${name}</p>
        ${preview ? `<audio controls src="${preview}" style="width: 100%; border-radius: 4px;"></audio>` : ``}
      `;

      lista.appendChild(container);
    });
  } catch (error) {
    app.innerHTML = `<p>Error al cargar los destacados: ${error.message}</p>`;
  }
}
