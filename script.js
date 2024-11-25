/**
 * Clase que representa una persona genérica.
 */
class Persona {
    /**
     * Crea una instancia de Persona.
     * @param {number} id - Identificador único de la persona.
     * @param {string} nombre - Nombre de la persona.
     * @param {string} apellido - Apellido de la persona.
     * @param {string} fechaNacimiento - Fecha de nacimiento de la persona (formato ISO).
     */
    constructor(id, nombre, apellido, fechaNacimiento) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
    }

    /**
     * Devuelve una representación en cadena de la persona.
     * @returns {string} Descripción de la persona.
     */
    toString() {
        return `ID: ${this.id}, Nombre: ${this.nombre}, Apellido: ${this.apellido}, Fecha de nacimiento: ${this.fechaNacimiento}`;
    }

    /**
     * Convierte la información de la persona a un formato JSON.
     * @returns {string} JSON que representa a la persona.
     */
    toJson() {
        return JSON.stringify({
            id: this.id,
            nombre: this.nombre,
            apellido: this.apellido,
            fechaNacimiento: this.fechaNacimiento
        });
    }
}

/**
 * Clase que representa a un ciudadano, hereda de Persona.
 */
class Ciudadano extends Persona {
    /**
     * Crea una instancia de Ciudadano.
     * @param {number} id - Identificador único del ciudadano.
     * @param {string} nombre - Nombre del ciudadano.
     * @param {string} apellido - Apellido del ciudadano.
     * @param {string} fechaNacimiento - Fecha de nacimiento del ciudadano (formato ISO).
     * @param {number} dni - DNI del ciudadano.
     */
    constructor(id, nombre, apellido, fechaNacimiento, dni) {
        super(id, nombre, apellido, fechaNacimiento);
        this.dni = dni;
    }

    /**
     * Devuelve una representación en cadena del ciudadano.
     * @returns {string} Descripción del ciudadano.
     */
    toString() {
        return `${super.toString()}, DNI: ${this.dni}`;
    }

    /**
     * Convierte la información del ciudadano a un formato JSON.
     * @returns {string} JSON que representa al ciudadano.
     */
    toJson() {
        const personaAJson = super.toJson();
        const ciudadanoAJson = { dni: this.dni };
        return JSON.stringify({ ...JSON.parse(personaAJson), ...ciudadanoAJson });
    }
}

/**
 * Clase que representa a un extranjero, hereda de Persona.
 */
class Extranjero extends Persona {
    /**
     * Crea una instancia de Extranjero.
     * @param {number} id - Identificador único del extranjero.
     * @param {string} nombre - Nombre del extranjero.
     * @param {string} apellido - Apellido del extranjero.
     * @param {string} fechaNacimiento - Fecha de nacimiento del extranjero (formato ISO).
     * @param {string} paisOrigen - País de origen del extranjero.
     */
    constructor(id, nombre, apellido, fechaNacimiento, paisOrigen) {
        super(id, nombre, apellido, fechaNacimiento);
        this.paisOrigen = paisOrigen;
    }

    /**
     * Devuelve una representación en cadena del extranjero.
     * @returns {string} Descripción del extranjero.
     */
    toString() {
        return `${super.toString()}, País de Origen: ${this.paisOrigen}`;
    }

    /**
     * Convierte la información del extranjero a un formato JSON.
     * @returns {string} JSON que representa al extranjero.
     */
    toJson() {
        const personaAJson = super.toJson();
        const extranjeroAJson = { paisOrigen: this.paisOrigen };
        return JSON.stringify({ ...JSON.parse(personaAJson), ...extranjeroAJson });
    }
}

let personas = [];
let ordenAscendente = true;
let modoActual = "";

/**
 * Carga los datos desde una API y los almacena en el array de personas.
 * Identifica si son Ciudadanos o Extranjeros según los datos recibidos.
 */
