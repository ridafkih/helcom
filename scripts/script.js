import ErrorService from "./services/error.service.js";
import ModalService from "./services/modal.service.js";
import ContentService, { registerTimelinePosts } from "./services/content.service.js";

import PostModule from "./modules/post.module.js";
customElements.define('post-element', PostModule);

const modals = new ModalService().register();
const content = new ContentService(modals);
content.registerSwipeEvents();
content.registerFileUpload();

registerTimelinePosts();

export const error = new ErrorService();