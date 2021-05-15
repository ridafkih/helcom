class ModalManager {
  _element = document.getElementById("modalsContainer");

  constructor() {
    const closers = document.getElementsByClassName("modal-close");
    const closersArray = Array.from(closers);

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
}

class ErrorManager {
  /**
   * Display an error to the developer, and the user if desired.
   * @param {string} message - The message to display in the console & for the user.
   * @param {boolean} display - Whether or not you would like the user to see the error.
   */
  log(message, display) {
    console.warn(message);
    if (display) this.display(message);
  }

  /**
   * Display an error message for the user.
   * @param {string} message - The message to display in the console & for the user.
   */
  display(message) {
    // ...
  }
}

class ContentManager {
  caption = "";
  captionPreview = document.querySelector(".post-preview .caption");
  _input = document.getElementById("contentInput");

  constructor() {
    this._input.addEventListener("input", (ev) => {
      this.setCaption(ev.target.textContent);
    });
  }

  setCaption(text = "") {
    this.captionPreview.textContent = text;
    this.caption = text;
  }

  publish() {
    this.reset();
  }

  reset() {
    this._input.textContent = "";
    this.setCaption();
  }
}

class FeedPost {
  constructor() {
    this.images = [];
    this.posted = new Date();
    this.caption = "";

    this.reactions = {
      likes: 0,
      comments: 0,
      shares: 0,
    };
  }

  /**
   * Return the caption node with resizing.
   * @param {number} cutoff - The text limit.
   * @returns {HTMLDivElement} - The caption node.
   */
  parseCaption = (cutoff = 240) => {
    const paragraph = createElement("p", null, "caption");

    const head = this.caption.substr(0, cutoff),
      		tail = this.caption.substr(cutoff);

    const preview = createElement("span", head, "preview");
    paragraph.appendChild(preview);

    if (tail) {
      const ellipses = createElement("span", "...", "ellipses"),
        		hidden = createElement("span", tail, "hidden");
      paragraph.append(ellipses, hidden);
    }

    return paragraph;
  }

  /**
   * Import FeedPost data from a node.
   * @param {HTMLElement} node - The node element.
	 * @returns {FeedPost} - The resulting feed post.
   */
  importFromNode = (node) => {
		const { posted } = node.dataset;

    this.images = Array.from(node.querySelectorAll(".cover-container img")).map(
      ({ src }) => src
    );
		this.posted = new Date(parseInt(posted));

		const captionElement = node.querySelector(".caption");
    this.caption = captionElement.textContent;
		registerCollapseToggle(captionElement);

    this.reactions = getActionsCount(node);
		return this;
  }
}

/**
 * Register an event emitter that allows a paragraph element to collapse.
 * @param {HTMLParagraphElement} element - The collapsable paragraph element.
 */
function registerCollapseToggle(element) {
  if (element.children.length <= 1) return;
  element.addEventListener("click", () => {
    element.classList.toggle("collapsed");
  });
}

/**
 *
 * @param {string} tag - The HTML tag.
 * @param {string} textContent - Text content of the node.
 * @param  {...string} classNames - Spread classList.
 * @returns {HTMLElement} - The HTML Element.
 */
function createElement(tag, textContent, ...classNames) {
  const element = document.createElement(tag);
  element.classList.add(classNames);
  if (textContent) element.textContent = textContent;
  return element;
}

function getActionsCount(parentNode) {
  const likes = parseInt(getActionCount(parentNode, "like")) || 0,
    comments = parseInt(getActionCount(parentNode, "comment")) || 0;
  shares = parseInt(getActionCount(parentNode, "share")) || 0;

  return { likes, comments, shares };
}

function getActionCount(node, className) {
  return node.querySelector(`.action.${className}`).dataset.count;
}

const error = new ErrorManager();
const modals = new ModalManager();
const content = new ContentManager();

const events = [
  {
    event: "click",
    element: document.getElementById("upload"),
    res: () => modals.activate("createPost"),
  },
  {
    event: "click",
    element: document.getElementById("preview"),
    res: () => modals.activate("previewPost"),
  },
];

events.forEach(({ event, element, res }) => {
  element.addEventListener(event, res);
});

const postElements = Array.from(document.querySelectorAll('.post')),
			posts = postElements.map(new FeedPost().importFromNode);

console.log(posts);

// Post Preview Drag Logic

let startPosition, touchHistory = [];
const previewModal = document.getElementById("previewPost");

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
    completionTask = () => modals.activate("createPost");
  } else if (momentum < -threshold) {
    targetPosition = "-100vh";
    completionTask = () => {
      content.publish();
      modals.close();
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