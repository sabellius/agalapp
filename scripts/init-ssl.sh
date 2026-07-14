#!/bin/sh
set -e

DOMAIN="agalapp.saveliyshiryaev.dev"
EMAIL="dev.letsencrypt@shiryaevs.com"
COMPOSE_FILE="docker-compose.prod.yml"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

echo "=== SSL Initialization for $DOMAIN ==="

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "ERROR: Run this script from the project root (where $COMPOSE_FILE is)."
    exit 1
fi

echo "Checking for existing certificate..."
if docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "" certbot \
    test -d "$CERT_DIR" 2>/dev/null; then
    echo "Certificate already exists for $DOMAIN. Nothing to do."
    exit 0
fi

echo "No certificate found. Generating temporary self-signed certificate..."
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "" certbot \
    sh -c "mkdir -p '$CERT_DIR' && \
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout '$CERT_DIR/privkey.pem' \
    -out '$CERT_DIR/fullchain.pem' \
    -subj '/CN=$DOMAIN'"

echo "Starting all services (Nginx will use the temp cert)..."
docker compose -f "$COMPOSE_FILE" up -d

echo "Waiting for Nginx to start..."
sleep 5

echo "Requesting real certificate from Let's Encrypt..."
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "" certbot \
    sh -c "rm -rf '$CERT_DIR' /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf && \
    certbot certonly --webroot -w /var/www/certbot \
    -d '$DOMAIN' \
    --email '$EMAIL' \
    --agree-tos \
    --no-eff-email"

echo "Reloading Nginx with real certificate..."
docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload

echo ""
echo "=== SSL setup complete! ==="
echo "Visit: https://$DOMAIN"
