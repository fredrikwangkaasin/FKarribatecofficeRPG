import { useAuth } from '@arribatec-sds/arribatec-nexus-react';
import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { Container, Box, CircularProgress, Typography, Button } from '@mui/material';
import config from '../game/config';
import { GameAPI } from '../utils/gameApi';

/**
 * GamePage - React wrapper for Phaser3 game
 * Handles authentication, game lifecycle, and auto-save
 */
function GamePage() {
  const { user, isAuthenticated, getToken } = useAuth();
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !containerRef.current) {
      return;
    }

    // Prevent double initialization in React Strict Mode
    if (gameRef.current) {
      return;
    }
    
    // Check if container already has a canvas (double mount protection)
    if (containerRef.current.querySelector('canvas')) {
      return;
    }

    initializeGame();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [isAuthenticated, user]);

  const initializeGame = async () => {
    try {
      const token = await getToken();
      
      if (!token) {
        setError('Failed to get authentication token');
        setLoading(false);
        return;
      }

      // Create Game API client
      const gameAPI = new GameAPI(token);

      // Configure Phaser game
      const gameConfig: Phaser.Types.Core.GameConfig = {
        ...config,
        parent: containerRef.current!,
        callbacks: {
          preBoot: (game) => {
            // Pass auth data to Phaser via registry
            game.registry.set('user', {
              id: user.id,
              username: user.username,
              email: user.email
            });
            game.registry.set('authToken', token);
            game.registry.set('gameAPI', gameAPI);
            
            // Initialize play time tracking
            game.registry.set('playTime', 0);
            
            // Track play time
            game.events.on('step', () => {
              const playTime = game.registry.get('playTime') || 0;
              game.registry.set('playTime', playTime + (1 / 60)); // Assuming 60 FPS
            });
          }
        }
      };

      // Create Phaser game
      gameRef.current = new Phaser.Game(gameConfig);
      
      // Setup auto-save (every 60 seconds)
      setupAutoSave(gameAPI);
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setError('Failed to initialize game. Please try again.');
      setLoading(false);
    }
  };

  const setupAutoSave = (gameAPI: GameAPI) => {
    // Auto-save every 60 seconds
    autoSaveIntervalRef.current = setInterval(() => {
      if (gameRef.current) {
        const registry = gameRef.current.registry;
        
        try {
          const playerStats = registry.get('playerStats');
          const defeatedBosses = registry.get('defeatedBosses');
          const playTime = Math.floor(registry.get('playTime') || 0);
          
          // Get current position from active scene
          const activeScene = gameRef.current.scene.getScene('OfficeScene');
          if (activeScene && (activeScene as any).player) {
            const player = (activeScene as any).player;
            
            gameAPI.saveGame({
              position: { x: player.x, y: player.y },
              currentZone: (activeScene as any).currentZone || 'lobby',
              playerStats,
              defeatedBosses,
              playTime
            }).catch(err => {
              console.error('Auto-save failed:', err);
            });
          }
        } catch (err) {
          console.error('Failed to gather game state for auto-save:', err);
        }
      }
    }, 60000); // 60 seconds
  };

  const cleanup = () => {
    // Clear auto-save interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }

    // Destroy Phaser game
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
  };

  const handleResetGame = async () => {
    if (confirm('Are you sure you want to reset your game? All progress will be lost!')) {
      try {
        const token = await getToken();
        if (token) {
          const gameAPI = new GameAPI(token);
          await gameAPI.resetGame();
          
          // Restart game
          cleanup();
          setLoading(true);
          setTimeout(() => initializeGame(), 500);
        }
      } catch (err) {
        console.error('Failed to reset game:', err);
        alert('Failed to reset game. Please try again.');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Authentication Required
        </Typography>
        <Typography color="text.secondary">
          Please log in to play the game.
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom color="error">
          Error
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth={false} 
      disableGutters
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#000',
        overflow: 'hidden'
      }}
    >
      {/* Game controls bar */}
      <Box 
        sx={{ 
          bgcolor: '#0066CC',
          color: 'white',
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000
        }}
      >
        <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          Arribatec Office RPG
        </Typography>
        <Box>
          <Typography variant="body2" component="span" sx={{ mr: 2 }}>
            Player: {user.username}
          </Typography>
          <Button 
            size="small" 
            variant="outlined" 
            sx={{ color: 'white', borderColor: 'white', mr: 1 }}
            onClick={handleResetGame}
          >
            Reset Game
          </Button>
        </Box>
      </Box>

      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 999
          }}
        >
          <CircularProgress size={60} sx={{ color: '#0066CC' }} />
          <Typography 
            variant="h6" 
            sx={{ mt: 2, color: 'white', fontFamily: 'monospace' }}
          >
            Loading Game...
          </Typography>
        </Box>
      )}

      {/* Phaser game container */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#000',
          '& canvas': {
            display: 'block',
            margin: '0 auto'
          }
        }}
      />

      {/* Controls info */}
      <Box 
        sx={{ 
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          p: 1,
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}
      >
        Controls: Arrow Keys = Move | E = Interact (Break Room, Boss Doors) | Click = Battle Actions
      </Box>
    </Container>
  );
}

export default GamePage;
