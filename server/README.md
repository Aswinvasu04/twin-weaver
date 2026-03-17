# TwinIT Backend — MySQL Setup

## Prerequisites
- Node.js 18+
- MySQL 8.0+ running locally

## Quick Start

```sh
cd server
npm install
npm run dev
```

The server auto-creates the `twinit` database and tables on first run.

## Environment Variables (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `MYSQL_HOST` | `localhost` | MySQL host |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_USER` | `root` | MySQL username |
| `MYSQL_PASSWORD` | *(empty)* | MySQL password |
| `MYSQL_DATABASE` | `twinit` | Database name |
| `PORT` | `3001` | API server port |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/twins` | List all twins |
| GET | `/api/twins/:id` | Get a twin |
| POST | `/api/twins` | Create a twin |
| PUT | `/api/twins/:id` | Update a twin |
| DELETE | `/api/twins/:id` | Delete a twin |
| POST | `/api/twins/:id/history` | Save simulation history |
