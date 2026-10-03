export const OPEN_SIGN_IN_MODAL_EVENT = 'rentpe:open-sign-in-modal';

export const openSignInModal = () => {
  window.dispatchEvent(new Event(OPEN_SIGN_IN_MODAL_EVENT));
};
