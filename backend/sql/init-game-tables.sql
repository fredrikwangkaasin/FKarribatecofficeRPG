-- GameStates table for Arribatec Office RPG
-- Stores player game state with tenant isolation

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GameStates')
BEGIN
    CREATE TABLE GameStates (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        TenantId NVARCHAR(50) NOT NULL,
        UserId NVARCHAR(100) NOT NULL,
        
        -- Player position
        PositionX INT NOT NULL DEFAULT 400,
        PositionY INT NOT NULL DEFAULT 300,
        CurrentZone NVARCHAR(50) NOT NULL DEFAULT 'lobby',
        
        -- Player stats
        Level INT NOT NULL DEFAULT 1,
        Exp INT NOT NULL DEFAULT 0,
        Gold INT NOT NULL DEFAULT 0,
        CurrentHP INT NOT NULL DEFAULT 100,
        MaxHP INT NOT NULL DEFAULT 100,
        Logic INT NOT NULL DEFAULT 10,
        Resilience INT NOT NULL DEFAULT 8,
        Charisma INT NOT NULL DEFAULT 7,
        
        -- Progress tracking
        DefeatedBosses NVARCHAR(MAX) NOT NULL DEFAULT '[]', -- JSON array of boss IDs
        
        -- Metadata
        PlayTime INT DEFAULT 0, -- Total play time in seconds
        LastSaved DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT UK_GameStates_TenantUser UNIQUE (TenantId, UserId)
    );
    
    CREATE INDEX IX_GameStates_TenantId ON GameStates(TenantId);
    CREATE INDEX IX_GameStates_UserId ON GameStates(UserId);
    
    PRINT 'GameStates table created successfully';
END
ELSE
BEGIN
    PRINT 'GameStates table already exists';
END
GO
