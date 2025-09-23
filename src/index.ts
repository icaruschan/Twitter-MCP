import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";

// =================================================================
// SECTION 1: UTILITY FUNCTIONS
// =================================================================

function safeArray<T>(value: any): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [];
}

function safeSlice<T>(array: any, start: number, end?: number): T[] {
  const safe = safeArray<T>(array);
  return safe.slice(start, end);
}

// =================================================================
// SECTION 2: COMPLETE TYPESCRIPT INTERFACES
// =================================================================

interface TwitterUser {
  type: "user";
  userName: string;
  url: string;
  id: string;
  name: string;
  isBlueVerified: boolean;
  verifiedType?: string;
  profilePicture?: string;
  coverPicture?: string;
  description?: string;
  location?: string;
  followers: number;
  following: number;
  canDm?: boolean;
  createdAt?: string;
  favouritesCount?: number;
  hasCustomTimelines?: boolean;
  isTranslator?: boolean;
  mediaCount?: number;
  statusesCount?: number;
  withheldInCountries?: string[];
  affiliatesHighlightedLabel?: any;
  possiblySensitive?: boolean;
  pinnedTweetIds?: string[];
  isAutomated?: boolean;
  automatedBy?: string;
  unavailable?: boolean;
  message?: string;
  unavailableReason?: string;
  profile_bio?: any;
}

interface TwitterTweet {
  type: "tweet";
  id: string;
  url: string;
  text: string;
  source?: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  viewCount?: number;
  createdAt: string;
  lang?: string;
  bookmarkCount?: number;
  isReply?: boolean;
  inReplyToId?: string;
  conversationId?: string;
  displayTextRange?: number[];
  inReplyToUserId?: string;
  inReplyToUsername?: string;
  author: TwitterUser;
  entities?: any;
  quoted_tweet?: any;
  retweeted_tweet?: any;
  isLimitedReply?: boolean;
}

// =================================================================
// SECTION 3: ROBUST TwitterAPIClient
// =================================================================

class TwitterAPIClient {
  private api: AxiosInstance;

