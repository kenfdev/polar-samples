actor User {}

allow(actor, action, resource) if
  has_permission(actor, action, resource);

resource Item {}

has_permission(_actor: User, "read", _item: Item{acl: acl}) if
  acl = "read_item";