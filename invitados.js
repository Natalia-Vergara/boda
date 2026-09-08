/* ============================================================
   LISTA DE INVITADOS — links personalizados
   ------------------------------------------------------------
   Cada invitado (o familia) tiene un código. El link que se le
   envía por WhatsApp lleva ese código:

       https://TU-SITIO/?i=codigo

   Ejemplo:  https://natalia-vergara.github.io/boda/?i=flia-perez

   Con ese link, el sobre muestra su nombre y la cantidad de
   lugares reservados, y el mensaje de confirmación de WhatsApp
   sale con su nombre.

   Reglas para el código: minúsculas, sin espacios ni acentos
   (usar guiones). Para agregar un invitado, copiá una línea y
   cambiá el código, el nombre y los pases.

   Si alguien abre el sitio sin código (o con un código que no
   existe), ve la invitación genérica: "Estás cordialmente
   invitado", sin cantidad de personas.
   ============================================================ */

window.INVITADOS = {
  /* ——— EJEMPLOS: reemplazar por los invitados reales ——— */
  'flia-perez':      { nombre: 'Familia Pérez',            pases: 4 },
  'ana-y-juan':      { nombre: 'Ana & Juan',               pases: 2 },
  'maria-gonzalez':  { nombre: 'María González',           pases: 1 },
};
