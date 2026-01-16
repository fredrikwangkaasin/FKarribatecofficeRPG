import { createApiClient } from './api';

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * NPC dialogue request
 */
export interface NpcDialogueRequest {
  npcName: string;
  npcType: 'boss' | 'quest_giver' | 'merchant' | 'mentor' | 'hr' | string;
  playerMessage: string;
  currentZone?: string;
  playerLevel?: number;
  defeatedBosses?: string[];
}

/**
 * NPC dialogue response
 */
export interface NpcDialogueResponse {
  npcName: string;
  dialogue: string;
  hints?: string[];
  hasQuest: boolean;
}

/**
 * Game hint request
 */
export interface GameHintRequest {
  currentZone: string;
  playerLevel: number;
  defeatedBosses: string[];
  stuckOn?: string;
}

/**
 * Game hint response
 */
export interface GameHintResponse {
  hint: string;
  nextObjective?: string;
  relevance: number;
}

/**
 * Chat completion request
 */
export interface ChatCompletionRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

/**
 * Chat completion response
 */
export interface ChatCompletionResponse {
  id: string;
  content: string;
  model: string;
  tokensUsed: number;
  timestamp: string;
}

/**
 * AI status response
 */
export interface AiStatusResponse {
  available: boolean;
  provider: string;
  model: string;
}

/**
 * Quiz question for battle
 */
export interface QuizQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
  explanation?: string;
  theme?: string;
}

/**
 * Request to generate a battle quiz question
 */
export interface BattleQuizRequest {
  enemyId: string;
  enemyName: string;
  enemyZone: 'finance' | 'hospitality' | 'research' | string;
  isBoss: boolean;
  difficulty: number;
  playerLevel: number;
  previousQuestions?: string[];
  recentlySeenIds?: string[]; // Question IDs recently shown to avoid duplicates
}

/**
 * Response with a single battle quiz question
 */
export interface BattleQuizResponse {
  enemyId: string;
  enemyName: string;
  question: QuizQuestion;
  questionId?: string; // Database ID for tracking answered questions
  tauntMessage?: string;
  timeLimit: number;
}

/**
 * Request to mark a question as answered
 */
export interface QuestionAnsweredRequest {
  questionId: string;
  answeredCorrectly: boolean;
}

/**
 * Request to generate multiple questions at once
 */
export interface BattleQuizBatchRequest {
  enemyId: string;
  enemyName: string;
  enemyZone: string;
  isBoss: boolean;
  difficulty: number;
  playerLevel: number;
  questionCount: number;
}

/**
 * Response with multiple quiz questions
 */
export interface BattleQuizBatchResponse {
  enemyId: string;
  enemyName: string;
  questions: QuizQuestion[];
  timeLimit: number;
}

/**
 * LLM API service for game AI features
 */
export class LlmApi {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getClient() {
    const client = createApiClient();
    client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    return client;
  }

  /**
   * Check if AI is available and configured
   */
  async getStatus(): Promise<AiStatusResponse> {
    const client = this.getClient();
    const response = await client.get<AiStatusResponse>('/chat/status');
    return response.data;
  }

  /**
   * Get NPC dialogue from the AI
   */
  async getNpcDialogue(request: NpcDialogueRequest): Promise<NpcDialogueResponse> {
    const client = this.getClient();
    const response = await client.post<NpcDialogueResponse>('/chat/npc', request);
    return response.data;
  }

  /**
   * Get a game hint from the AI
   */
  async getGameHint(request: GameHintRequest): Promise<GameHintResponse> {
    const client = this.getClient();
    const response = await client.post<GameHintResponse>('/chat/hint', request);
    return response.data;
  }

  /**
   * Send a general chat completion request
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const client = this.getClient();
    const response = await client.post<ChatCompletionResponse>('/chat/completion', request);
    return response.data;
  }

  /**
   * Generate a single battle quiz question for an enemy
   */
  async generateBattleQuiz(request: BattleQuizRequest): Promise<BattleQuizResponse> {
    const client = this.getClient();
    const response = await client.post<BattleQuizResponse>('/chat/battle-quiz', request);
    return response.data;
  }

