import Coin from './coin';

// Mock Phaser
jest.mock('phaser', () => ({
  GameObjects: {
    Image: jest.fn()
  }
}));

describe('Coin', () => {
  let mockScene: any;
  let mockSprite: any;
  let updateCallback: Function | null = null;

  beforeEach(() => {
    updateCallback = null;
    mockSprite = {
      setScale: jest.fn()
    };

    mockScene = {
      add: {
        image: jest.fn().mockReturnValue(mockSprite)
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
    it('should create a coin at the specified position', () => {
      const coin = new Coin(mockScene, 100, 200);

      expect(mockScene.add.image).toHaveBeenCalledWith(100, 200, 'silver-coin');
    });

    it('should use custom texture when provided', () => {
      const coin = new Coin(mockScene, 100, 200, 'gold-coin');

      expect(mockScene.add.image).toHaveBeenCalledWith(100, 200, 'gold-coin');
    });

    it('should register update callback', () => {
      const coin = new Coin(mockScene, 100, 200);

      expect(mockScene.events.on).toHaveBeenCalledWith('update', expect.any(Function));
    });
  });

  describe('getPosition', () => {
    it('should return the coin position', () => {
      const coin = new Coin(mockScene, 100, 200);
      const position = coin.getPosition();

      expect(position).toEqual({ x: 100, y: 200 });
    });
  });

  describe('getSprite', () => {
    it('should return the sprite object', () => {
      const coin = new Coin(mockScene, 100, 200);
      const sprite = coin.getSprite();

      expect(sprite).toBe(mockSprite);
    });
  });

  describe('rotation animation', () => {
    it('should scale sprite on update', () => {
      const coin = new Coin(mockScene, 100, 200);

      if (updateCallback) {
        updateCallback();
        expect(mockSprite.setScale).toHaveBeenCalled();
      }
    });

    it('should maintain minimum scale of 0.2', () => {
      const coin = new Coin(mockScene, 100, 200);

      // Call update multiple times to test different rotation angles
      for (let i = 0; i < 100; i++) {
        if (updateCallback) {
          updateCallback();
        }
      }

      // Check that all scale calls have x-scale >= 0.2
      const calls = mockSprite.setScale.mock.calls;
      calls.forEach((call: any[]) => {
        expect(call[0]).toBeGreaterThanOrEqual(0.2);
        expect(call[0]).toBeLessThanOrEqual(1);
        expect(call[1]).toBe(1); // Y scale should always be 1
      });
    });
  });
});
