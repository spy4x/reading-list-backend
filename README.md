# Backend for Reading List app

[ ![Codeship Status for spy4x/reading-list-backend](https://app.codeship.com/projects/b220ef30-893e-0134-ab3e-424976f5906b/status?branch=master)](https://app.codeship.com/projects/184162)

## Development

### Setup environment

Install node.js and use this commands to install all dependencies:

```
npm i -g gulp
npm i
```

### Usage

Run app on local: 
```bash
$ gulp
```

Run compile typescript, lint and tests as watcher (useful to keep in separate 
terminal window while development): 
```bash
$ gulp watch
```

Run lint and tests: 
```bash
$ gulp build-and-validate
```


## Production/staging environment

### Setup environment

Install node.js and use this commands to install all dependencies:

```bash
npm i -g pm2
npm i
```

### Usage

To start app:

```bash
$ pm2 start pm2.production.json
```

## Contributing

### Unit tests

All js code should be unit-tested

### Code style

https://github.com/felixge/node-style-guide
https://basarat.gitbooks.io/typescript/content/docs/styleguide/styleguide.html

### Commits & Pull requests

Commits should follow guidelines. Short version:

* no commits to master: only Pull Requests from feature branches
* code have to be linted and tested

Check [commit message conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#)
