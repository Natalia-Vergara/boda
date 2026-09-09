/* ============================================================
   LEAN & NATI — Invitación de Boda
   JavaScript Vanilla + GSAP + Lenis
   ------------------------------------------------------------
   Índice
   01. Configuración
   02. Utilidades
   03. Preloader
   04. Scroll suave (Lenis) + barra de progreso
   05. Cursor personalizado
   06. Música (con memoria en localStorage)
   07. Invitado personalizado (?i=codigo → invitados.js)
   08. Sobre: apertura + secuencia de entrada del hero
   09. Animaciones de scroll (fade, zoom, split, dibujo, parallax)
   10. Cuenta regresiva
   10b. Fotos del lugar (opcionales)
   10c. Formularios en ventana (confirmación y canciones)
   11. Álbum compartido (link configurable)
   12. Copiar los datos de la cuenta
   12b. Indicador de scroll
   13. Botón volver arriba
   ============================================================ */

'use strict';

/* ————— 01. CONFIGURACIÓN ————— */
const CONFIG = {
  // Fecha y hora de la ceremonia (Argentina, UTC-3)
  fechaBoda: new Date('2026-11-27T18:30:00-03:00'),

  // Link del álbum compartido (Google Fotos u otro).
  // Reemplazar por la URL real, p. ej.: 'https://photos.app.goo.gl/XXXXXXXX'
  urlAlbum: 'https://photos.app.goo.gl/CAMBIAR-POR-EL-LINK-DEL-ALBUM',

  // WhatsApp de los novios
  whatsapp: '542215864142',

  /* Base de datos (Supabase).
     Mientras falte alguno de los dos datos, los formularios abren WhatsApp con el
     mensaje ya escrito, así la invitación funciona igual sin configurar
     nada. Al completar estos dos datos, las confirmaciones y las
     canciones se guardan en la base. Ver README.md, sección «Base de datos».

     La clave anónima está pensada para vivir en el navegador: lo que
     protege los datos son las políticas de la base, que sólo permiten
     insertar filas, nunca leerlas ni borrarlas. */
  baseDeDatos: {
    url: 'https://mjvhfvcpkrzpufrpklrv.supabase.co',
    clave: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdmhmdmNwa3J6cHVmcnBrbHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MTc4NjksImV4cCI6MjEwNDQ5Mzg2OX0.r9gSC7MoNaAxQQo3oQtZmZXkMyOlYDJe6G1rphYhb50',
  },

  // Clave usada para recordar el estado de la música entre visitas
  claveMusica: 'nyl-musica',
};

/* ————— 02. UTILIDADES ————— */
const $  = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

const prefiereMenosMovimiento =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Envuelve cada palabra de un elemento en <span class="palabra"><span>…</span></span>
 * para poder animarlas individualmente (efecto "text split reveal").
 */
function dividirEnPalabras(elemento) {
  const palabras = elemento.textContent.trim().split(/\s+/);
  elemento.innerHTML = palabras
    .map((p) => `<span class="palabra"><span>${p}</span></span>`)
    .join(' ');
  return $$('.palabra > span', elemento);
}

document.documentElement.classList.remove('sin-js');

