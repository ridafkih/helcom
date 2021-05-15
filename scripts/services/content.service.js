import PostModule from "../modules/post.module.js";

/**
 * Content Management Service
 */
export default class ContentService {
  caption = "";
  captionPreview = document.querySelector(".post-preview .caption");
  _input = document.querySelector("#contentInput");
  _modalManager;

  /**
   * @param {ModalManager} modalManager - Corresponding modal manager.
   */
  constructor(modalManager) {
    this._modalManager = modalManager;

    this._input.addEventListener("paste", (ev) => {
      ev.preventDefault();
      let text = "";
      if (ev.clipboardData) {
        text = ev.clipboardData.getData("text/plain");
      } else if (window.clipboardData) {
        text = window.clipboardData.getData("Text");
      }

      const insertTextSupported = document.queryCommandSupported("insertText");
      const command = insertTextSupported ? "insertText" : "paste";
      document.execCommand(command, false, text);
    });

    this._input.addEventListener("input", (ev) => {
      this.setCaption(ev.target.textContent);
    });
  }

  registerSwipeEvents() {
    let startPosition,
      touchHistory = [];
    const previewModal = document.querySelector("#previewPost");

    previewModal.addEventListener(
      "touchstart",
      (ev) => {
        previewModal.classList.add("dragging");
        const [{ clientY }] = ev.touches;
        startPosition = clientY;

        touchHistory = [];
      },
      { passive: true }
    );

    previewModal.addEventListener(
      "touchmove",
      (ev) => {
        const [{ clientY }] = ev.touches;
        const delta = clientY - startPosition;

        touchHistory.push(delta);
        if (touchHistory.length > 10) touchHistory.shift();

        previewModal.style.transform = `translateY(${delta}px)`;
      },
      { passive: true }
    );

    previewModal.addEventListener("touchend", () => {
      const momentum = calculateMomentum(touchHistory);
      const threshold = 15;

      let delay = 320;
      let targetPosition, completionTask;

      if (momentum > threshold) {
        targetPosition = "100vh";
        completionTask = () => this._modalManager.activate("createPost");
      } else if (momentum < -threshold) {
        targetPosition = "-100vh";
        completionTask = () => {
          this.publish();
          this._modalManager.close();
        };
      } else {
        targetPosition = "0";
        delay = 0;
      }

      previewModal.classList.remove("dragging");
      previewModal.style.transform = `translateY(${targetPosition})`;

      setTimeout(() => {
        previewModal.style.transform = `translateY(0)`;
        if (completionTask) completionTask();
      }, delay);

      touchHistory = [];
    });
  }

  setCaption(text = "") {
    this.captionPreview.textContent = text;
    this.caption = text;
  }

  publish() {
    const post = new PostModule();

    this.reset();
  }

  reset() {
    this._input.textContent = "";
    this.setCaption();
  }
}

function calculateMomentum(history = touchHistory) {
  const momentum =
    history
      .map((delta, index) => {
        return delta - history[index - 1];
      })
      .slice(1)
      .reduce((a, b) => a + b, 0) / history.length;
  return momentum || 0;
}
