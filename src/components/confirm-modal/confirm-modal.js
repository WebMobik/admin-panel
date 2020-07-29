import React from 'react';
import UIkit from 'uikit';

const ConfirmModal = ({modal, target, method}) => {
    return (
        <div id={target} uk-modal={modal.toString()}>
            <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">Сохранение</h2>
                <p>Вы действительно хотите опубликовать изменения ?</p>
                <button className="uk-button uk-modal-close" type="button">Отмена</button>
                <button 
                    className="uk-button uk-button-primary" 
                    type="button"
                    onClick={() => method(() => {
                        UIkit.notification({message: "Успешно сохранено", status: 'success'})
                    },
                    () => {
                        UIkit.notification({message: "Ошибка сохранения", status: 'danger'})
                    })} >
                    Опубликовать</button>
            </div>
        </div>
    )
}

export default ConfirmModal;