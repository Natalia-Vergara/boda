# Lean & Nati — Invitación de Boda 💍

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
1. **Portada** — animación de entrada (L & N → Lean & Nati), promesa, «Nos casamos» y cuenta regresiva en tiempo real hasta el 27/11/2026.
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
   ├─ images/            → og-cover.jpg (vista previa al compartir)
   │   └─ finca/         → finca-01 … finca-03 (fotos del lugar)
   ├─ vendor/            → gsap, ScrollTrigger, lenis (auto-hospedados)
   └─ icons/             → favicon.svg
```

## Publicar el sitio (GitHub Pages)

La rama `main` tiene siempre la versión final. Para publicarla:

1. En el repositorio, entrar a **Settings → Pages**.
2. En *Source* elegir **Deploy from a branch**.
3. Seleccionar la rama **`main`** y la carpeta **`/ (root)`**. Guardar.
4. Al minuto el sitio queda en:
   **https://natalia-vergara.github.io/boda/**

Conviene además dejar `main` como rama principal del repositorio
(**Settings → General → Default branch**), para que sea siempre la que se
ve al entrar y no quede a la vista una versión vieja.

Cada vez que se haga un cambio en `main`, el sitio se actualiza solo en
un par de minutos.

### Antes de mandar el link a los invitados

- **Álbum de fotos**: mientras `CONFIG.urlAlbum` (en `script.js`) siga con
  el valor de ejemplo, la sección *Fotos* no se muestra. Al pegar el link
  real del álbum, aparece sola.
- **Música**: el botón del reproductor sólo aparece si existe
  `assets/music/cancion.mp3`. Sin ese archivo, no se ve ningún botón roto.
- **Invitados**: `invitados.js` trae tres ejemplos. Reemplazarlos por los
  invitados reales antes de repartir los links personalizados.

## Probar en la computadora

Es un sitio 100 % estático: basta con servir la carpeta.

```bash
python3 -m http.server 8080
# → http://localhost:8080
# Con invitado:  http://localhost:8080/?i=flia-perez
```

## Personalización rápida

| Qué | Dónde |
|---|---|
| **Invitados y pases** | `invitados.js` (un renglón por invitado/familia) |
| **Fotos de fondo** (sobre, portada, versículo, cierre) | Guardarlas en `assets/images/fondos/` con los nombres que indica el `LEEME.txt` de esa carpeta |
| **Link del álbum compartido** | `CONFIG.urlAlbum` en `script.js` (pegar el link de Google Fotos) |
| Fotos de la finca | `assets/images/finca/finca-01.jpg` … `finca-03.jpg` (proporción 4:3). Si falta alguna, esa foto se oculta sola; si faltan las tres, se oculta el bloque entero |
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

Diseño y desarrollo a medida para Lean & Nati. Paleta inspirada en su moodboard: bordó profundo, vino, marfil, champagne y dorado — el bordó de las damas de honor como acento principal.
