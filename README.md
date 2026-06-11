# MyMeal

A minimal Telegram Mini App for tracking your daily meals with emojis, backed by
a Notion database. Built with React + Vite (client) and Vercel serverless
functions (API).

- Log meals as emojis and see estimated protein / carbs / fat for the day
- Calendar view of your meal history
- Private by default: only the Telegram user IDs you allow can open the app
- Data lives in **your own** Notion database

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthelapyae%2FMyMeal&env=NOTION_TOKEN,NOTION_DATABASE_ID,ALLOWED_TELEGRAM_ID&envDescription=Notion%20credentials%20and%20the%20allow-list%20of%20Telegram%20user%20IDs&envLink=https%3A%2F%2Fgithub.com%2Fthelapyae%2FMyMeal%233-configure-environment-variables&project-name=mymeal&repository-name=mymeal)

Clicking the button clones the repo to your own GitHub, prompts you for the
environment variables below, and deploys it. You still need to set up Notion and
connect the bot in Telegram — see the steps below.

## How it works

- The **client** (`/client`) is a Vite + React app that runs as a Telegram Mini App.
- The **API** (`/api/meals.ts`) is a Vercel serverless function that talks to the
  Notion API using your integration token.
- **Every API request is authorized server-side**: the client sends Telegram's
  `initData`, and the server reads the Telegram user id and checks it against
  `ALLOWED_TELEGRAM_ID`. Anyone who isn't on the allow-list — including someone
  opening the site directly in a browser — gets `401`/`403` and no Notion data is
  ever exposed.
- Optionally set `TELEGRAM_BOT_TOKEN` to also cryptographically verify the
  `initData` signature so the user id cannot be forged. This is recommended but
  not required for the app to work.

You bring three things (plus an optional fourth):

1. A **Notion integration token**
2. A **Notion database ID**
3. Your **Telegram user ID**
4. *(optional)* A **Telegram bot token** for signature verification

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

Message [@userinfobot](https://t.me/userinfobot). It replies with your numeric
ID — this is your Telegram user ID. To allow several people, use a comma-separated
list (e.g. `1695096396,123456789`).

*(Optional, recommended)* If you want signature verification, open
[@BotFather](https://t.me/BotFather), send `/newbot`, and copy the **bot token** —
this is your `TELEGRAM_BOT_TOKEN`.

## 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env   # NOTION_TOKEN, NOTION_DATABASE_ID, ALLOWED_TELEGRAM_ID, (optional) TELEGRAM_BOT_TOKEN
```

| Variable              | Required | Description                                            |
| --------------------- | -------- | ------------------------------------------------------ |
| `NOTION_TOKEN`        | yes      | Notion integration secret                              |
| `NOTION_DATABASE_ID`  | yes      | ID of your meals database                              |
| `ALLOWED_TELEGRAM_ID` | yes      | Comma-separated allow-list of Telegram user IDs        |
| `TELEGRAM_BOT_TOKEN`  | optional | Verifies the Telegram signature so ids can't be forged |

> **Security note:** all variables are server-side only. `ALLOWED_TELEGRAM_ID` is
> what protects your data — the API checks every request's Telegram id against it,
> so opening the site in a browser returns nothing. Add `TELEGRAM_BOT_TOKEN` to
> also verify the cryptographic signature.

## 4. Run locally

```bash
# install deps
cd client && npm install && cd ..

# run the client (Vite dev server on :5173, proxies /api to :3001)
cd client && npm run dev
```

## 5. Deploy to Vercel

1. Import the repo into Vercel.
2. Add the environment variables in **Project Settings → Environment Variables**
   (`NOTION_TOKEN`, `NOTION_DATABASE_ID`, `ALLOWED_TELEGRAM_ID`, and optionally
   `TELEGRAM_BOT_TOKEN`).
3. Deploy. The included `vercel.json` builds the client and serves the API.

## 6. Connect it to Telegram

1. Open [@BotFather](https://t.me/BotFather) and create a bot (`/newbot`) if you
   haven't already.
2. Set up a Mini App / Web App (`/newapp` or via bot settings) and point its URL
   at your deployed Vercel domain.
3. Open the app from your bot. Only the Telegram IDs you configured will get in;
   everyone else — including anyone opening the URL in a browser — is rejected
   both at the UI and at the API.

---

## License

MIT — do whatever you like. Contributions welcome.
