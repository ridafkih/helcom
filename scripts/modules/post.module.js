import { createElement } from "../services/dom.service.js";

const template = document.getElementById("postTemplate");

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
    const likes = parseInt(getActionCount(this.domElement, "like")) || 0,
      comments = parseInt(getActionCount(this.domElement, "comment")) || 0;
    shares = parseInt(getActionCount(this.domElement, "share")) || 0;

    return { likes, comments, shares };
  }
}

function getActionCount(node, className) {
  return node.querySelector(`.action.${className}`).dataset.count;
}
