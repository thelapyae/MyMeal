# MyMeal

A minimal Telegram Mini App for tracking your daily meals with emojis, backed by
a Notion database. Built with React + Vite (client) and Vercel serverless
functions (API).

- Log meals as emojis and see estimated protein / carbs / fat for the day
- Calendar view of your meal history
- Private by default: only the Telegram user IDs you allow can open the app
- Data lives in **your own** Notion database

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthelapyae%2FMyMeal&env=NOTION_TOKEN,NOTION_DATABASE_ID,TELEGRAM_BOT_TOKEN,ALLOWED_TELEGRAM_ID,VITE_ALLOWED_TELEGRAM_ID&envDescription=Notion%20credentials%2C%20Telegram%20bot%20token%2C%20and%20the%20allow-list%20of%20Telegram%20user%20IDs&envLink=https%3A%2F%2Fgithub.com%2Fthelapyae%2FMyMeal%233-configure-environment-variables&project-name=mymeal&repository-name=mymeal)

Clicking the button clones the repo to your own GitHub, prompts you for the three
environment variables below, and deploys it. You still need to set up Notion and
connect the bot in Telegram — see the steps below.

## How it works

- The **client** (`/client`) is a Vite + React app that runs as a Telegram Mini App.
- The **API** (`/api/meals.ts`) is a Vercel serverless function that talks to the
  Notion API using your integration token.
- **Every API request is cryptographically verified server-side**: the client
  sends Telegram's signed `initData`, and the server validates the signature with
  your bot token and checks the user against the allow-list. This means the meal
  log stays private even if someone opens the site directly in a browser — the
  API returns `401`/`403` and no Notion data is ever exposed.

You bring four things:

1. A **Notion integration token**
2. A **Notion database ID**
3. A **Telegram bot token**
4. Your **Telegram user ID**

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

## 2. Create a Telegram bot and find your user ID

1. Open [@BotFather](https://t.me/BotFather), send `/newbot`, and follow the
   prompts. Copy the **bot token** it gives you — this is your
   `TELEGRAM_BOT_TOKEN`.
2. Message [@userinfobot](https://t.me/userinfobot). It replies with your numeric
   ID — this is your Telegram user ID. To allow several people, use a
   comma-separated list (e.g. `1695096396,123456789`).

## 3. Configure environment variables

Copy the example files and fill in your values:

```bash
cp .env.example .env                 # NOTION_TOKEN, NOTION_DATABASE_ID, TELEGRAM_BOT_TOKEN, ALLOWED_TELEGRAM_ID
cp client/.env.example client/.env   # VITE_ALLOWED_TELEGRAM_ID
```

| Variable                   | Where        | Description                                            |
| -------------------------- | ------------ | ------------------------------------------------------ |
| `NOTION_TOKEN`             | server       | Notion integration secret                              |
| `NOTION_DATABASE_ID`       | server       | ID of your meals database                              |
| `TELEGRAM_BOT_TOKEN`       | server       | Bot token used to verify Telegram requests             |
| `ALLOWED_TELEGRAM_ID`      | server       | Comma-separated allow-list enforced by the API         |
| `VITE_ALLOWED_TELEGRAM_ID` | client/build | Same allow-list, used by the client UI gate            |

> **Security note:** `ALLOWED_TELEGRAM_ID` (server) is what actually protects your
> data — it's checked against a cryptographically verified Telegram signature.
> `VITE_ALLOWED_TELEGRAM_ID` (client) only controls the UI and is baked into the
> bundle at **build time**, so set it before building and keep both lists in sync.

## 4. Run locally

```bash
# install deps
cd client && npm install && cd ..

# run the client (Vite dev server on :5173, proxies /api to :3001)
cd client && npm run dev
```

## 5. Deploy to Vercel

1. Import the repo into Vercel.
2. Add all five environment variables in **Project Settings → Environment Variables**
   (`NOTION_TOKEN`, `NOTION_DATABASE_ID`, `TELEGRAM_BOT_TOKEN`,
   `ALLOWED_TELEGRAM_ID`, `VITE_ALLOWED_TELEGRAM_ID`).
3. Deploy. The included `vercel.json` builds the client and serves the API.

## 6. Connect it to Telegram

1. Open [@BotFather](https://t.me/BotFather) (using the bot you created in step 2).
2. Set up a Mini App / Web App (`/newapp` or via bot settings) and point its URL
   at your deployed Vercel domain.
3. Open the app from your bot. Only the Telegram IDs you configured will get in;
   everyone else — including anyone opening the URL in a browser — is rejected
   both at the UI and at the API.

---

## License

MIT — do whatever you like. Contributions welcome.
