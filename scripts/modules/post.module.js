import { createElement } from "../services/dom.service.js";

const template = document.getElementById("postTemplate");

/**
 * A timeline post module.
 */
export default class PostModule extends HTMLElement {
	author = {
		fullName: null,
		handle: null
	}

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
		if (this._nodeImport)
			this.importFromNode(this._nodeImport);

		if (!this.innerHTML.trim())
			this.innerHTML = template.innerHTML;

		this.registerCaption();
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

	generateDomElement = () => {
		
	}

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
  }

	getActionsCount() {
		const likes = parseInt(getActionCount(this.domElement, "like")) || 0,
					comments = parseInt(getActionCount(this.domElement, "comment")) || 0;
					shares = parseInt(getActionCount(this.domElement, "share")) || 0;
	
		return { likes, comments, shares };
	}

	/**
	 * Register an event emitter that allows a paragraph
	 * element to collapse.
	 */
	registerCaption = () => {
		const element = this.querySelector(".caption");
		if (element.children.length <= 1) return;
		element.addEventListener("click", () => {
			element.classList.toggle("collapsed");
		});
    this.caption = element.textContent;
	}
}
		
function getActionCount(node, className) {
	return node.querySelector(`.action.${className}`).dataset.count;
}