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