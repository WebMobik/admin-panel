export default class EditorText {
    constructor(elem, virtualElem) {

        this.elem = elem;
        this.virtualElem = virtualElem;
        this.elem.addEventListener('click', () => this.onClick());
        this.elem.addEventListener('blur', () => this.onBlur());
        this.elem.addEventListener('keypress', (e) => this.onKeypress(e));
        this.elem.addEventListener('input', () => this.onTextEdit());
        if(this.elem.parentNode.nodeName === "A" || this.elem.parentNode.nodeName === "BUTTON") {
            this.elem.addEventListener('contextmenu', (e) => this.onCxtMenu(e));
        }
    }

    onCxtMenu(e) {
        e.preventDefault();
        this.onClick();
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