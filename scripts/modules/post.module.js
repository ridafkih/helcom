import { populateImageCarousel } from "../services/content.service.js";
import { createElement } from "../services/dom.service.js";
import { parseDate, parseTimeSince } from "../services/time.service.js";

const template = document.querySelector("#postTemplate");

/**
 * A timeline post module.
 */
export default class PostModule extends HTMLElement {
  userPosted = false;
  rendered = false;
  author = {
    fullName: null,
    handle: null,
    avatar: null
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

      const likeButton = this.querySelector('.action.likes .action-button');
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

    const newlineIndices = captionCopy.map((x, i) => {
      return x === "\n" ? i : undefined;
    }).filter(Number.isInteger);

    const newlineCutoff = newlineIndices[newlineLimit];
    if (newlineCutoff > newlineLimit) cutoff = newlineCutoff;
    
    const collapsable = this.caption.length > cutoff || newlineCutoff > newlineLimit;

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

    if (!this.rendered) 
      this.populate();

    return this;
  };

  toggleLike = () => {
    const likeButton = this.querySelector('.action.likes');
    this.liked = !this.liked;

    this.reactions.likes += (this.liked ? 1 : -1);
    this.setReactions({ likes: this.reactions.likes });

    likeButton.classList[this.liked ? "add" : "remove"]("liked");
  }

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