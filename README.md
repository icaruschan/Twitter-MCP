\# Agentic Twitter MCP Server



This project is a powerful, "smart" Model Context Protocol (MCP) server for Twitter analysis and monitoring. It is designed to be used as a tool by AI assistants like Claude, providing a natural language interface to a robust set of Twitter intelligence and automation capabilities.



The server is built with Node.js/TypeScript, packaged in a Docker container, and is designed to integrate with a stateful n8n automation workflow backend for persistent, 24/7 monitoring.



\## 🚀 Features



This MCP server is divided into two main categories of tools:



\*\*1. On-Demand Analysis \& Intelligence:\*\*

\*   \*\*Comprehensive Account Analysis:\*\* Get a full intelligence report on any Twitter user, including their profile stats, recent tweet engagement, and most influential followers.

\*   \*\*Advanced Tweet Search:\*\* Perform complex, one-time searches for tweets using full Twitter Advanced Search syntax.

\*   \*\*Engagement Tracking:\*\* Get a detailed breakdown of the engagement for any specific tweet.

\*   \*\*Relationship Mapping:\*\* Check the mutual follow status between multiple accounts.

\*   \*\*And more...\*\*



\*\*2. Agentic Monitoring Control Panel:\*\*

\*   \*\*Control n8n via Natural Language:\*\* The MCP acts as a stateless "control panel" that allows an AI assistant to manage a powerful, persistent monitoring engine built in n8n.

\*   \*\*Monitor User Accounts:\*\* Dynamically add or remove specific user accounts from the 24/7 monitoring list.

\*   \*\*Monitor Keywords \& Queries:\*\* Add or remove any keyword, hashtag, or complex search query to the monitoring list.

\*   \*\*List Current Monitors:\*\* Query the n8n engine to get a real-time list of all active user and keyword monitors.



\## 🏛️ Architecture



This project utilizes a modern, decoupled, agentic architecture for maximum robustness and scalability.



\*   \*\*Twitter MCP Server (This Repo):\*\* The stateless, Dockerized front-end that exposes the toolset to the AI.

\*   \*\*n8n Automation Engine:\*\* A stateful, persistent backend that runs the 24/7 monitoring workflows. It polls the Twitter API, filters for new tweets, and sends notifications.

\*   \*\*Supabase (PostgreSQL) Database:\*\* The "single source of truth" that stores the list of monitored users and keywords, as well as the ID of the last tweet seen to prevent duplicate notifications.



!\[Architecture Diagram](https://i.imgur.com/your-diagram-image.png)  <!-- You can create and upload a diagram if you want -->



\## 🛠️ Getting Started



\### Prerequisites

\*   \[Docker](https://www.docker.com/products/docker-desktop/) installed

\*   An API Key from a third-party Twitter API provider (e.g., `twitterapi.io`)

\*   An n8n instance (Cloud or self-hosted)

\*   A Supabase project for the database



\### Local Setup \& Installation



1\.  \*\*Clone the repository:\*\*

&nbsp;   ```bash

&nbsp;   git clone https://github.com/your-username/your-repo-name.git

&nbsp;   cd your-repo-name

&nbsp;   ```



2\.  \*\*Configure Environment Variables:\*\*

&nbsp;   \*   Create a `.env` file in the root of the project. This file is ignored by Git and will not be committed.

&nbsp;   \*   Add your Twitter API key to the `.env` file:

&nbsp;     ```env

&nbsp;     TWITTER\_API\_KEY=your\_secret\_api\_key\_here

&nbsp;     ```



3\.  \*\*Update n8n Webhook URLs:\*\*

&nbsp;   \*   In `src/index.ts`, find the handler functions for the monitoring tools (e.g., `handleStartMonitoringUser`).

&nbsp;   \*   Paste your unique n8n AI Agent webhook URLs into the corresponding constants.



4\.  \*\*Build and Run the Docker Container:\*\*

&nbsp;   ```bash

&nbsp;   docker-compose build

&nbsp;   docker-compose up

&nbsp;   ```



\### Connecting to an AI Assistant (e.g., Claude Desktop)



1\.  In your AI assistant's developer settings, add a new local MCP server.

2\.  Use the following configuration to allow the assistant to communicate with your running Docker container:

&nbsp;   ```json

&nbsp;   "twitter-mcp-server": {

&nbsp;     "command": "docker",

&nbsp;     "args": \[

&nbsp;       "exec",

&nbsp;       "-i",

&nbsp;       "twitter-mcp-server",

&nbsp;       "node",

&nbsp;       "dist/index.js"

&nbsp;     ]

&nbsp;   }

&nbsp;   ```



You can now use natural language to interact with your Twitter intelligence tools directly from your AI assistant.

