import ErrorService from "./services/error.service.js";
import ModalService from "./services/modal.service.js";
import ContentService from "./services/content.service.js";

import PostModule from "./modules/post.module.js";
customElements.define('post-element', PostModule);

const modals = new ModalService().register();
const content = new ContentService(modals);
content.registerSwipeEvents();

const post = new PostModule()
  .setAuthor("Rida F'kih", "@ridafkih")
  .setCaption("Say no to drugs!")
  .setDate()
  .setReactions({ likes: 12, comments: 18 });

post.bindToTimeline();

const error = new ErrorService();