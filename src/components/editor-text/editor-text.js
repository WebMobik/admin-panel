export default class EditorText {
    constructor(elem, virtualElem) {

        this.elem = elem;
        this.virtualElem = virtualElem;
        this.elem.addEventListener('click', () => this.onClick());
        this.elem.addEventListener('blur', () => this.onBlur());
        this.elem.addEventListener('keypress', (e) => this.onKeypress(e));
        this.elem.addEventListener('input', () => this.onTextEdit());

    }

    onClick() {
        this.elem.contentEditable = 'true';
        this.elem.focus();
    }

    onBlur() {
        this.elem.removeAttribute('contenteditable');
    }

    onKeypress(e) {
        if(e.keyCode === 13) {
            this.elem.blur();
        }
    }

    onTextEdit() { // по атрибуту nodeid перенесем данные в основную страницу 
        this.virtualElem.innerHTML = this.elem.innerHTML;
    }
   
}