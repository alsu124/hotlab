#!/bin/sh
# Regenerates sitemap.xml from every indexable *.html page in the repo root.
# Run after adding/removing a page, or let the sitemap-update GitHub Action do it on push.
cd "$(dirname "$0")"

priority_for() {
  case "$1" in
    index.html) echo "1.0" ;;
    pilates-reformer.html|goryachaya-yoga.html|goryachiy-pilates.html|goryachaya-rastyazhka.html|goryachie-trenirovki.html|raspisanie-i-tseny.html|probnoe-zanyatie.html|kontakty.html|otzyvy.html|o-kompanii.html) echo "0.8" ;;
    blog.html) echo "0.7" ;;
    oferta.html|politika-konfidencialnosti.html) echo "0.3" ;;
    *) echo "0.6" ;;
  esac
}

changefreq_for() {
  case "$1" in
    index.html|raspisanie-i-tseny.html|blog.html) echo "weekly" ;;
    oferta.html|politika-konfidencialnosti.html) echo "yearly" ;;
    *) echo "monthly" ;;
  esac
}

out="sitemap.xml"
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  for f in *.html; do
    case "$f" in yandex_*) continue ;; esac
    url=$(grep -o 'rel="canonical" href="[^"]*"' "$f" | head -1 | sed -E 's/.*href="([^"]*)".*/\1/')
    if [ -z "$url" ]; then
      url="https://hotlabstudio.ru/$f"
    fi
    lastmod=$(git log -1 --format=%cd --date=short -- "$f" 2>/dev/null)
    if [ -z "$lastmod" ]; then
      lastmod=$(date +%Y-%m-%d)
    fi
    echo "  <url>"
    echo "    <loc>$url</loc>"
    echo "    <lastmod>$lastmod</lastmod>"
    echo "    <changefreq>$(changefreq_for "$f")</changefreq>"
    echo "    <priority>$(priority_for "$f")</priority>"
    echo "  </url>"
  done
  echo '</urlset>'
} > "$out"

echo "Wrote $out with $(grep -c '<url>' "$out") URLs"
