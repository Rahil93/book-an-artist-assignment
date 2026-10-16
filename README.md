## Running it locally

### What you need

- Node.js 20+ (the code is ES modules and Express 5)
- A running MySQL server (8.x)
- A running MongoDB instance (local or Atlas)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd node
npm install
```

### 2. Create the `.env`

Create a `.env` file in the project root. It isn't committed, so you have to make it yourself:

```env
PORT=3001

ACCESS_TOKEN_SECRET=put-a-long-random-string-here

MONGODB_URI=mongodb://localhost:27017/artist_booking

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=artist_booking
```

The MySQL database itself has to exist already. The app creates tables, not databases:

```sql
CREATE DATABASE artist_booking;
```

### 3. Create the tables

```bash
npm run db:push
```

This reads `src/models/mySQL/schema.js` and creates the `users`, `bookings` and `payments` tables in the MySQL database from step 2. MongoDB needs nothing here, because Mongoose creates its collections on first write.

### 4. Seed the database

```bash
npm run seed
```

### 5. Start the server

```bash
npm run dev
```

### 6. Run the tests

```bash
npm test
```

### Other scripts

- `npm run db:generate` – generate a new SQL migration after editing `src/models/mySQL/schema.js`
- `npm run db:migrate` – apply migrations manually
- `npm run db:push` – push the schema straight to MySQL without a migration file (handy for throwaway experiments)

## Decisions I made

**Drizzle for MySQL, Mongoose for Mongo.** Drizzle keeps the schema in plain JS and generates real SQL migration files I can read. Mongoose gives validation on the review model (`rating` 1–5, required ids) for free.

**Layered structure: routes → validators → controllers → services.** Controllers deal with HTTP, services hold the logic. It's a bit more files than a tiny API needs, but it keeps the booking rules out of the request handling.

## Trade-offs I accepted

- **Reviews use skip/limit pagination.** Simple and gives page numbers, but it gets slow deep into big collections. Cursor-based would scale better.
- For the booking status update API, we need to use a database transaction for the select and update operations. If two users hit the same API simultaneously, their requests may overlap and cause a race condition, leading to incorrect booking status updates.
- Since I have created a repository folder, all SQL and MongoDB queries should be handled in the repository files, while the service files should contain the business logic.
