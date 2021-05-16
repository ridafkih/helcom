import PostModule from "../modules/post.module.js";
import { createElement } from "./dom.service.js";

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

  /**
   * Activate file uploading for a file input element.
   * @param {Function} callback - Callback function that takes list of files as parameter.
   */
  registerFileUpload() {
    const label = document.querySelector("label.attach");
    const container = document.querySelector(".attachments-container");
    const node = document.querySelector("input[type=\"file\"]");
    node.addEventListener("change", function () {
      const { files } = this;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        const imageContainer = createElement("div", null, "attachment");
        const image = createElement("img");
        image.src = URL.createObjectURL(file);
        imageContainer.appendChild(image)

        container.insertBefore(imageContainer, label);
      }
    }, false);
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
    const post = new PostModule()
      .setAuthor("Helcim Team", "@helcim")
      .setDate()
      .setCaption(this.caption);

    post.bindToTimeline();

    this.reset();
  }

  reset() {
    this._input.textContent = "";
    this.setCaption();
  }
}

export function registerTimelinePosts() {
  const posts = Array.from(document.querySelectorAll('post-element'));
  posts.forEach(new PostModule().importFromNode);
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
