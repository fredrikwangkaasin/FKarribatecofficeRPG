import Phaser from 'phaser';
import { EnemyData, QuizQuestion } from '../data/enemies';
import { PlayerStats, shouldLevelUp, levelUpStats } from '../data/gameState';
import { LlmApi, QuizQuestion as LlmQuizQuestion } from '../../utils/llmApi';

enum BattleState {
  INTRO,
  LOADING_QUESTION,
  SHOWING_QUESTION,
  WAITING_FOR_ANSWER,
  ANSWER_RESULT,
  VICTORY,
  DEFEAT
}

interface AnswerButton {
  button: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  answerIndex: number;
}

/**
 * BattleScene - Quiz-based combat with AI-generated office trivia questions
 */
export default class BattleScene extends Phaser.Scene {
  private enemy!: EnemyData;
  private enemyHP!: number;
  private enemySprite!: Phaser.GameObjects.Image;
  private playerSprite!: Phaser.GameObjects.Sprite;
  
  private state: BattleState = BattleState.INTRO;
  private answerButtons: AnswerButton[] = [];
  private currentQuestion!: QuizQuestion;
  
  private returnPosition!: { x: number; y: number };
  private returnZone!: string;
  
  private messageText!: Phaser.GameObjects.Text;
  private questionText!: Phaser.GameObjects.Text;
  private enemyHPBar!: Phaser.GameObjects.Graphics;
  private playerHPBar!: Phaser.GameObjects.Graphics;
  
  private playerStats!: PlayerStats;
  
  // LLM API for dynamic question generation
  private llmApi: LlmApi | null = null;
  private askedQuestions: string[] = [];
  private recentlySeenIds: string[] = []; // Track question IDs to avoid duplicates
  private questionCache: QuizQuestion[] = [];
  private currentQuestionId: string | null = null; // Track DB question ID for marking answered
  
  // Run away button
  private runAwayButton!: Phaser.GameObjects.Container;

  constructor() {
    super('BattleScene');
  }

  init(data: any) {
    this.enemy = data.enemy;
    this.enemyHP = this.enemy.maxHP;
    this.returnPosition = data.returnPosition;
    this.returnZone = data.currentZone;
    
    this.playerStats = { ...this.registry.get('playerStats') };
    
    // Initialize LLM API with token from registry
    const token = this.registry.get('authToken');
    console.log('BattleScene.init() - Token present:', !!token);
    if (token) {
      this.llmApi = new LlmApi(token);
      console.log('BattleScene.init() - LLM API initialized');
    } else {
      console.warn('BattleScene.init() - No auth token, LLM API not available');
    }
    
    // Load previously asked questions from registry (persist across battles)
    this.askedQuestions = this.registry.get('askedQuestions') || [];
    this.recentlySeenIds = this.registry.get('recentlySeenIds') || [];
    this.questionCache = [];
  }
  
  /**
   * Save asked questions and recently seen IDs to registry so they persist across battles
   */
  private saveAskedQuestions() {
    this.registry.set('askedQuestions', this.askedQuestions);
    // Keep only the last 20 seen IDs to avoid memory bloat but prevent recent repeats
    if (this.recentlySeenIds.length > 20) {
      this.recentlySeenIds = this.recentlySeenIds.slice(-20);
    }
    this.registry.set('recentlySeenIds', this.recentlySeenIds);
  }

  create() {
    console.log('BattleScene.create() called with enemy:', this.enemy);
    
    // Reset answer buttons array for fresh battle
    this.answerButtons = [];
    this.state = BattleState.INTRO;
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Battle background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);
    
    // Enemy sprite (top)
    this.enemySprite = this.add.image(width / 2, 120, this.enemy.spriteKey);
    this.enemySprite.setScale(2);
    
