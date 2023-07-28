import { Oso } from 'oso';
import * as path from 'path';

class User {}
class Item {
  acl?: string;
  constructor(props?: { acl: string }) {
    if (props?.acl) {
      // set acl only if it is passed
      this.acl = props.acl;
    }
  }
}

describe('Check if attribute exists', () => {
  let oso: Oso;

  beforeEach(async () => {
    oso = new Oso();
    oso.registerClass(User);
    oso.registerClass(Item);
    await oso.loadFiles([path.join(__dirname, 'policies', 'main.polar')]);
  });

  it('should not throw error if acl is read_item', async () => {
    // Arrange
    const user = new User();
    const itemWithAcl = new Item({ acl: 'read_item' });

    // Act & Assert
    await expect(
      oso.authorize(user, 'read', itemWithAcl)
    ).resolves.toBeUndefined();
  });

  it('should throw error if acl is not read_item', async () => {
    // Arrange
    const user = new User();
    const itemWithAcl = new Item({ acl: 'invalid_acl' });

    // Act & Assert
    await expect(oso.authorize(user, 'read', itemWithAcl)).rejects.toThrow();
  });

  it('should throw error if acl property does not exist', async () => {
    // Arrange
    const user = new User();
    const itemWithAcl = new Item();

    // Act & Assert
    await expect(oso.authorize(user, 'read', itemWithAcl)).rejects.toThrow();
  });
});
