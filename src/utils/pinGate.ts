let unlockedThisSession = false;

export function isPinUnlockedThisSession(): boolean {
  return unlockedThisSession;
}

export function markPinUnlockedThisSession(): void {
  unlockedThisSession = true;
}

export function resetPinUnlockedThisSession(): void {
  unlockedThisSession = false;
}

