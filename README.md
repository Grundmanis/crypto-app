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

## Plan
- repo + service patterns 


## Project setup

```bash
$ docker compose up --watch
```

## Tests

To run test:
```bash
$ npm run test
```