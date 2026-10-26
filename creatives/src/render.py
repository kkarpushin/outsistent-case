#!/usr/bin/env python3
"""Накладка текста, логотипа и кнопок поверх сцен-диорам и фото Карины.

HTML-шаблон на каждый креатив -> скриншот headless Chrome в точный размер
(4:5 = 1080x1350, 9:16 = 1080x1920). Текст набираем кодом, генератор рисует
только сцену: так контролируем орфографию и бренд.

Запуск:  python3 render.py            # все креативы
         python3 render.py A1 C2      # выборочно
"""
import html
import re
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path("/home/karpushin/WebinarK/karina")
CR = ROOT / "creatives"
SCENES = CR / "scenes"
OUT = CR / "out"
HTML_DIR = CR / "src" / "html"
PROFILE = Path(os.environ.get("CHROME_PROFILE", "/tmp/claude-1000/-home-karpushin-WebinarK/a6220c97-c2cb-4c07-bf4a-3f8264a38dd9/scratchpad/chrome-prof"))

LOGO = ROOT / "site/public/images/logo.png"            # серая S, для светлого фона
LOGO_WHITE = ROOT / "site/public/images/logo-white.png"  # белая S, для графита
MARKER = ROOT / "site/public/images/marker-line.png"
KARINA = ROOT / "brand/assets/instagram/avatar_karina_zamkova.jpg"  # реальное фото, не генерация

SIZES = {"4:5": (1080, 1350), "9:16": (1080, 1920)}

ARROW = ('<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'
         '<path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>')

BASE_CSS = """
:root{--teal:#30D5C8;--teal-deep:#0D7773;--teal-light:#73EBDF;--ink:#11141B;--text:#000917;
--heading:#222222;--grey:#727272;--muted:#5B6462;--paper:#F5F5F5;--line:#DEE4E2}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:%(w)dpx;height:%(h)dpx;overflow:hidden}
body{position:relative;font-family:'Montserrat',sans-serif;background:var(--paper);color:var(--ink);
-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.bg{position:absolute;left:0;top:0;width:100%%;height:100%%;object-fit:cover}
.logo{position:absolute;width:230px;height:auto}
.copy{position:absolute;left:64px;right:64px}
h1{font-weight:800;color:var(--ink);letter-spacing:-0.012em;line-height:1.07}
.mk{background-image:url('%(marker)s');background-repeat:no-repeat;background-size:100%% 46%%;
background-position:0 92%%;-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:0 6px;margin:0 -6px}
.sub{font-weight:500;color:#222222;line-height:1.36;margin-top:22px}
.hand{font-family:'Caveat',cursive;font-weight:700;color:var(--teal-deep);line-height:1;margin-bottom:10px}
.cta{display:inline-flex;align-items:center;gap:20px;background:var(--teal);color:var(--ink);font-weight:700;
border-radius:999px;padding:12px 12px 12px 36px;white-space:nowrap;box-shadow:0 10px 28px rgba(17,20,27,.14)}
.cta i{display:grid;place-items:center;border-radius:50%%;background:var(--ink);color:var(--teal);font-style:normal}
.note{font-weight:500;color:var(--muted);margin-top:14px}
.chip{display:inline-block;background:#fff;border:1px solid var(--line);border-radius:999px;padding:8px 18px;
font-weight:600;color:var(--teal-deep)}
"""

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800'
         '&family=Caveat:wght@600;700&display=block&subset=cyrillic" rel="stylesheet">')


SHORT = ("а","і","й","в","у","з","о","до","не","на","за","що","як","чи","та","ще","від","для","без","по","про","його","її","їх")


def typo(t):
    """Неразрывные пробелы: после коротких слов, перед тире, внутри чисел с единицами."""
    if not t:
        return t
    t = t.replace(" — ", "&nbsp;— ")
    t = re.sub(r"(\d) (млн|грн|ознак|робочі|хвилин|листопада|групи|місяці)", r"\1&nbsp;\2", t)
    t = re.sub(r"(?<=[\s>«(])(" + "|".join(SHORT) + r") ", r"\1&nbsp;", t, flags=re.I)
    t = re.sub(r"^(" + "|".join(SHORT) + r") ", r"\1&nbsp;", t, flags=re.I)
    return t


