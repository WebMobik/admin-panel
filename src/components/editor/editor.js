import '../../helpers/iframeLoader.js';
import React, { Component } from 'react';
import DOMHelper from '../../helpers/dom-helper';
import EditorText from '../editor-text';
import Spinner from '../spinner';
import ConfirmModal from '../confirm-modal';
import ChooseModal from '../choose-modal';

import UIkit from 'uikit';
import axios from 'axios';

export default class Editor extends Component {
    constructor() {
        super();
        this.currentPage = "index.html";
        this.state = {
            pageList: [],
            newPageName: "",
            loading: true
        }
        this.createNewPage = this.createNewPage.bind(this);
        this.isLoading = this.isLoading.bind(this);
        this.isLoaded = this.isLoaded.bind(this);
        this.save = this.save.bind(this);
        this.init = this.init.bind(this);
    }

    componentDidMount() { 
        this.init(null, this.currentPage);
    }

    init(e, page) {
        if(e) {
            e.preventDefault();
        }
        this.isLoading();
        this.iframe = document.querySelector('iframe');
        this.open(page, this.isLoaded);
        this.loadPageList();    // загрузка списка страниц
    }

    open(page, cb) {
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
            .then(() => this.iframe.load("../ytytyr33345_12ee.html"))   // загрузка страницы редактирования
            .then(() => axios.post('./api/deleteTempPage.php'))
            .then(() => this.enableEditing()) // включение редактирования и синхронизация с готовой страницей
            .then(() => this.injectStyles())
            .then(cb)
    }

    save(onSuccess, onError) {
        this.isLoading();
        const newDom = this.virtualDOM.cloneNode(this.virtualDOM);  // копия dom дерева
        DOMHelper.unwrapTextNodes(newDom);                               // развернем текс из обертки
        const html = DOMHelper.serializeDOMToString(newDom);             // преобразим в строку
        axios
            .post("api/savePage.php", {pageName: this.currentPage, html}) // отправим на сервер
            .then(onSuccess)
            .catch(onError)
            .finally(this.isLoaded)
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

    isLoading() {
        this.setState({
            loading: true
        })
    }

    isLoaded() {
        this.setState({
            loading: false
        })
    }

    loadPageList() {
        axios
            .get("./api/pageList.php")
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
        const {loading, pageList} = this.state;
        const modal = true;
        
        let spinner;

        loading ? spinner = <Spinner active/> : spinner = <Spinner /> 

        return (
            <>
                <iframe src={this.currentPage} frameBorder="0"></iframe>

                {spinner}

                <div className="panel">
                    <button className="uk-button uk-button-primary uk-margin-small-right" uk-toggle="target: #modal-open">Открыть</button>
                    <button className="uk-button uk-button-primary" uk-toggle="target: #modal-save" >Опубликовать</button>
                </div>

                <ConfirmModal modal={modal} target={'modal-save'} method={this.save} />
                <ChooseModal modal={modal} target={'modal-open'} data={pageList} redirect={this.init}/>
            </>
        )
    }
}