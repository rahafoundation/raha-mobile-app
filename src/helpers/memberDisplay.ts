import { Member } from "../store/reducers/members";

export function getMemberColor(invitedMember: Member) {
  const hue =
    invitedMember.memberId
      .split("")
      .map(x => x.charCodeAt(0))
      .reduce((a, b) => a + b, 0) % 360;
  return `hsl(${hue}, 100%, 80%)`;
}

export function getInitialsForName(name: string): string {
  const initials = name.split(" ").map(part => part.charAt(0).toUpperCase());
  return initials[0] + initials[initials.length - 1];
}
