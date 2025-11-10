## Project setup

## Prepare 

Copy .env.example to .env and put real values


## Running
```bash
$ docker compose up --watch
```


## Seeding
Get container id
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

# Dev notes
## Description
Your task is to develop a cryptocurrency price-tracking application.

Tasks to Complete:
Create a scheduler in the backend that regularly pulls cryptocurrency prices from the CoinGecko API (https://www.coingecko.com/api/documentation). By default, the scheduler should fetch data every 10 seconds, but this interval should be configurable.
By default, track the prices of Bitcoin and Ethereum. However, users should have the ability to add new coins if the desired coin is not displayed. Ensure that user inputs for adding new coins are properly validated.
Implement functionality in the React application to display the latest prices of the tracked coins. Additionally, display a historical list of up to 10 records of prices that have been changed, along with timestamps. This data should be fetched from the backend API.

Technical Requirements:
done -Dockerized NodeJS with Typescript for the backend. You can choose any Node.js framework, such as AdonisJS, NestJS, etc.
done - Choose SQLite, MySQL, or PostgreSQL for the database.
Implement the repository and service pattern for database interactions.
Develop a simple React application for frontend display.
Utilize the CoinGecko API for fetching cryptocurrency prices.

Bonus Objectives:
Implement caching using Redis to improve performance.
Implement a live refresh mechanism in the React application for real-time updates.


## Raw plan based on the requirement
- repo + service patterns 
- cron service to pull the prices / every 10 secs (interval is configurable in env)
    - by def: bitcoin + ethereum coiins, but user can add more (coins in db)
- react for the front - separate app
    - show latest price of the coins (in the table)
    - show history of prices (coin prices in db for the actual price + history) - [need to implement the limit per coin]
    - 

## DB
- coins
- coin_exchange_rates

## repos
- coinRepository
- coinExchangeRateRepo

## services 
- CoinExchangeRateService - to pull the rate 
- CoinExchangeRateApi - generic one , to store the api 
- Cache service
- websockets (for live updates)

## env
- EXCHANGE_RATE_PULL_INTERVAL