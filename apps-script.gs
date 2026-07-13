/**
 * ============================================================
 * NATI & LEAN — Receptor de confirmaciones (RSVP)
 * Google Apps Script → Google Sheets
 * ------------------------------------------------------------
 * Este archivo NO forma parte del sitio web: se pega en
 * script.google.com siguiendo los pasos del README.md.
 * ============================================================
 */

/** Nombre de la hoja donde se guardan las confirmaciones */
const NOMBRE_HOJA = 'Confirmaciones';

/**
 * Se ejecuta cada vez que el formulario del sitio hace un POST.
 * Recibe un JSON con: nombre, apellido, asistentes, asistira, mensaje.
 */
function doPost(e) {
  const hoja = obtenerHoja_();
  const datos = JSON.parse(e.postData.contents);

  hoja.appendRow([
    new Date(),                 // Fecha y hora de la confirmación
    datos.nombre    || '',
    datos.apellido  || '',
    datos.asistentes || '',
    datos.asistira  || '',
    datos.mensaje   || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Devuelve la hoja de confirmaciones; la crea con encabezados si no existe. */
function obtenerHoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(NOMBRE_HOJA);

  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
    hoja.appendRow(['Fecha', 'Nombre', 'Apellido', 'Asistentes', '¿Asistirá?', 'Mensaje']);
    hoja.getRange('A1:F1').setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  return hoja;
}
