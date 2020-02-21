    'use strict'
    function toDoGenerator(name, $form, $list, $sum, $done, template) {
        this.form = $form;
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
                obj[key] = 'false' ? false : true;
            } else {
                obj[key] = value;
            }

        });
        return obj
    };
    toDoGenerator.prototype.save = function () {
        this.notesJson = JSON.stringify(this.notes);
        localStorage.setItem(this.name, this.notesJson);
    };
    toDoGenerator.prototype.createNotesArray = function () {
        this.formData = new FormData(this.form);
        this.formData.append('id', moment().format('x'));
        this.formData.append('completed', false);
        this.formData.append('time', moment().format('MMMM Do YYYY, h:mm:ss a'));
        this.noteObject = this.formDataToObject(this.formData);
        this.notes.push(this.noteObject);
        this.save();
    };
    toDoGenerator.prototype.setDone = function (id) {
        this.notes.find(el => el.id === id)
            .completed = true;
        this.save()
    };
    toDoGenerator.prototype.removeNote = function (id, confirm) {
        if (confirm === true) {
            const index = this.notes.indexOf(this.notes.find(el => el.id === id));
            this.notes.splice(index, 1);
            this.save()
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
        return this.notes.length
    };
    toDoGenerator.prototype.getDone = function () {
        return this.notes.filter((el) => el.completed === true).length
    };
    toDoGenerator.prototype.renderEditor = function (note, id) {
        note.innerHTML =
            `<input type="text" name="title" value="${this.notes.find(el => el.id === id).title}">
                
                <textarea rows="5"  name="text"  >${this.notes.find(el => el.id === id).text}</textarea>
                <button type="button" class="note_save">Save</button>`


    };
    toDoGenerator.prototype.notesRender = function (container) {
        container.innerHTML = '';
        this.notes.forEach(note => {
            container.innerHTML += this.template(note);
        })
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
                this.renderEditor(e.target.closest('li'), e.target.closest('li').id)

            }
            if (e.target.classList.contains('note_save')) {
                const inputTitle = e.target.parentNode.querySelector('[name="title"]');
                const inputText = e.target.parentNode.querySelector('[name="text"]')
                this.editNote(e.target.parentNode.id, inputTitle.value, inputText.value, confirm('Sure?'));
                this.notesRender(this.list);
            }


        });

    };

    const $form = document.querySelector('form');
    const $list = document.querySelector('.notes');
    const $sum = document.querySelector('.sum_span');
    const $done = document.querySelector('.done_span');
    const toDoList = new toDoGenerator(
        'todo',
        $form,
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