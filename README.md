# WIP

# Setting up the current development environment

Until the repository separation and build system is completed there are a number
of manual steps that need to be done to get this repository working on your machine.


#### Step 0: Clone & init this repo

```
git clone ....
npm install
```

#### Step 1: Clone the Algorithm repository to a separate location

#### Step 2: Symlink the Algorithm repository into `src/main/ALGO-NWS`

(the path name, just like these build steps is only temporary)

```
# In this repo's directory
ln -s <FULL PATH TO ALGO REPO> ./src/main/ALGO-NWS
```


#### Step 3: Build the UI

```
# In the src/renderer directory
npm install
npm run build
```

this'll output the compiled UI files into the `dist` directory.


#### Step 4: Start the application

```
npm start
```


## Generating configuration file signatures


Use the script `tools/config-signature.js` in the algorithm repostiory to generate a signature for a configuration file:

```
node tools/config-signature.js config.toml
Opening file:  config.toml
HASH: f3634ad11b145368af2ea19087921f5a
```

This signature can be copy-pasted into the `signature.config_signature` value in the config file (the signature is generated by ignoring the `signature` key)