def u(p: Path) -> str:
    return "file://" + str(p)


def cta(text, size=30, circle=58):
    return (f'<span class="cta" style="font-size:{size}px"><span>{text}</span>'
            f'<i style="width:{circle}px;height:{circle}px">{ARROW}</i></span>')


# ---------------------------------------------------------------- layouts

def layout_scene(c, w, h):
    """Сцена на весь кадр, текст на пустой части стола сверху."""
    nine = c["ratio"] == "9:16"
    top = c.get("copy_top", 300 if nine else 150)
    logo_top = c.get("logo_top", 210 if nine else 60)
    fade = c.get("fade", 0.0)
    shift = c.get("shift", 0)
    img = c["scene"]
    bg = (f'<img class="bg" src="{u(img)}" style="object-position:{c.get("pos","50% 50%")};'
          f'top:{shift}px;height:{h - shift}px">')
    filler = ""
    if shift:
        # продлеваем пустой стол вверх зеркалом верхней части сцены (без швов и полос)
        filler = (f'<div style="position:absolute;left:0;top:0;width:100%;height:{shift}px;overflow:hidden">'
                  f'<img src="{u(img)}" style="position:absolute;left:0;top:{shift}px;width:100%;height:{h - shift}px;'
                  f'object-fit:cover;object-position:{c.get("pos","50% 50%")};transform:scaleY(-1);'
                  f'transform-origin:50% 0"></div>')
    veil = ""
    if fade:
        veil = (f'<div style="position:absolute;left:0;right:0;top:0;height:{int(h*fade)}px;'
                f'background:linear-gradient(180deg,rgba(242,242,241,.92) 0%,rgba(242,242,241,.78) 55%,'
                f'rgba(242,242,241,0) 100%)"></div>')
    hand = f'<div class="hand" style="font-size:{c.get("hand_size",48)}px">{c["hand"]}</div>' if c.get("hand") else ""
    sub = f'<div class="sub" style="font-size:{c.get("sub_size",32)}px">{c["sub"]}</div>' if c.get("sub") else ""
    cta_inline = ""
    if c.get("cta") and c.get("cta_pos", "inline") == "inline":
        cta_inline = f'<div style="margin-top:{c.get("cta_gap",34)}px">{cta(c["cta"], c.get("cta_size",30))}</div>'
        if c.get("note"):
            cta_inline += f'<div class="note" style="font-size:22px">{c["note"]}</div>'
    cta_bottom = ""
    if c.get("cta") and c.get("cta_pos") == "bottom":
        cta_bottom = (f'<div style="position:absolute;left:64px;bottom:{c.get("cta_bottom",64)}px">'
                      f'{cta(c["cta"], c.get("cta_size",30))}'
                      + (f'<div class="note" style="font-size:22px;background:rgba(245,245,245,.85);'
                         f'display:inline-block;padding:4px 10px;border-radius:8px;margin-left:12px">{c["note"]}</div>'
                         if c.get("note") else "") + '</div>')
    return f"""{filler}{bg}{veil}
<img class="logo" src="{u(LOGO)}" style="left:64px;top:{logo_top}px">
<div class="copy" style="top:{top}px">{hand}
<h1 style="font-size:{c.get('h_size',66)}px">{c['h']}</h1>{sub}{cta_inline}</div>{cta_bottom}"""


