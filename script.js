import ErrorService from "./scripts/services/error.service.js";
import ModalService from "./scripts/services/modal.service.js";
import ContentService from "./scripts/services/content.service.js";

import PostModule from "./scripts/modules/post.module.js";
customElements.define('post-element', PostModule);

const modals = new ModalService().register();
const content = new ContentService(modals);
content.registerSwipeEvents();

const post = new PostModule();

const error = new ErrorService();