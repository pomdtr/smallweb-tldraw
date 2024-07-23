#!/bin/sh

set -eu

cd frontend
npm install
npm run build

cd ..
rm -r server/static
mv frontend/dist server/static

