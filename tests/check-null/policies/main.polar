actor User {}

allow(actor, action, resource) if
  has_permission(actor, action, resource);

resource Item {
  permissions = ["read"];
}

has_permission(_actor: User, "read", item: Item) if
  item.locked = nil;