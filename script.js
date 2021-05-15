import ErrorService from "./scripts/services/error.service.js";
import ModalService from "./scripts/services/modal.service.js";
import ContentService from "./scripts/services/content.service.js";
import { createElement } from "./scripts/services/dom.service.js";

import PostModule from "./scripts/modules/post.module.js";
customElements.define('post-element', PostModule);

const modals = new ModalService().register();
const content = new ContentService(modals);
content.registerSwipeEvents();

const error = new ErrorService();