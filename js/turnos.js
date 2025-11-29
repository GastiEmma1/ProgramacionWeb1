/**
 * ============================================================
 * turnos.js - ABM de turnos con LocalStorage
 * ------------------------------------------------------------
 * - Permite crear, listar, editar y eliminar turnos.
 * - Los datos se almacenan en localStorage bajo la clave
 *   "turnosVeterinaria".
 * - Se utiliza JavaScript moderno (ES6+).
 * ============================================================
 */

// Clave única para almacenar los turnos en LocalStorage
const CLAVE_TURNOS = "turnosVeterinaria";

// Estado interno para saber si estamos editando un turno
let turnoEnEdicionId = null;

document.addEventListener("DOMContentLoaded", () => {
  inicializarABMTurnos();
});

/**
 * Inicializa el módulo de turnos:
 *  - Asigna eventos al formulario y botones.
 *  - Carga y dibuja los turnos guardados.
 */
const inicializarABMTurnos = () => {
  const formulario = document.getElementById("form-turnos");
  const btnCancelar = document.getElementById("btn-cancelar-edicion");
  const btnEliminarTodos = document.getElementById("btn-eliminar-todos");

  if (!formulario) return;

  formulario.addEventListener("submit", manejarEnvioFormulario);

  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      limpiarFormulario();
      mostrarMensaje("Modo edición cancelado.", "info");
    });
  }

  if (btnEliminarTodos) {
    btnEliminarTodos.addEventListener("click", eliminarTodosLosTurnos);
  }

  // Dibujamos la tabla inicial con lo que haya en LocalStorage
  renderizarTurnos();
};

/**
 * Obtiene el array de turnos desde LocalStorage.
 */
const obtenerTurnosDesdeStorage = () => {
  const datos = localStorage.getItem(CLAVE_TURNOS);
  if (!datos) return [];

  try {
    const turnos = JSON.parse(datos);
    return Array.isArray(turnos) ? turnos : [];
  } catch (error) {
    console.error("Error al parsear los turnos desde LocalStorage:", error);
    return [];
  }
};

/**
 * Guarda el array de turnos en LocalStorage.
 */
const guardarTurnosEnStorage = (turnos) => {
  localStorage.setItem(CLAVE_TURNOS, JSON.stringify(turnos));
};

/**
 * Maneja el envío del formulario de alta/edición.
 */
const manejarEnvioFormulario = (evento) => {
  evento.preventDefault();

  const formulario = evento.target;
  const dueno = formulario.dueno.value.trim();
  const mascota = formulario.mascota.value.trim();
  const especie = formulario.especie.value;
  const servicio = formulario.servicio.value;
  const fecha = formulario.fecha.value;
  const hora = formulario.hora.value;
  const notas = formulario.notas.value.trim();

  if (!dueno || !mascota || !especie || !servicio || !fecha || !hora) {
    mostrarMensaje("Por favor, completa todos los campos obligatorios.", "error");
    return;
  }

  const turnos = obtenerTurnosDesdeStorage();

  if (turnoEnEdicionId) {
    // Modo edición: actualizamos el turno existente
    const indice = turnos.findIndex((t) => t.id === turnoEnEdicionId);
    if (indice !== -1) {
      turnos[indice] = {
        ...turnos[indice],
        dueno,
        mascota,
        especie,
        servicio,
        fecha,
        hora,
        notas,
      };
      mostrarMensaje("Turno actualizado correctamente.", "exito");
    }
  } else {
    // Modo alta: creamos un nuevo turno
    const nuevoTurno = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      dueno,
      mascota,
      especie,
      servicio,
      fecha,
      hora,
      notas,
      creadoEn: new Date().toISOString(),
    };
    turnos.push(nuevoTurno);
    mostrarMensaje("Turno creado correctamente.", "exito");
  }

  guardarTurnosEnStorage(turnos);
  renderizarTurnos();
  limpiarFormulario();
};

/**
 * Limpia el formulario y sale del modo edición.
 */
const limpiarFormulario = () => {
  const formulario = document.getElementById("form-turnos");
  const campoId = document.getElementById("turno-id");

  if (formulario) {
    formulario.reset();
  }

  if (campoId) {
    campoId.value = "";
  }

  turnoEnEdicionId = null;
};

/**
 * Muestra un mensaje al usuario en la caja superior.
 * type puede ser: "exito", "error", "info".
 */
