# Update the algo repos
git submodule init
git submodule update

# Build the renderer
(cd src/renderer && npm install && npm run build)

# Install dependencies for building
npm install

# Call per-platform builders

echo "Building WINDOWS version"
bash ./build-win

echo "Building MAC version"
bash ./build-mac
