export default class ModalService {
  _element = document.querySelector("#modalsContainer");
  _events = [
    {
      event: "click",
      element: document.querySelector("#upload"),
      res: () => this.activate("createPost"),
    },
    {
      event: "click",
      element: document.querySelector("#preview"),
      res: () => this.activate("previewPost"),
    },
  ];

  constructor() {
    const closers = Array.from(document.querySelectorAll(".modal-close"));

    this._element.addEventListener("click", (ev) => {
      if (this._element.isEqualNode(ev.target)) this.close();
    });

    closers.forEach((closer) => {
      closer.addEventListener("click", () => this.close());
    });
  }

  /**
   * Display a modal for the user.
   * @param {string} id - The ID of the modal to displays.
   */
  activate(id) {
    this.close();
    const modal = document.getElementById(id);
    document.body.classList.add("no-overflow");
    if (!modal) return error.log("Modal does not exist.");
    this._element.classList.add("active");
    modal.classList.add("modal-active");
  }

  /**
   * Close all modals and the modal container.
   */
  close() {
    const modals = Array.from(document.querySelectorAll(".modal"));
    document.body.classList.remove("no-overflow");

    this._element.classList.remove("active");
    modals.forEach((modalNode) => {
      modalNode.classList.remove("modal-active");
    });
  }

  /**
   * Register the modals & their event listeners.
   * @returns {ModalService} - Returns the active modal service.
   */
  register() {
    this._events.forEach(({ event, element, res }) => {
      element.addEventListener(event, res);
    });
    return this;
  }
}