    // Enemy HP bar
    this.add.text(width / 2, 210, `${this.enemy.displayName}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const enemyHPBg = this.add.graphics();
    enemyHPBg.fillStyle(0x330000, 1);
    enemyHPBg.fillRoundedRect(width / 2 - 150, 240, 300, 20, 4);
    
    this.enemyHPBar = this.add.graphics();
    
    // Player sprite (bottom right corner)
    this.playerSprite = this.add.sprite(width - 80, height - 80, 'player');
    this.playerSprite.play('player-idle-down');
    this.playerSprite.setScale(1.5);
    
    // Player HP bar (compact, bottom left)
    this.add.text(100, height - 100, 'YOU', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#0066CC',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const playerHPBg = this.add.graphics();
    playerHPBg.fillStyle(0x003300, 1);
    playerHPBg.fillRoundedRect(30, height - 80, 140, 15, 4);
    
    this.playerHPBar = this.add.graphics();
    
    // Question box (center of screen)
    const questionBg = this.add.graphics();
    questionBg.fillStyle(0x000033, 0.95);
    questionBg.fillRoundedRect(50, 280, width - 100, 120, 8);
    questionBg.lineStyle(3, 0x0066CC);
    questionBg.strokeRoundedRect(50, 280, width - 100, 120, 8);
    
    this.questionText = this.add.text(width / 2, 340, '', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 140 }
    }).setOrigin(0.5);
    
    // Message box (bottom)
    const messageBg = this.add.graphics();
    messageBg.fillStyle(0x000000, 0.9);
    messageBg.fillRoundedRect(50, height - 50, width - 100, 40, 8);
    messageBg.lineStyle(2, 0x00CC00);
    messageBg.strokeRoundedRect(50, height - 50, width - 100, 40, 8);
    
    this.messageText = this.add.text(width / 2, height - 30, '', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // Answer buttons
    this.createAnswerButtons();
    
    // Run Away button
    this.createRunAwayButton();
    
    // Update HP bars
    this.updateHPBars();
    
    // Start battle
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.time.delayedCall(500, () => this.startBattle());
  }

  private startBattle() {
    console.log('BattleScene.startBattle() - Setting state to INTRO');
    this.state = BattleState.INTRO;
    this.showMessage(this.enemy.introText);
    this.questionText.setText('');
    
    this.time.delayedCall(2500, () => {
      console.log('BattleScene - Showing first question');
      this.askQuestion();
    });
  }
  
  private createAnswerButtons() {
    const width = this.cameras.main.width;
    const buttonWidth = (width - 120) / 2;
    const buttonHeight = 60;
    const spacing = 20;
    const startX = 60;
    const startY = 420;
    
    for (let i = 0; i < 4; i++) {
      const x = startX + (i % 2) * (buttonWidth + spacing);
      const y = startY + Math.floor(i / 2) * (buttonHeight + spacing);
      
      const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x004400, 0.9);
      button.setStrokeStyle(3, 0x00AA00);
      button.setInteractive();
      button.setVisible(false);
      button.setOrigin(0, 0);
      
      const text = this.add.text(x + buttonWidth / 2, y + buttonHeight / 2, '', {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: buttonWidth - 20 }
      }).setOrigin(0.5);
      text.setVisible(false);
      
      button.on('pointerover', () => {
        if (this.state === BattleState.WAITING_FOR_ANSWER) {
          button.setFillStyle(0x006600, 1);
        }
      });
      
      button.on('pointerout', () => {
        if (this.state === BattleState.WAITING_FOR_ANSWER) {
          button.setFillStyle(0x004400, 0.9);
        }
      });
      
      button.on('pointerdown', () => {
        if (this.state === BattleState.WAITING_FOR_ANSWER) {
          this.selectAnswer(i);
        }
      });
      
      this.answerButtons.push({ button, text, answerIndex: i });
    }
  }
  
  private askQuestion() {
    this.state = BattleState.LOADING_QUESTION;
    this.showMessage('Preparing question...');
    
    // Try to get a question from cache first, then LLM, then fallback to static
    this.getNextQuestion().then(question => {
      if (!question) {
        console.error('No question available!');
        this.victory();
        return;
      }
      
      this.currentQuestion = question;
      this.askedQuestions.push(question.question);
      this.saveAskedQuestions(); // Persist across battles
      
      this.state = BattleState.SHOWING_QUESTION;
      this.questionText.setText(this.currentQuestion.question);
      this.showMessage('Choose your answer...');
      
      // Show answer buttons
      this.answerButtons.forEach(({ button, text }, index) => {
        text.setText(this.currentQuestion.answers[index]);
        button.setVisible(true);
        text.setVisible(true);
      });
      
      this.state = BattleState.WAITING_FOR_ANSWER;
    }).catch(err => {
      console.error('Error getting question:', err);
      // Use fallback static question
      this.useFallbackQuestion();
    });
  }
  
  /**
   * Get the next question - tries LLM API first, falls back to static questions
   * Anders, Lars Hugo, and Ole Jakob are special - they ALWAYS use their static questions!
   */
  private async getNextQuestion(): Promise<QuizQuestion | null> {
    // Reset questionId for each new question
    this.currentQuestionId = null;
    
    // ANDERS ALWAYS uses his own CAPS questions - no API fetch!
    if (this.enemy.id === 'anders') {
      console.log('ANDERS USES HIS OWN CAPS QUESTIONS!');
      return this.getStaticQuestion();
    }
    
    // LARS HUGO ALWAYS uses his cycling/running cap questions - no API fetch!
    if (this.enemy.id === 'lars-hugo') {
      console.log('LARS HUGO USES HIS CAP-THEMED ATHLETIC QUESTIONS!');
      return this.getStaticQuestion();
    }
    
    // OLE JAKOB ALWAYS uses his Arribatec company questions - no API fetch!
    if (this.enemy.id === 'ole-jakob') {
      console.log('OLE JAKOB USES HIS ARRIBATEC COMPANY QUESTIONS!');
      return this.getStaticQuestion();
    }
    
    // KRISTIANE ALWAYS uses her medical questions - no API fetch!
    if (this.enemy.id === 'kristiane') {
      console.log('KRISTIANE USES HER MEDICAL QUESTIONS!');
      return this.getStaticQuestion();
    }
    
    // FREDRIK ALWAYS uses his pop quiz questions - no API fetch!
    if (this.enemy.id === 'fredrik') {
      console.log('FREDRIK USES HIS POP QUIZ QUESTIONS!');
      return this.getStaticQuestion();
    }
    
    // Check cache first
    if (this.questionCache.length > 0) {
      return this.questionCache.shift()!;
    }
    
    // Try to fetch from LLM API (database questions)
    console.log('getNextQuestion() - llmApi available:', !!this.llmApi);
    if (this.llmApi) {
      try {
        console.log('Fetching database question for:', this.enemy.displayName, 'zone:', this.enemy.zone);
        console.log('Recently seen IDs:', this.recentlySeenIds);
        const response = await this.llmApi.generateBattleQuiz({
          enemyId: this.enemy.id,
          enemyName: this.enemy.displayName,
          enemyZone: this.enemy.zone,
          isBoss: this.enemy.isBoss,
          difficulty: this.enemy.difficulty,
          playerLevel: this.playerStats.level,
          previousQuestions: this.askedQuestions,
          recentlySeenIds: this.recentlySeenIds
        });
        
        console.log('API response received:', response);
        
        if (response && response.question) {
          console.log('Using database question:', response.question.question);
          
          // Store the question ID for tracking correct answers and recent views
          if (response.questionId) {
            this.currentQuestionId = response.questionId;
            // Track this question ID as recently seen
            this.recentlySeenIds.push(response.questionId);
            this.saveAskedQuestions();
          }
          
          // Show taunt if available
          if (response.tauntMessage) {
            this.showMessage(response.tauntMessage);
            await this.delay(1500);
          }
          
          return response.question;
        } else {
          console.warn('API response did not contain a question');
        }
      } catch (err) {
        console.error('Database question API failed:', err);
      }
    } else {
      console.log('No LLM API available, using static questions');
    }
    
    // Fallback to static questions from enemy data
    return this.getStaticQuestion();
  }
  
  /**
   * Get a static question from the enemy's question pool
   */
  private getStaticQuestion(): QuizQuestion | null {
    if (!this.enemy.questions || this.enemy.questions.length === 0) {
      return null;
    }
    
    // Get the last asked question to avoid immediate repeats
    const lastAskedQuestion = this.askedQuestions.length > 0 
      ? this.askedQuestions[this.askedQuestions.length - 1] 
      : null;
    
    // Filter out already asked questions (across all battles)
    let availableQuestions = this.enemy.questions.filter(
      q => !this.askedQuestions.includes(q.question)
    );
    
    if (availableQuestions.length === 0) {
      // All questions for this enemy type have been asked
      // Clear the asked questions for this enemy type to allow them again
      console.log(`All ${this.enemy.questions.length} questions for ${this.enemy.displayName} have been asked. Resetting...`);
      
      // Remove this enemy's questions from the asked list to allow them again
      this.askedQuestions = this.askedQuestions.filter(
        q => !this.enemy.questions.some(eq => eq.question === q)
      );
      this.saveAskedQuestions();
      
      // After reset, all questions are available EXCEPT the last one asked (to avoid immediate repeat)
      availableQuestions = this.enemy.questions.filter(
        q => q.question !== lastAskedQuestion
      );
      
      // If only 1 question exists, we have to allow it even if it was just asked
      if (availableQuestions.length === 0) {
        availableQuestions = this.enemy.questions;
      }
    }
    
    // Pick a random question from available ones
    const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    
    return selectedQuestion;
  }
  
  /**
   * Use a fallback static question when LLM fails
   */
  private useFallbackQuestion() {
    const question = this.getStaticQuestion();
    
    if (!question) {
      console.error('No fallback questions available!');
      this.victory();
      return;
    }
    
    this.currentQuestion = question;
    this.askedQuestions.push(question.question);
    this.saveAskedQuestions(); // Persist across battles
    
    this.state = BattleState.SHOWING_QUESTION;
    this.questionText.setText(this.currentQuestion.question);
    this.showMessage('Choose your answer...');
    
    // Show answer buttons
    this.answerButtons.forEach(({ button, text }, index) => {
      text.setText(this.currentQuestion.answers[index]);
      button.setVisible(true);
      text.setVisible(true);
    });
    
    this.state = BattleState.WAITING_FOR_ANSWER;
  }
  
  /**
   * Simple delay helper for async operations
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private hideAnswerButtons() {
    this.answerButtons.forEach(({ button, text }) => {
      button.setVisible(false);
      text.setVisible(false);
    });
  }
  
  private selectAnswer(answerIndex: number) {
    this.state = BattleState.ANSWER_RESULT;
    this.hideAnswerButtons();
    
    const isCorrect = answerIndex === this.currentQuestion.correctIndex;
    
    // Mark question as answered in the database (async, don't wait)
    if (this.currentQuestionId && this.llmApi) {
      this.llmApi.markQuestionAnswered(this.currentQuestionId, isCorrect)
        .catch(err => console.warn('Failed to mark question as answered:', err));
    }
    
    if (isCorrect) {
      // Correct answer - damage enemy
      this.showMessage('Correct! Your knowledge prevails!');
      
      const damage = 30;
      this.enemyHP -= damage;
      
      // Show damage
      this.showDamageNumber(damage, this.enemySprite.x, this.enemySprite.y);
      
      // Enemy hit animation
      this.tweens.add({
        targets: this.enemySprite,
        x: this.enemySprite.x + 15,
        duration: 50,
        yoyo: true,
        repeat: 4,
        ease: 'Power2'
      });
      
      this.updateHPBars();
      
      this.time.delayedCall(1500, () => {
        if (this.enemyHP <= 0) {
          this.victory();
        } else {
          this.askQuestion();
        }
      });
    } else {
      // Wrong answer - player takes damage
      this.showMessage(`Wrong! The correct answer was: ${this.currentQuestion.answers[this.currentQuestion.correctIndex]}`);
      
      const damage = 20;
      this.playerStats.currentHP -= damage;
      this.registry.set('playerStats', this.playerStats);
      
      // Show damage
      this.showDamageNumber(damage, this.playerSprite.x, this.playerSprite.y);
      
      // Player hit animation
      this.tweens.add({
        targets: this.playerSprite,
        x: this.playerSprite.x - 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });
      
      this.updateHPBars();
      
      // Show damage taken in UI
      const uiScene = this.scene.get('UIScene') as any;
      if (uiScene && uiScene.showDamageTaken) {
        uiScene.showDamageTaken(damage);
      }
      
      this.time.delayedCall(2500, () => {
        if (this.playerStats.currentHP <= 0) {
          this.defeat();
        } else {
          this.askQuestion();
        }
      });
    }
  }
  
  private victory() {
    this.state = BattleState.VICTORY;
    this.hideAnswerButtons();
    
    // Enemy defeated animation
    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0,
      duration: 1000,
      ease: 'Power2'
    });
    
    this.showMessage(this.enemy.defeatText);
    
    this.time.delayedCall(2000, () => {
      // Award rewards
      this.playerStats.exp += this.enemy.expReward;
      this.playerStats.gold += this.enemy.goldReward;
      
      this.showMessage(`Victory! Gained ${this.enemy.expReward} XP and ${this.enemy.goldReward} gold!`);
      
      // Check for level up
      if (shouldLevelUp(this.playerStats)) {
        this.time.delayedCall(2000, () => this.handleLevelUp());
      } else {
        this.registry.set('playerStats', this.playerStats);
        this.time.delayedCall(2000, () => this.endBattle());
      }
    });
  }
  
  private handleLevelUp() {
    this.playerStats = levelUpStats(this.playerStats);
    this.registry.set('playerStats', this.playerStats);
    
    this.showMessage(`LEVEL UP! You are now level ${this.playerStats.level}!`);
    
    const uiScene = this.scene.get('UIScene') as any;
    if (uiScene && uiScene.showLevelUp) {
      uiScene.showLevelUp(this.playerStats.level);
    }
    
    this.time.delayedCall(3000, () => this.endBattle());
  }
  
  private defeat() {
    this.state = BattleState.DEFEAT;
    this.hideAnswerButtons();
    
    // Player defeated animation
    this.tweens.add({
      targets: this.playerSprite,
      alpha: 0,
      duration: 1000,
      ease: 'Power2'
    });
    
    this.showMessage('You were overwhelmed by their questions...');
    
    this.time.delayedCall(2000, () => {
      // Penalty
      this.playerStats.gold = Math.floor(this.playerStats.gold * 0.5);
      this.playerStats.currentHP = this.playerStats.maxHP; // Respawn with full HP
      this.registry.set('playerStats', this.playerStats);
      
      this.showMessage('You lost half your gold and retreated...');
      
      this.time.delayedCall(2000, () => this.endBattle());
    });
  }
  
  private endBattle() {
    console.log('BattleScene.endBattle() - Transitioning back to OfficeScene');
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      console.log('BattleScene - Starting OfficeScene with position:', this.returnPosition);
      // Mark this enemy as defeated in registry
      const defeatedEnemies = this.registry.get('defeatedEnemies') || [];
      defeatedEnemies.push(this.enemy.displayName);
      this.registry.set('defeatedEnemies', defeatedEnemies);
      
      // Start OfficeScene with spawn position (scene.start replaces current scene)
      this.scene.start('OfficeScene', {
        spawnPosition: this.returnPosition,
        currentZone: this.returnZone
      });
    });
  }
  
  private createRunAwayButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create button background
    const buttonBg = this.add.rectangle(0, 0, 120, 40, 0x660000, 0.9);
    buttonBg.setStrokeStyle(2, 0xFF0000);
    buttonBg.setInteractive({ useHandCursor: true });
    
    // Create button text
    const buttonText = this.add.text(0, 0, '🏃 RUN AWAY', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Create container and position it
    this.runAwayButton = this.add.container(width - 80, 30, [buttonBg, buttonText]);
    this.runAwayButton.setDepth(100);
    
    // Hover effects
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x990000, 1);
    });
    
    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x660000, 0.9);
    });
    
    // Click handler
    buttonBg.on('pointerdown', () => {
      this.runAway();
    });
  }
  
  private runAway() {
    // Can only run away during certain states
    if (this.state === BattleState.VICTORY || this.state === BattleState.DEFEAT) {
      return; // Already ending
    }
    
    this.state = BattleState.DEFEAT; // Prevent further actions
    this.hideAnswerButtons();
    this.runAwayButton.setVisible(false);
    
    this.showMessage('You ran away!');
    
    // Small gold penalty for running (10%)
    const goldLost = Math.floor(this.playerStats.gold * 0.1);
    if (goldLost > 0) {
      this.playerStats.gold -= goldLost;
      this.registry.set('playerStats', this.playerStats);
    }
    
    this.time.delayedCall(1000, () => {
      if (goldLost > 0) {
        this.showMessage(`Escaped! Lost ${goldLost} gold in the panic.`);
      } else {
        this.showMessage('You escaped safely!');
      }
      
      this.time.delayedCall(1500, () => {
        // Return to map - enemy respawns (not marked as defeated)
        // Offset spawn position to avoid landing on the same enemy
        const safePosition = {
          x: this.returnPosition.x + 60, // Move player 60px away
          y: this.returnPosition.y + 60
        };
        
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start('OfficeScene', {
            spawnPosition: safePosition,
            currentZone: this.returnZone
          });
        });
      });
    });
  }
  
  private updateHPBars() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Enemy HP
    this.enemyHPBar.clear();
    const enemyHPPercent = Math.max(0, this.enemyHP / this.enemy.maxHP);
    this.enemyHPBar.fillStyle(0xFF0000, 1);
    this.enemyHPBar.fillRoundedRect(width / 2 - 150, 240, 300 * enemyHPPercent, 20, 4);
    
    // Player HP
    this.playerHPBar.clear();
    const playerHPPercent = Math.max(0, this.playerStats.currentHP / this.playerStats.maxHP);
    this.playerHPBar.fillStyle(0x00FF00, 1);
    this.playerHPBar.fillRoundedRect(30, height - 80, 140 * playerHPPercent, 15, 4);
  }
  
  private showMessage(text: string) {
    this.messageText.setText(text);
  }
  
  private showDamageNumber(damage: number, x: number, y: number) {
    const damageText = this.add.text(x, y, `-${damage}`, {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#FF0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
  }
}
