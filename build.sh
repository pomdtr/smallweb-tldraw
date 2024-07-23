#!/bin/sh

cd frontend || exit
npm install
npm run build

cd .. || exit
rm -r server/static
mv frontend/dist server/static

