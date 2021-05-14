class ModalManager {
    _element = document.getElementById("modalsContainer");

    constructor() {
        const closers = document.getElementsByClassName("modal-close");
        const closersArray = Array.from(closers);

        closersArray.forEach(closerNode => {
            closerNode.addEventListener("click", () => this.close());
        });
    }

    /**
     * Display a modal for the user.
     * @param {string} id - The ID of the modal to displays. 
     */
    activate(id) {
        this.close();
        const modal = document.getElementById(id);
        if (!modal)
            return error.log("Modal does not exist.");
        this._element.classList.add("active");
        modal.classList.add("modal-active");
    }

    close() {
        const modals = document.getElementsByClassName("modal");
        const modalsArray = Array.from(modals);
        
        this._element.classList.remove("active");
        modalsArray.forEach(modalNode => {
            modalNode.classList.remove("modal-active");
        });
    }
}

class ErrorManager {
    /**
     * Display an error to the developer, and the user if desired.
     * @param {string} message - The message to display in the console & for the user.
     * @param {boolean} display - Whether or not you would like the user to see the error. 
     */
    log(message, display) {
        console.error(message);
        if (display) this.display(message);
    }

    /**
     * Display an error message for the user.
     * @param {string} message - The message to display in the console & for the user. 
     */
    display(message) {
        // ...
    }
}

const error = new ErrorManager();
const modals = new ModalManager();

const uploadButton = document.getElementById("upload");

uploadButton.addEventListener("click", e => {
    modals.activate("createPost");
});