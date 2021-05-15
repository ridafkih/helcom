export default class ModalService {
  _element = document.getElementById("modalsContainer");
  _events = [
    {
      event: "click",
      element: document.getElementById("upload"),
      res: () => this.activate("createPost"),
    },
    {
      event: "click",
      element: document.getElementById("preview"),
      res: () => this.activate("previewPost"),
    },
  ]

  constructor() {
    const closers = document.getElementsByClassName("modal-close"),
					closersArray = Array.from(closers);

    this._element.addEventListener("click", (ev) => {
      if (this._element.isEqualNode(ev.target)) this.close();
    });

    closersArray.forEach((closerNode) => {
      closerNode.addEventListener("click", () => this.close());
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
    const modals = document.getElementsByClassName("modal");
    const modalsArray = Array.from(modals);
    document.body.classList.remove("no-overflow");

    this._element.classList.remove("active");
    modalsArray.forEach((modalNode) => {
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