/* Todo arranca cuando el DOM está listo (los scripts cargan con defer) */
document.addEventListener('DOMContentLoaded', () => {
  iniciarInvitado();

  // Plan B: si GSAP no cargó, la invitación sigue siendo usable sin animaciones
  if (typeof gsap === 'undefined') {
    document.documentElement.classList.add('sin-js');
    $('#preloader').classList.add('preloader--fuera');
    iniciarMusica();
    iniciarCuentaRegresiva();
    iniciarFotosFinca();
    iniciarVentanas();
    iniciarAlbum();
    iniciarCopiarAlias();
    $('#btnAbrir').addEventListener('click', () => {
      reproducirMusica();
      const escena = $('#escenaSobre');
      escena.classList.add('escena--abierta');
      setTimeout(() => {
        escena.classList.add('escena--fuera');
        document.body.dataset.estado = 'abierta';
        invitacionAbierta = true;
        actualizarBotonMusica();
      }, 5200);
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  iniciarLenis();
  iniciarPreloader();
  iniciarCursor();
  iniciarMusica();
  iniciarParallax();
  iniciarSobre();
  iniciarAnimacionesScroll();
  iniciarCuentaRegresiva();
  iniciarFotosFinca();
  iniciarVentanas();
  iniciarAlbum();
  iniciarCopiarAlias();
  iniciarIndicadorScroll();
  iniciarBotonArriba();
});

/* ————— 03. PRELOADER ————— */
function iniciarPreloader() {
  const preloader = $('#preloader');

  // Cuando la página terminó de cargar, el telón se levanta con elegancia.
  // (La secuencia del hero arranca recién al abrir el sobre.)
  const salir = () => {
    setTimeout(() => preloader.classList.add('preloader--fuera'), 700);
  };

  if (document.readyState === 'complete') salir();
  else window.addEventListener('load', salir);
}

/* ————— 04. SCROLL SUAVE + PROGRESO ————— */
let lenis = null;

function iniciarLenis() {
  if (prefiereMenosMovimiento) return;

  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    smoothWheel: true,
  });

  // Lenis y ScrollTrigger comparten el mismo reloj
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((tiempo) => lenis.raf(tiempo * 1000));
  gsap.ticker.lagSmoothing(0);

  // Barra de progreso de lectura
  gsap.to('#progresoBarra', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.4 },
  });
}

/** Scroll suave hacia un elemento (o hacia una posición numérica), con o sin Lenis */
function irHacia(objetivo) {
  if (lenis) lenis.scrollTo(objetivo, { duration: 2, offset: 0 });
  else if (typeof objetivo === 'number') window.scrollTo({ top: objetivo, behavior: 'smooth' });
  else objetivo.scrollIntoView({ behavior: 'smooth' });
}

/* ————— 05. CURSOR PERSONALIZADO ————— */
function iniciarCursor() {
  const punto = $('#cursor');
  const halo = $('#cursorHalo');
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // El punto sigue al mouse al instante; el halo lo persigue con retardo
  const moverPunto = gsap.quickTo(punto, 'x', { duration: 0.1, ease: 'power2.out' });
  const moverPuntoY = gsap.quickTo(punto, 'y', { duration: 0.1, ease: 'power2.out' });
  const moverHalo = gsap.quickTo(halo, 'x', { duration: 0.45, ease: 'power3.out' });
  const moverHaloY = gsap.quickTo(halo, 'y', { duration: 0.45, ease: 'power3.out' });

  window.addEventListener('pointermove', (e) => {
    // Recién se muestran cuando sabemos dónde está el mouse
    punto.classList.add('cursor--activo');
    halo.classList.add('cursor--activo');
    moverPunto(e.clientX); moverPuntoY(e.clientY);
    moverHalo(e.clientX); moverHaloY(e.clientY);
  });

  // El halo se expande sobre elementos interactivos
  $$('a, button, [data-cursor="hover"]').forEach((el) => {
    el.addEventListener('pointerenter', () => halo.classList.add('cursor-halo--activo'));
    el.addEventListener('pointerleave', () => halo.classList.remove('cursor-halo--activo'));
  });
}

/* ————— 06. MÚSICA ————— */
const audio = $('#audioBoda');
const btnMusica = $('#btnMusica');

// El botón flotante sólo se muestra si hay canción cargada Y la invitación
// ya está abierta. Así, mientras no exista assets/music/cancion.mp3, el
// invitado no ve un botón que no hace nada.
let hayMusica = false;
let invitacionAbierta = false;

function actualizarBotonMusica() {
  btnMusica.classList.toggle('musica--visible', hayMusica && invitacionAbierta);
}

