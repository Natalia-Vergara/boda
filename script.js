/* ============================================================
   NATI & LEAN — Invitación de Boda
   JavaScript Vanilla + GSAP + Lenis
   ------------------------------------------------------------
   Índice
   01. Configuración
   02. Utilidades
   03. Preloader
   04. Scroll suave (Lenis) + barra de progreso
   05. Cursor personalizado
   06. Música (con memoria en localStorage)
   07. Hero: secuencia cinematográfica de entrada
   08. Abrir invitación
   09. Animaciones de scroll (fade, zoom, split, dibujo, parallax)
   10. Timeline animada
   11. Cuenta regresiva
   12. Álbum compartido (link configurable)
   13. Copiar alias (uno por cada novio)
   14. Botón volver arriba
   ============================================================ */

'use strict';

/* ————— 01. CONFIGURACIÓN ————— */
const CONFIG = {
  // Fecha y hora de la ceremonia (Argentina, UTC-3)
  fechaBoda: new Date('2026-11-27T18:30:00-03:00'),

  // Link del álbum compartido (Google Fotos u otro).
  // Reemplazar por la URL real, p. ej.: 'https://photos.app.goo.gl/XXXXXXXX'
  urlAlbum: 'https://photos.app.goo.gl/CAMBIAR-POR-EL-LINK-DEL-ALBUM',

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
  // Plan B: si GSAP no cargó, la invitación sigue siendo usable sin animaciones
  if (typeof gsap === 'undefined') {
    document.documentElement.classList.add('sin-js');
    $('#preloader').classList.add('preloader--fuera');
    iniciarMusica();
    iniciarCuentaRegresiva();
    iniciarAlbum();
    iniciarCopiarAlias();
    $('#btnAbrir').addEventListener('click', () => {
      reproducirMusica();
      document.body.dataset.estado = 'abierta';
      btnMusica.classList.add('musica--visible');
      $('#cuenta-regresiva').scrollIntoView({ behavior: 'smooth' });
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  iniciarLenis();
  iniciarPreloader();
  iniciarCursor();
  iniciarMusica();
  iniciarHero();
  iniciarAbrirInvitacion();
  iniciarAnimacionesScroll();
  iniciarTimeline();
  iniciarCuentaRegresiva();
  iniciarAlbum();
  iniciarCopiarAlias();
  iniciarBotonArriba();
});

/* ————— 03. PRELOADER ————— */
function iniciarPreloader() {
  const preloader = $('#preloader');

  // Cuando la página terminó de cargar, el telón se levanta con elegancia
  const salir = () => {
    setTimeout(() => {
      preloader.classList.add('preloader--fuera');
      // Con el telón fuera, arranca la secuencia del hero
      reproducirEntradaHero();
    }, 900);
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

function iniciarMusica() {
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

/* ————— 07. HERO: ENTRADA CINEMATOGRÁFICA ————— */
function iniciarHero() {
  // Parallax del fondo del hero y demás capas con data-parallax
  $$('[data-parallax]').forEach((capa) => {
    const fuerza = parseFloat(capa.dataset.parallax) || 0.2;
    const seccion = capa.closest('section, header');
    // El hero ya está en pantalla al cargar: su parallax arranca desde arriba
    const esHero = seccion.classList.contains('hero');
    gsap.to(capa, {
      yPercent: fuerza * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: seccion,
        start: esHero ? 'top top' : 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/** Secuencia: iniciales → nombres → promesa → fecha → botón */
function reproducirEntradaHero() {
  const letras = dividirEnPalabras($('#heroNombres'));

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero__ornamento--sup', { opacity: 1, duration: 1.6 })
    .to('#heroIniciales', { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }, '-=1.2')
    .set('#heroNombres', { opacity: 1 }, '-=0.6')
    .from(letras, {
      yPercent: 110,
      duration: 1.6,
      stagger: 0.12,
      ease: 'power4.out',
    }, '<')
    .to('#heroPromesa', { opacity: 1, y: 0, duration: 1.8 }, '-=0.8')
    .to('#heroFecha', { opacity: 1, y: 0, duration: 1.4 }, '-=1')
    .to('#btnAbrir', { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.4)' }, '-=0.7')
    .to('.hero__ornamento--inf', { opacity: 1, duration: 1.6 }, '-=1');

  // Estados iniciales de la secuencia
  gsap.set('#heroIniciales', { y: 24 });
  gsap.set('#heroPromesa', { y: 30 });
  gsap.set('#heroFecha', { y: 24 });
  gsap.set('#btnAbrir', { scale: 0.9 });
}

/* ————— 08. ABRIR INVITACIÓN ————— */
function iniciarAbrirInvitacion() {
  $('#btnAbrir').addEventListener('click', () => {
    // 1. Empieza la música (gesto del usuario: el navegador lo permite)
    reproducirMusica();

    // 2. Se libera el scroll y se aclara el velo (transición en CSS)
    document.body.dataset.estado = 'abierta';

    // 3. Aparecen los controles flotantes
    btnMusica.classList.add('musica--visible');

    // 4. Lenis necesita recalcular la altura ahora que el body creció
    if (lenis) lenis.resize();
    ScrollTrigger.refresh();

    // 5. Viaje suave hacia la primera sección
    setTimeout(() => irHacia($('#cuenta-regresiva')), 450);
  });
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

      /* Hitos de la timeline: desde la izquierda */
      case 'hito':
        gsap.fromTo(el,
          { opacity: 0, x: -36 },
          {
            opacity: 1, x: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { ...disparo, onEnter: () => el.classList.add('activo') },
          });
        break;
    }
  });
}

/* ————— 10. TIMELINE: EL HILO DORADO CRECE CON EL SCROLL ————— */
function iniciarTimeline() {
  if (prefiereMenosMovimiento) return;
  gsap.to('#ejeProgreso', {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '#lineaTiempo',
      start: 'top 75%',
      end: 'bottom 55%',
      scrub: 0.6,
    },
  });
}

/* ————— 11. CUENTA REGRESIVA ————— */
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

/* ————— 12. ÁLBUM COMPARTIDO ————— */
function iniciarAlbum() {
  // El link vive en CONFIG.urlAlbum para poder cambiarlo sin tocar el HTML
  $('#btnAlbum').href = CONFIG.urlAlbum;
}

/* ————— 13. COPIAR ALIAS ————— */
function iniciarCopiarAlias() {
  const aviso = $('#avisoCopia');
  let temporizador = null;

  $$('[data-alias]').forEach((boton) => {
    boton.addEventListener('click', async () => {
      const alias = boton.dataset.alias;

      try {
        await navigator.clipboard.writeText(alias);
      } catch {
        // Fallback para contextos sin Clipboard API (http, navegadores viejos)
        const auxiliar = document.createElement('textarea');
        auxiliar.value = alias;
        auxiliar.setAttribute('readonly', '');
        auxiliar.style.position = 'fixed';
        auxiliar.style.opacity = '0';
        document.body.appendChild(auxiliar);
        auxiliar.select();
        document.execCommand('copy');
        auxiliar.remove();
      }

      // Animación de confirmación
      aviso.classList.add('brindis-copia--visible');
      if (window.gsap) gsap.fromTo(boton, { scale: 1 }, { scale: 0.94, yoyo: true, repeat: 1, duration: 0.16, ease: 'power2.inOut' });

      clearTimeout(temporizador);
      temporizador = setTimeout(() => aviso.classList.remove('brindis-copia--visible'), 2600);
    });
  });
}

/* ————— 14. BOTÓN VOLVER ARRIBA ————— */
function iniciarBotonArriba() {
  const boton = $('#btnArriba');

  // Aparece después de pasar el hero
  ScrollTrigger.create({
    start: () => window.innerHeight * 0.9,
    onUpdate: (self) => boton.classList.toggle('arriba--visible', self.scroll() > window.innerHeight * 0.9),
  });

  boton.addEventListener('click', () => irHacia(document.body));
}
