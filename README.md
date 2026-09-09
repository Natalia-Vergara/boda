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

0. **Sobre** — a pantalla completa, bordó aterciopelado con filete dorado y sello de lacre; muestra el nombre del invitado y sus lugares. Al tocar el sello, el lacre se despega, la solapa gira y la carta —«Lean & Nati · nos casamos · save the date · 27 · 11 · 2026»— sale despacio; recién a los 7 s la escena se disuelve en la portada.
1. **Portada** — animación de entrada (L & N → Lean & Nati), promesa, «Nos casamos» y cuenta regresiva en tiempo real hasta el 27/11/2026.
2. **Con inmensa alegría** — bienvenida.
3. **Ceremonia & Celebración** — dirección completa, horarios (18:15 llegada / 18:30 puntual), botones **Ver mapa** (Google Maps) y **Fotos del lugar** (Instagram `@fincalajosefinaeventos`), más cuatro fotos reales de la finca.
4. **Dress code** — Formal, con los 5 colores a evitar (blanco, crema, beige, nude y bordo).
5. **Regalos** — datos de la cuenta (Naranja X) con botones para copiar el alias y el CBU (Clipboard API + fallback) y aviso de confirmación.
6. **Celebración sólo para adultos**.
7. **Fotos** — link al álbum compartido del evento.
8. **Confirmación de asistencia** — antes del **25 de octubre**, botón «Confirmar aquí» que abre WhatsApp con mensaje predefinido.
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
   │   └─ finca/         → finca-01 … finca-04 (fotos del lugar)
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

## Base de datos (Supabase)

Las confirmaciones y las sugerencias de canciones se guardan en una base
PostgreSQL en Supabase, que tiene plan gratuito y no necesita servidor propio:
el sitio escribe directamente en la base desde el navegador.

Para conectarla, completar en `script.js` → `CONFIG.baseDeDatos`:

```js
baseDeDatos: {
  url:   'https://mjvhfvcpkrzpufrpklrv.supabase.co',
  clave: 'eyJhbGciOi…',   // clave anon (public)
},
```

Mientras falte alguno de los dos, los formularios abren WhatsApp con el
mensaje ya escrito, así la invitación funciona igual sin base conectada.

### Las tablas

```sql
-- Se puede correr las veces que haga falta: lo que ya existe, lo saltea.
create table if not exists confirmaciones (
  id         bigint generated always as identity primary key,
  creado_en  timestamptz not null default now(),
  asiste     text not null,
  nombre     text not null,
  personas   int  not null default 1,
  alcohol    int  not null default 0,   -- pulseras de barra libre
  nota       text,
  invitado   text,   -- nombre según la lista, si entró por su link
  codigo     text    -- código del link personalizado (?i=…)
);

create table if not exists canciones (
  id         bigint generated always as identity primary key,
  creado_en  timestamptz not null default now(),
  nombre     text not null,
  cancion    text not null,
  link       text,
  codigo     text
);

-- Por si la tabla se creó antes de que existiera la barra libre
alter table confirmaciones add column if not exists alcohol int not null default 0;
```

### Seguridad

La clave `anon` es pública por diseño: viaja al navegador de cada invitado.
Lo que protege los datos son las políticas de la base, que habilitan
**únicamente insertar** filas:

```sql
alter table confirmaciones enable row level security;
alter table canciones      enable row level security;

drop policy if exists "cualquiera puede confirmar" on confirmaciones;
drop policy if exists "cualquiera puede sugerir"   on canciones;

create policy "cualquiera puede confirmar"
  on confirmaciones for insert to anon with check (true);

create policy "cualquiera puede sugerir"
  on canciones for insert to anon with check (true);
```

Sin políticas de lectura, nadie puede consultar ni borrar las respuestas
desde el sitio. Las confirmaciones se ven desde el panel de Supabase, que
usa credenciales propias y permite exportar a CSV.

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
| Fotos de la finca | `assets/images/finca/finca-01.jpg` … `finca-04.jpg` (proporción 4:3). Si falta alguna, esa foto se oculta sola; si faltan todas, se oculta el bloque entero |
| Música | Colocar el MP3 en `assets/music/cancion.mp3` |
| Imagen del hero | Reemplazar `assets/images/hero.svg` por una foto (actualizar la ruta en `index.html`) |
| Fecha de la cuenta regresiva | `CONFIG.fechaBoda` en `script.js` |
| Datos de la cuenta | Sección *Regalos* en `index.html`: el texto visible y el atributo `data-copiar` de cada botón deben coincidir |
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
