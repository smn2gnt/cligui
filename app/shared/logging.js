let outputElement;
let outputModal;
let scrollOutput;
let closeButton;

const addModal = exports.addModal = (containerId) => {
    const modalMarkup='<div class="slds-hide" id="output-modal">\n' + 
                      '  <section role="dialog" tabindex="-1" aria-labelledby="modal-heading" aria-modal="true" aria-describedby="modal-content" class="slds-modal slds-fade-in-open slds-modal_large">\n' +
                      '    <div class="slds-modal__container">\n' + 
                      '      <header class="slds-modal__header">\n' + 
                      '        <button class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" id="modal-close" title="Close">\n' + 
                      '          <svg class="slds-button__icon slds-button__icon_large" aria-hidden="true">\n' +
                      '            <use xlink:href="style/slds_2_10/icons/utility-sprite/svg/symbols.svg#close"></use>\n' +
                      '          </svg>\n' +
                      '          <span class="slds-assistive-text">Close</span>\n' +
                      '        </button>\n' +
                      '        <h2 id="modal-heading" class="slds-modal__title slds-hyphenate">Output</h2>\n' +
                      '      </header>\n' +
                      '      <div class="slds-modal__content slds-p-around_medium output" id="modal-content">\n' +
                      '        <pre id="output"></pre>\n' +
                      '      </div>\n' +
                      '      <footer class="slds-modal__footer">\n' + 
                      '        <button class="slds-button slds-button_neutral" id="modal-clear">Clear</button>\n' +
                      '      </footer>\n' + 
                      '    </div>\n' +
                      '  </section>\n' +
                      '  <div class="slds-backdrop slds-backdrop_open"></div>\n' +
                      '</div>\n';
  
    const container = document.querySelector('#' + containerId);
    container.innerHTML=modalMarkup;

    outputElement = document.querySelector('#output');
    scrollOutput = document.querySelector('#modal-content');
    outputModal = document.querySelector('#output-modal');

    closeButton = document.querySelector('#modal-close');
    closeButton.addEventListener('click', () => {
        toggleModal();
    });

    clearButton = document.querySelector('#modal-clear');
    clearButton.addEventListener('click', () => {
        outputElement.innerHTML='';
        scrollOutput.scrollTop = scrollOutput.scrollHeight;
    });
}

const toggleModal = exports.toggleModal = () => {
    outputModal.classList.toggle('slds-show');
    outputModal.classList.toggle('slds-hide');
}

const log = exports.log = (message) => {
    let timestamp=new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    outputElement.innerHTML+=timestamp +' : ' + message + '\n';
    scrollOutput.scrollTop = scrollOutput.scrollHeight;
}
