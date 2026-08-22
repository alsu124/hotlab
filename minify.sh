#!/bin/sh
# Regenerates styles.min.css and script.min.js from styles.css / script.js.
# Run after editing either source file, before committing.
cd "$(dirname "$0")"

perl -0777 -pe '
  s{/\*.*?\*/}{}gs;
  s/[ \t]*\r?\n[ \t]*/ /g;
  s/[ \t]{2,}/ /g;
  s/\s*([{};:,])\s*/$1/g;
  s/;}/}/g;
  s/^\s+|\s+$//g;
' styles.css > styles.min.css

perl -ne '
  next if /^\s*\/\//;
  next if /^\s*$/;
  s/^\s+//;
  s/\s+$//;
  print "$_\n";
' script.js > script.min.js

echo "styles.min.css: $(wc -c < styles.css) -> $(wc -c < styles.min.css) bytes"
echo "script.min.js:  $(wc -c < script.js) -> $(wc -c < script.min.js) bytes"
