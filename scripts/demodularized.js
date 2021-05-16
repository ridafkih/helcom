
const template = document.querySelector("#postTemplate");

/**
 * A timeline post module.
 */
class PostModule extends HTMLElement {
  userPosted = false;
  rendered = false;
  author = {
    fullName: null,
    handle: null,
    avatar: null,
  };

  images = [];
  postedDate = new Date();
  caption = "";

  liked = false;
  reactions = {
    likes: 0,
    comments: 0,
    shares: 0,
  };

  _nodeImport;
  _dateInterval;

  /**
   * @param {HTMLElement} nodeImport
   * 	- The pre-existing dom element to register
   */
  constructor(nodeImport) {
    super();
    this._nodeImport = nodeImport;
  }

  connectedCallback() {
    if (this._nodeImport) this.importFromNode(this._nodeImport);
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
      this.populate();

      const likeButton = this.querySelector(".action.likes .action-button");
      likeButton.addEventListener("click", () => this.toggleLike());
    }
  }

  /**
   * Populate the element with all the information.
   * @returns {PostModule} - The post module.
   */
  populate() {
    this.setAuthor();
    this.setAvatar();
    this.setCaption();
    this.setDate();
    this.setReactions();
    this.registerCaption();
    this.setImages();

    this.classList.add("populated");
    this.rendered = true;

    return this;
  }

  /**
   * Indicates that the post is indeed user posted.
   * @returns {PostModule} - The post module.
   */
  setUserPosted() {
    this.userPosted = true;
    this.classList.add("user-posted");
    return this;
  }

  /**
   * Set the author of the post module.
   * @param {string} fullName - The full name of the user.
   * @param {string} handle - The users handle.
   * @returns {PostModule} - The post module.
   */
  setAuthor(fullName = this.author.fullName, handle = this.author.handle) {
    this.author.fullName = fullName;
    this.author.handle = handle;

    const fullNameElement = this.querySelector(".full-name");
    const handleElement = this.querySelector(".handle");

    if (fullNameElement) fullNameElement.textContent = fullName;
    if (handleElement) handleElement.textContent = handle;

    return this;
  }

  /**
   * Set the avatar of the author of the post module.
   * @param {string} url - The url of the image.
   * @returns {PostModule} - The post module.
   */
  setAvatar(url) {
    if (!this.author.avatar) this.author.avatar = url;
    const avatarElement = this.querySelector(".avatar");
    if (avatarElement) {
      avatarElement.src = this.author.avatar;
    }
    return this;
  }

  /**
   * Sets the caption of the post module.
   * @param {string} caption - The new caption for the post.
   * @returns {PostModule} - The post module.
   */
  setCaption(caption = this.caption) {
    this.caption = caption;
    this.parseCaption();
    return this;
  }

  /**
   * Sets the images of the post.
   * @param {string[]} urls - Array of src URLs.
   * @returns {PostModule} - The post module.
   */
  setImages(urls = []) {
    if (urls.length > 0) this.images = urls;
    const container = this.querySelector(".cover-container");
    if (!container) return this;
    populateImageCarousel(container, this.images);
    return this;
  }

  /**
   * Sets the date of the new post.
   * @param {Date} date - The target date.
   * @returns {PostModule} - The post module.
   */
  setDate = (date = new Date()) => {
    const dateElement = this.querySelector(".date");
    const sinceElement = this.querySelector(".since");

    const { fullDateString, since } = parseDate(this.postedDate);

    if (!this.postedDate) this.postedDate = date;

    if (dateElement) dateElement.textContent = fullDateString;
    if (sinceElement) sinceElement.textContent = since;

    if (!this._dateInterval) clearInterval(this._dateInterval);

    this._dateInterval = setInterval(() => {
      const { since } = parseDate(this.postedDate);
      if (sinceElement) sinceElement.textContent = since;
    }, 1000);

    return this;
  };

  /**
   * Updates the amount of
   * @param {{
   *  likes: number,
   *  comments: number,
   *  shares: number
   * }} opts - The options containing the target reaction counts.
   * @returns {PostModule} - The post module.
   */
  setReactions = ({ likes, comments, shares } = {}) => {
    this.populateReaction("likes", likes);
    this.populateReaction("comments", comments);
    this.populateReaction("shares", shares);

    return this;
  };

  /**
   * Populate a reaction with a reaction count.
   * @param {'likes'|'comments'|'shares'} reactionName - The name of the reaction.
   * @param {number} count - The amount of reactions.
   */
  populateReaction(reactionName, count) {
    const container = this.querySelector(`.action.${reactionName}`);
    if (container) {
      const total = count || this.reactions[reactionName];
      container.dataset.count = total;
      this.reactions[reactionName] = parseInt(total);
    } else {
      this.reactions[reactionName] = parseInt(count) || 0;
    }
  }

  /**
   * Resizes the caption for easy consuming..
   * @param {number} cutoff - The text limit.
   * @param {number} newlineLimit - The newline limit.
   * @returns {HTMLDivElement} - The caption node.
   */
  parseCaption = (cutoff = 240, newlineLimit = 6) => {
    const captionElement = this.querySelector(".caption");

    if (!this.caption && captionElement) {
      this.caption = captionElement.innerText;
    }

    let [...captionCopy] = this.caption.slice(0).trim();

    const newlineIndices = captionCopy
      .map((x, i) => {
        return x === "\n" ? i : undefined;
      })
      .filter(Number.isInteger);

    const newlineCutoff = newlineIndices[newlineLimit];
    if (newlineCutoff > newlineLimit) cutoff = newlineCutoff;

    const collapsable =
      this.caption.length > cutoff || newlineCutoff > newlineLimit;

    const paragraph = createElement(
      "div",
      null,
      "caption",
      collapsable ? "collapsable" : "",
      collapsable ? "collapsed" : ""
    );

    const head = captionCopy.splice(0, cutoff).join``;
    const tail = captionCopy.join``;

    if (collapsable) {
      const preview = createElement("p", head, "preview");
      const ellipses = createElement("p", "...", "ellipses");
      const hidden = createElement("p", tail, "hidden");
      paragraph.append(preview, ellipses, hidden);
    } else {
      paragraph.innerText = this.caption;
    }

    if (captionElement) captionElement.replaceWith(paragraph);
  };

  /**
   * Register an event emitter that allows a paragraph
   * element to collapse.
   */
  registerCaption = () => {
    this.parseCaption();

    const element = this.querySelector(".caption");
    if (element.children.length <= 1) return;
    element.addEventListener("click", () => {
      element.classList.toggle("collapsed");
    });
  };

  /**
   * Extracts data from node and replaces with a FeedPost class.
   * @param {HTMLElement} node - The node element.
   * @returns {FeedPost} - The resulting feed post.
   */
  importFromNode = (node) => {
    this.author.fullName = node.querySelector(".full-name").textContent;
    this.author.handle = node.querySelector(".handle").textContent;
    this.author.avatar = node.querySelector(".avatar").getAttribute("src");

    this.postedDate = new Date(
      parseInt(node.querySelector(".post").dataset.postedDate)
    );
    this.images = Array.from(node.querySelectorAll(".cover-container img")).map(
      ({ src }) => src
    );
    this.caption = node.querySelector(".caption").textContent;
    this.setReactions({
      likes: getActionCount(node, "likes") || 0,
      comments: getActionCount(node, "comments") || 0,
      shares: getActionCount(node, "shares") || 0,
    });

    node.replaceWith(this);

    if (!this.rendered) this.populate();

    return this;
  };

  toggleLike = () => {
    const likeButton = this.querySelector(".action.likes");
    this.liked = !this.liked;

    this.reactions.likes += this.liked ? 1 : -1;
    this.setReactions({ likes: this.reactions.likes });

    likeButton.classList[this.liked ? "add" : "remove"]("liked");
  };

  /**
   * Prepend the active element to the timeline.
   */
  bindToTimeline() {
    document.querySelector("main").prepend(this);
  }
}