def layout_card(c, w, h):
    """Светлый лист: текст сверху, сцена в скруглённой рамке снизу (для чужих пропорций)."""
    frame_h = c.get("frame_h", 700)
    frame = (f'<div style="position:absolute;left:64px;right:64px;bottom:64px;height:{frame_h}px;'
             f'border-radius:28px;overflow:hidden;border:1px solid var(--line);background:#fff">'
             f'<img src="{u(c["scene"])}" style="width:100%;height:100%;object-fit:cover;'
             f'object-position:{c.get("pos","50% 50%")}"></div>')
    hand = f'<div class="hand" style="font-size:{c.get("hand_size",48)}px">{c["hand"]}</div>' if c.get("hand") else ""
    sub = f'<div class="sub" style="font-size:{c.get("sub_size",30)}px">{c["sub"]}</div>' if c.get("sub") else ""
    cta_html = ""
    if c.get("cta"):
        cta_html = (f'<div style="position:absolute;right:88px;bottom:{64 + 28}px">'
                    f'{cta(c["cta"], c.get("cta_size",28), 54)}</div>')
    return f"""<img class="logo" src="{u(LOGO)}" style="left:64px;top:60px">
<div class="copy" style="top:{c.get('copy_top',160)}px">{hand}
<h1 style="font-size:{c.get('h_size',60)}px">{c['h']}</h1>{sub}</div>{frame}{cta_html}"""


def layout_scene_karina_bar(c, w, h):
    """Сцена + графитовая подпись с реальным фото Карины в круге."""
    bar = c.get("bar_h", 236)
    base = layout_scene({**c, "cta": None}, w, h)
    return base + f"""
<div style="position:absolute;left:0;right:0;bottom:0;height:{bar}px;background:var(--ink);display:flex;
align-items:center;padding:0 48px 0 56px;gap:26px">
  <div style="width:150px;height:150px;border-radius:50%;overflow:hidden;flex:none;border:4px solid var(--teal)">
    <img src="{u(KARINA)}" style="width:100%;height:100%;object-fit:cover;object-position:50% 30%"></div>
  <div style="flex:1;min-width:0">
    <div style="color:#fff;font-weight:700;font-size:32px">Карина Замкова</div>
    <div style="color:#B8C1BF;font-weight:500;font-size:23px;margin-top:6px;line-height:1.3">{c.get('role','податковий консультант')}</div>
  </div>
  {cta(c['cta'], 27, 52)}
</div>"""


def layout_karina_story(c, w, h):
    """9:16, графит, реальное фото Карины внизу."""
    photo_top = c.get("photo_top", 820)
    return f"""<div style="position:absolute;inset:0;background:var(--ink)"></div>
<img src="{u(KARINA)}" style="position:absolute;left:0;top:{photo_top}px;width:1080px;height:{h-photo_top}px;
object-fit:cover;object-position:50% 18%">
<div style="position:absolute;left:0;right:0;top:{photo_top-2}px;height:300px;
background:linear-gradient(180deg,#11141B 0%,rgba(17,20,27,.55) 45%,rgba(17,20,27,0) 100%)"></div>
<img class="logo" src="{u(LOGO_WHITE)}" style="left:64px;top:{c.get('logo_top',210)}px">
<div class="copy" style="top:{c.get('copy_top',320)}px">
  <div class="hand" style="font-size:52px;color:var(--teal-light)">{c['hand']}</div>
  <h1 style="font-size:{c.get('h_size',64)}px;color:#fff">{c['h']}</h1>
  <div class="sub" style="font-size:30px;color:#D5DCDA">{c['sub']}</div>
  <div style="margin-top:34px">{cta(c['cta'], 30)}</div>
</div>
<div style="position:absolute;right:56px;top:{photo_top + 60}px;text-align:right;color:#fff">
  <div style="font-weight:700;font-size:30px;text-shadow:0 2px 10px rgba(0,0,0,.35)">Карина Замкова</div>
  <div style="font-weight:500;font-size:23px;color:#E6ECEA;margin-top:4px;text-shadow:0 2px 10px rgba(0,0,0,.35)">податковий консультант</div>
</div>"""


LAYOUTS = {"scene": layout_scene, "card": layout_card, "karina_bar": layout_scene_karina_bar,
           "karina_story": layout_karina_story}


