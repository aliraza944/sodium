"""Generates the Unhooked toolbar/store icons. Run: python3 icons/make_icons.py"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BG = (232, 69, 60, 255)      # coral red, deliberately not YouTube's #FF0000
FG = (255, 255, 255, 255)
N = 1000                     # design grid, drawn at 4x then downsampled
W = 96                      # stroke width
OUT = Path(__file__).parent


def circle(d, c, r, s):
    x, y = c
    d.ellipse([(x - r) * s, (y - r) * s, (x + r) * s, (y + r) * s], fill=FG)


def line(d, a, b, s):
    d.line([a[0] * s, a[1] * s, b[0] * s, b[1] * s], fill=FG, width=int(W * s))
    circle(d, a, W / 2, s)
    circle(d, b, W / 2, s)


def arc(d, c, r, start, end, s):
    x, y = c
    rr = r + W / 2
    d.arc([(x - rr) * s, (y - rr) * s, (x + rr) * s, (y + rr) * s],
          start, end, fill=FG, width=int(W * s))
    for a in (start, end):
        t = math.radians(a)
        circle(d, (x + r * math.cos(t), y + r * math.sin(t)), W / 2, s)


def art(size):
    s = 4 * size / N
    img = Image.new("RGBA", (4 * size,) * 2, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, 4 * size - 1, 4 * size - 1], radius=int(230 * s), fill=BG)
    # A fishing hook whose bend is snapped open: the fish got away.
    cx, cy, r = 450, 610, 175
    sx = cx + r
    d.ellipse([(sx - 70) * s, 130 * s, (sx + 70) * s, 270 * s],
              outline=FG, width=int(52 * s))                # eye
    line(d, (sx, 270), (sx, cy), s)                         # shank
    arc(d, (cx, cy), r, 0, 100, s)                          # bend, right half
    arc(d, (cx, cy), r, 145, 180, s)                        # bend, left stub after the break
    px = cx - r
    line(d, (px, cy), (px, 470), s)                         # point
    h = W / 2
    d.polygon([(px * s, 330 * s), ((px - h) * s, 480 * s), ((px + h) * s, 480 * s),
               ((px + h) * s, 455 * s), ((px + h + 70) * s, 520 * s),
               ((px + h) * s, 390 * s)], fill=FG)            # barbed tip
    return img.resize((size, size), Image.LANCZOS)


def icon(size, pad):
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    inner = size - 2 * pad
    canvas.paste(art(inner), (pad, pad))
    return canvas


def promo_tile():
    font = "/usr/share/fonts/truetype/ubuntu/Ubuntu-{}.ttf"
    tile = Image.new("RGBA", (440, 280), (15, 15, 15, 255))
    mark = art(128)
    tile.paste(mark, (40, 76), mark)
    d = ImageDraw.Draw(tile)
    d.text((192, 96), "Unhooked", font=ImageFont.truetype(font.format("B"), 46), fill=FG)
    d.text((194, 152), "Focus for YouTube", font=ImageFont.truetype(font.format("R"), 22),
           fill=(170, 170, 170, 255))
    return tile


if __name__ == "__main__":
    # Chrome Web Store asks for 96x96 artwork inside the 128x128 icon.
    for size, pad in ((16, 0), (32, 1), (48, 2), (128, 16)):
        icon(size, pad).save(OUT / f"icon{size}.png")
    promo_tile().save(OUT.parent / "store" / "promo-small-440x280.png")
