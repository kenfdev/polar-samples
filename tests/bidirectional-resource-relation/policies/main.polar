allow(actor, action, resource) if has_permission(actor, action, resource);

actor User {}

resource Organization {
  roles = ["admin", "viewer"];
  permissions = ["read", "delete", "event.create"];

  relations = {
    events: Event
  };

  # roles
  "viewer" if "admin" on "events";
  
  # permissions
  ## admin
  "read" if "admin";
  "delete" if "admin";
  "event.create" if "admin";

  ## viewer
  "read" if "viewer";
}

has_relation(event: Event, "events", organization: Organization) if
  event in organization.events;

has_role(user: User, "admin", _: Organization) if
  user.isAdmin;

resource Event {
  roles = ["admin", "viewer"];
  permissions = ["read", "delete"];

  relations = {
      organization: Organization
  };

  # roles
  "admin" if "admin" on "organization";

  # permissions
  ## admin
  "read" if "admin";
  "delete" if "admin";
  
  ## viewer
  "read" if "viewer";
}

has_relation(organization: Organization, "organization", event: Event) if
  event.organization = organization;

has_role(user: User, "admin", event: Event) if
  event.ownerUserId = user.id;