function iniciarMusica() {
  // ¿Está subida la canción?
  fetch(audio.getAttribute('src'), { method: 'HEAD' })
    .then((r) => { hayMusica = r.ok; actualizarBotonMusica(); })
    .catch(() => { hayMusica = false; });

  btnMusica.addEventListener('click', () => {
    if (audio.paused) reproducirMusica();
    else pausarMusica();
  });

  // Memoria entre visitas: si la última vez estaba sonando, retomamos
  // en el primer gesto del usuario (los navegadores bloquean el autoplay).
  if (localStorage.getItem(CONFIG.claveMusica) === 'sonando') {
    const retomar = () => {
      reproducirMusica();
      window.removeEventListener('pointerdown', retomar);
      window.removeEventListener('keydown', retomar);
    };
    window.addEventListener('pointerdown', retomar, { once: false });
    window.addEventListener('keydown', retomar, { once: false });
  }
}

function reproducirMusica() {
  audio.play().then(() => {
    btnMusica.classList.add('musica--sonando');
    localStorage.setItem(CONFIG.claveMusica, 'sonando');
  }).catch(() => {
    /* El navegador bloqueó el autoplay: el usuario puede tocar el botón */
  });
}

function pausarMusica() {
  audio.pause();
  btnMusica.classList.remove('musica--sonando');
  localStorage.setItem(CONFIG.claveMusica, 'pausada');
}

/* ————— 07. INVITADO PERSONALIZADO ————— */
/**
 * Lee el código del link (?i=codigo) y lo busca en window.INVITADOS
 * (invitados.js). Con invitado: el sobre muestra su nombre y sus pases,
 * el RSVP indica los lugares reservados y el WhatsApp sale con su nombre.
 * Sin código (o con uno inexistente): invitación genérica.
 */
function iniciarInvitado() {
  const codigo = new URLSearchParams(location.search).get('i');
  const invitado = (window.INVITADOS || {})[codigo];
  if (!invitado) return;

  window.__invitado = invitado;

  const pases = Number(invitado.pases) || 1;
  const textoPases = pases === 1 ? '1 persona' : `${pases} personas`;

  $('#invitadoNombre').textContent = invitado.nombre;
  const pasesEl = $('#invitadoPases');
  pasesEl.textContent = textoPases;
  pasesEl.hidden = false;

  const rsvpPases = $('#rsvpPases');
  rsvpPases.innerHTML = `Tu invitación es válida por <strong>${textoPases}</strong>.`;
  rsvpPases.hidden = false;

  const mensaje = `Hola! Soy ${invitado.nombre}. Quiero confirmar mi asistencia a la boda de Lean & Nati 🎉 (${textoPases})`;
  $('#btnWhatsapp').href = `https://wa.me/542215864142?text=${encodeURIComponent(mensaje)}`;
}

