## Project setup
Copy .env.example to .env and put real values

### Running the app
```bash
$ docker compose up --watch
```

### Seeding
To have default coins in database, need to see them.
Get container id by
```
docker ps
```

then run
```
docker exec -it <container_name_or_id> npm run seed:coins
```

## Tests
To run test:
```bash
$ npm run test
```

## Linting
To run test:
```bash
$ npm run lint
```