function cargarDatos() {
    mostrarSpinner();

    console.log("Iniciando la carga de datos...");

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4) {
            if (xhttp.status === 200) {
                try {
                    const data = JSON.parse(xhttp.responseText);

                    if (!Array.isArray(data)) {
                        throw new Error("Los datos recibidos no son un array.");
                    }
                    personas = data.map(item => {
                        if (item.paisOrigen !== undefined) {
                            return new Extranjero(item.id, item.nombre, item.apellido, item.fechaNacimiento, item.paisOrigen);
                        } else if (item.dni !== undefined) {
                            return new Ciudadano(item.id, item.nombre, item.apellido, item.fechaNacimiento, item.dni);
                        }
                    }).filter(Boolean);
                    const filtroSeleccionado = document.getElementById('filtro').value;
                    actualizarTabla(filtroSeleccionado);
                } catch (error) {
                    alert("No se pudieron cargar los datos.");
                    console.error('Error al procesar los datos JSON:', error);
                }
                ocultarSpinner();
                console.log("Carga de datos finalizada.");
            } else {
                console.warn("Error al obtener los datos de la API:", xhttp.status);
                alert("No se pudo cargar la lista de personas. Intente nuevamente.");
                ocultarSpinner();
            }
        }
    };

    xhttp.open("GET", "https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", true);
    xhttp.send();
    console.log("Solicitud enviada a la API");
}

/**
 * Actualiza la tabla HTML con los datos filtrados.
 * @param {string} filtro - Filtro aplicado a las personas (ciudadano, extranjero, etc.).
 * @param {Array<Persona>} [personasParaMostrar=window.listaPersonas] - Lista de personas a mostrar.
 */