  constructor(apiKey: string) {
    this.api = axios.create({
      baseURL: "https://api.twitterapi.io",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error.response?.data || error.message);
        throw error;
      }
    );
  }

  async getUserInfo(userName: string): Promise<TwitterUser | null> {
    try {
      const response = await this.api.get("/twitter/user/info", {
        params: { userName },
      });
      return response.data?.data || null;
    } catch (error) {
      console.error(`getUserInfo failed for ${userName}:`, error);
      return null;
    }
  }

  async getUserTweets(
    userName: string,
    cursor?: string,
    includeReplies: boolean = false
  ): Promise<{
    tweets: TwitterTweet[];
    has_next_page: boolean;
    next_cursor?: string;
  }> {
    try {
      const response = await this.api.get("/twitter/user/last_tweets", {
        params: { userName, cursor, includeReplies },
      });
      const responseData = response.data?.data;
      return {
        tweets: safeArray<TwitterTweet>(responseData?.tweets),
        has_next_page: response.data?.has_next_page || false,
        next_cursor: response.data?.next_cursor,
      };
    } catch (error) {
      console.error(`getUserTweets failed for ${userName}:`, error);
      return { tweets: [], has_next_page: false, next_cursor: undefined };
    }
  }

  async getUserFollowers(
    userName: string,
    cursor?: string,
    pageSize: number = 200
  ): Promise<{
    followers: TwitterUser[];
    has_next_page: boolean;
    next_cursor?: string;
  }> {
    try {
      const response = await this.api.get("/twitter/user/followers", {
        params: { userName, cursor, pageSize },
      });
      return {
        followers: safeArray<TwitterUser>(response.data?.followers),
        has_next_page: response.data?.has_next_page || false,
        next_cursor: response.data?.next_cursor,
      };
    } catch (error) {
      console.error(`getUserFollowers failed for ${userName}:`, error);
      return { followers: [], has_next_page: false, next_cursor: undefined };
    }
  }

  async getUserFollowings(
    userName: string,
    cursor?: string,
    pageSize: number = 200
  ): Promise<{
    followings: TwitterUser[];
    has_next_page: boolean;
    next_cursor?: string;
  }> {
    try {
      const response = await this.api.get("/twitter/user/followings", {
        params: { userName, cursor, pageSize },
      });
      return {
        followings: safeArray<TwitterUser>(response.data?.followings),
        has_next_page: response.data?.has_next_page || false,
        next_cursor: response.data?.next_cursor,
      };
    } catch (error) {
      console.error(`getUserFollowings failed for ${userName}:`, error);
      return { followings: [], has_next_page: false, next_cursor: undefined };
    }
  }

  async getBatchUserInfo(userIds: string[]): Promise<TwitterUser[]> {
    const response = await this.api.get("/twitter/user/batch_info_by_ids", {
      params: { userIds: userIds.join(",") },
    });
    return safeArray(response.data.users);
  }
  async getUserMentions(
    userName: string,
    sinceTime?: number,
    untilTime?: number,
    cursor?: string
  ): Promise<{
    tweets: TwitterTweet[];
    has_next_page: boolean;
    next_cursor?: string;
  }> {
    const response = await this.api.get("/twitter/user/mentions", {
      params: { userName, sinceTime, untilTime, cursor },
    });
    return {
      tweets: safeArray(response.data?.tweets),
      has_next_page: response.data?.has_next_page || false,
      next_cursor: response.data?.next_cursor,
    };
  }
  async checkFollowRelationship(
    sourceUserName: string,
    targetUserName: string
  ): Promise<{ following: boolean; followed_by: boolean }> {
    const response = await this.api.get(
      "/twitter/user/check_follow_relationship",
      {
        params: {
          source_user_name: sourceUserName,
          target_user_name: targetUserName,
        },
      }
    );
    return response.data.data;
  }
  async searchUsers(query: string): Promise<TwitterUser[]> {
    const response = await this.api.get("/twitter/user/search", {
      params: { query },
    });
    return safeArray(response.data.users);
  }
  async getTweetsByIds(tweetIds: string[]): Promise<TwitterTweet[]> {
    const response = await this.api.get("/twitter/tweets", {
      params: { tweet_ids: tweetIds.join(",") },
    });
    return safeArray(response.data.tweets);
  }
  async getTweetReplies(
    tweetId: string,
    cursor?: string
  ): Promise<{
    replies: TwitterTweet[];
    has_next_page: boolean;
    next_cursor?: string;
  }> {
    const response = await this.api.get("/twitter/tweet/replies", {
      params: { tweetId, cursor },
    });
    return {
      replies: safeArray(response.data?.replies),
      has_next_page: response.data?.has_next_page || false,
      next_cursor: response.data?.next_cursor,
    };
  }
  async getTweetQuotes(
    tweetId: string,
    cursor?: string
  ): Promise<{
    tweets: TwitterTweet[];
    has_next_page: boolean;
    next_cursor?: string;
  }> {
    const response = await this.api.get("/twitter/tweet/quotes", {
      params: { tweetId, cursor },
    });
    return {
      tweets: safeArray(response.data?.tweets),
      has_next_page: response.data?.has_next_page || false,
      next_cursor: response.data?.next_cursor,
    };
  }
  async getTweetRetweeters(
    tweetId: string,
    cursor?: string
  ): Promise<{
    users: TwitterUser[];
    has_next_page: boolean;
    next_cursor?: string;
  }> {
    const response = await this.api.get("/twitter/tweet/retweeters", {
      params: { tweetId, cursor },
    });
    return {
      users: safeArray(response.data?.users),
      has_next_page: response.data?.has_next_page || false,
      next_cursor: response.data?.next_cursor,
    };
  }
  async getTweetThreadContext(
    tweetId: string,
    cursor?: string
  ): Promise<{
    replies: TwitterTweet[];
    has_next_page: boolean;
    next_cursor?: string;
  }> {
    const response = await this.api.get("/twitter/tweet/thread_context", {
      params: { tweetId, cursor },
    });
    return {
      replies: safeArray(response.data?.replies),
      has_next_page: response.data?.has_next_page || false,
      next_cursor: response.data?.next_cursor,
    };
  }
  async getArticle(tweetId: string): Promise<any> {
    const response = await this.api.get("/twitter/article", {
      params: { tweet_id: tweetId },
    });
    return response.data.article;
  }
  async advancedSearch(
    query: string,
    queryType: "Latest" | "Top" = "Latest",
    cursor?: string
  ): Promise<{
    tweets: TwitterTweet[];
    has_next_page: boolean;
    next_cursor?: string;
  }> {
    const response = await this.api.get("/twitter/tweet/advanced_search", {
      params: { query, queryType, cursor },
    });
    return {
      tweets: safeArray(response.data?.tweets),
      has_next_page: response.data?.has_next_page || false,
      next_cursor: response.data?.next_cursor,
    };
  }
  async getTrends(woeid: number, count: number = 30): Promise<any[]> {
    const response = await this.api.get("/twitter/trends", {
      params: { woeid, count },
    });
    return safeArray(response.data.trends);
  }
}

