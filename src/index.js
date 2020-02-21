'use strict';
// eslint-disable-next-line
function toDoGenerator(name, $todoForm, $list, $sum, $done, template) {
    this.form = $todoForm;
    this.name = name;
    this.notes = localStorage.getItem(this.name) ? JSON.parse(localStorage.getItem(this.name)) : [];
    this.list = $list;
    this.sum = $sum;
    this.done = $done;
    this.template = template;
    this.noteObject = {};
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
toDoGenerator.prototype.save = function () {
    const urlTodo = 'https://todo.hillel.it/todo';
    this.todoData = {
        'priority': 1,
        'value': localStorage.getItem('todo')
    };
    this.notesJson = JSON.stringify(this.notes);
    localStorage.setItem(this.name, this.notesJson);
    this.options = {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            // eslint-disable-next-line
            'Authorization': 'Bearer ' + login.getToken()
        },
        body: JSON.stringify(this.todoData)
    };
    fetch(urlTodo, this.options)
        .then(res => res.json()).then();
};
toDoGenerator.prototype.createNotesArray = function () {
    this.formData = new FormData(this.form);
    // eslint-disable-next-line
    this.formData.append('id', moment().format('x'));
    this.formData.append('completed', false);
    // eslint-disable-next-line
    this.formData.append('time', moment().format('MMMM Do YYYY, h:mm:ss a'));
    this.noteObject = this.formDataToObject(this.formData);
    this.notes.push(this.noteObject);
    this.save();
};
toDoGenerator.prototype.setDone = function (id) {
    this.notes.find(el => el.id === id)
        .completed = true;
    this.save();
};
toDoGenerator.prototype.removeNote = function (id, confirm) {
    if (confirm === true) {
        const index = this.notes.indexOf(this.notes.find(el => el.id === id));
        // eslint-disable-next-line
        this.notes.splice(index, 1);
        this.save();
    }
};
toDoGenerator.prototype.editNote = function (id, title, text, confirm) {
    if (confirm) {
        const index = this.notes.indexOf(this.notes.find(el => el.id === id));
        this.notes[index].title = title;
        this.notes[index].text = text;
        this.save();
    }

};
toDoGenerator.prototype.getSum = function () {
    return this.notes.length;
};
toDoGenerator.prototype.getDone = function () {
    return this.notes.filter((el) => el.completed === true).length;
};
toDoGenerator.prototype.renderEditor = function (note, id) {
    note.innerHTML =
        `<input type="text" name="title" value="${this.notes.find(el => el.id === id).title}">
                
                <textarea rows="5"  name="text"  >${this.notes.find(el => el.id === id).text}</textarea>
                <button type="button" class="note_save">Save</button>`;


};
toDoGenerator.prototype.notesRender = function (container) {
    container.innerHTML = '';
    this.notes.forEach(note => {
        container.innerHTML += this.template(note);
    });
};
toDoGenerator.prototype.init = function () {
    this.sum.textContent = this.getSum();
    this.done.textContent = this.getDone();
    this.notesRender(this.list);
    this.form.addEventListener('submit', e => {
        e.preventDefault();
        this.createNotesArray();
        this.notesRender(this.list);
        this.form.reset();
        this.sum.textContent = this.getSum();
    });
    this.list.addEventListener('click', e => {
        if (e.target.classList.contains('note_done')) {
            this.setDone(e.target.closest('li').id);
            this.notesRender(this.list);
            this.done.textContent = this.getDone();
        }
        if (e.target.classList.contains('note_remove')) {
            this.removeNote(e.target.closest('li').id, confirm('Sure'));
            this.notesRender(this.list);
            this.done.textContent = this.getDone();
            this.sum.textContent = this.getSum();
        }
        if (e.target.classList.contains('note_edit')) {
            this.renderEditor(e.target.closest('li'), e.target.closest('li').id);

        }
        if (e.target.classList.contains('note_save')) {
            const inputTitle = e.target.parentNode.querySelector('[name="title"]');
            const inputText = e.target.parentNode.querySelector('[name="text"]');
            this.editNote(e.target.parentNode.id, inputTitle.value, inputText.value, confirm('Sure?'));
            this.notesRender(this.list);
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
    note => `<li class="notes_item ${note.completed ? 'completed' : ''}" id = ${note.id}  > 
                    <h4 class="note_title">${note.title}</h4>
                    <p class="note_text">${note.text}</p>
                    <div class="buttons">
                        <button type="button" class="note_done" ${note.completed ? 'disabled' : ''} >Done</button>
                        <button type="button" class="note_remove"  >Remove</button>
                        <button type="button" class="note_edit"  ${note.completed ? 'disabled' : ''} >Edit</button>
                    </div>
                    
                </li>`
);
toDoList.init();

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
Login.prototype.getToken = function(){
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

