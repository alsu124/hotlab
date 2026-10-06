#!/usr/bin/env python3
"""Собирает блок расписания на страницах сайта из schedule.json.

Использование:
  python3 tools/render_schedule.py          # проверить данные и обновить страницы
  python3 tools/render_schedule.py --check  # только проверить, ничего не менять (код 1, если страницы отличаются)

Блок между <!-- SCHEDULE:START --> и <!-- SCHEDULE:END --> на страницах PAGES
полностью перезаписывается. Остальное в HTML не трогается.
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ['index.html', 'raspisanie-i-tseny.html']
DAYS = [('mon', 'Понедельник'), ('tue', 'Вторник'), ('wed', 'Среда'),
        ('thu', 'Четверг'), ('fri', 'Пятница'), ('sat', 'Суббота'), ('sun', 'Воскресенье')]
TIME_RE = re.compile(r'^(\d{1,2})\.(\d{2})$')
START, END = '<!-- SCHEDULE:START -->', '<!-- SCHEDULE:END -->'
IND = ' ' * 10


def load_and_validate(path):
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    days = data.get('days')
    errors = []
    if not isinstance(days, dict) or set(days) != {k for k, _ in DAYS}:
        raise SystemExit('schedule.json: в "days" должны быть ровно ключи mon, tue, wed, thu, fri, sat, sun')
    total = 0
    for key, title in DAYS:
        items = days[key]
        if not isinstance(items, list):
            errors.append('%s: должен быть списком' % key)
            continue
        seen = set()
        for i, it in enumerate(items, 1):
            t, n = str(it.get('time', '')).strip(), str(it.get('name', '')).strip()
            m = TIME_RE.match(t)
            if not m or not (7 <= int(m.group(1)) <= 23) or int(m.group(2)) > 59:
                errors.append('%s #%d: время "%s" не в формате Ч.ММ (с 7.00 до 23.59)' % (key, i, t))
            if not n or len(n) > 60 or re.search(r'[<>\u0000-\u001f]', n):
                errors.append('%s #%d: название пустое, длиннее 60 знаков или содержит недопустимые символы' % (key, i))
            if (t, n) in seen:
                errors.append('%s #%d: повтор "%s %s"' % (key, i, t, n))
            seen.add((t, n))
            it['time'], it['name'] = t, n
        total += len(items)
    if errors:
        raise SystemExit('Ошибки в schedule.json:\n  - ' + '\n  - '.join(errors))
    if total == 0:
        raise SystemExit('schedule.json: расписание пустое, остановлено')
    return days


def sort_key(it):
    h, m = it['time'].split('.')
    return int(h) * 60 + int(m)


def render(days):
    out = []
    for key, title in DAYS:
        rows = sorted(days[key], key=sort_key)  # стабильная: порядок внутри одного времени сохраняется
        out.append('%s<div class="tt-panel" data-day="%s" role="tabpanel">' % (' ' * 10, key))
        out.append('%s<p class="tt-day-title">%s</p>' % (' ' * 12, title))
        for it in rows:
            out.append('%s<div class="tt-row"><span class="tt-time">%s</span><span class="tt-name">%s</span></div>'
                       % (' ' * 12, it['time'], html.escape(it['name'], quote=False)))
        out.append('%s</div>' % (' ' * 10))
        out.append('')
    return '\n'.join(out).rstrip('\n')


def apply(text, block):
    a, b = text.find(START), text.find(END)
    if a < 0 or b < 0 or b < a:
        raise SystemExit('не найдены метки %s / %s' % (START, END))
    return text[:a + len(START)] + '\n' + block + '\n' + IND + text[b:]


def main():
    check = '--check' in sys.argv
    days = load_and_validate(os.path.join(ROOT, 'schedule.json'))
    block = render(days)
    changed = []
    for page in PAGES:
        p = os.path.join(ROOT, page)
        with open(p, encoding='utf-8') as f:
            old = f.read()
        new = apply(old, block)
        if new != old:
            changed.append(page)
            if not check:
                with open(p, 'w', encoding='utf-8', newline='') as f:
                    f.write(new)
    print(('Отличаются: ' if check else 'Обновлено: ') + (', '.join(changed) or 'ничего, страницы уже совпадают'))
    sys.exit(1 if (check and changed) else 0)


if __name__ == '__main__':
    main()
