# 🚀 Agentic Twitter Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Badge"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js Badge"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Badge"/>
  <img src="https://img.shields.io/badge/n8n-1A1A3D?style=for-the-badge&logo=n8n&logoColor=white" alt="n8n Badge"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase Badge"/>
</p>

This repository contains a powerful, "smart" **Model Context Protocol (MCP)** server for advanced Twitter analysis and monitoring. It is designed to be used as a tool by AI assistants like Claude, providing a natural language interface to a robust set of Twitter intelligence and automation capabilities.

The server is built with Node.js/TypeScript, packaged in a Docker container, and is designed to integrate with a stateful **n8n** automation workflow backend for persistent, 24/7 monitoring.

---

## ✨ Core Features

This MCP server is divided into two primary categories of tools:

### 🔬 On-Demand Analysis & Intelligence
*   **Comprehensive Account Analysis:** Get a full intelligence report on any Twitter user, including their profile stats, recent tweet engagement, and most influential followers.
*   **Advanced Tweet Search:** Perform complex, one-time searches for tweets using the full power of Twitter's Advanced Search syntax.
*   **Engagement Tracking:** Get a detailed breakdown of the engagement for any specific tweet.
*   **And more...**

### 🤖 Agentic Monitoring Control Panel
*   **Control n8n via Natural Language:** The MCP acts as a stateless control panel, allowing an AI assistant to manage a powerful, persistent monitoring engine built in n8n.
*   **Monitor User Accounts & Keywords:** Dynamically add or remove specific user accounts or complex search queries from the 24/7 monitoring list.
*   **Real-time Status:** Query the n8n engine to get a live list of all active user and keyword monitors.

---

## 🏛️ System Architecture

This project utilizes a modern, decoupled, and agentic architecture for maximum robustness and scalability.

-   **Twitter MCP Server (This Repo):** The stateless, Dockerized front-end that exposes the toolset to the AI assistant.
-   **n8n Automation Engine:** A stateful, persistent backend that runs the 24/7 monitoring workflows. It polls the Twitter API, filters for new tweets, and sends notifications to a configured destination (e.g., Discord).
-   **Supabase (PostgreSQL) Database:** The "single source of truth" that stores the list of monitored users and keywords, as well as the ID of the last tweet seen to prevent duplicate notifications.

---

## 🛠️ Getting Started

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed on your machine.
- An API Key from a third-party Twitter API provider (e.g., `twitterapi.io`).
- An n8n instance (Cloud or self-hosted).
- A Supabase project for the PostgreSQL database.

### Installation & Local Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/icaruschan/Twitter-MCP.git
    cd Twitter-MCP
    ```

2.  **Configure Environment Variables**
    -   Create a `.env` file in the root of the project. This file is protected by `.gitignore` and will not be committed.
    -   Add your Twitter API key to the `.env` file:
      ```env
      TWITTER_API_KEY=your_secret_api_key_here
      ```

3.  **Set Up n8n & Supabase**
    -   Follow the project's n8n and Supabase setup guides to create your monitoring engine and control panel workflows.
    -   In `src/index.ts`, find the handler functions for the monitoring tools (e.g., `handleStartMonitoringUser`) and paste your unique n8n AI Agent webhook URLs into the corresponding constants.

4.  **Build and Run the Docker Container**
    ```bash
    # Build the container image
    docker-compose build

    # Run the container in the background
    docker-compose up -d
    ```

### 🔌 Connecting to an AI Assistant

To connect this server to an AI assistant like Claude Desktop:

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
You can now use natural language to interact with your Twitter intelligence tools directly from your AI assistant.

<details>
<summary><strong>Click to see the full list of available tools</strong></summary>

- `start_monitoring_user`
- `stop_monitoring_user`
- `list_monitored_users`
- `start_monitoring_keyword`
- `stop_monitoring_keyword`
- `list_monitored_keywords`
- `analyze_account`
- `search_tweets`
- `track_engagement`
- `check_relationships`
- `get_mentions`
- `get_trends`
- `batch_analyze`

</details>
