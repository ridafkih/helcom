export default class ErrorService {
  /**
   * Display an error to the developer, and the user if desired.
   * @param {string} message - The message to display in the console & for the user.
   * @param {boolean} display - Whether or not you would like the user to see the error.
   */
  log(message, display) {
    console.warn(message);
    if (display) this.display(message);
  }

  /**
   * Display an error message for the user.
   * @param {string} message - The message to display in the console & for the user.
   */
  display(message) {
    // ... hi helcim! this is where I would usually put an error handler
  }
}
