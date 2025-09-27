# 🚀 Agentic Twitter Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Badge"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js Badge"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Badge"/>
  <img src="https://img.shields.io/badge/n8n-1A1A3D?style=for-the-badge&logo=n8n&logoColor=white" alt="n8n Badge"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase Badge"/>
</p>

This repository contains a powerful, "smart" **Model Context Protocol (MCP)** server for advanced Twitter analysis and monitoring. It is designed to be used as a tool by AI assistants like Claude, providing a natural language interface to a robust set of Twitter intelligence and automation capabilities.

The server is built with Node.js/TypeScript, packaged in a Docker container, and integrates with a stateful **n8n** automation backend for persistent, 24/7 monitoring.

---

## 🏛️ System Architecture

This project utilizes a modern, decoupled, and agentic architecture for maximum robustness and scalability.

-   **Twitter MCP Server (This Repo):** The stateless, Dockerized front-end that exposes a rich toolset to the AI assistant.
-   **n8n Automation Engine:** A stateful, persistent backend that contains two main parts:
    1.  **The AI Agent Router:** A single workflow that receives commands from the MCP, uses an LLM to understand intent, and calls the appropriate sub-workflow to manage the monitoring lists.
    2.  **The Monitoring Engines:** Two separate, scheduled workflows that poll the Twitter API for new tweets from the monitored users and keywords, preventing duplicate notifications.
-   **Supabase (PostgreSQL) Database:** The "single source of truth" that stores the monitoring lists and the last seen tweet ID for state management.

---

## 📖 Tool Manifest & Capabilities

The MCP exposes a total of **14 high-level tools**. These are divided into two categories: a control panel for managing the n8n monitoring engine and a suite of on-demand analysis tools.

### 🤖 Unified Monitoring Control Panel (3 Tools)
These tools act as a natural language remote control for the n8n monitoring engine.

<details>
<summary><strong>1. `add_monitor`</strong></summary>
<br>
Adds a new target (either a user account or a keyword/query) to the 24/7 monitoring list. The n8n AI Agent is smart enough to differentiate between the target types.
<br><br>
<strong>Parameters:</strong> `target` (string, required) - The user account (e.g., "@nasa") or keyword/query (e.g., "#AI") to start monitoring.
</details>

<details>
<summary><strong>2. `remove_monitor`</strong></summary>
<br>
Removes a target from the monitoring list.
<br><br>
<strong>Parameters:</strong> `target` (string, required) - The user account or keyword/query to stop monitoring.
</details>

<details>
<summary><strong>3. `list_monitors`</strong></summary>
<br>
Lists all currently monitored user accounts and keywords from the n8n engine.
<br><br>
<strong>Parameters:</strong> None.
</details>

### 🔬 On-Demand Analysis & Intelligence Tools (11 Tools)
These tools perform real-time data fetching and processing for immediate insights.

<details>
<summary><strong>4. `analyze_account`</strong></summary>
<br>
Provides a comprehensive intelligence report on a single Twitter user.
<br><br>
<strong>Underlying Sub-Tasks:</strong> `getUserInfo`, `getUserTweets`, `calculateTweetStats`, `getUserFollowers`, `getUserFollowings`.
<br><br>
<strong>Parameters:</strong> `userName` (string, required), `includeFollowers` (boolean), `includeFollowings` (boolean), `includeTweets` (boolean).
</details>

<details>
<summary><strong>5. `search_tweets`</strong></summary>
<br>
Performs a powerful, one-time search for tweets using full Twitter Advanced Search syntax.
<br><br>
<strong>Underlying Sub-Tasks:</strong> `advancedSearch`.
<br><br>
<strong>Parameters:</strong> `query` (string, required), `maxResults` (number).
</details>

<details>
<summary><strong>6. `track_engagement`</strong></summary>
<br>
Provides a detailed breakdown of the engagement for a single, specific tweet.
<br><br>
<strong>Underlying Sub-Tasks:</strong> `getTweetsByIds`, `getTweetReplies`, `getTweetQuotes`, `getTweetRetweeters`.
<br><br>
<strong>Parameters:</strong> `tweetId` (string, required).
</details>