/* ————— 08. SOBRE: APERTURA + ENTRADA DEL HERO ————— */
function iniciarParallax() {
  // Marcas de agua y capas con data-parallax
  $$('[data-parallax]').forEach((capa) => {
    const seccion = capa.closest('section, header');
    gsap.to(capa, {
      yPercent: (parseFloat(capa.dataset.parallax) || 0.2) * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: seccion,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

function iniciarSobre() {
  const escena = $('#escenaSobre');

  $('#btnAbrir').addEventListener('click', () => {
    // 1. Empieza la música (gesto del usuario: el navegador lo permite)
    reproducirMusica();

    // 2. La solapa se abre y la carta asoma (animaciones en CSS)
    escena.classList.add('escena--abierta');

    // 3. Terminada la apertura (ver los tiempos en style.css), la escena se
    //    disuelve y aparece el hero
    setTimeout(() => {
      escena.classList.add('escena--fuera');
      document.body.dataset.estado = 'abierta';
      invitacionAbierta = true;
      actualizarBotonMusica();

      if (lenis) lenis.resize();
      ScrollTrigger.refresh();
      reproducirEntradaHero();
    }, 5200);
  });
}

/** Secuencia del hero: ramas → iniciales → nombres → promesa → fecha */
function reproducirEntradaHero() {
  if (prefiereMenosMovimiento) return;

  // Estados iniciales de la secuencia
  gsap.set('#heroIniciales', { y: 24 });
  gsap.set('#heroPromesa', { y: 30 });
  gsap.set('#heroFecha', { y: 24 });

  const letras = dividirEnPalabras($('#heroNombres'));

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('#heroIniciales', { opacity: 1, y: 0, duration: 1.8, ease: 'power2.out' })
    .set('#heroNombres', { opacity: 1 }, '-=0.7')
    .from(letras, {
      yPercent: 110,
      duration: 1.6,
      stagger: 0.12,
      ease: 'power4.out',
    }, '<')
    .to('#heroPromesa', { opacity: 1, y: 0, duration: 1.8 }, '-=0.8')
    .to('#heroFecha', { opacity: 1, y: 0, duration: 1.4 }, '-=1');
}

/* ————— 09. ANIMACIONES DE SCROLL ————— */
function iniciarAnimacionesScroll() {
  if (prefiereMenosMovimiento) {
    $$('[data-anim]').forEach((el) => (el.style.opacity = 1));
    return;
  }

  $$('[data-anim]').forEach((el) => {
    const tipo = el.dataset.anim;
    const retardo = parseFloat(el.dataset.animDelay) || 0;
    const disparo = {
      trigger: el,
      start: 'top 86%',
      toggleActions: 'play none none none',
    };

    switch (tipo) {
      /* Aparece subiendo con desenfoque que se disipa */
      case 'fade-up':
        gsap.fromTo(el,
          { opacity: 0, y: 44, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5, delay: retardo, ease: 'power3.out', scrollTrigger: disparo });
        break;

      /* Zoom sereno, para tarjetas */
      case 'zoom':
        gsap.fromTo(el,
          { opacity: 0, scale: 0.94, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 1.6, delay: retardo, ease: 'power3.out', scrollTrigger: disparo });
        break;

      /* Títulos: cada palabra emerge desde su máscara */
      case 'split': {
        const palabras = dividirEnPalabras(el);
        gsap.set(el, { opacity: 1 });
        gsap.from(palabras, {
          yPercent: 115,
          duration: 1.3,
          stagger: 0.07,
          ease: 'power4.out',
          delay: retardo,
          scrollTrigger: disparo,
        });
        break;
      }

      /* Ornamentos SVG que se dibujan trazo a trazo */
      case 'dibujo':
        gsap.set(el, { opacity: 1 });
        gsap.to($$('.trazo', el), {
          strokeDashoffset: 0,
          duration: 2.4,
          stagger: 0.25,
          ease: 'power2.inOut',
          scrollTrigger: disparo,
        });
        break;

      /* Piezas de la galería: entran deslizándose alternadas */
      case 'pieza': {
        const indice = [...el.parentElement.children].indexOf(el);
        gsap.fromTo(el,
          { opacity: 0, y: 60, x: indice % 2 ? 24 : -24 },
          { opacity: 1, y: 0, x: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: disparo });
        break;
      }

    }
  });
}

/* ————— 10. CUENTA REGRESIVA ————— */
function iniciarCuentaRegresiva() {
  const refs = {
    dias: $('#cdDias'), horas: $('#cdHoras'),
    min: $('#cdMin'), seg: $('#cdSeg'),
  };

  const actualizar = () => {
    const resta = CONFIG.fechaBoda - Date.now();

    if (resta <= 0) {
      // ¡Llegó el día!
      refs.dias.textContent = '000';
      refs.horas.textContent = refs.min.textContent = refs.seg.textContent = '00';
      $('.cuenta__hasta').textContent = '¡Hoy es el gran día!';
      return;
    }

    const seg = Math.floor(resta / 1000);
    refs.dias.textContent = String(Math.floor(seg / 86400)).padStart(3, '0');
    refs.horas.textContent = String(Math.floor((seg % 86400) / 3600)).padStart(2, '0');
    refs.min.textContent = String(Math.floor((seg % 3600) / 60)).padStart(2, '0');
    refs.seg.textContent = String(seg % 60).padStart(2, '0');
  };

  actualizar();
  setInterval(actualizar, 1000);
}

/* ————— 10b. FOTOS DEL LUGAR ————— */
/**
 * Las fotos de la finca son opcionales: si un archivo todavía no está
 * subido, esa figura se quita, y si no hay ninguna, se oculta el bloque
 * entero. Así nunca se ve el ícono de imagen rota.
 */
function iniciarFotosFinca() {
  const bloque = $('.ceremonia__fotos');
  if (!bloque) return;

  // Se consulta cada archivo al cargar la página. No alcanza con esperar el
  // evento "error" de la etiqueta: como las fotos son lazy, recién intentarían
  // cargar al llegar con el scroll y el hueco se vería un instante.
  const figuras = $$('.ceremonia__foto', bloque);
  Promise.all(figuras.map((fig) =>
    fetch($('img', fig).getAttribute('src'), { method: 'HEAD' })
      .then((r) => (r.ok ? null : fig))
      .catch(() => fig)
  )).then((faltantes) => {
    faltantes.filter(Boolean).forEach((fig) => fig.remove());
    if (!$('.ceremonia__foto', bloque)) bloque.remove();
  });
}

/* ————— 10c. FORMULARIOS EN VENTANA ————— */
let ventanaAbierta = null;
let botonQueAbrio = null;

function abrirVentana(id) {
  const ventana = $('#' + id);
  if (!ventana) return;

  // Con link personalizado, el nombre y los lugares vienen puestos
  const invitado = window.__invitado;
  if (invitado) {
    const campoNombre = $('input[name="nombre"]', ventana);
    if (campoNombre && !campoNombre.value) campoNombre.value = invitado.nombre;
    const campoPersonas = $('input[name="personas"]', ventana);
    if (campoPersonas) {
      campoPersonas.value = Number(invitado.pases) || 1;
      // Avisa al campo de barra libre, que no puede superar esa cantidad
      campoPersonas.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  ventana.hidden = false;
  requestAnimationFrame(() => ventana.classList.add('modal--visible'));
  ventanaAbierta = ventana;
  if (lenis) lenis.stop();

  // El foco entra en la ventana, para quien navega con teclado
  const primero = $('input:not([type="hidden"]), button', ventana);
  if (primero) setTimeout(() => primero.focus({ preventScroll: true }), 120);
}

function cerrarVentana() {
  if (!ventanaAbierta) return;
  const ventana = ventanaAbierta;
  ventana.classList.remove('modal--visible');
  setTimeout(() => { ventana.hidden = true; }, 350);
  ventanaAbierta = null;
  if (lenis) lenis.start();
  if (botonQueAbrio) botonQueAbrio.focus({ preventScroll: true });
}

function iniciarVentanas() {
  $$('[data-abrir]').forEach((boton) => {
    boton.addEventListener('click', () => {
      botonQueAbrio = boton;
      abrirVentana(boton.dataset.abrir);
    });
  });

  $$('[data-cerrar]').forEach((el) => el.addEventListener('click', cerrarVentana));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ventanaAbierta) cerrarVentana();
  });

  iniciarCampoBarra();
  conectarFormulario($('#formConfirmar'), 'confirmaciones', armarMensajeConfirmar);
  conectarFormulario($('#formCancion'), 'canciones', armarMensajeCancion);
}

/**
 * Barra libre: se pregunta cuántos van a tomar alcohol, porque a cada uno
 * se le entrega una pulsera. Sólo tiene sentido si el invitado viene, y
 * nunca puede ser más gente que la que asiste.
 */
function iniciarCampoBarra() {
  const form = $('#formConfirmar');
  if (!form) return;

  const campo = $('[data-campo-barra]', form);
  const alcohol = $('input[name="alcohol"]', form);
  const personas = $('input[name="personas"]', form);
  if (!campo || !alcohol) return;

  const limitar = () => {
    const total = Number(personas && personas.value) || 1;
    alcohol.max = String(total);
    if (Number(alcohol.value) > total) alcohol.value = String(total);
  };

  const alternar = () => {
    const elegida = $('input[name="asiste"]:checked', form);
    const viene = !!elegida && elegida.value.startsWith('Sí');
    campo.hidden = !viene;
    alcohol.required = viene;
    if (!viene) alcohol.value = '';
  };

  $$('input[name="asiste"]', form).forEach((r) => r.addEventListener('change', alternar));
  if (personas) personas.addEventListener('input', limitar);
  alcohol.addEventListener('input', limitar);
  alternar();
  limitar();

  // El formulario se reutiliza: al reiniciarlo vuelve a su estado inicial
  form.addEventListener('reset', () => setTimeout(() => { alternar(); limitar(); }, 0));
}

/** Texto que se manda por WhatsApp mientras no haya planilla conectada */
function armarMensajeConfirmar(datos) {
  const partes = [
    `Hola! Soy ${datos.nombre}.`,
    datos.asiste.startsWith('Sí')
      ? `Confirmo mi asistencia al casamiento de Lean & Nati 🎉 (${datos.personas} ${datos.personas === '1' ? 'persona' : 'personas'})`
      : `Lamentablemente no voy a poder acompañarlos 💔`,
  ];
  if (datos.asiste.startsWith('Sí')) {
    const pulseras = Number(datos.alcohol) || 0;
    partes.push(pulseras > 0
      ? `Barra libre: ${pulseras} ${pulseras === 1 ? 'pulsera' : 'pulseras'}.`
      : 'Barra libre: ninguno toma alcohol.');
  }
  if (datos.nota) partes.push(`Aclaración: ${datos.nota}`);
  return partes.join(' ');
}

function armarMensajeCancion(datos) {
  let texto = `Hola! Soy ${datos.nombre}. Esta canción no puede faltar en la fiesta de Lean & Nati 🎶: ${datos.cancion}`;
  if (datos.link) texto += ` — ${datos.link}`;
  return texto;
}

/**
 * Guarda una fila en la base. Supabase expone cada tabla como dirección
 * web, así que alcanza con un envío normal; a diferencia de un formulario
 * externo, acá sí sabemos si la fila entró y podemos avisar cuando falla.
 */
async function guardarEnBase(tabla, fila) {
  const { url, clave } = CONFIG.baseDeDatos;
  const respuesta = await fetch(`${url}/rest/v1/${tabla}`, {
    method: 'POST',
    headers: {
      apikey: clave,
      Authorization: `Bearer ${clave}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(fila),
  });
  if (!respuesta.ok) throw new Error(`${respuesta.status} ${await respuesta.text()}`);
}

/** Arma la fila que se guarda, según la tabla */
function armarFila(tabla, datos) {
  const invitado = window.__invitado;
  const codigo = new URLSearchParams(location.search).get('i') || null;

  if (tabla === 'confirmaciones') {
    return {
      asiste: datos.asiste,
      nombre: datos.nombre,
      personas: Number(datos.personas) || 1,
      alcohol: Number(datos.alcohol) || 0,
      nota: datos.nota || null,
      invitado: invitado ? invitado.nombre : null,
      codigo,
    };
  }
  return {
    nombre: datos.nombre,
    cancion: datos.cancion,
    link: datos.link || null,
    codigo,
  };
}

function conectarFormulario(form, tabla, armarMensaje) {
  if (!form) return;
  const estado = $('.modal__estado', form);
  const boton = $('.modal__enviar', form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      estado.textContent = 'Completá los campos obligatorios.';
      form.reportValidity();
      return;
    }

    const datos = Object.fromEntries(new FormData(form));

    // Sin base conectada: se abre WhatsApp con el mensaje escrito
    if (!CONFIG.baseDeDatos.url || !CONFIG.baseDeDatos.clave) {
      const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(armarMensaje(datos))}`;
      window.open(url, '_blank', 'noopener');
      estado.textContent = '¡Gracias! Te llevamos a WhatsApp para enviarlo.';
      setTimeout(cerrarVentana, 1800);
      return;
    }

    boton.disabled = true;
    estado.textContent = 'Enviando…';
    try {
      await guardarEnBase(tabla, armarFila(tabla, datos));
      estado.textContent = '¡Gracias! Recibimos tu respuesta ❤️';
      form.reset();
      setTimeout(cerrarVentana, 2200);
    } catch (error) {
      console.error('No se pudo guardar:', error);
      // Si la base falla, el invitado no se queda sin poder avisar
      estado.innerHTML = 'No pudimos guardarlo. ' +
        `<a href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(armarMensaje(datos))}" ` +
        'target="_blank" rel="noopener">Envialo por WhatsApp</a>.';
    } finally {
      boton.disabled = false;
    }
  });
}

/* ————— 11. ÁLBUM COMPARTIDO ————— */
function iniciarAlbum() {
  // Mientras el álbum no esté creado, la sección entera se oculta:
  // es preferible a mostrar un botón que lleva a un link roto.
  if (!CONFIG.urlAlbum || CONFIG.urlAlbum.includes('CAMBIAR-POR')) {
    $('#fotos').remove();
    return;
  }
  $('#btnAlbum').href = CONFIG.urlAlbum;
}

/* ————— 12. COPIAR DATOS DE LA CUENTA ————— */
function iniciarCopiarAlias() {
  const aviso = $('#avisoCopia');
  let temporizador = null;

  $$('[data-copiar]').forEach((boton) => {
    boton.addEventListener('click', async () => {
      const valor = boton.dataset.copiar;
      const nombre = boton.dataset.copiarNombre || 'Dato';

      try {
        await navigator.clipboard.writeText(valor);
      } catch {
        // Fallback para contextos sin Clipboard API (http, navegadores viejos)
        const auxiliar = document.createElement('textarea');
        auxiliar.value = valor;
        auxiliar.setAttribute('readonly', '');
        auxiliar.style.position = 'fixed';
        auxiliar.style.opacity = '0';
        document.body.appendChild(auxiliar);
        auxiliar.select();
        document.execCommand('copy');
        auxiliar.remove();
      }

      // Animación de confirmación
      aviso.textContent = `${nombre} copiado ❤️`;
      aviso.classList.add('brindis-copia--visible');
      if (window.gsap) gsap.fromTo(boton, { scale: 1 }, { scale: 0.94, yoyo: true, repeat: 1, duration: 0.16, ease: 'power2.inOut' });

      clearTimeout(temporizador);
      temporizador = setTimeout(() => aviso.classList.remove('brindis-copia--visible'), 2600);
    });
  });
}

/* ————— 12b. INDICADOR DE SCROLL ————— */
function iniciarIndicadorScroll() {
  const indicador = $('#heroScroll');
  if (!indicador) return;

  const revisar = () => {
    indicador.classList.toggle('hero__scroll--oculto', window.scrollY > 120);
  };
  window.addEventListener('scroll', revisar, { passive: true });
  revisar();
}

/* ————— 13. BOTÓN VOLVER ARRIBA ————— */
function iniciarBotonArriba() {
  const boton = $('#btnArriba');

  // Aparece después de pasar el hero
  ScrollTrigger.create({
    start: () => window.innerHeight * 0.9,
    onUpdate: (self) => boton.classList.toggle('arriba--visible', self.scroll() > window.innerHeight * 0.9),
  });

  boton.addEventListener('click', () => irHacia(document.body));
}
