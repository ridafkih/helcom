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
	captionPreview = document.querySelector('.post-preview .caption');
	_input = document.getElementById("contentInput");

	constructor() {
		this._input.addEventListener("input", (ev) => {
			this.setCaption(ev.target.textContent);
		})
	}

	setCaption(text = "") {
		this.captionPreview.textContent = text;
		this.caption = text;
	}

	reset() {
		this._input.textContent = "";
		this.setCaption();
	}
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

// Post Preview Drag Logic

let startPosition;
let touchHistory = [];

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
  let targetPosition;
  let completionTask;

  if (momentum > threshold) {
    targetPosition = "100vh";
    completionTask = () => modals.activate("createPost");
  } else if (momentum < -threshold) {
    targetPosition = "-100vh";
    completionTask = () => {
      publish();
      modals.close();
    };
  } else {
    delay = 0;
    targetPosition = "0";
  }

  previewModal.classList.remove("dragging");
  previewModal.style.transform = `translateY(${targetPosition})`;

  setTimeout(() => {
    previewModal.style.transform = `translateY(0)`;
    if (completionTask)
			completionTask();
  }, delay);

  touchHistory = [];
});

function publish() {
  console.log("Publish Complete!");
	content.reset();
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