<details>
<summary><strong>7. `get_verified_followers`</strong></summary>
<br>
Gets a list of a user's followers who are verified (have a blue check).
<br><br>
<strong>Underlying Sub-Tasks:</strong> `getVerifiedFollowers`.
<br><br>
<strong>Parameters:</strong> `userId` (string, required), `cursor` (string).
</details>

<details>
<summary><strong>8. `get_list_members`</strong></summary>
<br>
Gets the members of a specific Twitter List.
<br><br>
<strong>Underlying Sub-Tasks:</strong> `getListMembers`.
<br><br>
<strong>Parameters:</strong> `listId` (string, required), `cursor` (string).
</details>

<details>
<summary><strong>9. `get_list_followers`</strong></summary>
<br>
Gets the followers of a specific Twitter List.
<br><br>
<strong>Underlying Sub-Tasks:</strong> `getListFollowers`.
<br><br>
<strong>Parameters:</strong> `listId` (string, required), `cursor` (string).
</details>

<details>
<summary><strong>10. `check_relationships`</strong></summary>
<br>
Checks the mutual follow status between multiple Twitter accounts.
<br><br>
<strong>Underlying Sub-Tasks:</strong> `checkFollowRelationship`.
<br><br>
<strong>Parameters:</strong> `accounts` (array of strings, required).
</details>

<details>
<summary><strong>11. `get_mentions`</strong></summary>
<br>
Retrieves recent tweets that @mention a specific user.
<br><br>
<strong>Underlying Sub-Tasks:</strong> `getUserMentions`.
<br><br>
<strong>Parameters:</strong> `userName` (string, required), `sinceHours` (number).
</details>

<details>
<summary><strong>12. `get_trends`</strong></summary>
<br>
Gets the current list of trending topics on Twitter for a specific location.
<br><br>
<strong>Underlying Sub-Tasks:</strong> `getTrends`.
<br><br>
<strong>Parameters:</strong> `location` (string).
</details>

<details>
<summary><strong>13. `batch_analyze`</strong></summary>
<br>
Efficiently retrieves profile information for a list of multiple users in a single API call.
<br><br>
<strong>Underlying Sub-Tasks:</strong> `getBatchUserInfo`.
<br><br>
<strong>Parameters:</strong> `userNames` (array of strings, required).
</details>

<details>
<summary><strong>14. `get_article`</strong></summary>
<br>
Retrieves the content of a long-form tweet (article).
<br><br>
<strong>Underlying Sub-Tasks:</strong> `getArticle`.
<br><br>
<strong>Parameters:</strong> `tweetId` (string, required).
</details>

---

## 🛠️ Getting Started

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed on your machine.
- An API Key from a third-party Twitter API provider ([twitterapi.io](https://twitterapi.io/)).
- An n8n instance with a configured LLM (e.g., via OpenRouter).
- A Supabase project for the PostgreSQL database.

### Installation & Local Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/icaruschan/Twitter-MCP.git
    cd Twitter-MCP
    ```

2.  **Configure Environment Variables**
    - Create a `.env` file in the root of the project.
    - Add your Twitter API key:
    ```env
    TWITTER_API_KEY=your_secret_api_key_here
    ```

3.  **Set Up n8n & Supabase**
    - The complete n8n backend, including all monitoring and agent workflows, is available as a set of importable JSON templates in a separate repository.
    - **[Click here to get the n8n workflow templates](https://github.com/icaruschan/twitter-mcp-n8n-workflows)**
    - Follow the instructions in that repository to set up your Supabase tables and import the workflows into your n8n instance.
    - Once your "Unified AI Agent" workflow is active in n8n, copy its unique **Production Webhook URL**.
    - In this project's `src/index.ts` file, paste that URL into the `N8N_UNIFIED_AGENT_WEBHOOK` constant.

4.  **Build and Run the Docker Container**
    ```bash
    # Build the container image
    docker-compose build

    # Run the container in the background
    docker-compose up -d
    ```

### 🔌 Connecting to an AI Assistant

To connect this server to an AI assistant like Claude Desktop for local development:

1.  Navigate to your AI assistant's developer/tool settings.
2.  Add a new local MCP server with the following configuration:
    ```json
    "twitter-mcp-server": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "twitter-mcp-server",
        "node",
        "dist/index.js"
      ]
    }
    ```