(function () {
  const ACCESS_KEY = "access_token";
  const FILE_KEY = "file_token";

  // Verificar si ya existen los tokens
  const existingAccess = localStorage.getItem(ACCESS_KEY);
  const existingFile = localStorage.getItem(FILE_KEY);

  if (existingAccess && existingFile) {
    console.log("Tokens ya existen en localStorage. No se hace la petición.");
    return;
  }

  // Si no existen, hacer la petición
  fetch("http://localhost:3000/api/v1/session", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
      return response.json();
    })
    .then(data => {
      if (data.success && data.data && data.data.tokens) {
        const accessToken = data.data.tokens.access;
        const fileToken = data.data.tokens.file;

        // Guardar en localStorage en dos llaves distintas
        localStorage.setItem(ACCESS_KEY, accessToken);
        localStorage.setItem(FILE_KEY, fileToken);

        console.log("Tokens guardados correctamente.");
      } else {
        console.error("La respuesta no contiene tokens válidos.");
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });
})();
