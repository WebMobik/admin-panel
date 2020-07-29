import React from 'react';

const ChooseModal = ({modal, target}) => {
    return (
        <div id={target} uk-modal={modal.toString()}>
            <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">Открыть</h2>
                <button className="uk-button uk-modal-close" type="button">Отмена</button>
            </div>
        </div>
    )
}

export default ChooseModal;