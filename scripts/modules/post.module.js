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
    }
  }

  /**
   * Populate the element with all the information.
   * @returns {PostModule} - The post module.
   */
  populate() {
    this.setAuthor();
    this.setCaption();
    this.setDate();
    this.setReactions();
    this.registerCaption();

    this.classList.add("populated");

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
   * Sets the date of the new post.
   * @param {Date} date - The target date.
   * @returns {PostModule} - The post module.
   */
  setDate = (date = new Date()) => {
    const dateElement = this.querySelector(".date");
    const sinceElement = this.querySelector(".since");

    const { fullDateString, since } = parseDate(this.posted);

    if (!this.posted) this.posted = date;

    if (dateElement) dateElement.textContent = fullDateString;
    if (sinceElement) sinceElement.textContent = since;

    if (!this._dateInterval) clearInterval(this._dateInterval);

    this._dateInterval = setInterval(() => {
      const { since } = parseDate(this.posted);
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
      this.reactions[reactionName] = total;
    } else {
      this.reactions[reactionName] = count || 0;
    }
  }

  /**
   * Resizes the caption for easy consuming..
   * @param {number} cutoff - The text limit.
   * @returns {HTMLDivElement} - The caption node.
   */
  parseCaption = (cutoff = 240) => {
    if (!this.caption) {
      this.caption = this.querySelector(".caption").textContent;
    }

    const captionElement = this.querySelector(".caption");
    const collapsable = this.caption.length > cutoff;

    const paragraph = createElement(
      "p",
      null,
      "caption",
      collapsable ? "collapsable" : "",
      collapsable ? "collapsed" : ""
    );

    const head = this.caption.substr(0, cutoff);
    const tail = this.caption.substr(cutoff);

    if (collapsable) {
      const preview = createElement("span", head, "preview");
      const ellipses = createElement("span", "...", "ellipses");
      const hidden = createElement("span", tail, "hidden");
      paragraph.append(preview, ellipses, hidden);
    } else {
      paragraph.textContent = this.caption;
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
    this.posted = new Date(parseInt(node.querySelector(".post").dataset.posted));
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
    this.populate();

    return this;
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
