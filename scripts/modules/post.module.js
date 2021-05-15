import { createElement } from "../services/dom.service.js";

const template = document.querySelector("#postTemplate");

/**
 * A timeline post module.
 */
export default class PostModule extends HTMLElement {
  author = {
    fullName: null,
    handle: null,
  };

  images = [];
  posted = new Date();
  caption = "";

  reactions = {
    likes: 0,
    comments: 0,
    shares: 0,
  };

  domElement;
  _nodeImport;

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
    if (!this.innerHTML.trim()) this.innerHTML = template.innerHTML;
    this.registerCaption();
  }

  /**
   * Set the author of the post module.
   * @param {string} fullName - The full name of the user.
   * @param {string} handle - The users handle.
   * @returns {PostModule} - The post module.
   */
  setAuthor(fullName, handle) {
    this.author.fullName = fullName;
    this.author.handle = handle;

    this.querySelector(".full-name").textContent = fullName;
    this.querySelector(".handle").textContent = handle;

    return this;
  }

  /**
   * Sets the caption of the post module.
   * @param {string} caption - The new caption for the post.
   * @returns {PostModule} - The post module.
   */
  setCaption(caption) {
    this.caption = caption;
    this.parseCaption();
    return this;
  }

  /**
   * Sets the date of the new post.
   * @param {Date} date - The target date.
   * @returns {PostModule} - The post module.
   */
  setDate(date = new Date()) {
    this.posted = date;
    document.querySelector(".post").dataset.posted = date;
    return this;
  }

  /**
   * Updates the amount of
   * @param {{
   *  likes: number,
   *  comments: number,
   *  shares: number 
   * }} opts - The options containing the target reaction counts.
   * @returns {PostModule} - The post module.
   */
  setReactions({
    likes = this.reactions.likes,
    comments = this.reactions.comments,
    shares = this.reactions.shares,
  }) {
    const likeContainer = document.querySelector(".action.like");
    const commentContainer = document.querySelector(".action.comment");
    const shareContainer = document.querySelector(".action.share");

    likeContainer.dataset.count = likes;
    commentContainer.dataset.count = comments;
    shareContainer.dataset.count = shares;

    this.reactions.likes = likeContainer.dataset.count;
    this.reactions.comments = commentContainer.dataset.count;
    this.reactions.shares = shareContainer.dataset.count;

    return this;
  }

  /**
   * Resizes the caption for easy consuming..
   * @param {number} cutoff - The text limit.
   * @returns {HTMLDivElement} - The caption node.
   */
  parseCaption = (cutoff = 240) => {
    if (!this.caption)
      this.caption = this.querySelector(".caption").textContent;

    const captionElement = this.querySelector(".caption");

    const collapsable = this.caption.length > cutoff;

    const paragraph = createElement(
      "p",
      null,
      "caption",
      collapsable ? "collapsable" : "",
      collapsable ? "collapsed" : ""
    );

    const head = this.caption.substr(0, cutoff),
      tail = this.caption.substr(cutoff);

    if (collapsable) {
      const preview = createElement("span", head, "preview"),
        ellipses = createElement("span", "...", "ellipses"),
        hidden = createElement("span", tail, "hidden");
      paragraph.append(preview, ellipses, hidden);
    } else {
      paragraph.textContent = this.caption;
    }

    captionElement.replaceWith(paragraph);
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
   * Import FeedPost data from a node.
   * @param {HTMLElement} node - The node element.
   * @returns {FeedPost} - The resulting feed post.
   */
  importFromNode = (node) => {
    this.domElement = node;

    const fullName = node.querySelector(".full-name").textContent;
    const handle = node.querySelector(".handle").textContent;

    this.author.fullName = fullName;
    this.author.handle = handle;

    const { posted } = node.querySelector(".post").dataset;
    this.posted = new Date(parseInt(posted));

    this.images = Array.from(node.querySelectorAll(".cover-container img")).map(
      ({ src }) => src
    );

    this.registerCaption();

    this.reactions = this.getActionsCount();
    return this;
  };

  getActionsCount() {
    const likes = parseInt(getActionCount(this.domElement, "like")) || 0;
    const comments = parseInt(getActionCount(this.domElement, "comment")) || 0;
    const shares = parseInt(getActionCount(this.domElement, "share")) || 0;

    return { likes, comments, shares };
  }
}

function getActionCount(node, className) {
  return node.querySelector(`.action.${className}`).dataset.count;
}
