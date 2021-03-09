const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyCreate = users.some(user => user.username === username);

  if (userAlreadyCreate) {
    return response.status(400).json({ error: 'User already create' });
  }

  const newUser = {
    id: uuidv4(),
    name, 
    username, 
    todos: [],
  };

  users.push(newUser);

  return response.json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const objTodo = {
    title,
    deadline: new Date(deadline),
    done: false,
  }

  const todoExist = user.todos.some(todo => todo.id === id);

  if (!todoExist) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos = user.todos.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...objTodo,
      }
    }

    return item;
  });

  return response.json(objTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const newObjTodo = {
    ...todo,
    done: true,
  }

  user.todos = user.todos.map(item => {
    if (item.id === id) {
      return newObjTodo;
    }

    return item;
  });

  return response.status(200).json(newObjTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos = user.todos.filter(item => item.id !== id);

  return response.status(204).send();
});

module.exports = app;