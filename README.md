# anychart nodejs mongodb integration sample

## Project structure
* public/ - static resources
* public/jsx - react jsx sources
* public/js - javascript sources
* index.js - nodejs source
* dump/ - database dump

## Requirements
* nodejs 0.10+
* mongodb 3.0+
* babel (optional) for converting jsx to js http://babeljs.io

## Database setup

    mongorestore --dir ./dump

## Running app

    npm install
    node index.js

And open http://localhost:3000
