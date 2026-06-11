# MyMeal

A minimal Telegram Mini App for tracking your daily meals with emojis, backed by
a Notion database. Built with React + Vite (client) and Vercel serverless
functions (API).

- Log meals as emojis and see estimated protein / carbs / fat for the day
- Calendar view of your meal history
- Private by default: only the Telegram user IDs you allow can open the app
- Data lives in **your own** Notion database

## How it works

- The **client** (`/client`) is a Vite + React app that runs as a Telegram Mini App.
- The **API** (`/api/meals.ts`) is a Vercel serverless function that talks to the
  Notion API using your integration token.
- Access is gated to the Telegram user ID(s) you configure.

You bring three things:

1. A **Notion integration token**
2. A **Notion database ID**
3. Your **Telegram user ID**

---

## 1. Set up Notion

1. Go to https://www.notion.so/my-integrations and click **New integration**.
2. Give it a name (e.g. "MyMeal") and create it. Copy the
   **Internal Integration Secret** — this is your `NOTION_TOKEN`.
3. Create a database (a full-page table) with these properties (exact names matter):

   | Property    | Type      |
   | ----------- | --------- |
   | `Name`      | Title     |
   | `Date`      | Date      |
   | `Meal Type` | Select    |
   | `Emoji`     | Text      |
   | `Notes`     | Text      |

4. Open the database as a full page and copy the 32-character ID from the URL —
   this is your `NOTION_DATABASE_ID`:
   `https://www.notion.so/<workspace>/<DATABASE_ID>?v=...`
5. In the database, click the `•••` menu → **Connections** → add your integration
   so it has permission to read/write.

## 2. Find your Telegram user ID

Message [@userinfobot](https://t.me/userinfobot) on Telegram. It replies with your
numeric ID — this is your `VITE_ALLOWED_TELEGRAM_ID`. To allow several people, use
a comma-separated list (e.g. `1695096396,123456789`).

## 3. Configure environment variables

Copy the example files and fill in your values:

```bash
cp .env.example .env                 # NOTION_TOKEN, NOTION_DATABASE_ID
cp client/.env.example client/.env   # VITE_ALLOWED_TELEGRAM_ID
```

| Variable                   | Where        | Description                                   |
| -------------------------- | ------------ | --------------------------------------------- |
| `NOTION_TOKEN`             | server       | Notion integration secret                     |
| `NOTION_DATABASE_ID`       | server       | ID of your meals database                     |
| `VITE_ALLOWED_TELEGRAM_ID` | client/build | Comma-separated allow-list of Telegram IDs    |

> `VITE_ALLOWED_TELEGRAM_ID` is read at **build time** and baked into the client
> bundle, so you must set it before building (and rebuild if you change it).

## 4. Run locally

```bash
# install deps
cd client && npm install && cd ..

# run the client (Vite dev server on :5173, proxies /api to :3001)
cd client && npm run dev
```

## 5. Deploy to Vercel

1. Import the repo into Vercel.
2. Add all three environment variables in **Project Settings → Environment Variables**
   (`NOTION_TOKEN`, `NOTION_DATABASE_ID`, `VITE_ALLOWED_TELEGRAM_ID`).
3. Deploy. The included `vercel.json` builds the client and serves the API.

## 6. Connect it to Telegram

1. Open [@BotFather](https://t.me/BotFather) and create a bot (`/newbot`).
2. Set up a Mini App / Web App (`/newapp` or via bot settings) and point its URL
   at your deployed Vercel domain.
3. Open the app from your bot. Only the Telegram IDs in `VITE_ALLOWED_TELEGRAM_ID`
   will get in; everyone else sees "access denied".

---

## License

MIT — do whatever you like. Contributions welcome.
