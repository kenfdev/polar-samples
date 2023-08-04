import { Oso } from "oso";
import * as path from "path";

class User {
  public readonly id: string;
  public readonly isAdmin: boolean;
  constructor(id: string, props: { isAdmin: boolean } = { isAdmin: false }) {
    this.id = id;
    this.isAdmin = props.isAdmin;
  }
}

class Organization {
  public readonly events: Event[];
  constructor() {
    this.events = [];
  }

  addEvent(e: Event) {
    this.events.push(e);
  }
}

class Event {
  public readonly id: string;
  public readonly ownerUserId: string;
  public readonly organization: Organization;
  constructor(
    id: string,
    props: { organization: Organization; ownerUserId: string }
  ) {
    this.organization = props.organization;
    this.ownerUserId = props.ownerUserId;
  }
}

describe("Check bidirectional resource relation", () => {
  let oso: Oso;

  beforeEach(async () => {
    oso = new Oso();
    oso.registerClass(User);
    oso.registerClass(Organization);
    oso.registerClass(Event);
    await oso.loadFiles([path.join(__dirname, "policies", "main.polar")]);
  });

  describe("Organization resource", () => {
    describe("Organization admin user", () => {
      it.each(["read", "delete", "event.create"])(
        "should be able to do action: %s",
        async (action) => {
          // Arrange
          const user = new User("user-1", { isAdmin: true });
          const org = new Organization();

          // Act
          const result = await oso.isAllowed(user, action, org);

          expect(result).toBe(true);
        }
      );
    });

    describe("Event admin", () => {
      it.each`
        action            | expectedResult
        ${"read"}         | ${true}
        ${"delete"}       | ${false}
        ${"event.create"} | ${false}
      `(
        "should have viewer role on Organization and result should be $expectedResult when action is $action",
        async ({ action, expectedResult }) => {
          // Arrange
          const user = new User("user-1", { isAdmin: false });
          const org = new Organization();
          const event = new Event("event-1", {
            organization: org,
            ownerUserId: user.id,
          });
          org.addEvent(event);

          // Act
          const result = await oso.isAllowed(user, action, org);

          expect(result).toBe(expectedResult);
        }
      );

      it("should not have any permission if the event is not related to the organization", async () => {
        // Arrange
        const user = new User("user-1", { isAdmin: false });
        const org = new Organization();
        const event = new Event("event-1", {
          organization: org,
          ownerUserId: user.id,
        });
        org.addEvent(event);

        const otherOrg = new Organization();

        // Act
        for (const action of ["read", "delete", "event.create"]) {
          const result = await oso.isAllowed(user, action, otherOrg);

          // Assert
          expect(result).toBe(false);
        }
      });
    });

    describe("Event viewer", () => {
      it.each`
        action            | expectedResult
        ${"read"}         | ${false}
        ${"delete"}       | ${false}
        ${"event.create"} | ${false}
      `(
        "should not have any permission for Organization",
        async ({ action, expectedResult }) => {
          // Arrange
          const eventAdminUser = new User("user-1", { isAdmin: false });
          const org = new Organization();
          const event = new Event("event-1", {
            organization: org,
            ownerUserId: eventAdminUser.id,
          });
          org.addEvent(event);

          const otherUser = new User("user-2", { isAdmin: false });

          // Act
          const result = await oso.isAllowed(otherUser, action, org);

          expect(result).toBe(expectedResult);
        }
      );
    });
  });
});