function getActionCount(node, className) {
  return node.querySelector(`.action.${className}`).dataset.count;
}

class ContentService {
  images = [];
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
      this.setCaption(ev.target.innerText);
      this.updatePreviewButton();
    });
  }

  /**
   * Activate file uploading for a file input element.
   * @param {Function} callback - Callback function that takes list of files as parameter.
   */
  registerFileUpload() {
    const _this = this;
    const node = document.querySelector('input[type="file"]');
    node.addEventListener(
      "change",
      function () {
        const { files } = this;
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file.type.startsWith("image/")) continue;
          _this.upload(file);
        }
        _this.updatePreviewImages();
        node.value = "";
      },
      false
    );
  }

  /**
   * Upload and preview a file.
   * @param {File} file - The file to be uploaded.
   */
  upload(file) {
    const label = document.querySelector("label.attach");
    const container = document.querySelector(".attachments-container");

    const imageContainer = createElement("div", null, "attachment");
    const image = createElement("img");
    image.src = URL.createObjectURL(file);
    imageContainer.appendChild(image);

    this.images.push(image.src);

    container.insertBefore(imageContainer, label);
    this.updatePreviewButton();
  }

  /**
   * Update the preview images of the
   * preview modal.
   */
  updatePreviewImages() {
    const container = document.querySelector(".cover-container");
    populateImageCarousel(container, this.images);
  }

  /**
   * Register the swipe events for the preview modal
   */
  registerSwipeEvents() {
    let startPosition,
      touchHistory = [];
    const previewModal = document.querySelector("#previewPost");
    const imageContainer = previewModal.querySelector(".cover-container");

    let lastClientY = 0;
    let dragging = false;

    let dragDisabled = false;
    let dragTimeout;

    imageContainer.addEventListener("scroll", () => {
      dragDisabled = true;
      clearTimeout(dragTimeout);
      dragTimeout = setTimeout(() => {
        dragDisabled = false;
      }, 200);
    });

    imageContainer.addEventListener("dragstart", (ev) => {
      ev.preventDefault();
    });

    const handleTouchStart = (ev) => {
      if (targetIsOverflowingCaption(ev)) return;
      lastClientY = 0;

      dragging = true;

      previewModal.classList.add("dragging");
      if (ev.touches) {
        const [{ clientY }] = ev.touches;
        startPosition = clientY;
      } else {
        startPosition = ev.clientY;
      }

      touchHistory = [];
    };

    const handleTouchMove = (ev) => {
      if (targetIsOverflowingCaption(ev) || dragDisabled || !dragging) return;

      let delta;

      if (ev.touches) {
        const [{ clientY }] = ev.touches;
        lastClientY = clientY;
        delta = clientY - startPosition;
      } else {
        const { clientY } = ev;
        lastClientY = clientY;
        delta = clientY - startPosition;
      }

      touchHistory.push(delta);
      if (touchHistory.length > 10) touchHistory.shift();
      previewModal.style.transform = `translateY(${delta}px)`;
    };

    const handleTouchEnd = () => {
      if (!dragging) return;
      dragging = false;

      const momentum = calculateMomentum(touchHistory);
      const threshold = 15;

      let delay = 320;
      let targetPosition, completionTask;

      const distanceFromEquator = !lastClientY ? 0 : lastClientY - (window.innerHeight / 2);
      const inTopQuarter = distanceFromEquator > window.innerHeight / 4;
      const inBottomQuarter = distanceFromEquator < window.innerHeight / -4;

      if (momentum > threshold || inTopQuarter) {
        targetPosition = "100vh";
        completionTask = () => this._modalManager.activate("createPost");
      } else if (momentum < -threshold || inBottomQuarter) {
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
    };

    previewModal.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    previewModal.addEventListener("mousedown", handleTouchStart);
    document.addEventListener("mousemove", handleTouchMove);
    document.addEventListener("mouseup", handleTouchEnd);
  }

  setCaption(text = "") {
    const trimmed = text.trim();
    this.captionPreview.innerText = trimmed;
    this.caption = trimmed;
  }

  /**
   * Destroy the attachment blobs and revoke URLs.
   */
  destroyAttachments() {
    const attachments = Array.from(document.querySelectorAll(".attachment"));
    attachments.forEach((attachment) => attachment.remove());
    this.images.forEach(URL.revokeObjectURL);
    this.images = [];
  }

  /**
   * Enables & disables the preview button depending on preview content.
   */
  updatePreviewButton() {
    const button = document.querySelector("#preview");
    button.disabled =
      this.images.length === 0 && this.caption.trim().length === 0;
  }

  publish() {
    const post = new PostModule()
      .setAuthor("Helcim Team", "@helcim")
      .setAvatar(
        "https://pbs.twimg.com/profile_images/1268634165995429888/CHymLbpm_400x400.jpg"
      )
      .setCaption(this.caption)
      .setImages(this.images)
      .setUserPosted()
      .setDate();

    post.bindToTimeline();
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    this.reset();
  }

  reset() {
    this._input.textContent = "";
    this.setCaption();
    this.destroyAttachments();
    this.updatePreviewImages();
    this.updatePreviewButton();
  }
}