  /**
   * Generate multiple battle quiz questions at once (for pre-loading)
   */
  async generateBattleQuizBatch(request: BattleQuizBatchRequest): Promise<BattleQuizBatchResponse> {
    const client = this.getClient();
    const response = await client.post<BattleQuizBatchResponse>('/chat/battle-quiz/batch', request);
    return response.data;
  }

  /**
   * Mark a question as answered (tracks correct answers to avoid repeats)
   */
  async markQuestionAnswered(questionId: string, answeredCorrectly: boolean): Promise<void> {
    const client = this.getClient();
    await client.post('/chat/battle-quiz/answered', {
      questionId,
      answeredCorrectly,
    });
  }

  /**
   * Quick helper to get a battle question for an enemy
   */
  async getBattleQuestion(
    enemyId: string,
    enemyName: string,
    enemyZone: string,
    isBoss: boolean,
    difficulty: number,
    playerLevel: number
  ): Promise<BattleQuizResponse> {
    return this.generateBattleQuiz({
      enemyId,
      enemyName,
      enemyZone,
      isBoss,
      difficulty,
      playerLevel,
    });
  }

  /**
   * Pre-load multiple questions for a battle
   */
  async preloadBattleQuestions(
    enemyId: string,
    enemyName: string,
    enemyZone: string,
    isBoss: boolean,
    difficulty: number,
    playerLevel: number,
    count: number = 3
  ): Promise<QuizQuestion[]> {
    try {
      const response = await this.generateBattleQuizBatch({
        enemyId,
        enemyName,
        enemyZone,
        isBoss,
        difficulty,
        playerLevel,
        questionCount: count,
      });
      return response.questions;
    } catch (error) {
      console.error('Failed to preload battle questions:', error);
      return [];
    }
  }

  /**
   * Quick helper to talk to an NPC
   */
  async talkToNpc(
    npcName: string,
    npcType: string,
    message: string,
    gameState?: {
      currentZone?: string;
      playerLevel?: number;
      defeatedBosses?: string[];
    }
  ): Promise<string> {
    try {
      const response = await this.getNpcDialogue({
        npcName,
        npcType,
        playerMessage: message,
        currentZone: gameState?.currentZone,
        playerLevel: gameState?.playerLevel,
        defeatedBosses: gameState?.defeatedBosses,
      });
      return response.dialogue;
    } catch (error) {
      console.error('Failed to get NPC dialogue:', error);
      return getFallbackDialogue(npcType);
    }
  }

  /**
   * Quick helper to get a hint
   */
  async getQuickHint(
    currentZone: string,
    playerLevel: number,
    defeatedBosses: string[] = [],
    stuckOn?: string
  ): Promise<string> {
    try {
      const response = await this.getGameHint({
        currentZone,
        playerLevel,
        defeatedBosses,
        stuckOn,
      });
      return response.hint;
    } catch (error) {
      console.error('Failed to get game hint:', error);
      return 'Keep exploring and leveling up!';
    }
  }
}

/**
 * Create an LLM API instance with the given auth token
 */
export function createLlmApi(token: string): LlmApi {
  return new LlmApi(token);
}

/**
 * Fallback dialogues when AI is unavailable
 */
function getFallbackDialogue(npcType: string): string {
  switch (npcType.toLowerCase()) {
    case 'boss':
      return "Your meeting request has been... declined. Now prepare yourself!";
    case 'quest_giver':
      return "I could really use your help with something...";
    case 'merchant':
      return "Welcome! Check out my selection of office supplies!";
    case 'mentor':
      return "Remember, young one: synergy is the key to success.";
    case 'hr':
      return "Please fill out form HR-2847B before proceeding.";
    default:
      return "Hello there, fellow employee!";
  }
}

/**
 * React hook helper - use with useAuth
 * 
 * @example
 * ```tsx
 * import { useAuth } from '@arribatec-sds/keycloak-auth-react';
 * import { useLlmApi } from '@/utils/llmApi';
 * 
 * function MyComponent() {
 *   const { token } = useAuth();
 *   const llmApi = useLlmApi(token);
 * 
 *   const handleTalk = async () => {
 *     const dialogue = await llmApi.talkToNpc('Meeting Master', 'boss', 'Hello!');
 *     console.log(dialogue);
 *   };
 * }
 * ```
 */
export function useLlmApi(token: string | undefined): LlmApi | null {
  if (!token) return null;
  return createLlmApi(token);
}
