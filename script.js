// --- DATOS DEL JUEGO Y CONFIGURACIÓN ---
const PUNTOS_POR_ACIERTO = 10;
const TIEMPO_MAXIMO_SEGUNDOS = 60; // 60 segundos
const TIEMPO_GIRO_SEGUNDOS = 4; // Duración de la animación de giro

let tiempoRestante = TIEMPO_MAXIMO_SEGUNDOS;
let cronometroInterval;
let turnoActualEquipoIndex = 0;
let jugadorActuandoIndex = 0;
let tipoMimicaSeleccionada = ''; 
let palabraSeleccionada = '';
let numActoresSeleccionado = 0;

// ESTRUCTURA DE EQUIPOS
const equipos = [
    { nombre: "Equipo A", puntos: 0, jugadores: ["J1", "J2", "J3", "J4"], turnosActuados: [0, 0, 0, 0] },
    { nombre: "Equipo B", puntos: 0, jugadores: ["P1", "P2", "P3", "P4"], turnosActuados: [0, 0, 0, 0] }
];

// LISTAS DE CONTENIDO FINALES Y APROBADAS
const objetos = [
    "Karol G", 
    "Arepa", 
    "Hormiga Culona", 
    "Tamal", 
    "Sombrero Vueltiao", 
    "Aguardiente", 
    "Arpa", 
    "Oblea", 
    "Lechona", 
    "Buñuelo", 
    "Ajiaco", 
    "Maracuyá", 
    "Empanada", 
    "Ruana (poncho)", 
    "Mochila Wayúu", 
    "Marimonda (disfraz de carnaval)", 
    "Una cumbia", 
    "El acordeón de vallenato", 
    "Chiva (bus colorido)", 
    "Una canoa", 
    "Falcao", 
    "Shakira", 
    "Trompo", 
    "Queso con Bocadillo" 
];

const situaciones = [
    "Bailar Salsa Caleña", 
    "Ir a un Paseo de Olla", 
    "Celebrar un Gol", 
    "Pedir la ñapa", 
    "Colarse en el Transmilenio", 
    "Rezar la Novena en Navidad", 
    "Bailar el Ras Tas Tas", 
    "El Día de las Velitas", 
    "Jugar Dominó", 
    "Jugar Parqués", 
    "Jugar Rana", 
    "Bailar vallenato apretadito", 
    "Hacer Buñuelos", 
    "Subir a Monserrate", 
    "Tomarse un tinto"
];


// --- INICIALIZACIÓN DE LA RUEDA (WinWheel) ---

// Colores de los sectores (Amarillo, Azul, Rojo)
const colores = ['#FCD116', '#003893', '#C8102E'];

// RUEDA 1: Actores (1, 2, 3)
const wheelActores = new Winwheel({
    'numSegments': 3,
    'outerRadius': 90,
    'textFontSize': 18,
    'animation': { 'type': 'spinToStop', 'duration': TIEMPO_GIRO_SEGUNDOS, 'spins': 8, 'callbackFinished': 'resultadoActores()' },
    'segments': [
        { 'fillStyle': colores[0], 'text': '1 Actor' },
        { 'fillStyle': colores[1], 'text': '2 Actores' },
        { 'fillStyle': colores[2], 'text': '3 Actores' }
    ],
    'canvasId': 'ruleta-actores'
});

// RUEDA 2: Tipo de Mímica (Objeto, Situación)
const wheelTipo = new Winwheel({
    'numSegments': 2,
    'outerRadius': 90,
    'textFontSize': 18,
    'animation': { 'type': 'spinToStop', 'duration': TIEMPO_GIRO_SEGUNDOS, 'spins': 8, 'callbackFinished': 'resultadoTipo()' },
    'segments': [
        { 'fillStyle': colores[1], 'text': 'Objeto' },
        { 'fillStyle': colores[2], 'text': 'Situación' }
    ],
    'canvasId': 'ruleta-tipo'
});

// RUEDA 3: Contenido (Inicialmente vacía, se llena dinámicamente)
const wheelContenido = new Winwheel({
    'numSegments': 1,
    'outerRadius': 90,
    'textFontSize': 8,
    'animation': { 'type': 'spinToStop', 'duration': TIEMPO_GIRO_SEGUNDOS, 'spins': 10, 'callbackFinished': 'resultadoContenido()' },
    'segments': [{ 'fillStyle': colores[0], 'text': 'Gira Tipo Primero' }],
    'canvasId': 'ruleta-contenido'
});


