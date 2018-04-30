# Local League "Auth" endpoint

## Installation

```sh
npm install @localleague/auth-endpoint 
```

## Usage
Need to pass a Restify server instance.
```javascript
require('@localleague/auth-endpoint')(server);
```

And you're good to go!

## Test 

```sh
npm run test:integration 
```
## Documentation
The documentation for the endpoint is generated using the [OpenAPI 3](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md) specifications and [Swagger](https://swagger.io).

Using the path "/swagger.json" the JSON representation of the docs can be retrieved and used in the [Swagger Editor](http://editor.swagger.io) for reading and testing.

## Todo
1. Create unit tests
2. Create Swagger docs

## Issues
