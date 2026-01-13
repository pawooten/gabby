import Star from './star';

// Mock Phaser
jest.mock('phaser', () => ({
  Physics: {
    Arcade: {
      Sprite: jest.fn(),
      Body: jest.fn()
    }
  }
}));

describe('Star', () => {
  let mockScene: any;
  let mockSprite: any;
  let mockBody: any;
  let updateCallback: Function | null = null;

  beforeEach(() => {
    updateCallback = null;
    mockBody = {
      setAllowGravity: jest.fn(),
      setVelocityX: jest.fn(),
      setVelocityY: jest.fn(),
      setBounce: jest.fn(),
      setCollideWorldBounds: jest.fn(),
      velocity: { x: -50, y: 0 }
    };

    mockSprite = {
      body: mockBody,
      setScale: jest.fn().mockReturnThis(),
      x: 100,
      y: 200,
      angle: 0
    };

    mockScene = {
      physics: {
        add: {
          sprite: jest.fn().mockReturnValue(mockSprite)
        }
      },
      events: {
        on: jest.fn((event: string, callback: Function) => {
          if (event === 'update') {
            updateCallback = callback;
          }
        })
      }
    };
  });

  describe('constructor', () => {
    it('should create a star at the specified position', () => {
      const star = new Star(mockScene, 100, 200);

      expect(mockScene.physics.add.sprite).toHaveBeenCalledWith(100, 200, 'silver-star');
    });

    it('should use custom texture when provided', () => {
      const star = new Star(mockScene, 100, 200, 'gold-star');

      expect(mockScene.physics.add.sprite).toHaveBeenCalledWith(100, 200, 'gold-star');
    });

    it('should configure physics properties', () => {
      const star = new Star(mockScene, 100, 200);

      expect(mockSprite.setScale).toHaveBeenCalledWith(0.5);
      expect(mockBody.setAllowGravity).toHaveBeenCalledWith(false);
      expect(mockBody.setVelocityX).toHaveBeenCalledWith(-50);
      expect(mockBody.setBounce).toHaveBeenCalledWith(1, 1);
      expect(mockBody.setCollideWorldBounds).toHaveBeenCalledWith(false);
    });

    it('should register update callback', () => {
      const star = new Star(mockScene, 100, 200);

      expect(mockScene.events.on).toHaveBeenCalledWith('update', expect.any(Function));
    });
  });

  describe('getStartPosition', () => {
    it('should return the starting position', () => {
      const star = new Star(mockScene, 100, 200);
      const position = star.getStartPosition();

      expect(position).toEqual({ x: 100, y: 200 });
    });
  });

  describe('getSprite', () => {
    it('should return the sprite object', () => {
      const star = new Star(mockScene, 100, 200);
      const sprite = star.getSprite();

      expect(sprite).toBe(mockSprite);
    });
  });

  describe('rotation', () => {
    it('should rotate clockwise on update', () => {
      const star = new Star(mockScene, 100, 200);
      const initialAngle = mockSprite.angle;

      if (updateCallback) {
        updateCallback();
        expect(mockSprite.angle).toBe(initialAngle + 2);
      }
    });

    it('should continuously rotate', () => {
      const star = new Star(mockScene, 100, 200);
      mockSprite.angle = 0;

      if (updateCallback) {
        updateCallback();
        expect(mockSprite.angle).toBe(2);

        updateCallback();
        expect(mockSprite.angle).toBe(4);

        updateCallback();
        expect(mockSprite.angle).toBe(6);
      }
    });
  });

  describe('bounce boundaries', () => {
    it('should reverse X velocity when reaching left boundary', () => {
      const star = new Star(mockScene, 100, 200);
      mockSprite.x = -1; // 100 - 101 = -1 (beyond left boundary)
      mockBody.velocity.x = -50;

      if (updateCallback) {
        updateCallback();
        expect(mockSprite.x).toBe(0); // 100 - 100 = 0 (at boundary)
        expect(mockBody.setVelocityX).toHaveBeenCalledWith(50); // Reversed
      }
    });

    it('should reverse X velocity when reaching right boundary', () => {
      const star = new Star(mockScene, 100, 200);
      mockSprite.x = 201; // 100 + 101 = 201 (beyond right boundary)
      mockBody.velocity.x = 50;

      if (updateCallback) {
        updateCallback();
        expect(mockSprite.x).toBe(200); // 100 + 100 = 200 (at boundary)
        expect(mockBody.setVelocityX).toHaveBeenCalledWith(-50); // Reversed
      }
    });

    it('should reverse Y velocity when reaching top boundary', () => {
      const star = new Star(mockScene, 100, 200);
      mockSprite.y = 99; // 200 - 101 = 99 (beyond top boundary)
      mockBody.velocity.y = -50;

      if (updateCallback) {
        updateCallback();
        expect(mockSprite.y).toBe(100); // 200 - 100 = 100 (at boundary)
        expect(mockBody.setVelocityY).toHaveBeenCalledWith(50); // Reversed
      }
    });

    it('should reverse Y velocity when reaching bottom boundary', () => {
      const star = new Star(mockScene, 100, 200);
      mockSprite.y = 301; // 200 + 101 = 301 (beyond bottom boundary)
      mockBody.velocity.y = 50;

      if (updateCallback) {
        updateCallback();
        expect(mockSprite.y).toBe(300); // 200 + 100 = 300 (at boundary)
        expect(mockBody.setVelocityY).toHaveBeenCalledWith(-50); // Reversed
      }
    });
  });
});
