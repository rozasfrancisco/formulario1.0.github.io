document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("property-form");
    const mediaInput = document.getElementById("media");
    const selectFilesButton = document.getElementById("select-files");
    const fileCountDisplay = document.getElementById("file-count");
    const filePreview = document.getElementById("file-preview");
    const loadingScreen = document.getElementById("loading-screen");
    const scheduleSelect = document.getElementById("schedule");
    const datetimeFields = document.getElementById("datetime-fields");
    const contentTypeSelect = document.getElementById("content_type");
    const platformCheckboxes = document.querySelectorAll(
      'input[name="platforms"]'
    );
    const postTypeSelects = document.querySelectorAll(".post-type-select");
  
    let selectedFiles = [];
  
    // Opciones de tipo de publicación por plataforma y contenido
    const postTypeOptions = {
      Imagen: {
        Instagram: ["Carrusel", "Post con imagen"],
        Facebook: ["Post con imagen"],
        Twitter: ["Post con imagen"],
        LinkedIn: ["Post con imagen"]
      },
      Video: {
        Instagram: ["Reel"],
        Facebook: ["Post con video"],
        Twitter: [], // No disponible
        LinkedIn: ["Post con video"]
      }
    };
  
    // Función para actualizar las opciones de tipo de publicación
    function updatePostTypeOptions() {
      const contentType = contentTypeSelect.value;
  
      postTypeSelects.forEach((select) => {
        const platform = select.getAttribute("data-platform");
        const options = postTypeOptions[contentType][platform] || [];
        select.innerHTML =
          '<option value="" disabled selected>Elige una opción</option>';
  
        options.forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option;
          opt.textContent = option;
          select.appendChild(opt);
        });
  
        // Si no hay opciones, mostrar mensaje
        if (options.length === 0) {
          const opt = document.createElement("option");
          opt.value = "";
          opt.textContent = "No disponible";
          select.appendChild(opt);
          select.disabled = true;
        } else {
          select.disabled = false;
        }
      });
    }
  
    // Evento al cambiar el tipo de contenido
    contentTypeSelect.addEventListener("change", function () {
      updatePostTypeOptions();
    });
  
    // Evento para mostrar u ocultar las configuraciones de cada plataforma
    platformCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const platform = this.value;
        const settingsDiv = document.getElementById(
          `settings-${platform.toLowerCase()}`
        );
        if (this.checked) {
          settingsDiv.style.display = "block";
        } else {
          settingsDiv.style.display = "none";
          // Reiniciar el select de tipo de publicación
          const select = settingsDiv.querySelector(".post-type-select");
          select.value = "";
        }
      });
    });
  
    // Mostrar u ocultar los campos de fecha y hora según la opción seleccionada
    scheduleSelect.addEventListener("change", () => {
      if (scheduleSelect.value === "yes") {
        datetimeFields.style.display = "block";
        document.getElementById("publish_date").required = true;
        document.getElementById("publish_time").required = true;
      } else {
        datetimeFields.style.display = "none";
        document.getElementById("publish_date").required = false;
        document.getElementById("publish_time").required = false;
      }
    });
  
    // Evento para abrir el selector de archivos al hacer clic en el botón personalizado
    selectFilesButton.addEventListener("click", () => {
      if (!contentTypeSelect.value) {
        alert(
          "Por favor, selecciona qué quieres subir antes de seleccionar archivos."
        );
        return;
      }
      mediaInput.click();
    });
  
    // Actualizar el contador de archivos
    function updateFileCount() {
      fileCountDisplay.textContent = `${selectedFiles.length} archivo(s) seleccionado(s)`;
    }
  
    // Función para mostrar la vista previa de los archivos
    mediaInput.addEventListener("change", function () {
      const files = Array.from(this.files);
  
      // Validación del número total de archivos
      if (selectedFiles.length + files.length > 3) {
        alert("Puedes subir un máximo de 3 archivos.");
        this.value = ""; // Resetear input de archivos
        return;
      }
  
      let filesProcessed = 0;
      let filesToAdd = [];
  
      files.forEach((file) => {
        // Verificar el tipo de archivo según la selección de contenido
        const contentType = contentTypeSelect.value;
        if (
          contentType === "Imagen" &&
          !(file.type === "image/png" || file.type === "image/jpeg")
        ) {
          alert(`El archivo ${file.name} no es una imagen PNG o JPEG.`);
          filesProcessed++;
          checkAllFilesProcessed();
          return;
        } else if (contentType === "Video" && file.type !== "video/mp4") {
          alert(`El archivo ${file.name} no es un video MP4.`);
          filesProcessed++;
          checkAllFilesProcessed();
          return;
        }
  
        // Verificar el tamaño del archivo
        if (file.size > 10 * 1024 * 1024) {
          // 10 MB
          alert(`El archivo ${file.name} supera el tamaño máximo de 10 MB.`);
          filesProcessed++;
          checkAllFilesProcessed();
          return;
        }
  
        // Si es imagen, validar dimensiones
        if (contentType === "Imagen") {
          const reader = new FileReader();
          reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
              const width = img.width;
              const height = img.height;
              const aspectRatio = width / height;
  
              // Validar ancho mínimo y máximo
              if (width < 320) {
                alert(
                  `El ancho de ${file.name} es menor al mínimo permitido de 320 píxeles.`
                );
              } else if (width > 1440) {
                alert(
                  `El ancho de ${file.name} excede el máximo permitido de 1440 píxeles.`
                );
              } else if (aspectRatio < 0.8 || aspectRatio > 1.91) {
                alert(
                  `La relación de aspecto de ${file.name} debe estar entre 4:5 y 1.91:1.`
                );
              } else {
                // Si pasa todas las validaciones, agregar el archivo a la lista temporal
                filesToAdd.push(file);
              }
  
              filesProcessed++;
              checkAllFilesProcessed();
            };
            img.onerror = function () {
              alert(`No se pudo leer la imagen ${file.name}.`);
              filesProcessed++;
              checkAllFilesProcessed();
            };
            img.src = e.target.result;
          };
          reader.onerror = function () {
            alert(`No se pudo leer el archivo ${file.name}.`);
            filesProcessed++;
            checkAllFilesProcessed();
          };
          reader.readAsDataURL(file);
        } else {
          // Si es video, agregar directamente
          filesToAdd.push(file);
          filesProcessed++;
          checkAllFilesProcessed();
        }
      });
  
      // Función para verificar si todos los archivos han sido procesados
      function checkAllFilesProcessed() {
        if (filesProcessed === files.length) {
          selectedFiles = selectedFiles.concat(filesToAdd);
          updateFilePreview();
          updateFileCount();
        }
      }
  
      // Limpiar el input de archivos para permitir volver a seleccionar si es necesario
      this.value = "";
    });
  
    // Función para actualizar la vista previa de los archivos
    function updateFilePreview() {
      filePreview.innerHTML = "";
  
      selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          const previewContainer = document.createElement("div");
          previewContainer.classList.add("preview-file");
  
          let mediaElement;
          if (file.type.startsWith("image/")) {
            mediaElement = document.createElement("img");
          } else if (file.type.startsWith("video/")) {
            mediaElement = document.createElement("video");
            mediaElement.controls = true;
          }
          mediaElement.src = e.target.result;
  
          const deleteButton = document.createElement("button");
          deleteButton.classList.add("delete-file");
          deleteButton.textContent = "×";
          deleteButton.addEventListener("click", () => {
            removeFile(index);
          });
  
          previewContainer.appendChild(mediaElement);
          previewContainer.appendChild(deleteButton);
          filePreview.appendChild(previewContainer);
        };
        reader.readAsDataURL(file);
      });
    }
  
    // Función para eliminar un archivo de la lista y actualizar la vista previa
    function removeFile(index) {
      selectedFiles.splice(index, 1);
      updateFilePreview();
      updateFileCount();
    }
  
    // Función para subir archivos a ImgBB
    function uploadToImgBB(file) {
      const formData = new FormData();
      formData.append("image", file);
  
      return fetch(
        "https://api.imgbb.com/1/upload?key=ecd358d56cbd38ac8375d876b566533a",
        {
          method: "POST",
          body: formData
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            return data.data.url; // URL pública de la imagen/video
          } else {
            throw new Error("Error al subir el archivo a ImgBB");
          }
        })
        .catch((error) => {
          console.error("Error al subir a ImgBB:", error);
          alert("Error al subir a ImgBB. Por favor, intenta más tarde.");
          throw error;
        });
    }
  
    // Función para publicar en plataformas (Ejemplo para Instagram, Facebook, Twitter, LinkedIn)
    async function publishToSocialPlatforms(postData) {
      try {
        // Publicar en Instagram
        if (postData.platforms.includes("Instagram")) {
          for (const platformData of postData.platforms_data.filter(
            (p) => p.platform === "Instagram"
          )) {
            if (platformData.post_type === "Carrusel") {
              // Implementar lógica para publicar carrusel en Instagram
              await publishInstagramCarousel(platformData, postData);
            } else if (platformData.post_type === "Post con imagen") {
              await publishInstagramImage(platformData, postData);
            } else if (platformData.post_type === "Reel") {
              await publishInstagramReel(platformData, postData);
            }
          }
        }
  
        // Publicar en Facebook
        if (postData.platforms.includes("Facebook")) {
          for (const platformData of postData.platforms_data.filter(
            (p) => p.platform === "Facebook"
          )) {
            if (platformData.post_type === "Post con imagen") {
              await publishFacebookImage(platformData, postData);
            } else if (platformData.post_type === "Post con video") {
              await publishFacebookVideo(platformData, postData);
            }
          }
        }
  
        // Publicar en Twitter
        if (postData.platforms.includes("Twitter")) {
          for (const platformData of postData.platforms_data.filter(
            (p) => p.platform === "Twitter"
          )) {
            if (platformData.post_type === "Post con imagen") {
              await publishTwitterImage(platformData, postData);
            }
          }
        }
  
        // Publicar en LinkedIn
        if (postData.platforms.includes("LinkedIn")) {
          for (const platformData of postData.platforms_data.filter(
            (p) => p.platform === "LinkedIn"
          )) {
            if (platformData.post_type === "Post con imagen") {
              await publishLinkedInImage(platformData, postData);
            } else if (platformData.post_type === "Post con video") {
              await publishLinkedInVideo(platformData, postData);
            } else if (platformData.post_type === "Post de texto") {
              await publishLinkedInText(platformData, postData);
            }
          }
        }
      } catch (error) {
        console.error("Error al publicar en redes sociales:", error);
        alert(
          "Hubo un error al publicar en las redes sociales. Por favor, intenta de nuevo más tarde."
        );
      }
    }
  
    // Ejemplos de funciones para publicar en cada plataforma
    // Estas funciones deben ser implementadas con las respectivas APIs de cada red social
  
    async function publishInstagramImage(platformData, postData) {
      // Implementar la lógica para publicar una imagen en Instagram usando su API
      console.log("Publicando imagen en Instagram:", platformData, postData);
      // Ejemplo:
      // const response = await fetch('https://graph.instagram.com/...', { method: 'POST', body: ... });
    }
  
    async function publishInstagramCarousel(platformData, postData) {
      // Implementar la lógica para publicar un carrusel en Instagram usando su API
      console.log("Publicando carrusel en Instagram:", platformData, postData);
    }
  
    async function publishInstagramReel(platformData, postData) {
      // Implementar la lógica para publicar un Reel en Instagram usando su API
      console.log("Publicando Reel en Instagram:", platformData, postData);
    }
  
    async function publishFacebookImage(platformData, postData) {
      // Implementar la lógica para publicar una imagen en Facebook usando su API
      console.log("Publicando imagen en Facebook:", platformData, postData);
    }
  
    async function publishFacebookVideo(platformData, postData) {
      // Implementar la lógica para publicar un video en Facebook usando su API
      console.log("Publicando video en Facebook:", platformData, postData);
    }
  
    async function publishTwitterImage(platformData, postData) {
      // Implementar la lógica para publicar una imagen en Twitter usando su API
      console.log("Publicando imagen en Twitter:", platformData, postData);
    }
  
    async function publishLinkedInImage(platformData, postData) {
      // Implementar la lógica para publicar una imagen en LinkedIn usando su API
      console.log("Publicando imagen en LinkedIn:", platformData, postData);
    }
  
    async function publishLinkedInVideo(platformData, postData) {
      // Implementar la lógica para publicar un video en LinkedIn usando su API
      console.log("Publicando video en LinkedIn:", platformData, postData);
    }
  
    async function publishLinkedInText(platformData, postData) {
      // Implementar la lógica para publicar un texto en LinkedIn usando su API
      console.log("Publicando texto en LinkedIn:", platformData, postData);
    }
  
    // Función para enviar los datos al backend (Replit)
    async function sendDataToBackend(formData) {
      // Implementar la lógica para enviar los datos al backend de Replit
      // Por ejemplo, usando Fetch a una ruta específica en Replit
      const response = await fetch("/api/post", {
        method: "POST",
        body: formData
      });
  
      if (!response.ok) {
        throw new Error("Error en el servidor");
      }
  
      return response.json();
    }
  
    // Función para manejar el envío del formulario
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
  
      // Validación de selección de contenido
      if (!contentTypeSelect.value) {
        alert("Por favor, selecciona qué quieres subir.");
        return;
      }
  
      // Validación de selección de plataformas
      const selectedPlatforms = Array.from(platformCheckboxes).filter(
        (cb) => cb.checked
      );
      if (selectedPlatforms.length === 0) {
        alert("Por favor, selecciona al menos una plataforma.");
        return;
      }
  
      // Validación de tipo de publicación por plataforma
      let valid = true;
      const platformsData = [];
      selectedPlatforms.forEach((cb) => {
        const platform = cb.value;
        const select = document.querySelector(
          `.post-type-select[data-platform="${platform}"]`
        );
        if (!select.value || select.value === "No disponible") {
          alert(
            `Por favor, selecciona un tipo de publicación válido para ${platform}.`
          );
          valid = false;
        } else {
          // Añadir la plataforma y el tipo de publicación al array
          platformsData.push({
            platform: platform,
            post_type: select.value
          });
        }
      });
      if (!valid) return;
  
      // Validación de archivos
      if (selectedFiles.length === 0) {
        alert("Por favor, selecciona al menos un archivo.");
        return;
      }
  
      // Contar la cantidad de imágenes subidas
      const imageFiles = selectedFiles.filter((file) =>
        file.type.startsWith("image/")
      );
      const imageCount = imageFiles.length;
  
      // Validaciones adicionales
      platformsData.forEach((data) => {
        if (data.platform === "Instagram" && data.post_type === "Carrusel") {
          if (imageCount < 3) {
            alert(
              "Para un Carrusel de Instagram, por favor sube al menos 3 imágenes."
            );
            valid = false;
          }
        }
  
        if (data.post_type === "Post con imagen") {
          if (imageCount > 1) {
            alert(
              "No puedes subir más de 1 imagen en un Post normal. Si quieres subir más de una imagen, elige la opción de Carrusel."
            );
            valid = false;
          }
        }
      });
  
      if (!valid) return;
  
      // Mostrar la pantalla de carga
      loadingScreen.style.display = "flex";
  
      try {
        // Subir archivos a ImgBB y obtener URLs
        const uploadedUrls = await Promise.all(
          selectedFiles.map((file) => uploadToImgBB(file))
        );
  
        // Crear objeto de datos de la publicación
        const postData = {
          square_meters: document.getElementById("square_meters").value,
          rooms: document.getElementById("rooms").value,
          bathrooms: document.getElementById("bathrooms").value,
          price: document.getElementById("price").value,
          location: document.getElementById("location").value,
          description: document.getElementById("description").value,
          content_type: contentTypeSelect.value,
          platforms: selectedPlatforms.map((cb) => cb.value),
          platforms_data: platformsData,
          publish_now: scheduleSelect.value === "no",
          publish_date:
            scheduleSelect.value === "yes"
              ? document.getElementById("publish_date").value
              : null,
          publish_time:
            scheduleSelect.value === "yes"
              ? document.getElementById("publish_time").value
              : null,
          media_urls: uploadedUrls
        };
  
        // Publicar en las plataformas seleccionadas
        await publishToSocialPlatforms(postData);
  
        // Resetear el formulario
        form.reset();
        selectedFiles = [];
        updateFilePreview();
        updateFileCount();
        datetimeFields.style.display = "none";
        postTypeSelects.forEach((select) => {
          select.innerHTML =
            '<option value="" disabled selected>Elige una opción</option>';
          select.disabled = true;
        });
  
        alert("Información enviada exitosamente.");
      } catch (error) {
        console.error("Error al enviar la información:", error);
        alert("Hubo un problema al enviar la información.");
      } finally {
        // Ocultar la pantalla de carga
        loadingScreen.style.display = "none";
      }
    });
  
    // Función para actualizar las opciones de tipo de publicación al cargar la página
    document.addEventListener("DOMContentLoaded", function () {
      updatePostTypeOptions();
    });
  
    // Función para actualizar las opciones de tipo de publicación cuando se cambia "¿Qué quieres subir?"
    contentTypeSelect.addEventListener("change", function () {
      updatePostTypeOptions();
    });
  });s  