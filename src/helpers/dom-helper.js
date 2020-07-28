export default class DOMHelper {

    static serializeDOMToString(dom) { // преобразим html код в текст
        const serializer = new XMLSerializer();
        return serializer.serializeToString(dom);
    }

    static parseStrToDOM(str) { // преобразим текст в html код
        const parser = new DOMParser();
        return parser.parseFromString(str, 'text/html');
    }

    static wrapTextNodes(dom) {
        const body = dom.body;
        const textNode = [];

        function reqursy(element) {
            element.childNodes.forEach(node => {
                if(node.nodeName === '#text' && node.nodeValue.replace(/\s+/g, "").length > 0) {
                    textNode.push(node); // выделение всех текстовых узлов длинной больше 0 и добавление их в массив
                } else {
                    reqursy(node); // если нет текстового узла, углубляемся на тег ниже
                }
            });
        }

        reqursy(body);

        textNode.forEach((node, i) => {
            const wrapper = dom.createElement('text-editor'); // создание собственного тега
            node.parentNode.replaceChild(wrapper, node); // добавление тега и удаление node (текста)
            wrapper.appendChild(node); // поместим текст внутрь нового тега
            wrapper.setAttribute('nodeid', i);
        })

        return dom;
    }

    static unwrapTextNodes(dom) {
        dom.body.querySelectorAll("text-editor").forEach(elem => {
            elem.parentNode.replaceChild(elem.firstChild, elem);    // развернем весь текст из обертки тега text-editor
        });
    }

}