function targetIsOverflowingCaption({ target }) {
  return target.scrollHeight > target.clientHeight;
}

/**
 * Populate an image carousel with images.
 * @param {HTMLElement} container - The container for the carousel.
 * @param {string[]} urls - The urls of the images.
 */
function populateImageCarousel(container, urls) {
  while (container.children.length) {
    container.removeChild(container.firstChild);
  }

  const parent = container.parentElement;
  const indicatorContainer = parent.querySelector(".image-count");
  Array.from(indicatorContainer.children).forEach((element) =>
    element.remove()
  );

  const indicators = [];

  if (urls.length > 1) {
    for (let i = 0; i < urls.length; i++) {
      const indicator = createElement(
        "div",
        null,
        "indicator",
        i === 0 ? "active" : ""
      );
      indicators.push(indicator);
    }
    indicatorContainer.append(...indicators);
  }

  /**
   * Handle the carousel scroll event.
   * @param {Event} ev - The scroll event.
   */
  const handleCarouselScroll = (ev) => {
    ev.stopPropagation();
    const { target } = ev;

    const imageIndex = Math.round(target.scrollLeft / target.clientWidth);
    indicators.forEach((indicator) => indicator.classList.remove("active"));
    if (indicators[imageIndex]) indicators[imageIndex].classList.add("active");
  };

  container.removeEventListener("scroll", handleCarouselScroll);
  container.addEventListener("scroll", handleCarouselScroll);

  urls.forEach((url) => {
    const image = createElement("img", null, "cover");
    image.src = url;
    container.appendChild(image);
  });
}

