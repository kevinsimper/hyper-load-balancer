npm start

echo "Email used for Let's Encrypt"
echo $LETSENCRYPT_EMAIL
if [ -n "${LETSENCRYPT_EMAIL+1}" ]; then
  echo "Let's Encrypt enabled"
  /usr/bin/caddy -agree -email $LETSENCRYPT_EMAIL -conf /app/Caddyfile
else
  echo "No HTTPS enabled"
  /usr/bin/caddy -conf /app/Caddyfile
fi