# ---------------------------------------------------------------- creatives
S = SCENES
CREATIVES = {
    # ---- Угол A · «Банк ще нічого не запитував»
    "A1": dict(file="A1_bank-ne-zapytuvav_4x5", ratio="4:5", layout="scene", scene=S / "s1_empty_tray.png",
               h='Банк ще нічого<br><span class="mk">не запитував.</span>', h_size=74,
               sub="Саме час подивитися на рахунки його очима —<br>до запиту, а не після.", sub_size=33,
               cta="Заповнити анкету", cta_pos="bottom", cta_bottom=72,
               copy_top=158),
    "A2": dict(file="A2_vidsutnist-zapytu_9x16", ratio="9:16", layout="scene", scene=S / "s2_statement_rows.png",
               shift=150, copy_top=318, logo_top=214,
               h='Відсутність запиту<br>не означає<br><span class="mk">відсутність ризику</span>', h_size=70,
               sub="Карта ризиків рахунків і структури ФОП очима банку — за 3 робочі дні.", sub_size=32,
               cta="Заповнити анкету", cta_gap=30),
    "A3": dict(file="A3_karyna-karta-ryzykiv_4x5", ratio="4:5", layout="karina_bar", scene=S / "s7_risk_map_bank.png",
               pos="50% 30%", copy_top=150,
               h='Подивіться на свої рахунки <span class="mk">так, як їх бачить банк</span>', h_size=56,
               sub="Карта ризиків за 3 робочі дні — навіть якщо банк ще нічого не запитував.", sub_size=28,
               cta="Заповнити анкету", role="податковий консультант<br>ТОВ «Аутсістент»"),
    # ---- Угол B · «Кілька ФОП на родину»
    "B1": dict(file="B1_kilka-fop-ne-droblennia_4x5", ratio="4:5", layout="card",
               scene=ROOT / "assets/gen/bank-sees.png", pos="50% 50%", frame_h=770, copy_top=162,
               h='Кілька ФОП —<br><span class="mk">ще не дроблення.</span>', h_size=66,
               sub="Але банк дивиться, чи не є вони одним бізнесом.", sub_size=32,
               cta="Напишіть БАНК"),
    "B2": dict(file="B2_rodyna-odyn-magazyn_9x16", ratio="9:16", layout="scene", scene=S / "s3_fop_to_shop.png",
               shift=170, copy_top=318, logo_top=214,
               h='Кілька ФОП у родині.<br><span class="mk">Один магазин.</span>', h_size=68,
               sub="Для банку це може виглядати як один бізнес.", sub_size=32,
               cta="Напишіть БАНК — 10 ознак", cta_gap=30),
    "B3": dict(file="B3_10-oznak-chek-lyst_4x5", ratio="4:5", layout="scene", scene=S / "s4_checklist_v2.png",
               copy_top=150,
               h='<span class="mk">10 ознак,</span> за якими банк бачить кілька ФОП як один бізнес', h_size=56,
               sub="Самоперевірка за 10 хвилин. Безкоштовно.", sub_size=31,
               cta="Напишіть БАНК", cta_gap=28),
    # ---- Угол C · «Бухгалтер каже, що все гаразд»
    "C1": dict(file="C1_vse-garazd-kazhe-buhgalter_4x5", ratio="4:5", layout="scene",
               scene=S / "s5_stamp_vs_statement.png", copy_top=150,
               h='«Все гаразд», —<br>каже бухгалтер.', h_size=72,
               sub='А банк читає виписку. <b style="font-weight:700">Подивіться на неї його очима.</b>', sub_size=33,
               cta="Заповнити анкету", cta_gap=30),
    "C2": dict(file="C2_karyna-druga-para-ochei_9x16", ratio="9:16", layout="karina_story",
               hand="друга, незалежна пара очей",
               h='Бухгалтер веде облік.<br><span style="color:var(--teal)">Я дивлюся на рахунки очима банку.</span>',
               h_size=62, sub="Без оцінки вашого бухгалтера і пошуку винних.<br>Карта ризиків — за 3 робочі дні.",
               cta="Заповнити анкету", photo_top=880),
    # ---- Повод · 14 листопада
    "D1": dict(file="D1_14-lystopada-do_4x5", ratio="4:5", layout="card", scene=S / "s6_calendar_1411.png",
               pos="50% 66%", frame_h=812, copy_top=150, hand="до 14 листопада", hand_size=44,
               h='Ліміт 1 млн грн на місяць. <span class="mk">Кого він стосується насправді</span>', h_size=50,
               sub="Нових і «сплячих» ФОП 2–3 групи. І це не заборона платити&nbsp;більше.", sub_size=28,
               cta="Напишіть БАНК"),
    "D2": dict(file="D2_14-lystopada-pislia_9x16", ratio="9:16", layout="scene", scene=S / "s6_calendar_1411.png",
               shift=120, copy_top=300, logo_top=214, hand="без паніки", hand_size=54,
               h='Що змінилось<br><span class="mk">з 14 листопада</span>', h_size=72,
               sub="Ліміт 1 млн грн на місяць — лише для нових і «сплячих» ФОП 2–3 групи. Більше — з документами.",
               sub_size=30, cta="Заповнити анкету", cta_gap=28),
}

