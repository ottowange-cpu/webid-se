#!/bin/bash

# Web Guard AI - Blocklist Installer for Mac
# https://webguard.ai

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BLOCKLIST_URL="https://zotvdjgxsrzswmaalujv.supabase.co/functions/v1/content-blocker?format=hosts"
HOSTS_FILE="/etc/hosts"
MARKER_START="# === WEB GUARD AI START ==="
MARKER_END="# === WEB GUARD AI END ==="

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🛡️  Web Guard AI Installer        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Detta skript måste köras med sudo${NC}"
    echo ""
    echo "Kör: sudo bash install-webguard.sh"
    echo ""
    exit 1
fi

# Function to remove existing entries
remove_existing() {
    if grep -q "$MARKER_START" "$HOSTS_FILE"; then
        echo "🔄 Tar bort tidigare installation..."
        sed -i '' "/$MARKER_START/,/$MARKER_END/d" "$HOSTS_FILE"
    fi
}

# Function to install blocklist
install_blocklist() {
    echo "📥 Hämtar blocklista från Web Guard AI..."
    
    BLOCKLIST=$(curl -s "$BLOCKLIST_URL")
    
    if [ -z "$BLOCKLIST" ]; then
        echo -e "${RED}❌ Kunde inte hämta blocklistan${NC}"
        exit 1
    fi
    
    # Count domains
    DOMAIN_COUNT=$(echo "$BLOCKLIST" | grep -c "0.0.0.0")
    
    echo "✅ Hämtade $DOMAIN_COUNT blockerade domäner"
    echo ""
    echo "📝 Uppdaterar /etc/hosts..."
    
    # Remove existing entries first
    remove_existing
    
    # Add new entries
    echo "" >> "$HOSTS_FILE"
    echo "$MARKER_START" >> "$HOSTS_FILE"
    echo "$BLOCKLIST" >> "$HOSTS_FILE"
    echo "$MARKER_END" >> "$HOSTS_FILE"
    
    echo "🔄 Rensar DNS-cache..."
    dscacheutil -flushcache
    killall -HUP mDNSResponder 2>/dev/null
    
    echo ""
    echo -e "${GREEN}✅ Installation klar!${NC}"
    echo ""
    echo "Du är nu skyddad mot $DOMAIN_COUNT farliga domäner."
    echo ""
    echo "För att avinstallera, kör:"
    echo "  sudo bash install-webguard.sh --uninstall"
    echo ""
}

# Function to uninstall
uninstall_blocklist() {
    echo "🗑️  Avinstallerar Web Guard AI..."
    
    if grep -q "$MARKER_START" "$HOSTS_FILE"; then
        remove_existing
        dscacheutil -flushcache
        killall -HUP mDNSResponder 2>/dev/null
        echo -e "${GREEN}✅ Avinstallation klar!${NC}"
    else
        echo "ℹ️  Web Guard AI är inte installerat"
    fi
    echo ""
}

# Function to update
update_blocklist() {
    echo "🔄 Uppdaterar blocklista..."
    install_blocklist
}

# Parse arguments
case "$1" in
    --uninstall|-u)
        uninstall_blocklist
        ;;
    --update|-up)
        update_blocklist
        ;;
    *)
        install_blocklist
        ;;
esac
