# Nati & Lean — Invitación de Boda 💍

Invitación digital de lujo, completamente responsive, construida con **HTML5, CSS3 y JavaScript Vanilla** + **GSAP** y **Lenis** para las animaciones y el scroll suave. Sin frameworks, sin Bootstrap.

**27 de noviembre · Finca La Josefina, Berisso**

---

## Estructura del proyecto

```
boda/
│  index.html            → Estructura de la invitación (SEO, OpenGraph, Schema.org)
│  style.css             → Sistema de diseño completo (paleta, tipografías, secciones)
│  script.js             → Animaciones GSAP, Lenis, cuenta regresiva, RSVP, lightbox
│  manifest.webmanifest  → Manifest PWA
│  apps-script.gs        → Código para Google Apps Script (RSVP → Google Sheets)
│  README.md             → Este archivo
│
└─ assets/
   ├─ fonts/             → (Las tipografías se cargan desde Google Fonts)
   ├─ music/             → cancion.mp3 (agregar aquí la canción elegida)
   ├─ images/            → hero.svg, og-cover.svg
   │   └─ gallery/       → foto-01 … foto-08 (reemplazar por fotos reales)
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
| Música | Colocar el MP3 en `assets/music/cancion.mp3` |
| Fotos de la galería | Reemplazar `assets/images/gallery/foto-01.svg` … `foto-08.svg` por `.jpg/.webp` (actualizar las rutas en `index.html`). Ideal: WebP ≤ 200 KB por foto |
| Imagen del hero | Reemplazar `assets/images/hero.svg` por una foto (actualizar la ruta en `index.html`) |
| Fecha de la cuenta regresiva | `CONFIG.fechaBoda` en `script.js` |
| Alias de Mercado Pago | Sección *Regalos* en `index.html` |
| URL canónica / OpenGraph | `<head>` de `index.html` |

---

## 📋 Conectar el formulario a Google Sheets (paso a paso)

El formulario de confirmación envía los datos a una hoja de cálculo tuya mediante **Google Apps Script**. Configurarlo lleva 5 minutos:

### 1. Crear la hoja de cálculo
1. Entrá a [sheets.google.com](https://sheets.google.com) con tu cuenta de Google.
2. Creá una hoja nueva y nombrala, por ejemplo, **"Confirmaciones Boda"**.

### 2. Agregar el script
1. En la hoja, abrí el menú **Extensiones → Apps Script**.
2. Borrá el contenido del editor y pegá **todo** el código del archivo [`apps-script.gs`](apps-script.gs) de este proyecto.
3. Guardá con el ícono de disquete (o `Ctrl + S`).

### 3. Publicar como Web App
1. Arriba a la derecha, botón **Implementar → Nueva implementación**.
2. En el engranaje ⚙️ elegí el tipo **Aplicación web**.
3. Configurá:
   - **Descripción:** `RSVP Boda`
   - **Ejecutar como:** *Yo* (tu cuenta)
   - **Quién tiene acceso:** ⚠️ **Cualquier usuario** (imprescindible para que los invitados puedan enviar sin iniciar sesión)
4. Presioná **Implementar**.
5. Google te pedirá autorizar el script: **Autorizar acceso** → elegí tu cuenta → *Configuración avanzada* → *Ir a … (no seguro)* → **Permitir**. (El aviso aparece porque el script es tuyo y no está verificado por Google; es seguro.)
6. Copiá la **URL de la aplicación web** (termina en `/exec`).

### 4. Conectar el sitio
1. Abrí `script.js` y buscá la constante `CONFIG.urlAppsScript` (línea ~30).
2. Reemplazá `'PEGAR_AQUI_LA_URL_DEL_WEB_APP'` por la URL copiada:

```js
urlAppsScript: 'https://script.google.com/macros/s/AKfycb.../exec',
```

### 5. Probar
1. Abrí la invitación, completá el formulario y presioná **Confirmar asistencia**.
2. En unos segundos la fila aparece en la pestaña **"Confirmaciones"** de tu hoja (el script la crea sola con encabezados la primera vez).

> **Si más adelante editás el script**, recordá republicar: **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva → Implementar**. La URL se mantiene.

---

## Rendimiento

- CSS y JS propios sin dependencias pesadas; GSAP + Lenis suman ~90 KB comprimidos desde CDN.
- Imágenes de la galería con `loading="lazy"` y `decoding="async"`.
- Tipografías con `display=swap` y `preconnect`.
- `prefers-reduced-motion` respetado: sin animaciones para quienes las desactivan.
- Al reemplazar los SVG por fotos reales, conviene exportarlas en **WebP** (calidad 80, ancho ≤ 1200 px) para mantener Lighthouse arriba de 95.

## Créditos

Diseño y desarrollo a medida para Nati & Lean. Paleta inspirada en su moodboard: bordó profundo, vino, marfil, champagne, dorado y verde oliva.