// =================================================================
// SECTION 4: ROBUST MCP Server Implementation
// =================================================================

class TwitterMCPServer {
  private server: Server;
  private twitterClient: TwitterAPIClient;

  // NEW: Define the single endpoints for your AI Agents
  private readonly N8N_USER_AGENT_WEBHOOK =
    "https://n8n-online-a6e3c293ca19.herokuapp.com/webhook/4370aaed-6fa2-4cae-abb0-4ab7c669c803";
  private readonly N8N_KEYWORD_AGENT_WEBHOOK =
    "https://n8n-online-a6e3c293ca19.herokuapp.com/webhook/5f977a8d-6888-42a6-b57c-e687f6eb1210";

  constructor(apiKey: string) {
    this.twitterClient = new TwitterAPIClient(apiKey);
    this.server = new Server(
      { name: "twitter-mcp", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getToolDefinitions(),
    }));
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return this.handleToolCall(
        request.params.name,
        request.params.arguments || {}
      );
    });
  }

  private getToolDefinitions(): Tool[] {
    return [
      // --- n8n User Monitoring Control Panel ---
      {
        name: "start_monitoring_user",
        description:
          "Adds a Twitter user to the n8n workflow for continuous real-time monitoring.",
        inputSchema: {
          type: "object",
          properties: {
            userName: {
              type: "string",
              description:
                "The Twitter username (without @) to start monitoring.",
            },
          },
          required: ["userName"],
        },
      },
      {
        name: "stop_monitoring_user",
        description: "Removes a Twitter user from the n8n monitoring workflow.",
        inputSchema: {
          type: "object",
          properties: {
            userName: {
              type: "string",
              description:
                "The Twitter username (without @) to stop monitoring.",
            },
          },
          required: ["userName"],
        },
      },
      {
        name: "list_monitored_users",
        description:
          "Retrieves and lists all Twitter users currently being monitored by the n8n workflow.",
        inputSchema: { type: "object", properties: {} },
      },
      // --- n8n Keyword Monitoring Control Panel ---
      {
        name: "start_monitoring_keyword",
        description:
          "Adds a keyword or search query to the n8n workflow for continuous real-time monitoring.",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description:
                "The keyword or advanced search query to start monitoring.",
            },
          },
          required: ["keyword"],
        },
      },
      {
        name: "stop_monitoring_keyword",
        description: "Removes a keyword from the n8n monitoring workflow.",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "The keyword or query to stop monitoring.",
            },
          },
          required: ["keyword"],
        },
      },
      {
        name: "list_monitored_keywords",
        description:
          "Retrieves and lists all keywords currently being monitored by the n8n workflow.",
        inputSchema: { type: "object", properties: {} },
      },
      // --- Analysis Tools ---
      {
        name: "analyze_account",
        description: "Get comprehensive analysis of a Twitter account",
        inputSchema: {
          type: "object",
          properties: {
            userName: {
              type: "string",
              description: "Twitter username to analyze",
            },
            includeFollowers: {
              type: "boolean",
              description: "Include follower analysis",
              default: false,
            },
            includeFollowings: {
              type: "boolean",
              description: "Include following analysis",
              default: false,
            },
            includeTweets: {
              type: "boolean",
              description: "Include recent tweets",
              default: true,
            },
            includeReplies: {
              type: "boolean",
              description: "Include replies in tweets",
              default: false,
            },
            maxFollowers: {
              type: "number",
              description: "Max followers to retrieve",
              default: 200,
            },
          },
          required: ["userName"],
        },
      },
      {
        name: "search_tweets",
        description: "Search for tweets using advanced operators",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                'Search query with operators (e.g., "from:nasa #space")',
            },
            queryType: {
              type: "string",
              enum: ["Latest", "Top"],
              default: "Latest",
            },
            maxResults: {
              type: "number",
              description: "Maximum tweets to retrieve",
              default: 50,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "track_engagement",
        description: "Analyze engagement metrics for a tweet",
        inputSchema: {
          type: "object",
          properties: {
            tweetId: { type: "string", description: "Tweet ID to analyze" },
            includeReplies: { type: "boolean", default: true },
            includeQuotes: { type: "boolean", default: true },
            includeRetweeters: { type: "boolean", default: true },
            includeThread: { type: "boolean", default: false },
            maxResults: { type: "number", default: 50 },
          },
          required: ["tweetId"],
        },
      },
      {
        name: "check_relationships",
        description: "Check follow relationships between accounts",
        inputSchema: {
          type: "object",
          properties: {
            accounts: {
              type: "array",
              items: { type: "string" },
              description: "List of account usernames to check relationships",
            },
            checkMutual: {
              type: "boolean",
              description: "Check all mutual relationships",
              default: true,
            },
          },
          required: ["accounts"],
        },
      },
      {
        name: "get_mentions",
        description: "Get mentions of a specific account",
        inputSchema: {
          type: "object",
          properties: {
            userName: {
              type: "string",
              description: "Username to get mentions for",
            },
            sinceHours: {
              type: "number",
              description: "Get mentions from last N hours",
            },
            maxResults: { type: "number", default: 50 },
          },
          required: ["userName"],
        },
      },
      {
        name: "get_trends",
        description: "Get trending topics for a location",
        inputSchema: {
          type: "object",
          properties: {
            location: {
              type: "string",
              enum: ["worldwide", "usa", "uk", "japan", "custom"],
              default: "worldwide",
            },
            woeid: {
              type: "number",
              description: 'Custom WOEID if location is "custom"',
            },
            count: { type: "number", default: 30 },
          },
          required: [],
        },
      },
      {
        name: "batch_analyze",
        description: "Analyze multiple users efficiently",
        inputSchema: {
          type: "object",
          properties: {
            userIds: {
              type: "array",
              items: { type: "string" },
              description: "List of user IDs to analyze",
            },
            userNames: {
              type: "array",
              items: { type: "string" },
              description: "List of usernames (will be converted to IDs)",
            },
          },
          oneOf: [{ required: ["userIds"] }, { required: ["userNames"] }],
        },
      },
    ];
  }

  private async handleToolCall(toolName: string, args: any): Promise<any> {
    console.error(
      `Executing tool: ${toolName} with args:`,
      JSON.stringify(args)
    );
    try {
      switch (toolName) {
        // --- User Monitoring Cases ---
        case "start_monitoring_user":
          return await this.handleStartMonitoringUser(args);
        case "stop_monitoring_user":
          return await this.handleStopMonitoringUser(args);
        case "list_monitored_users":
          return await this.handleListMonitoredUsers(args);
        // --- Keyword Monitoring Cases ---
        case "start_monitoring_keyword":
          return await this.handleStartMonitoringKeyword(args);
        case "stop_monitoring_keyword":
          return await this.handleStopMonitoringKeyword(args);
        case "list_monitored_keywords":
          return await this.handleListMonitoredKeywords(args);
        // --- Analysis Cases ---
        case "analyze_account":
          return await this.handleAnalyzeAccount(args);
        case "search_tweets":
          return await this.handleSearchTweets(args);
        case "track_engagement":
          return await this.handleTrackEngagement(args);
        case "check_relationships":
          return await this.handleCheckRelationships(args);
        case "get_mentions":
          return await this.handleGetMentions(args);
        case "get_trends":
          return await this.handleGetTrends(args);
        case "batch_analyze":
          return await this.handleBatchAnalyze(args);
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error: any) {
      console.error(`Tool ${toolName} failed:`, error);
      const errorMessage =
        (error as any).response?.data?.message ||
        (error as any).message ||
        "Unknown error occurred";
      return {
        content: [
          {
            type: "text",
            text: `Error in ${toolName}: ${errorMessage}\n\nDebug info:\nArgs: ${JSON.stringify(
              args,
              null,
              2
            )}`,
          },
        ],
      };
    }
  }

  // --- REWRITTEN: Handlers for the n8n AI Agents ---
  private async handleStartMonitoringUser(args: any) {
    const { userName } = args;
    const message = `Please add the user @${userName} to the monitoring list.`;
    const response = await axios.post(this.N8N_USER_AGENT_WEBHOOK, { message });
    return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
  }

  private async handleStopMonitoringUser(args: any) {
    const { userName } = args;
    const message = `Please remove the user @${userName} from the monitoring list.`;
    const response = await axios.post(this.N8N_USER_AGENT_WEBHOOK, { message });
    return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
  }

  private async handleListMonitoredUsers(args: any) {
    const message = "What users are currently being monitored?";
    const response = await axios.post(this.N8N_USER_AGENT_WEBHOOK, { message });
    return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
  }

  private async handleStartMonitoringKeyword(args: any) {
    const { keyword } = args;
    const message = `Please add the keyword "${keyword}" to the monitoring list.`;
    const response = await axios.post(this.N8N_KEYWORD_AGENT_WEBHOOK, {
      message,
    });
    return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
  }

  private async handleStopMonitoringKeyword(args: any) {
    const { keyword } = args;
    const message = `Please remove the keyword "${keyword}" from the monitoring list.`;
    const response = await axios.post(this.N8N_KEYWORD_AGENT_WEBHOOK, {
      message,
    });
    return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
  }

  private async handleListMonitoredKeywords(args: any) {
    const message = "What keywords are currently being monitored?";
    const response = await axios.post(this.N8N_KEYWORD_AGENT_WEBHOOK, {
      message,
    });
    return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
  }

  // --- Existing, Corrected Handler Methods ---
  private async handleAnalyzeAccount(args: any) {
    const {
      userName,
      includeFollowers,
      includeFollowings,
      includeTweets,
      includeReplies,
      maxFollowers = 200,
    } = args;
    try {
      const analysis: any = {};
      const userInfo = await this.twitterClient.getUserInfo(userName);
      if (!userInfo) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Unable to find user @${userName}. Please check the username and try again.`,
            },
          ],
        };
      }
      analysis.profile = userInfo;
      if (includeTweets) {
        const tweetsData = await this.twitterClient.getUserTweets(
          userName,
          undefined,
          includeReplies
        );
        const tweets: TwitterTweet[] = tweetsData.tweets;
        analysis.recentTweets = safeSlice(tweets, 0, 10);
        analysis.tweetStats = {
          totalRetrieved: tweets.length,
          avgLikes:
            tweets.length > 0
              ? tweets.reduce(
                  (sum: number, t: TwitterTweet) => sum + (t?.likeCount || 0),
                  0
                ) / tweets.length
              : 0,
          avgRetweets:
            tweets.length > 0
              ? tweets.reduce(
                  (sum: number, t: TwitterTweet) =>
                    sum + (t?.retweetCount || 0),
                  0
                ) / tweets.length
              : 0,
        };
      }
      if (includeFollowers) {
        const followersData = await this.twitterClient.getUserFollowers(
          userName,
          undefined,
          maxFollowers
        );
        const followers: TwitterUser[] = followersData.followers;
        analysis.topFollowers = followers
          .filter(
            (f): f is TwitterUser => !!(f && typeof f.followers === "number")
          )
          .sort(
            (a: TwitterUser, b: TwitterUser) =>
              (b.followers || 0) - (a.followers || 0)
          )
          .slice(0, 10);
      }
      if (includeFollowings) {
        const followingsData = await this.twitterClient.getUserFollowings(
          userName,
          undefined,
          maxFollowers
        );
        const followings: TwitterUser[] = followingsData.followings;
        analysis.topFollowings = followings
          .filter(
            (f): f is TwitterUser => !!(f && typeof f.followers === "number")
          )
          .sort(
            (a: TwitterUser, b: TwitterUser) =>
              (b.followers || 0) - (a.followers || 0)
          )
          .slice(0, 10);
      }
      return {
        content: [{ type: "text", text: JSON.stringify(analysis, null, 2) }],
      };
    } catch (error: any) {
      console.error("handleAnalyzeAccount error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error analyzing @${userName}: ${
              error.message || "Unknown error occurred"
            }`,
          },
        ],
      };
    }
  }
  private async handleSearchTweets(args: any) {
    const { query, queryType = "Latest", maxResults = 50 } = args;
    let allTweets: TwitterTweet[] = [];
    let cursor: string | undefined;
    try {
      while (allTweets.length < maxResults) {
        const data = await this.twitterClient.advancedSearch(
          query,
          queryType,
          cursor
        );
        allTweets = allTweets.concat(data.tweets);
        if (!data?.has_next_page || allTweets.length >= maxResults) break;
        cursor = data?.next_cursor;
      }
    } catch (error) {
      console.error("Search tweets error:", error);
    }
    const results = safeSlice(allTweets, 0, maxResults);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { query, queryType, totalResults: results.length, tweets: results },
            null,
            2
          ),
        },
      ],
    };
  }
  private async handleTrackEngagement(args: any) {
    const {
      tweetId,
      includeReplies,
      includeQuotes,
      includeRetweeters,
      includeThread,
      maxResults,
    } = args;
    const engagement: any = { tweetId, metrics: {} };
    const tweets = await this.twitterClient.getTweetsByIds([tweetId]);
    if (tweets.length > 0) {
      engagement.originalTweet = tweets[0];
      engagement.metrics = {
        likes: tweets[0].likeCount,
        retweets: tweets[0].retweetCount,
        replies: tweets[0].replyCount,
        quotes: tweets[0].quoteCount,
        views: tweets[0].viewCount,
      };
    }
    if (includeReplies) {
      const repliesData = await this.twitterClient.getTweetReplies(tweetId);
      engagement.topReplies = safeSlice(repliesData.replies, 0, maxResults);
    }
    if (includeQuotes) {
      const quotesData = await this.twitterClient.getTweetQuotes(tweetId);
      engagement.topQuotes = safeSlice(quotesData.tweets, 0, maxResults);
    }
    if (includeRetweeters) {
      const retweetersData = await this.twitterClient.getTweetRetweeters(
        tweetId
      );
      const users: TwitterUser[] = retweetersData.users;
      engagement.topRetweeters = users
        .sort(
          (a: TwitterUser, b: TwitterUser) =>
            (b?.followers || 0) - (a?.followers || 0)
        )
        .slice(0, maxResults);
    }
    if (includeThread) {
      const threadData = await this.twitterClient.getTweetThreadContext(
        tweetId
      );
      engagement.thread = threadData.replies;
    }
    return {
      content: [{ type: "text", text: JSON.stringify(engagement, null, 2) }],
    };
  }
  private async handleCheckRelationships(args: any) {
    const { accounts, checkMutual } = args;
    const relationships: any[] = [];
    if (checkMutual) {
      for (let i = 0; i < accounts.length; i++) {
        for (let j = i + 1; j < accounts.length; j++) {
          const rel = await this.twitterClient.checkFollowRelationship(
            accounts[i],
            accounts[j]
          );
          relationships.push({
            source: accounts[i],
            target: accounts[j],
            sourceFollowsTarget: rel.following,
            targetFollowsSource: rel.followed_by,
            mutual: rel.following && rel.followed_by,
          });
        }
      }
    } else {
      for (let i = 0; i < accounts.length - 1; i++) {
        const rel = await this.twitterClient.checkFollowRelationship(
          accounts[i],
          accounts[i + 1]
        );
        relationships.push({
          source: accounts[i],
          target: accounts[i + 1],
          sourceFollowsTarget: rel.following,
          targetFollowsSource: rel.followed_by,
          mutual: rel.following && rel.followed_by,
        });
      }
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              accounts,
              relationships,
              summary: {
                totalChecked: relationships.length,
                mutualFollows: relationships.filter((r) => r.mutual).length,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }
  private async handleGetMentions(args: any) {
    const { userName, sinceHours, maxResults = 50 } = args;
    let sinceTime: number | undefined;
    if (sinceHours) {
      sinceTime = Math.floor(Date.now() / 1000) - sinceHours * 3600;
    }
    const mentionsData = await this.twitterClient.getUserMentions(
      userName,
      sinceTime
    );
    const mentions: TwitterTweet[] = safeSlice(
      mentionsData.tweets,
      0,
      maxResults
    );
    const analysis = {
      userName,
      totalMentions: mentions.length,
      timeRange: sinceHours ? `Last ${sinceHours} hours` : "All time",
      mentions,
      topMentioners: mentions
        .map((t: TwitterTweet) => t.author)
        .sort(
          (a: TwitterUser, b: TwitterUser) =>
            (b?.followers || 0) - (a?.followers || 0)
        )
        .slice(0, 10),
      engagementStats: {
        totalLikes: mentions.reduce(
          (sum: number, t: TwitterTweet) => sum + (t?.likeCount || 0),
          0
        ),
        totalRetweets: mentions.reduce(
          (sum: number, t: TwitterTweet) => sum + (t?.retweetCount || 0),
          0
        ),
        avgEngagement:
          mentions.length > 0
            ? mentions.reduce(
                (sum: number, t: TwitterTweet) =>
                  sum + (t?.likeCount || 0) + (t?.retweetCount || 0),
                0
              ) / mentions.length
            : 0,
      },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(analysis, null, 2) }],
    };
  }
  private async handleGetTrends(args: any) {
    const { location = "worldwide", woeid: customWoeid, count = 30 } = args;
    const woeids: Record<string, number> = {
      worldwide: 1,
      usa: 23424977,
      uk: 23424975,
      japan: 23424856,
    };
    const woeid = location === "custom" ? customWoeid : woeids[location];
    if (!woeid) {
      throw new Error("Invalid location or missing WOEID for custom location");
    }
    const trends = await this.twitterClient.getTrends(woeid, count);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { location, woeid, count: trends.length, trends },
            null,
            2
          ),
        },
      ],
    };
  }
  private async handleBatchAnalyze(args: any) {
    const { userIds, userNames } = args;
    let idsToAnalyze: string[] = userIds || [];
    if (userNames && userNames.length > 0) {
      const userPromises = userNames.map((name: string) =>
        this.twitterClient.getUserInfo(name).then((u) => u?.id || "")
      );
      const additionalIds = (await Promise.all(userPromises)).filter(
        (id) => id
      );
      idsToAnalyze = [...new Set([...idsToAnalyze, ...additionalIds])];
    }
    const users: TwitterUser[] = await this.twitterClient.getBatchUserInfo(
      idsToAnalyze
    );
    const analysis = {
      totalUsers: users.length,
      users: users,
      statistics: {
        avgFollowers:
          users.length > 0
            ? users.reduce(
                (sum: number, u: TwitterUser) => sum + (u?.followers || 0),
                0
              ) / users.length
            : 0,
        avgFollowing:
          users.length > 0
            ? users.reduce(
                (sum: number, u: TwitterUser) => sum + (u?.following || 0),
                0
              ) / users.length
            : 0,
        verifiedCount: users.filter((u: TwitterUser) => u?.isBlueVerified)
          .length,
        topByFollowers: users
          .sort(
            (a: TwitterUser, b: TwitterUser) =>
              (b?.followers || 0) - (a?.followers || 0)
          )
          .slice(0, 5),
      },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(analysis, null, 2) }],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // Silent startup for MCP compatibility
  }
} // <-- This brace closes the TwitterMCPServer class.

// =================================================================
// SECTION 5: FINAL Main execution function
// =================================================================
async function main() {
  const apiKey = process.env.TWITTER_API_KEY;

  if (!apiKey) {
    console.error("Error: TWITTER_API_KEY environment variable is required");
    process.exit(1);
  }

  const server = new TwitterMCPServer(apiKey);

  try {
    await server.run();

    // This function keeps the event loop active, preventing the script from exiting.
    setInterval(() => {}, 1000 * 60 * 60);

    process.on("SIGINT", () => {
      // This allows for a graceful shutdown on Ctrl+C
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Call the main function to start the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
