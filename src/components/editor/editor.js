import '../../helpers/iframeLoader.js';
import React, { Component } from 'react';
import axios from 'axios';

export default class Editor extends Component {
    constructor() {
        super();
        this.currentPage = "index.html";
        this.state = {
            pageList: [],
            newPageName: ""
        }
        this.createNewPage = this.createNewPage.bind(this);
    }

    componentDidMount() { 
        this.init(this.currentPage);
    }

    init(page) {
        this.iframe = document.querySelector('iframe');
        this.open(page);
        //this.loadPageList(); // error request
    }

    open(page) {
        this.currentPage = `../${page}?rnd=${Math.random()}`;

        axios
            .get(`../${page}`)
            .then(res => this.parseStrToDOM(res.data)) // преображение текста в dom html
            .then(this.wrapTextNodes)   // выделение текстовых узлов и обёртка тегом text-editor
            .then(dom => {              // копия dom virtualDOM
                this.virtualDOM = dom;
                return dom; 
            })
            .then(this.serializeDOMToString)    // конвертация dom дерева в текст
            .then(html => axios.post('./api/saveTempPage.php', {html}))     // отправим запрос с html для создания новой страницы (страницы редактирования)
            .then(() => this.iframe.load("../temp.html"))    // загрузка страницы редактирования
            .then(() => this.enableEditing()) // включение редактирования и синхронизация с готовой страницей

    }

    enableEditing() {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(elem => {
            elem.contentEditable = 'true';
            elem.addEventListener("input", () => {
                this.onTextEdit(elem);
            });
        })
    }

    onTextEdit(elem) {
        const id = elem.getAttribute('nodeid');
        this.virtualDOM.body.querySelector(`[nodeid="${id}"]`).innerHTML = elem.innerHTML;
    }

    serializeDOMToString(dom) {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(dom);
    }

    parseStrToDOM(str) {
        const parser = new DOMParser();
        return parser.parseFromString(str, 'text/html');
    }

    wrapTextNodes(dom) {
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

    loadPageList() {
        axios
            .get("/api")
            .then(res => this.setState({pageList: res.data})) // список страниц
    }

    createNewPage() {
        axios
            .post("/api/createNewPage.php", {"name": this.state.newPageName}) // post запрос на создание новой страницы
            .then(this.loadPageList()) // отрисовка списка с новой страницей
            .catch(() => alert("Страница уже существует!")) // Bad Request
    }

    deletePage(page) {
        axios
            .post('/api/deletePage.php', {"name": page}) // post запрос на удаление страницы
            .then(this.loadPageList()) // отрисовка списка страниц
            .catch(() => alert("Страница уже существует!")) // Bad Request
    }

    render() {
        const {pageList} = this.state;
        const pages = pageList.map((page, i ) => {
            return (
                <h1 key={i}>{page}
                    <a
                    href="#"
                    onClick={() => this.deletePage(page)}>(x)</a>
                </h1>
            )
        })
        
        return (
            <iframe src={this.currentPage} frameBorder="0"></iframe>
            // <>
            //     <input 
            //      onChange={(e) => this.setState({newPageName: e.target.value})}
            //      type="text"/>
            //     <button onClick={this.createNewPage}>Create page</button>
            //     {pages}
            // </>
        )
    }
}