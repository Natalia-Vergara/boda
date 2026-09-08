# Nati & Lean — Invitación de Boda 💍

Invitación digital de lujo, completamente responsive (mobile-first), construida con **HTML5, CSS3 y JavaScript Vanilla** + **GSAP** y **Lenis** para las animaciones y el scroll suave. Sin frameworks pesados.

**27 de noviembre de 2026 · Finca «La Josefina», Los Talas, Berisso**

---

## Links personalizados por invitado (sin base de datos)

Cada invitado puede recibir un link único que muestra **su nombre y sus lugares
reservados en el sobre**, y hace que el mensaje de WhatsApp de confirmación
salga con su nombre:

```
https://TU-SITIO/?i=flia-perez
```

La lista vive en [`invitados.js`](invitados.js) — un objeto simple
`codigo → { nombre, pases }`. Para agregar un invitado se copia una línea y se
cambian los datos; no hace falta backend ni base de datos. Quien abre el sitio
sin código ve la invitación genérica («Estás cordialmente invitado»).

## Secciones

0. **Sobre** — a pantalla completa, con textura de papel y sello de lacre; muestra el nombre del invitado y se abre al tocar el sello (la carta asoma y aparece la portada).
1. **Portada** — animación de entrada (N & L → Nati & Lean), promesa, «Nos casamos» y cuenta regresiva en tiempo real hasta el 27/11/2026.
2. **Con inmensa alegría** — bienvenida.
3. **Ceremonia & Celebración** — dirección completa, horarios (18:15 llegada / 18:30 puntual), botones **Ver mapa** (Google Maps) y **Fotos del lugar** (Instagram `@fincalajosefinaeventos`), más preview visual de la finca.
4. **Dress code** — Formal, con los 5 colores a evitar (blanco, crema, beige, nude y bordó).
5. **Regalos** — dos alias (Nati y Lean), cada uno con su botón «Copiar Alias» (Clipboard API + fallback) y aviso «Alias copiado ❤️».
6. **Celebración sólo para adultos**.
7. **Fotos** — link al álbum compartido del evento.
8. **Confirmación de asistencia** — antes del **19 de octubre**, botón «Confirmar aquí» que abre WhatsApp con mensaje predefinido.
9. **Cierre** — despedida con las iniciales.

## Estructura del proyecto

```
boda/
│  index.html            → Estructura de la invitación (SEO, OpenGraph, Schema.org)
│  style.css             → Sistema de diseño completo (paleta, tipografías, secciones)
│  script.js             → Animaciones GSAP, Lenis, cuenta regresiva, copiar alias
│  manifest.webmanifest  → Manifest PWA
│  README.md             → Este archivo
│
└─ assets/
   ├─ fonts/             → Tipografías auto-hospedadas (woff2)
   ├─ music/             → cancion.mp3 (agregar aquí la canción elegida)
   ├─ images/            → hero.svg, og-cover.svg
   │   └─ finca/         → finca-01 … finca-03 (reemplazar por fotos reales del lugar)
   ├─ vendor/            → gsap, ScrollTrigger, lenis (auto-hospedados)
   └─ icons/             → favicon.svg
```

## Puesta en marcha

Es un sitio 100 % estático: basta con servir la carpeta.

```bash
# Opción rápida para probar en local
python3 -m http.server 8080
# → http://localhost:8080
```

Para publicar: **GitHub Pages, Netlify, Vercel o Cloudflare Pages** (arrastrar la carpeta y listo).

## Personalización rápida

| Qué | Dónde |
|---|---|
| **Invitados y pases** | `invitados.js` (un renglón por invitado/familia) |
| **Link del álbum compartido** | `CONFIG.urlAlbum` en `script.js` (pegar el link de Google Fotos) |
| Fotos de la finca | Reemplazar `assets/images/finca/finca-01.svg` … `finca-03.svg` por fotos reales de `@fincalajosefinaeventos` en `.jpg/.webp` (actualizar las rutas en `index.html`). Ideal: WebP ≤ 200 KB por foto |
| Música | Colocar el MP3 en `assets/music/cancion.mp3` |
| Imagen del hero | Reemplazar `assets/images/hero.svg` por una foto (actualizar la ruta en `index.html`) |
| Fecha de la cuenta regresiva | `CONFIG.fechaBoda` en `script.js` |
| Alias de Mercado Pago | Sección *Regalos* en `index.html` (atributo `data-alias` y texto visible) |
| Número / mensaje de WhatsApp del RSVP | Sección *Confirmación* en `index.html` (link `wa.me`) |
| URL canónica / OpenGraph | `<head>` de `index.html` |

## Rendimiento

- CSS y JS propios sin dependencias pesadas; GSAP + Lenis auto-hospedados (~90 KB comprimidos).
- Imágenes con `loading="lazy"` y `decoding="async"`.
- Tipografías woff2 auto-hospedadas con `preload` de las críticas.
- `prefers-reduced-motion` respetado: sin animaciones para quienes las desactivan.
- Al reemplazar los SVG por fotos reales, conviene exportarlas en **WebP** (calidad 80, ancho ≤ 1200 px) para mantener Lighthouse arriba de 95.

## Créditos

Diseño y desarrollo a medida para Nati & Lean. Paleta inspirada en su moodboard: bordó profundo, vino, marfil, champagne y dorado — el bordó de las damas de honor como acento principal.