function actualizarTabla(filtro, personasParaMostrar = window.listaPersonas) {
    const tabla = document.querySelector('tbody');
    tabla.innerHTML = '';

    const personasFiltrados = filtrarPersonas(filtro, personasParaMostrar);
    
    personasFiltrados.forEach(persona => {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td>${persona.id}</td>
                          <td>${persona.nombre}</td>
                          <td>${persona.apellido}</td>
                          <td>${persona.fechaNacimiento}</td>`;
        
        if (persona instanceof Ciudadano) {
            fila.innerHTML += `<td>${persona.dni}</td>
                                <td>N/A</td>`;
        } else if (persona instanceof Extranjero) {
            fila.innerHTML += `<td>N/A</td>
                                <td>${persona.paisOrigen}</td>`;
        }

        fila.innerHTML += `
        <td><button onclick='mostrarFormularioABM("modificacion", ${JSON.stringify(persona)})'>Modificar</button></td>
        <td><button onclick='mostrarFormularioABM("baja", ${JSON.stringify(persona)})'>Eliminar</button></td>`;

        tabla.appendChild(fila);
    });

    manejarVisibilidadColumnas();
    console.log("Tabla actualizada");
    agregarEventos();
}

/**
 * Agrega eventos a las filas de la tabla y al botón de agregar datos.
 */
function agregarEventos() {
    const filas = document.querySelectorAll('tbody tr');
    filas.forEach(fila => {
        fila.addEventListener('dblclick', () => {
            const celdas = fila.querySelectorAll('td');
            const esCiudadano = celdas[4].textContent !== 'N/A';

            const datosFila = {
                id: parseInt(celdas[0].textContent),
                nombre: celdas[1].textContent,
                apellido: celdas[2].textContent,
                fechaNacimiento: celdas[3].textContent,
                dni: parseInt(celdas[4].textContent !== 'N/A' ? celdas[4].textContent : 0),
                paisOrigen: esCiudadano ? celdas[6].textContent : 0,
            };

            mostrarFormularioABM("modificacion", datosFila);
        });
    });

    const botonAgregar = document.querySelector('#agregarDatos');
    botonAgregar.addEventListener('click', () => {
        mostrarFormularioABM("alta");
    });

}

/**
 * Muestra el formulario ABM con la acción especificada (alta, modificación o baja).
 * @param {string} accion - La acción que se desea realizar (alta, baja, modificación).
 * @param {Object} [datos={}] - Datos de la persona a cargar en el formulario (opcional).
 */
function mostrarFormularioABM(accion, datos = {}) {
    document.querySelector('.form-datos').style.display = 'none';
    const formABM = document.getElementById('form-abm');
    formABM.style.display = 'block';
    
    limpiarFormularioABM();

    const formTitle = document.getElementById('form-titulo');
    const tipoSelect = document.getElementById('tipo');

    switch (accion) {
        case 'alta':
            formTitle.textContent = 'Alta';
            document.getElementById('id').style.display = 'none';
            document.getElementById('idLabel').style.display = 'none';
            tipoSelect.disabled = false;    
            modoActual = 'alta';
            break;
        case 'baja':
            formTitle.textContent = 'Eliminacion';
            cargarDatosEnFormulario(datos);
            document.getElementById('id').disabled = true;
            tipoSelect.disabled = true;
            modoActual = 'baja';
            break;
        case 'modificacion':
            formTitle.textContent = 'Modificación';
            document.getElementById('id').style.display = "block";
            document.getElementById('idLabel').style.display = 'block';
            cargarDatosEnFormulario(datos);
            tipoSelect.disabled = true;
            modoActual = 'modificacion';
            break;
        default:
            formTitle.textContent = 'Acción Desconocida';
            break;
    }
}

/**
 * Limpia todos los campos del formulario ABM y habilita los selectores.
 */
function limpiarFormularioABM(){
    document.getElementById('nombre').value = '';
    document.getElementById('apellido').value = '';
    document.getElementById('fechaNacimiento').value = '';
    document.getElementById('dni').value = '';
    document.getElementById('paisOrigen').value = '';

    const tipoSelect = document.getElementById('tipo');
    tipoSelect.value = '';
    tipoSelect.disabled = false; 

    document.getElementById('ciudadanoInputs').style.display = 'none';
    document.getElementById('extranjeroInputs').style.display = 'none';
}

/**
 * Oculta el formulario ABM y vuelve a mostrar la tabla de datos.
 */
function ocultarFormularioABM() {
    document.getElementById('form-abm').style.display = 'none';
    document.querySelector('.form-datos').style.display = 'block';
}

/**
 * Muestra los inputs adicionales para ciudadanos o extranjeros
 * en función del tipo seleccionado en el formulario ABM.
 */
function mostrarInputsParaAbm() {
    const tipoSeleccionado = document.getElementById('tipo').value;

    document.getElementById('ciudadanoInputs').style.display = 'none';
    document.getElementById('extranjeroInputs').style.display = 'none';

    if (tipoSeleccionado === 'ciudadano') {
        document.getElementById('ciudadanoInputs').style.display = 'block';
    } else if (tipoSeleccionado === 'extranjero') {
        document.getElementById('extranjeroInputs').style.display = 'block';
    }
}

/**
 * Carga los datos proporcionados en el formulario ABM.
 * @param {Object} datos - Los datos de la persona a cargar en el formulario.
 */
function cargarDatosEnFormulario(datos) {
    document.getElementById('id').value = datos.id;
    document.getElementById('nombre').value = datos.nombre;
    document.getElementById('apellido').value = datos.apellido;
    document.getElementById('fechaNacimiento').value = datos.fechaNacimiento;

    const tipoSelect = document.getElementById('tipo');
    if (datos.dni > 0) {
        tipoSelect.value = 'ciudadano';
        document.getElementById('dni').value = datos.dni;
    } else if (datos.paisOrigen) {
        tipoSelect.value = 'extranjero';
        document.getElementById('paisOrigen').value = datos.paisOrigen;
    }

    mostrarInputsParaAbm();
}

/**
 * Filtra la lista de personas según el tipo especificado.
 * @param {string} filtro - Tipo de filtro ('ciudadano', 'extranjeros', etc.).
 * @param {Array<Persona>} [listaPersonas=personas] - Lista de personas a filtrar.
 * @returns {Array<Persona>} Lista de personas filtradas.
 */
function filtrarPersonas(filtro, listaPersonas = personas) {
    return listaPersonas.filter(persona => {
        if (filtro === 'ciudadano') {
            return persona instanceof Ciudadano;
        } else if (filtro === 'extranjeros') {
            return persona instanceof Extranjero;
        }
        return true;
    });
}

/**
 * Maneja la visibilidad de las columnas según los checkboxes seleccionados.
 */
function manejarVisibilidadColumnas() {
    const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]');
    const headers = document.querySelectorAll('th');
    const filtro = document.getElementById('filtro').value;

    checkboxes.forEach((checkbox, index) => {
        if (index >= headers.length) return;

        if (filtro === 'ciudadanos') {
            if (index === 5 || index === 7) {
                checkbox.checked = false;
                checkbox.disabled = true;
            } else {
                checkbox.disabled = false;
            }
        } else if (filtro === 'camiones') {
            if (index === 4 || index === 6) {
                checkbox.checked = false;
                checkbox.disabled = true;
            } else {
                checkbox.disabled = false;
            }
        } else {
            checkbox.disabled = false;
        }
        
        const isVisible = checkbox.checked;
        headers[index].style.display = isVisible ? '' : 'none';

        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (index < cells.length) {
                cells[index].style.display = isVisible ? '' : 'none';
            }
        });
    });
}

/**
 * Maneja el cambio del filtro seleccionado y actualiza la tabla en consecuencia.
 */
function manejarCambioFiltro() {
    const filtroSeleccionado = this.value;
    actualizarTabla(filtroSeleccionado);
}

function manejarCambioCheckbox(checkbox, index) {
    manejarVisibilidadColumnas(checkbox, index);
}

/**
 * Ordena la tabla según una columna específica.
 * @param {string} columna - Nombre de la columna por la que se quiere ordenar.
 */
function ordenarTabla(columna) {
    const filtroActual = document.getElementById('filtro').value;

    let datosFiltrados = filtrarPersonas(filtroActual, personas);

    datosFiltrados.sort((a, b) => {
        let valorA = obtenerValorParaOrdenar(a, columna);
        let valorB = obtenerValorParaOrdenar(b, columna);

        if (typeof valorA === 'string') {
            return ordenAscendente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
        } else {
            return ordenAscendente ? valorA - valorB : valorB - valorA;
        }
    });
    ordenAscendente = !ordenAscendente;
    actualizarTabla(filtroActual, datosFiltrados);
}

/**
 * Obtiene el valor a utilizar para ordenar una columna específica.
 * @param {Object} dato - Objeto que representa una fila.
 * @param {string} columna - Nombre de la columna.
 * @returns {string|number} Valor de la columna para ordenar.
 */
function obtenerValorParaOrdenar(dato, columna) {
    if (columna === 'id') return dato.id;
    if (columna === 'nombre') return dato.nombre;
    if (columna === 'apellido') return dato.apellido;
    if (columna === 'fechaNacimiento') return dato.fechaNacimiento;
    if (columna === 'dni') return dato.dni || 0;
    if (columna === 'paisOrigen') return dato.paisOrigen;
    return ''; 
}

/**
 * Muestra un spinner de carga en la interfaz.
 */
function mostrarSpinner() {
    console.log("Mostrando spinner...");
    document.getElementById('spinner').style.display = 'flex';
}

/**
 * Oculta el spinner de carga en la interfaz.
 */
function ocultarSpinner() {
    console.log("Ocultando spinner...");
    document.getElementById('spinner').style.display = 'none';
}

/**
 * Inicia los eventos necesarios para el funcionamiento de la página.
 */
function iniciarEscucharEventos() {
    const filtroSelect = document.getElementById('filtro');
    filtroSelect.addEventListener('change', manejarCambioFiltro);

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', manejarVisibilidadColumnas);
    });
}

/**
 * Crea una nueva persona (ciudadano o extranjero) y la envía al servidor.
 * @param {Object} datos - Datos de la persona a crear.
 * @returns {Promise<Object|null>} Promesa que resuelve con la nueva persona creada o `null` en caso de error.
 */
async function crearNuevoPersona(datos) {
    const { nombre, apellido, fechaNacimiento, dni, paisOrigen, tipoSeleccionado } = datos;
    let nuevoPersona;

    if (tipoSeleccionado === 'ciudadano') {
        nuevoPersona = new Ciudadano(null, nombre, apellido, fechaNacimiento, dni);
    } else if (tipoSeleccionado === 'extranjero') {
        nuevoPersona = new Extranjero(null, nombre, apellido, fechaNacimiento, paisOrigen);
    }

    mostrarSpinner();

    try {
        const response = await fetch("https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoPersona)
        });

        if (!response.ok) {
            throw new Error(`No se pudo realizar la operación. Código de respuesta: ${response.status}`);
        }

        const data = await response.json();
        if (data.id) {
            nuevoPersona.id = data.id;
            return nuevoPersona;
        } else {
            throw new Error("La respuesta no contiene un ID válido.");
        }
    } catch (error) {
        console.error("Error:", error.message);
        alert("No se pudo realizar la operación. Por favor, intenta de nuevo.");
        return null;
    } finally {
        ocultarSpinner();
    }
}

/**
 * Agrega un nuevo elemento a la lista de personas o actualiza uno existente.
 */
async function agregarElemento() {
    const datos = obtenerDatosDelFormulario();
    const errorMensaje = validarDatosPersona(datos);
    if (errorMensaje) {
        alert(errorMensaje);
        return;
    }

    if (modoActual === 'modificacion') {
        let personaExistente = personas.find(persona => persona.id === parseInt(datos.id));
        if (personaExistente) {
            await modificarPersona();
            alert("Datos actualizados correctamente.");
            return;
        }
    }

    if (modoActual === 'alta') {
        const nuevoPersona = await crearNuevoPersona(datos);
        if (nuevoPersona) {
            personas.push(nuevoPersona);
            alert("Agregado correctamente.");
            actualizarTabla();
        }
    }

    ocultarFormularioABM();
    limpiarFormularioABM();
}

/**
 * Modifica los datos de una persona existente.
 */
function modificarPersona() {
    mostrarSpinner();
    const id = parseInt(document.getElementById('id').value);
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value;
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
    const dni = parseInt(document.getElementById('dni').value);
    const paisOrigen = document.getElementById('paisOrigen').value;
    const tipo = document.getElementById('tipo').value;

    const datosPersona = { nombre, apellido, fechaNacimiento, dni, paisOrigen, tipoSeleccionado: tipo };

    const errorMensaje = validarDatosPersona(datosPersona);
    if (errorMensaje) {
        alert(errorMensaje);
        ocultarSpinner();
        return;
    }

    let personaModificado;
    if (tipo === "ciudadano") {
        personaModificado = new Ciudadano(id, nombre, apellido, fechaNacimiento, dni);
    } else if (tipo === "extranejro") {
        personaModificado = new Camion(id, nombre, apellido, fechaNacimiento, paisOrigen);
    }

    fetch("https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(personaModificado)
    })
    .then(response => {
        ocultarSpinner();
        if (response.ok) {
            return response.text();
        } else {
            throw new Error("No se pudo modificar.");
        }
    })
    .then(text => {
        alert(text);

        const index = personas.findIndex(persona => persona.id === personaModificado.id);
        if (index !== -1) {
            personas[index] = personaModificado;
        }
        actualizarTabla(document.getElementById('filtro').value);
        ocultarFormularioABM();
    })
    .catch(error => {
        console.error(error);
        ocultarSpinner();
        alert('No se pudo realizar la modificación: ' + error.message);
    });
}

/**
 * Elimina una persona del servidor y la lista local.
 * @param {number} id - ID de la persona a eliminar.
 */
async function eliminarPersona(id) {
    mostrarSpinner();
    try {
        const response = await fetch("https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        });

        if (response.ok) {
            personas = personas.filter(persona => persona.id !== id);
            actualizarTabla(document.getElementById('filtro').value);
            ocultarSpinner();
            ocultarFormularioABM();
            alert("Elemento eliminado correctamente.");
        } else {
            throw new Error('No se pudo realizar la operación');
        }
    } catch (error) {
        console.error(error);
        ocultarSpinner();
        ocultarFormularioABM();
        alert(error.message);
    }
}

/**
 * Valida los datos de una persona.
 * @param {Object} datos - Datos de la persona a validar.
 * @returns {string|null} Mensaje de error si hay problemas; de lo contrario, `null`.
 */
function validarDatosPersona(datos) {
    const { nombre, apellido, fechaNacimiento, tipoSeleccionado } = datos;
    
    if (!nombre || nombre.trim() === "") {
        return "El nombre no puede estar vacío.";
    }
    if (!apellido || apellido.trim() === "") {
        return "El apellido no puede estar vacío.";
    }

    resultado = validarFechaNacimiento(fechaNacimiento);
    if (resultado) {
        return resultado;
    }

    if (tipoSeleccionado === 'ciudadano') {
        return validarDatosCiudadano(datos);
    } else if (tipoSeleccionado === 'camion') {
        return validarDatosCamion(datos);
    } else {
        return "Tipo seleccionado no válido. Por favor, seleccione 'ciudadano' o 'camion'.";
    }
}

/**
 * Valida si una fecha cumple con el formato AAAAMMDD.
 * @param {number} fechaNacimiento - Fecha a validar en formato AAAAMMDD.
 * @returns {string|null} Mensaje de error si no es válida; `null` si es válida.
 */
function validarFechaNacimiento(fechaNacimiento) {
    if (isNaN(fechaNacimiento)) {
        return "La fecha de nacimiento debe ser un número.";
    }

    // Convertir el número a string para trabajar con sus partes
    const fechaStr = fechaNacimiento.toString();

    // Verificar que tenga exactamente 8 dígitos
    if (fechaStr.length !== 8) {
        return "La fecha de nacimiento debe tener exactamente 8 dígitos.";
    }

    // Extraer año, mes y día
    const anio = parseInt(fechaStr.substring(0, 4), 10);
    const mes = parseInt(fechaStr.substring(4, 6), 10);
    const dia = parseInt(fechaStr.substring(6, 8), 10);

    // Validar rango de año (opcional: ajustar según el contexto)
    if (anio < 1900 || anio > new Date().getFullYear()) {
        return "El año debe estar entre 1900 y el año actual.";
    }

    // Validar mes
    if (mes < 1 || mes > 12) {
        return "El mes debe estar entre 01 y 12.";
    }

    // Validar día
    const diasEnMes = new Date(anio, mes, 0).getDate(); // Obtiene el último día del mes
    if (dia < 1 || dia > diasEnMes) {
        return `El día debe estar entre 01 y ${diasEnMes} para el mes ${mes}.`;
    }

    // Si todo es válido
    return null;
}

/**
 * Valida los datos específicos de un ciudadano.
 * @param {Object} datos - Datos del ciudadano a validar.
 * @returns {string|null} Mensaje de error si hay problemas; de lo contrario, `null`.
 */
function validarDatosCiudadano(datos) {
    const { dni } = datos;

    if (isNaN(dni) || dni <= 0) {
        return "El DNI debe ser mayor a 0.";
    }
    return null;
}

/**
 * Valida los datos específicos de un extranjero.
 * @param {Object} datos - Datos del extranjero a validar.
 * @returns {string|null} Mensaje de error si hay problemas; de lo contrario, `null`.
 */
function validarDatosExtranjero(datos) {
    const { paisOrigen } = datos;

    if (!paisOrigen || paisOrigen.trim() === "") {
        return "El pais de Origen no puede estar vacio.";
    }

    return null;
}

/**
 * Obtiene los datos ingresados en el formulario ABM.
 * @returns {Object} Objeto con los datos del formulario.
 */
function obtenerDatosDelFormulario() {
    return {
        id: parseInt(document.getElementById('id').value),
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        dni: parseInt(document.getElementById('dni').value) || 0,
        paisOrigen: document.getElementById('paisOrigen').value,
        tipoSeleccionado: document.getElementById('tipo').value
    };
}

document.getElementById('aceptar').addEventListener('click', async function() {
    const id = parseInt(document.getElementById('id').value);

    if (modoActual === 'alta') {
        await agregarElemento();
    } else if (modoActual === 'modificacion') {
        await modificarPersona();
    } else if (modoActual === 'baja') {
        await eliminarPersona(id);
    }

    
});

window.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    manejarVisibilidadColumnas();
    iniciarEscucharEventos();
});