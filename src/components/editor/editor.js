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
        // this.loadPageList(); // error request
    }

    open(page) {
        this.currentPage = `../${page}`;
        this.iframe.load(this.currentPage, () => {
            const body = this.iframe.contentDocument.body;
            const textNode = [];

            function reqursy(element) {
                element.childNodes.forEach(node => {
                    if(node.nodeName === '#text' && node.nodeValue.replace(/\s+/g, "").length > 0) {
                        textNode.push(node); // выделение всех текстовых узлов и добавление их в массив
                    } else {
                        reqursy(node); // если нет текстового узла, углубляемся на тег ниже
                    }
                });
            }

            reqursy(body);

            textNode.forEach(node => {
                const wrapper = this.iframe.contentDocument.createElement('text-editor'); // создание собственного тега
                node.parentNode.replaceChild(wrapper, node); // добавление тега
                wrapper.appendChild(node);
                wrapper.contentEditable = 'true'; // включение редактирования элементов
            })

        });
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