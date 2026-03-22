#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd "/Volumes/Danish's Work/Clude Projects/IMS Central"
exec pnpm dev