// --- FLUJO DE JUEGO (Botones y Lógica) ---

function actualizarPuntuacionUI() {
    document.getElementById('puntos-equipo-a').textContent = `Equipo A: ${equipos[0].puntos}`;
    document.getElementById('puntos-equipo-b').textContent = `Equipo B: ${equipos[1].puntos}`;
    document.getElementById('nombre-equipo-actual').textContent = equipos[turnoActualEquipoIndex].nombre;
}

function iniciarCronometro() {
    tiempoRestante = TIEMPO_MAXIMO_SEGUNDOS;
    document.getElementById('tiempo-restante').textContent = tiempoRestante;

    cronometroInterval = setInterval(() => {
        tiempoRestante--;
        document.getElementById('tiempo-restante').textContent = tiempoRestante;

        if (tiempoRestante <= 0) {
            clearInterval(cronometroInterval);
            alert(`¡Tiempo! El equipo ${equipos[turnoActualEquipoIndex].nombre} no logró adivinar la palabra: ${palabraSeleccionada}.`);
            turnoTerminado(false); 
        }
    }, 1000);
}

// Control para evitar giros múltiples mientras gira
let puedeGirar = true; 

function girar(wheel, buttonId) {
    if (puedeGirar) {
        puedeGirar = false;
        document.getElementById(buttonId).disabled = true;
        wheel.startAnimation();
    }
}

// 1. Ruleta Actores
function girarActores() {
    // Genera un número de vueltas aleatorio entre 1 y 3 (simulando azar)
    const stopAt = wheelActores.getRandomForSegment(Math.floor(Math.random() * 3) + 1);
    wheelActores.animation.stopAngle = stopAt;
    girar(wheelActores, 'btn-girar-actores');
}

window.resultadoActores = function() {
    const segmento = wheelActores.getSegment();
    numActoresSeleccionado = parseInt(segmento.text.charAt(0));
    
    const equipo = equipos[turnoActualEquipoIndex];
    const jugadorActual = equipo.jugadores[jugadorActuandoIndex];
    
    document.getElementById('res-actores').innerHTML = `${segmento.text}.<br> ¡Actúa: **${jugadorActual}**!`;
    
    // Habilitar siguiente ruleta
    document.getElementById('ruleta-actores-panel').classList.remove('activo');
    document.getElementById('ruleta-tipo-panel').classList.add('activo');
    document.getElementById('btn-girar-tipo').disabled = false;
    puedeGirar = true;
}

// 2. Ruleta Tipo
function girarTipo() {
    const stopAt = wheelTipo.getRandomForSegment(Math.floor(Math.random() * 2) + 1);
    wheelTipo.animation.stopAngle = stopAt;
    girar(wheelTipo, 'btn-girar-tipo');
}

window.resultadoTipo = function() {
    const segmento = wheelTipo.getSegment();
    tipoMimicaSeleccionada = segmento.text;
    document.getElementById('res-tipo').textContent = tipoMimicaSeleccionada;
    
    // Llenar la ruleta de Contenido con la lista correcta
    const lista = tipoMimicaSeleccionada === 'Objeto' ? objetos : situaciones;
    
    const segmentosContenido = lista.map((palabra, index) => {
        return {
            'fillStyle': colores[index % 3], // Rota los colores
            'text': palabra.substring(0, 20) // Muestra solo los primeros 20 caracteres
        };
    });

    wheelContenido.numSegments = segmentosContenido.length;
    wheelContenido.segments = segmentosContenido;
    wheelContenido.draw(); // Redibuja la rueda

    // Habilitar siguiente ruleta
    document.getElementById('ruleta-tipo-panel').classList.remove('activo');
    document.getElementById('ruleta-contenido-panel').classList.add('activo');
    document.getElementById('btn-girar-contenido').disabled = false;
    puedeGirar = true;
}

