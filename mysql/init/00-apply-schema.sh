#!/bin/bash
set -euo pipefail

echo "Applying database schema... 1/3"

SCHEMA_SRC="/docker-entrypoint-initdb.d/01-schema.tmpl"
SCHEMA_TMP=`mktemp`
sed \
  -e "s|\${DB_USER}|${DB_USER}|g" \
  -e "s|\${DB_PASSWORD}|${DB_PASSWORD}|g" \
  -e "s|\${DB_DATABASE}|${DB_DATABASE}|g" \
  "$SCHEMA_SRC" > "$SCHEMA_TMP"

echo "Applying database schema... 2/3"

mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" < "$SCHEMA_TMP"

echo "Applying database schema... 3/3"

rm "$SCHEMA_TMP"
