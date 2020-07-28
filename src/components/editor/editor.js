import '../../helpers/iframeLoader.js';
import React, { Component } from 'react';
import DOMHelper from '../../helpers/dom-helper';
import EditorText from '../editor-text';

import UIkit from 'uikit';
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
        this.currentPage = page; // рандомный параметр для избежание кэширования

        axios
            .get(`../${page}?rnd=${Math.random()}`)
            .then(res => DOMHelper.parseStrToDOM(res.data)) // преображение текста в dom html
            .then(DOMHelper.wrapTextNodes)   // выделение текстовых узлов и обёртка тегом text-editor
            .then(dom => {              // копия dom virtualDOM
                this.virtualDOM = dom;
                return dom; 
            })
            .then(DOMHelper.serializeDOMToString)    // конвертация dom дерева в текст
            .then(html => axios.post('./api/saveTempPage.php', {html}))     // отправим запрос с html для создания новой страницы (страницы редактирования)
            .then(() => this.iframe.load("../temp.html"))    // загрузка страницы редактирования
            .then(() => this.enableEditing()) // включение редактирования и синхронизация с готовой страницей
            .then(() => this.injectStyles())
    }

    save(onSuccess, onError) {
        const newDom = this.virtualDOM.cloneNode(this.virtualDOM);  // копия dom дерева
        DOMHelper.unwrapTextNodes(newDom);                               // развернем текс из обертки
        const html = DOMHelper.serializeDOMToString(newDom);             // преобразим в строку
        axios
            .post("api/savePage.php", {pageName: this.currentPage, html}) // отправим на сервер
            .then(onSuccess)
            .catch(onError)
    }

    enableEditing() {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(elem => {
            const id = elem.getAttribute('nodeid');
            const virtualElem = this.virtualDOM.body.querySelector(`[nodeid="${id}"]`);

            new EditorText(elem, virtualElem);
        })
    }

    injectStyles() {
        const style = this.iframe.contentDocument.createElement("style");
        style.innerHTML = `
            text-editor:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
            text-editor:focus {
                outline: 3px solid red;
                outline-offset: 8px;
            }
        `;
        this.iframe.contentDocument.head.appendChild(style);
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
        const modal = true;
        
        return (
            <>
                <iframe src={this.currentPage} frameBorder="0"></iframe>

                <div className="panel">
                    <button className="uk-button uk-button-primary" uk-toggle="target: #modal-save" >Опубликовать</button>
                </div>

                <div id="modal-save" uk-modal={modal.toString()}>
                    <div className="uk-modal-dialog uk-modal-body">
                        <h2 className="uk-modal-title">Сохранение</h2>
                        <p>Вы действительно хотите опубликовать изменения ?</p>
                        <button className="uk-button uk-modal-close" type="button">Отмена</button>
                        <button 
                            className="uk-button uk-button-primary" 
                            type="button"
                            onClick={() => this.save(() => {
                                UIkit.notification({message: "Успешно сохранено", status: 'success'})
                            },
                            () => {
                                UIkit.notification({message: "Ошибка сохранения", status: 'danger'})
                            })} >
                            Опубликовать</button>
                    </div>
                </div>
            </>
        )
    }
}