const mostrarMensaje = (texto, tipo = "info") => {
  const contenedor = document.getElementById("turnos-mensaje");
  if (!contenedor) return;

  contenedor.textContent = texto;
  contenedor.className = "turnos-mensaje"; // reset de clases

  if (tipo === "exito") contenedor.classList.add("turnos-mensaje--exito");
  if (tipo === "error") contenedor.classList.add("turnos-mensaje--error");
  if (tipo === "info") contenedor.classList.add("turnos-mensaje--info");
};

/**
 * Dibuja la tabla con todos los turnos.
 */
const renderizarTurnos = () => {
  const cuerpoTabla = document.getElementById("turnos-tabla-cuerpo");
  const textoVacio = document.getElementById("turnos-vacio");
  if (!cuerpoTabla || !textoVacio) return;

  const turnos = obtenerTurnosDesdeStorage();
  cuerpoTabla.innerHTML = "";

  if (turnos.length === 0) {
    textoVacio.style.display = "block";
    return;
  }

  textoVacio.style.display = "none";

  turnos.forEach((turno) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${turno.dueno}</td>
      <td>${turno.mascota}</td>
      <td>${formatearTexto(turno.especie)}</td>
      <td>${formatearServicio(turno.servicio)}</td>
      <td>${turno.fecha}</td>
      <td>${turno.hora}</td>
      <td>
        <button type="button" class="turnos-btn turnos-btn--editar" data-id="${turno.id}">
          Editar
        </button>
        <button type="button" class="turnos-btn turnos-btn--eliminar" data-id="${turno.id}">
          Eliminar
        </button>
      </td>
    `;

    cuerpoTabla.appendChild(fila);
  });

  // Asignamos eventos a los botones recién creados
  cuerpoTabla.querySelectorAll(".turnos-btn--editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      iniciarEdicionTurno(id);
    });
  });

  cuerpoTabla.querySelectorAll(".turnos-btn--eliminar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      eliminarTurno(id);
    });
  });
};

/**
 * Pasa un turno al modo edición cargando sus datos en el formulario.
 */
const iniciarEdicionTurno = (idTurno) => {
  const turnos = obtenerTurnosDesdeStorage();
  const turno = turnos.find((t) => t.id === idTurno);
  if (!turno) return;

  const formulario = document.getElementById("form-turnos");
  const campoId = document.getElementById("turno-id");
  if (!formulario || !campoId) return;

  formulario.dueno.value = turno.dueno;
  formulario.mascota.value = turno.mascota;
  formulario.especie.value = turno.especie;
  formulario.servicio.value = turno.servicio;
  formulario.fecha.value = turno.fecha;
  formulario.hora.value = turno.hora;
  formulario.notas.value = turno.notas || "";

  campoId.value = turno.id;
  turnoEnEdicionId = turno.id;

  mostrarMensaje("Editando turno. Modifica los datos y guarda para actualizar.", "info");
};

/**
 * Elimina un turno específico.
 */
const eliminarTurno = (idTurno) => {
  const confirmar = window.confirm("¿Seguro que deseas eliminar este turno?");
  if (!confirmar) return;

  let turnos = obtenerTurnosDesdeStorage();
  turnos = turnos.filter((t) => t.id !== idTurno);

  guardarTurnosEnStorage(turnos);
  renderizarTurnos();
  mostrarMensaje("Turno eliminado correctamente.", "exito");

  // Si estábamos editando ese turno, limpiamos el formulario
  if (turnoEnEdicionId === idTurno) {
    limpiarFormulario();
  }
};

/**
 * Elimina todos los turnos del almacenamiento.
 */
const eliminarTodosLosTurnos = () => {
  const confirmar = window.confirm(
    "Esto eliminará todos los turnos guardados. ¿Deseas continuar?"
  );
  if (!confirmar) return;

  localStorage.removeItem(CLAVE_TURNOS);
  renderizarTurnos();
  limpiarFormulario();
  mostrarMensaje("Se han eliminado todos los turnos.", "info");
};

/**
 * Convierte textos como "consulta-general" en "Consulta general".
 */
const formatearTexto = (texto) => {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

/**
 * Formatea el nombre del servicio para mostrarlo más legible.
 */
const formatearServicio = (servicio) => {
  switch (servicio) {
    case "consulta-general":
      return "Consulta general";
    case "vacunacion":
      return "Vacunación";
    case "control":
      return "Control de rutina";
    case "nutricion":
      return "Asesoramiento nutricional";
    default:
      return formatearTexto(servicio);
  }
};


