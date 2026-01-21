export async function loadUser(id) {
  return {
    id,
    name: id === '42' ? 'Ada Lovelace' : 'Guest User',
  };
}

export async function loadTeam() {
  return {
    name: 'Design Systems',
    members: 5,
  };
}

export function enrichWithFlags(data) {
  return {
    flags: ['beta', 'priority'],
    summary: `${data.name} (#${data.id ?? 'team'})`,
  };
}