# Накладки для видео (прозрачный PNG 1080x1920 поверх ролика)
OVERLAYS = {
    "V1": dict(base="A2", file="V1_overlay"),
    "V2": dict(base="B2", file="V2_overlay"),
}


def build_html(c):
    w, h = SIZES[c["ratio"]]
    css = BASE_CSS % {"w": w, "h": h, "marker": u(MARKER)}
    c = {**c, **{k: typo(c[k]) for k in ("h", "sub", "hand") if c.get(k)}}
    body = LAYOUTS[c["layout"]](c, w, h)
    extra = c.get("extra_css", "")
    return (f'<!doctype html><html lang="uk"><head><meta charset="utf-8">{FONTS}'
            f'<style>{css}{extra}</style></head><body>{body}</body></html>')


def shoot(html_path: Path, png_path: Path, w: int, h: int, transparent=False):
    cmd = ["google-chrome-stable", "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
           f"--user-data-dir={PROFILE}", f"--window-size={w},{h}", "--force-device-scale-factor=1",
           "--virtual-time-budget=9000", f"--screenshot={png_path}"]
    if transparent:
        cmd.append("--default-background-color=00000000")
    cmd.append(u(html_path))
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)


def render(keys):
    HTML_DIR.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    for k in keys:
        c = CREATIVES[k]
        w, h = SIZES[c["ratio"]]
        hp = HTML_DIR / f"{c['file']}.html"
        hp.write_text(build_html(c), encoding="utf-8")
        png = OUT / f"{c['file']}.png"
        shoot(hp, png, w, h)
        print("ok", png)


def render_overlays(keys):
    """Тот же текст, что у статики, но без сцены: фон прозрачный, лёгкая подложка под текстом."""
    for k in keys:
        o = OVERLAYS[k]
        c = dict(CREATIVES[o["base"]])
        c = {**c, **{k: typo(c[k]) for k in ("h", "sub", "hand") if c.get(k)}}
        w, h = SIZES[c["ratio"]]
        c["scene"] = None
        body = LAYOUTS["scene"]({**c, "shift": 0}, w, h)
        # убираем фон-сцену из разметки
        body = body.replace('<img class="bg" src="file://None"', '<img class="bg" style="display:none" src=""')
        veil = ""  # как в статике: тёмный текст на светлом пустом столе читается без подложки
        css = BASE_CSS % {"w": w, "h": h, "marker": u(MARKER)}
        css += "body{background:transparent}"
        doc = (f'<!doctype html><html lang="uk"><head><meta charset="utf-8">{FONTS}<style>{css}</style></head>'
               f'<body>{veil}{body}</body></html>')
        hp = HTML_DIR / f"{o['file']}.html"
        hp.write_text(doc, encoding="utf-8")
        png = CR / "src" / f"{o['file']}.png"
        shoot(hp, png, w, h, transparent=True)
        print("ok", png)


if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] == "overlays":
        render_overlays(args[1:] or list(OVERLAYS))
    else:
        render(args or list(CREATIVES))
