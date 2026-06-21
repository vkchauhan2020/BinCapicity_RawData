import { state, addEntry, resetDraft, setScreen } from './state.js';
import {
  renderScanScreen,
  renderDimensionsScreen,
  renderWeightQtyScreen,
  renderListScreen,
} from './ui/screens.js';

let root;

export function initApp(rootElement) {
  root = rootElement;
  render();
}

function goTo(screen) {
  setScreen(screen);
  render();
}

function render() {
  switch (state.currentScreen) {
    case 'scan':
      renderScanScreen(root, {
        onScanned: (article) => {
          state.draftEntry.article = article;
          goTo('dimensions');
        },
      });
      break;
    case 'dimensions':
      renderDimensionsScreen(root, {
        onMeasured: ({ l, w, h }) => {
          state.draftEntry.l = l;
          state.draftEntry.w = w;
          state.draftEntry.h = h;
          goTo('weightQty');
        },
      });
      break;
    case 'weightQty':
      renderWeightQtyScreen(root, {
        onSubmit: ({ weightKg, eaPerBox }) => {
          addEntry({
            article: state.draftEntry.article,
            l: state.draftEntry.l,
            w: state.draftEntry.w,
            h: state.draftEntry.h,
            weightKg,
            eaPerBox,
          });
          resetDraft();
          goTo('list');
        },
      });
      break;
    case 'list':
      renderListScreen(root, {
        onAddAnother: () => {
          resetDraft();
          goTo('scan');
        },
      });
      break;
  }
}
