/**
 * ============================================================
 * main.js - Lógica principal del portfolio de la Dra. Veterinaria
 * ------------------------------------------------------------
 * En este archivo iremos incorporando:
 *  - Interacciones de la navegación (menú móvil, desplegables).
 *  - Validaciones de formularios (contacto, turnos).
 *  - ABM de turnos utilizando LocalStorage (más adelante).
 *
 * Se utiliza JavaScript moderno (ES6+):
 *  - const / let en lugar de var (4.14)
 *  - funciones flecha (4.16)
 *  - addEventListener para eventos (4.7)
 * ============================================================
 */

// Ejecutar el código solo cuando el DOM esté cargado (4.9)
document.addEventListener("DOMContentLoaded", () => {
  inicializarNavegacion();
  inicializarFooter();
  inicializarFormularioContacto();
  inicializarCarruselTestimonios();
  // Más adelante: inicializarModuloTurnos(); // ABM con LocalStorage
});

/**
 * Inicializa la navegación principal:
 *  - Botón hamburguesa para móviles.
 *  - Menú desplegable "Más secciones".
 */
const inicializarNavegacion = () => {
  // Seleccionamos elementos del DOM relacionados con el menú
  const botonToggle = document.querySelector(".nav-toggle");
  const listaMenu = document.querySelector(".nav-lista");
  const botonDropdown = document.querySelector(".nav-dropdown__toggle");
  const listaDropdown = document.querySelector(".nav-dropdown__lista");

  // Seguridad: verificamos que existan en el documento
  if (!botonToggle || !listaMenu) return;

  // Maneja la apertura/cierre del menú principal en móviles
  botonToggle.addEventListener("click", () => {
    const abierto = listaMenu.classList.toggle("nav-lista--abierta");

    // Actualizamos atributos ARIA para accesibilidad (6.4)
    botonToggle.classList.toggle("nav-toggle--abierto", abierto);
    botonToggle.setAttribute("aria-expanded", abierto ? "true" : "false");
  });

  // Si existe el botón de dropdown, gestionamos el submenú
  if (botonDropdown && listaDropdown) {
    botonDropdown.addEventListener("click", () => {
      const abierto = listaDropdown.classList.toggle("nav-dropdown__lista--abierta");
      botonDropdown.setAttribute("aria-expanded", abierto ? "true" : "false");
    });

    // Cerrar el desplegable al hacer clic fuera (mejor usabilidad)
    document.addEventListener("click", (evento) => {
      const clicDentroDropdown =
        botonDropdown.contains(evento.target) || listaDropdown.contains(evento.target);

      if (!clicDentroDropdown) {
        listaDropdown.classList.remove("nav-dropdown__lista--abierta");
        botonDropdown.setAttribute("aria-expanded", "false");
      }
    });
  }
};

/**
 * Inicializa la información dinámica del footer.
 *  - Actualiza el año actual para no modificarlo manualmente cada año.
 */
const inicializarFooter = () => {
  const spanAnio = document.getElementById("anio-actual");
  if (!spanAnio) return;

  const anio = new Date().getFullYear();
  spanAnio.textContent = anio.toString();
};

/**
 * Inicializa el formulario de contacto:
 *  - Previene el envío si faltan campos obligatorios.
 *  - Muestra mensajes simples al usuario (se puede mejorar luego).
 */
const inicializarFormularioContacto = () => {
  const formulario = document.getElementById("form-contacto");
  if (!formulario) return;

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault(); // Evitamos envío real por ahora (4.10)

    // Obtenemos valores de los campos
    const nombre = formulario.nombre.value.trim();
    const email = formulario.email.value.trim();
    const motivo = formulario.motivo.value;
    const mensaje = formulario.mensaje.value.trim();

    // Validaciones muy básicas (más adelante podemos refinarlas)
    if (!nombre || !email || !motivo || !mensaje) {
      alert("Por favor, completa todos los campos del formulario de contacto."); // 4.18
      return;
    }

    // Mensaje de éxito simulado
    alert(
      "¡Gracias por tu mensaje! Te responderé a la brevedad.\n\n" +
        "Nombre: " +
        nombre +
        "\nMotivo: " +
        motivo
    );

    // Limpiamos el formulario
    formulario.reset();
  });
};

/**
 * Inicializa el carrusel de testimonios en la página de inicio.
 *  - Muestra una tarjeta por vez.
 *  - Botones anterior / siguiente.
 *  - Indicadores inferiores para saltar a un testimonio concreto.
 */
const inicializarCarruselTestimonios = () => {
  const carrusel = document.querySelector(".testimonios-carrusel");
  if (!carrusel) return; // La página actual no tiene carrusel

  const slides = carrusel.querySelectorAll(".testimonio-slide");
  const botonPrevio = carrusel.querySelector(".testimonios-control--prev");
  const botonSiguiente = carrusel.querySelector(".testimonios-control--next");
  const indicadores = document.querySelectorAll(".testimonios-indicador");

  if (!slides.length) return;

  let indiceActual = 0;

  const mostrarSlide = (indiceNuevo) => {
    if (indiceNuevo < 0) {
      indiceNuevo = slides.length - 1;
    } else if (indiceNuevo >= slides.length) {
      indiceNuevo = 0;
    }

    slides.forEach((slide, indice) => {
      slide.classList.toggle("testimonio-slide--activo", indice === indiceNuevo);
    });

    indicadores.forEach((indicador, indice) => {
      const activo = indice === indiceNuevo;
      indicador.classList.toggle("testimonios-indicador--activo", activo);
      indicador.setAttribute("aria-selected", activo ? "true" : "false");
    });

    indiceActual = indiceNuevo;
  };

  if (botonPrevio) {
    botonPrevio.addEventListener("click", () => {
      mostrarSlide(indiceActual - 1);
    });
  }

  if (botonSiguiente) {
    botonSiguiente.addEventListener("click", () => {
      mostrarSlide(indiceActual + 1);
    });
  }

  indicadores.forEach((indicador) => {
    indicador.addEventListener("click", () => {
      const indice = Number(indicador.getAttribute("data-indice"));
      if (!Number.isNaN(indice)) {
        mostrarSlide(indice);
      }
    });
  });

  // Aseguramos que el primer testimonio esté activo al inicializar
  mostrarSlide(0);
};