// 3. Ruleta Contenido
function girarContenido() {
    // Genera un número de segmento aleatorio (entre 1 y el total de segmentos)
    const segmentoAleatorio = Math.floor(Math.random() * wheelContenido.numSegments) + 1;
    const stopAt = wheelContenido.getRandomForSegment(segmentoAleatorio);
    wheelContenido.animation.stopAngle = stopAt;
    girar(wheelContenido, 'btn-girar-contenido');
}

window.resultadoContenido = function() {
    const segmento = wheelContenido.getSegment();
    palabraSeleccionada = segmento.text;
    document.getElementById('res-contenido').textContent = `¡"${palabraSeleccionada}"!`;
    
    // Deshabilitar la última ruleta y mostrar el botón de inicio de acción
    document.getElementById('btn-girar-contenido').disabled = true;
    document.getElementById('panel-accion').classList.remove('inactivo');
    document.getElementById('btn-empezar-mimica').disabled = false;
    document.getElementById('ruleta-contenido-panel').classList.remove('activo');
    puedeGirar = true;
}

// Función para iniciar el cronómetro después de los giros
function empezarMimica() {
    document.getElementById('btn-empezar-mimica').disabled = true;
    iniciarCronometro();
}

// ----------------------------------------------------
// LÓGICA DE FIN DE TURNO
// ----------------------------------------------------

function turnoTerminado(acierto) {
    clearInterval(cronometroInterval);

    if (acierto) {
        equipos[turnoActualEquipoIndex].puntos += PUNTOS_POR_ACIERTO;
    }
    
    // Rota al siguiente jugador y al siguiente equipo
    avanzarTurno();

    // Reiniciar UI para el siguiente turno
    reiniciarTurnoUI();

    actualizarPuntuacionUI();
    verificarVictoria();
}

function avanzarTurno() {
    // Marca que el jugador actual ya actuó
    equipos[turnoActualEquipoIndex].turnosActuados[jugadorActuandoIndex]++;
    
    // 1. Avanza al siguiente jugador dentro del equipo actual
    jugadorActuandoIndex = (jugadorActuandoIndex + 1) % equipos[turnoActualEquipoIndex].jugadores.length;
    
    // 2. Si el jugador actual es el primero del equipo, cambia al siguiente equipo
    if (jugadorActuandoIndex === 0) {
        turnoActualEquipoIndex = (turnoActualEquipoIndex + 1) % equipos.length;
    }
}

function verificarVictoria() {
    const PUNTOS_META = 50; 
    const VECES_ACTUADAS_META = 1; 

    for (const equipo of equipos) {
        const alcanzoPuntos = equipo.puntos >= PUNTOS_META;
        const todosActuaronSuficiente = equipo.turnosActuados.every(veces => veces >= VECES_ACTUADAS_META);

        if (alcanzoPuntos && todosActuaronSuficiente) {
            alert(`¡🎉 ¡VICTORIA! 🎉 El ${equipo.nombre} ha ganado el juego!`);
        }
    }
}

function reiniciarTurnoUI() {
    // Resetear visibilidad y activaciones
    document.getElementById('panel-accion').classList.add('inactivo');
    document.getElementById('ruleta-actores-panel').classList.add('activo');
    document.getElementById('ruleta-tipo-panel').classList.remove('activo');
    document.getElementById('ruleta-contenido-panel').classList.remove('activo');

    // Resetear botones y resultados
    document.getElementById('btn-girar-actores').disabled = false;
    document.getElementById('btn-girar-tipo').disabled = true;
    document.getElementById('btn-girar-contenido').disabled = true;
    document.getElementById('btn-empezar-mimica').disabled = false;

    document.getElementById('res-actores').textContent = '';
    document.getElementById('res-tipo').textContent = '';
    document.getElementById('res-contenido').textContent = '';
    
    // Redibujar las ruedas a su estado inicial
    wheelActores.draw(false);
    wheelTipo.draw(false);
    wheelContenido.draw(false);

    // Resetear variables globales
    palabraSeleccionada = '';
    numActoresSeleccionado = 0;
}

// Inicializa la UI al cargar
document.addEventListener('DOMContentLoaded', () => {
    actualizarPuntuacionUI();
    // Forzar el redibujo inicial para que las ruedas se vean
    wheelActores.draw();
    wheelTipo.draw();
    wheelContenido.draw();
});