function registerTimelinePosts() {
  const posts = Array.from(document.querySelectorAll("post-element"));
  const modules = posts.map((postNode) =>
    new PostModule().importFromNode(postNode)
  );
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

/**
 * Create a DOM element
 * @param {string} tag - The HTML tag.
 * @param {string} textContent - Text content of the node.
 * @param  {...string} classNames - Spread classList.
 * @returns {HTMLElement} - The HTML Element.
 */
 function createElement(tag, textContent, ...classNames) {
  const element = document.createElement(tag);
  element.classList.add(...classNames.filter(String));
  if (textContent) element.textContent = textContent;
  return element;
}

class ErrorService {
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
    // ... hi helcim! this is where I would usually put an error handler
  }
}

class ModalService {
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
      res: () => {
        const element = document.querySelector("#previewPost");
        element.querySelector(".date").textContent = parseDate().fullDateString;
        this.activate("previewPost");
      },
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

function parseDate(date = new Date()) {
  const options = { month: "short", day: "numeric", year: "numeric" };

  const now = new Date();

  const time = date.getTime();
  const fullDateString = date.toLocaleString("en-US", options);
  const since = parseTimeSince(now.getTime() - time);

  return { time, fullDateString, since };
}

function parseTimeSince(ms) {
  let suffix = "";
  let unit;

  const seconds = (ms - (ms % 1000)) / 1000;

  if (seconds / 3.154e7 >= 1) {
    suffix = "y";
    unit = Math.floor(seconds / 3.154e7);
  } else if (seconds / 2.592e6 >= 1) {
    suffix = "mo";
    unit = Math.floor(seconds / 2.592e6);
  } else if (seconds / 6.048e5 >= 1) {
    suffix = "w";
    unit = Math.floor(seconds / 6.048e5);
  } else if (seconds / 8.64e4 >= 1) {
    suffix = "d";
    unit = Math.floor(seconds / 8.64e4);
  } else if (seconds / 3600 >= 1) {
    suffix = "h";
    unit = Math.floor(seconds / 3600);
  } else if (seconds / 60 >= 1) {
    suffix = "m";
    unit = Math.floor(seconds / 60);
  } else if (seconds <= 10) {
    return "just now";
  } else {
    suffix = "s";
    unit = seconds;
  }

  return unit + suffix;
}

// script.js equiv.

customElements.define("post-element", PostModule);

const modals = new ModalService().register();
const content = new ContentService(modals);
content.registerSwipeEvents();
content.registerFileUpload();

registerTimelinePosts();

const error = new ErrorService();