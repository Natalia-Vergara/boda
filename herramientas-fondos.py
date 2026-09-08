"""
Genera los fondos fotográficos de la invitación.

Recrea la estética de las referencias con dibujo + desenfoque de movimiento
+ desenfoque gaussiano + grano, para que se lean como fotografía y no como
ilustración. Determinista (semilla fija).
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os, math, random

SALIDA = '/home/user/boda/assets/images/fondos'
os.makedirs(SALIDA, exist_ok=True)

W, H = 1000, 1500          # verticales, suficiente para móvil y desktop
MARGEN = 160               # se recorta al final (evita bordes del motion blur)


def lienzo(color):
    return Image.new('RGB', (W + 2 * MARGEN, H + 2 * MARGEN), color)


def mancha(draw, cx, cy, rx, ry, color, rot=0.0, pasos=48):
    """Elipse rotada dibujada como polígono."""
    pts = []
    for i in range(pasos):
        a = 2 * math.pi * i / pasos
        x = rx * math.cos(a)
        y = ry * math.sin(a)
        pts.append((cx + x * math.cos(rot) - y * math.sin(rot),
                    cy + x * math.sin(rot) + y * math.cos(rot)))
    draw.polygon(pts, fill=color)


def rosa(draw, cx, cy, r, base, rnd):
    """Rosa: pétalos exteriores + capas concéntricas hacia el centro."""
    # Pétalos exteriores alrededor
    for i in range(7):
        a = 2 * math.pi * i / 7 + rnd.uniform(-0.3, 0.3)
        d = r * 0.62
        tono = tuple(min(255, c + rnd.randint(-14, 10)) for c in base)
        mancha(draw, cx + d * math.cos(a), cy + d * math.sin(a),
               r * 0.52, r * 0.4, tono, rot=a)
    # Capas concéntricas: dan el volumen del centro
    for i in range(6, 0, -1):
        f = i / 6
        tono = tuple(min(255, int(c * (0.9 + 0.1 * f)) + rnd.randint(-8, 8)) for c in base)
        mancha(draw, cx + rnd.uniform(-3, 3), cy + rnd.uniform(-3, 3),
               r * 0.7 * f, r * 0.62 * f, tono, rot=rnd.uniform(0, 3.14))


def hoja(draw, cx, cy, largo, ancho, color, rot):
    mancha(draw, cx, cy, largo, ancho, color, rot=rot)


def motion_blur(img, dx, dy, pasos=26):
    """Arrastre direccional, como una foto movida."""
    arr = np.asarray(img, dtype=np.float32)
    acc = np.zeros_like(arr)
    peso_total = 0.0
    for i in range(pasos):
        t = i / max(pasos - 1, 1)
        peso = 1.0 - 0.55 * t
        despl = np.roll(arr, int(round(dy * t)), axis=0)
        despl = np.roll(despl, int(round(dx * t)), axis=1)
        acc += despl * peso
        peso_total += peso
    return Image.fromarray(np.clip(acc / peso_total, 0, 255).astype(np.uint8))


def acabado(img, vineta=0.55, grano=6.0, semilla=7):
    """Recorte, viñeta y grano de película."""
    img = img.crop((MARGEN, MARGEN, MARGEN + W, MARGEN + H))
    arr = np.asarray(img, dtype=np.float32)

    ys, xs = np.mgrid[0:H, 0:W]
    nx = (xs - W / 2) / (W / 2)
    ny = (ys - H / 2) / (H / 2)
    d = np.sqrt(nx ** 2 + ny ** 2) / math.sqrt(2)
    mascara = 1.0 - vineta * np.clip(d - 0.25, 0, 1) ** 1.5
    arr *= mascara[..., None]

    rng = np.random.default_rng(semilla)
    arr += rng.normal(0, grano, arr.shape)

    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def guardar(img, nombre):
    ruta = os.path.join(SALIDA, nombre)
    img.save(ruta, 'JPEG', quality=82, optimize=True, progressive=True)
    print(f'{nombre}: {os.path.getsize(ruta) // 1024} KB')


# ————————————————————————————————————————————————
# 1. VERSÍCULO — rosas blancas movidas sobre follaje verde profundo
# ————————————————————————————————————————————————
def versiculo():
    rnd = random.Random(11)
    img = lienzo((16, 26, 18))
    d = ImageDraw.Draw(img)

    # Follaje de fondo
    for _ in range(90):
        x = rnd.uniform(0, W + 2 * MARGEN)
        y = rnd.uniform(0, H + 2 * MARGEN)
        verde = (rnd.randint(30, 62), rnd.randint(52, 92), rnd.randint(28, 52))
        hoja(d, x, y, rnd.uniform(70, 210), rnd.uniform(26, 70), verde, rnd.uniform(0, 3.14))

    # Racimos de rosas blancas
    centros = [(0.30, 0.30), (0.62, 0.20), (0.20, 0.58), (0.55, 0.52),
               (0.80, 0.40), (0.38, 0.80), (0.72, 0.78), (0.12, 0.86), (0.90, 0.66)]
    for fx, fy in centros:
        cx = MARGEN + fx * W
        cy = MARGEN + fy * H
        for _ in range(rnd.randint(3, 5)):
            r = rnd.uniform(58, 104)
            blanco = (rnd.randint(232, 250), rnd.randint(228, 244), rnd.randint(218, 236))
            rosa(d, cx + rnd.uniform(-95, 95), cy + rnd.uniform(-85, 85), r, blanco, rnd)

    img = img.filter(ImageFilter.GaussianBlur(9))
    img = motion_blur(img, dx=-16, dy=34)        # arrastre diagonal
    img = img.filter(ImageFilter.GaussianBlur(6))
    return acabado(img, vineta=0.6, grano=5.5, semilla=3)


# ————————————————————————————————————————————————
# 2. SOBRE — luces de fiesta fuera de foco, en blanco y negro
#    (fondo neutro: el sobre es el protagonista)
# ————————————————————————————————————————————————
def sobre():
    rnd = random.Random(23)
    img = lienzo((40, 40, 40))
    d = ImageDraw.Draw(img)

    # Ambiente: claro arriba, oscuro abajo
    for y in range(0, H + 2 * MARGEN):
        t = y / (H + 2 * MARGEN)
        v = int(104 - 72 * t ** 1.4)
        d.line([(0, y), (W + 2 * MARGEN, y)], fill=(v, v, v))

    # Halos anchos de profundidad
    for _ in range(22):
        x = rnd.uniform(0, W + 2 * MARGEN)
        y = rnd.uniform(0, (H + 2 * MARGEN) * 0.85)
        r = rnd.uniform(180, 420)
        v = rnd.randint(58, 104)
        mancha(d, x, y, r, r * rnd.uniform(0.7, 1.2), (v, v, v))

    # Bokeh: discos con el borde más luminoso, como lentes abiertos
    for _ in range(46):
        x = rnd.uniform(-40, W + 2 * MARGEN + 40)
        y = rnd.uniform(-40, (H + 2 * MARGEN) * 0.78)
        r = rnd.uniform(26, 132)
        v = rnd.randint(120, 226)
        mancha(d, x, y, r * 1.06, r * 1.06, (min(255, v + 26),) * 3)   # aro
        mancha(d, x, y, r * 0.9, r * 0.9, (v, v, v))                   # interior

    img = img.filter(ImageFilter.GaussianBlur(13))
    img = motion_blur(img, dx=4, dy=8, pasos=10)
    img = img.filter(ImageFilter.GaussianBlur(5))

    # A blanco y negro puro
    arr = np.asarray(img, dtype=np.float32)
    gris = arr.mean(axis=2, keepdims=True)
    img = Image.fromarray(np.clip(np.repeat(gris, 3, axis=2), 0, 255).astype(np.uint8))
    return acabado(img, vineta=0.68, grano=7.0, semilla=5)


# ————————————————————————————————————————————————
# 3. PORTADA — flores color crema viradas a sepia.
#    Densas arriba y abajo, con el centro despejado para el texto.
# ————————————————————————————————————————————————
def portada():
    rnd = random.Random(37)
    img = lienzo((52, 42, 32))
    d = ImageDraw.Draw(img)

    # Follaje cálido de fondo
    for _ in range(80):
        x = rnd.uniform(0, W + 2 * MARGEN)
        y = rnd.uniform(0, H + 2 * MARGEN)
        c = (rnd.randint(58, 96), rnd.randint(46, 76), rnd.randint(32, 56))
        hoja(d, x, y, rnd.uniform(90, 260), rnd.uniform(34, 96), c, rnd.uniform(0, 3.14))

    # Flores: cintura superior e inferior, centro libre
    for franja in (0.08, 0.20, 0.80, 0.92):
        for _ in range(7):
            cx = MARGEN + W * rnd.uniform(-0.05, 1.05)
            cy = MARGEN + H * (franja + rnd.uniform(-0.06, 0.06))
            crema = (rnd.randint(214, 238), rnd.randint(198, 222), rnd.randint(170, 196))
            rosa(d, cx, cy, rnd.uniform(64, 118), crema, rnd)
    # Algunas apenas insinuadas en el centro
    for _ in range(5):
        cx = MARGEN + W * rnd.uniform(0, 1)
        cy = MARGEN + H * rnd.uniform(0.34, 0.66)
        crema = (rnd.randint(150, 178), rnd.randint(136, 162), rnd.randint(114, 138))
        rosa(d, cx, cy, rnd.uniform(52, 84), crema, rnd)

    img = img.filter(ImageFilter.GaussianBlur(17))
    img = motion_blur(img, dx=10, dy=-18, pasos=16)
    img = img.filter(ImageFilter.GaussianBlur(8))

    # Viraje sepia
    arr = np.asarray(img, dtype=np.float32)
    gris = arr.mean(axis=2)
    sep = np.stack([gris * 1.10 + 14, gris * 0.96 + 5, gris * 0.75], axis=2)
    img = Image.fromarray(np.clip(sep, 0, 255).astype(np.uint8))
    return acabado(img, vineta=0.7, grano=6.0, semilla=9)


# ————————————————————————————————————————————————
# 4. CIERRE — rosas dispersas sobre verde muy profundo
# ————————————————————————————————————————————————
def cierre():
    rnd = random.Random(53)
    img = lienzo((14, 22, 17))
    d = ImageDraw.Draw(img)

    for _ in range(70):
        x = rnd.uniform(0, W + 2 * MARGEN)
        y = rnd.uniform(0, H + 2 * MARGEN)
        verde = (rnd.randint(22, 50), rnd.randint(40, 74), rnd.randint(22, 44))
        hoja(d, x, y, rnd.uniform(80, 240), rnd.uniform(30, 80), verde, rnd.uniform(0, 3.14))

    # Rosas: dispersas, dejando aire oscuro
    for fx, fy in ((0.18, 0.18), (0.74, 0.12), (0.44, 0.34), (0.88, 0.44),
                   (0.10, 0.52), (0.60, 0.62), (0.30, 0.80), (0.82, 0.86)):
        for _ in range(rnd.randint(2, 3)):
            cx = MARGEN + fx * W + rnd.uniform(-70, 70)
            cy = MARGEN + fy * H + rnd.uniform(-70, 70)
            blanco = (rnd.randint(222, 242), rnd.randint(218, 236), rnd.randint(204, 224))
            rosa(d, cx, cy, rnd.uniform(50, 88), blanco, rnd)

    img = img.filter(ImageFilter.GaussianBlur(12))
    img = motion_blur(img, dx=-10, dy=22, pasos=18)
    img = img.filter(ImageFilter.GaussianBlur(7))
    return acabado(img, vineta=0.66, grano=5.5, semilla=13)


guardar(versiculo(), 'versiculo.jpg')
guardar(sobre(), 'sobre.jpg')
guardar(portada(), 'portada.jpg')
guardar(cierre(), 'cierre.jpg')
