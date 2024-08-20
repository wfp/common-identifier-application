# TODO: these should be injected from the build pipeline
ALGORITHM_WRAPPER_REPO=...
ALGORITHM_NWS_REPO=...
ALGORITHM_GOS_REPO=...

# the other repositories will be cloned here
# NOTE: this must be an absolute path for symlinks to work
WORKING_DIR=/tmp

# Clone the algorithm wrapper repo
git clone $ALGORITHM_WRAPPER_REPO $WORKING_DIR/algo-wrapper

# Clone the algorithm repos into their distinct places
git clone $ALGORITHM_NWS_REPO $WORKING_DIR/algo-nws
git clone $ALGORITHM_GOS_REPO $WORKING_DIR/algo-gos


# Prepare the repositories
for repo in wrapper nws gos
do

    # Symlink into the app main
    # TODO: check if bundling collects all files
    ln -s $WORKING_DIR/algo-$repo src/main/algo-$repo

    # Install the dependencies of the repos
    # TODO: check if bundling collects the right dependencies

    (cd src/main/algo-$repo && npm install)
done

# Install repo dependencies
npm install

# Run electron-forge to create a package
# TODO: check cross-compilation possibilities
npm run make



