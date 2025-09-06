// legacy single
await createTopUpRequest(user.uid, {
  userEmail: user.email,
  userName: user.displayName,
  hours,
  amountIDR: total,
  grams, material, color,
  note,
});

// new multi
await createTopUpRequest(user.uid, {
  userEmail: user.email,
  userName: user.displayName,
  hours,
  amountIDR: total,
  items, // FilamentItem[]
  note,
});
