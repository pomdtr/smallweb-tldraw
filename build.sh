#!/bin/sh

set -eu

cd frontend
npm install
npm run build

cd ..
rm -rf server/static
mv frontend/dist server/static

