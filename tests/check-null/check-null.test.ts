import { Oso } from 'oso';
import * as path from 'path';

class User {}

class Item {
  locked: boolean | null;
  constructor(props: { locked: boolean | null }) {
    this.locked = props.locked;
  }
}

describe('Check if null', () => {
  let oso: Oso;

  beforeEach(async () => {
    oso = new Oso();
    oso.registerClass(User);
    oso.registerClass(Item);
    await oso.loadFiles([path.join(__dirname, 'policies', 'main.polar')]);
  });

  it('should not throw error if locked is null on Item', async () => {
    // Arrange
    const user = new User();
    const item = new Item({ locked: null });

    // Act & Assert
    await expect(oso.authorize(user, 'read', item)).resolves.toBeUndefined();
  });

  it('should throw error if locked is true on Item', async () => {
    // Arrange
    const user = new User();
    const item = new Item({ locked: true });

    // Act & Assert
    await expect(oso.authorize(user, 'read', item)).rejects.toThrow();
  });
});
