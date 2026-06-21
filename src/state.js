function createEntry({ article, l, w, h, weightKg, eaPerBox }) {
  return {
    id: crypto.randomUUID(),
    article,
    l,
    w,
    h,
    weightKg,
    eaPerBox,
  };
}

export const state = {
  entries: [],
  currentScreen: 'scan',
  draftEntry: {},
};

export function addEntry(data) {
  state.entries.push(createEntry(data));
}

export function deleteEntry(id) {
  state.entries = state.entries.filter((e) => e.id !== id);
}

export function resetDraft() {
  state.draftEntry = {};
}

export function setScreen(screen) {
  state.currentScreen = screen;
}
