#!/bin/bash
set -e

# Change to the example app directory
cd example/apps/example

echo "Testing Vite 4..."
sed -i '' 's/"vite": "^[0-9.]*"/"vite": "^4.0.0"/' package.json
sed -i '' 's/"@vitejs\/plugin-react": "^[0-9.]*"/"@vitejs\/plugin-react": "^3.0.0"/' package.json
rm -rf dist node_modules pnpm-lock.yaml || true
pnpm install
pnpm build
echo "Vite 4 Build Successful!"

echo "Testing Vite 7..."
sed -i '' 's/"vite": "^[0-9.]*"/"vite": "^7.3.1"/' package.json
sed -i '' 's/"@vitejs\/plugin-react": "^[0-9.]*"/"@vitejs\/plugin-react": "^6.0.0"/' package.json
rm -rf dist node_modules pnpm-lock.yaml || true
pnpm install
pnpm build
echo "Vite 7 Build Successful!"

echo "Testing Vite 8..."
sed -i '' 's/"vite": "^[0-9.]*"/"vite": "^8.0.0"/' package.json
rm -rf dist node_modules pnpm-lock.yaml || true
pnpm install
pnpm build
echo "Vite 8 Build Successful!"

echo "Done! All versions built successfully."
