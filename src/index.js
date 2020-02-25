/* eslint-disable prefer-destructuring */
'use strict';
// eslint-disable-next-line
function toDoGenerator(name, $todoForm, $list, $sum, $done, template) {
    this.form = $todoForm;
    this.name = name;
    this.notes = [];
    this.list = $list;
    this.sum = $sum;
    this.done = $done;
    this.template = template;
    this.noteObject = {};
    this.urlTodo = 'https://todo.hillel.it/todo';
}


toDoGenerator.prototype.formDataToObject = function (data) {
    const obj = {};
    data.forEach((value, key) => {
        if (key === 'completed') {
            // eslint-disable-next-line
            obj[key] = 'false' ? false : true;
        } else {
            obj[key] = value;
        }

    });
    return obj;
};
toDoGenerator.prototype.add = function () {
    this.noteObjectJson = JSON.stringify(this.noteObject);
    this.todoData = {
        'priority': 1,
        'value': this.noteObjectJson
    };
    this.optionsAdd = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // eslint-disable-next-line
            'Authorization': 'Bearer ' + login.getToken()
        },
        body: JSON.stringify(this.todoData)
    };
    fetch(this.urlTodo, this.optionsAdd)
        .then(res => res.json()).then();
};
toDoGenerator.prototype.createNoteObject = function () {
    this.formData = new FormData(this.form);
    this.noteObject = this.formDataToObject(this.formData);
    this.add();
};
toDoGenerator.prototype.setDone = function (id) {
    this.noteDone = this.notes.find(el => el._id === +id);
    const text = JSON.parse(this.noteDone.value).text;
    const title = JSON.parse(this.noteDone.value).title;
    this.noteDoneObj = {
        'priority': 1,
        'value': JSON.stringify({
            'text': text,
            'title': title
        }),
        'checked': true
    };
    this.optionsDone = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // eslint-disable-next-line
            'Authorization': 'Bearer ' + login.getToken()
        },
        body: JSON.stringify(this.noteDoneObj)
    };
    fetch(`${this.urlTodo}/${id}/toggle`, this.optionsDone).then(() => {
        this.notesRender(this.list);
        this.done.textContent = this.getDone();
    });
};
toDoGenerator.prototype.removeNote = function (id, confirm) {
    if (confirm === true) {
        this.optionsDelete = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // eslint-disable-next-line
                'Authorization': 'Bearer ' + login.getToken()
            },
        };
        fetch(`${this.urlTodo}/${id}`, this.optionsDelete).then(() => {
            this.notesRender(this.list);
            this.done.textContent = this.getDone();
            this.sum.textContent = this.getSum();
        });
    }
};
toDoGenerator.prototype.editNote = function (id, title, text, confirm) {
    if (confirm) {
        this.editedNoteObj = {
            'priority': 1,
            'value': JSON.stringify({
                'text': text,
                'title': title,
            })
        };
        this.optionsEdited = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // eslint-disable-next-line
                'Authorization': 'Bearer ' + login.getToken()
            },
            body: JSON.stringify(this.editedNoteObj)
        };
        fetch(`${this.urlTodo}/${id}`, this.optionsEdited).then(this.notesRender(this.list));
    }

};
toDoGenerator.prototype.getSum = function () {
    return this.notes.length;
};
toDoGenerator.prototype.getDone = function () {
    return this.notes.filter((el) => el.checked === true).length;
};
toDoGenerator.prototype.renderEditor = function (note, id) {
    this.valueEdit = JSON.parse(this.notes.find(el => el._id === +id).value);
    note.innerHTML =
        `<input type="text" name="title" value="${this.valueEdit.title}">
                
                <textarea rows="5"  name="text"  >${this.valueEdit.text}</textarea>
                <button type="button" class="note_add">add</button>`;


};
toDoGenerator.prototype.notesRender = function (container) {
    fetch(this.urlTodo, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // eslint-disable-next-line
            'Authorization': 'Bearer ' + login.getToken()
        }
    }).then(res => res.json()).then(res => {
        this.notes = res;
        container.innerHTML = '';
        this.notes.forEach(note => {
            const id = note._id;
            const checked = note.checked;
            const value = JSON.parse(note.value);
            container.innerHTML += this.template(value, id, checked);
            this.sum.textContent = this.getSum();
            this.done.textContent = this.getDone();
        });
    });
};
toDoGenerator.prototype.init = function () {
    this.notesRender(this.list);
    this.form.addEventListener('submit', e => {
        e.preventDefault();
        this.createNoteObject();
        this.notesRender(this.list);
        this.form.reset();
        this.sum.textContent = this.getSum();
    });
    this.list.addEventListener('click', e => {
        if (e.target.classList.contains('note_done')) {
            this.setDone(e.target.closest('li').id);

        }
        if (e.target.classList.contains('note_remove')) {
            this.removeNote(e.target.closest('li').id, confirm('Sure'));

        }
        if (e.target.classList.contains('note_edit')) {
            this.renderEditor(e.target.closest('li'), e.target.closest('li').id);

        }
        if (e.target.classList.contains('note_add')) {
            const inputTitle = e.target.parentNode.querySelector('[name="title"]');
            const inputText = e.target.parentNode.querySelector('[name="text"]');
            this.editNote(e.target.parentNode.id, inputTitle.value, inputText.value, confirm('Sure?'));
        }
    });


};
const $todoForm = document.querySelector('#todo');
const $todoContainer = document.querySelector('.todo');
const $list = document.querySelector('.notes');
const $sum = document.querySelector('.sum_span');
const $done = document.querySelector('.done_span');
const toDoList = new toDoGenerator(
    'todo',
    $todoForm,
    $list,
    $sum,
    $done,
    (note, id, checked) => `<li class="notes_item ${checked ? 'completed' : ''}" id = ${id}  > 
                    <h4 class="note_title">${note.title}</h4>
                    <p class="note_text">${note.text}</p>
                    <div class="buttons">
                        <button type="button" class="note_done" ${checked ? 'disabled' : ''} >Done</button>
                        <button type="button" class="note_remove"  >Remove</button>
                        <button type="button" class="note_edit"  ${checked ? 'disabled' : ''} >Edit</button>
                    </div>
                    
                </li>`
);


function Login($authorizationForm) {
    this.form = $authorizationForm;
    this.tokenKey = 'access';
}
Login.prototype.authorization = function () {
    const urlAuth = 'https://todo.hillel.it/auth/login';
    this.options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.getFormData())

    };
    fetch(urlAuth, this.options)
        .then(res => res.json())
        .then(res => {
            this.form.reset();
            this.form.classList.add('hidden');
            localStorage.setItem(this.tokenKey, res['access_token']);
            $todoContainer.classList.remove('hidden');
            if (this.getToken()) {
                toDoList.init();
            }
        });
};
Login.prototype.getFormData = function () {
    this.formData = new FormData(this.form);
    this.formDataObj = {
        value: ''
    };
    this.formData.forEach(value => this.formDataObj.value += value);
    return this.formDataObj;
};
Login.prototype.getToken = function () {
    return localStorage.getItem(this.tokenKey);
};
Login.prototype.init = function () {
    this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.getFormData();
        this.authorization();
    });
};
const $authorizationForm = document.querySelector('#login');
const login = new Login($authorizationForm);
login.init();

