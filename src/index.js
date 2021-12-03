const express = require('express');
const cors = require('cors');
const { v4:uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(user =>
    user.username === username)
  
  if(!user){
    return response.status(400).json({error: "User not found"})
  }
  
  request.user = user;

  return next();

}


app.post('/users', (request, response) => {
  const {name, username} = request.body;
  
  const userAlredyExists = users.some((user) => 
    user.username === username
  );

  if(userAlredyExists){
    return response.status(400).json({
      error:"User Already Exists !"
    })
  }
  users.push({
    name, 
    username,
    id: uuidv4(),
    todos: []
  });

  return response.status(201).send();

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;

  const statementTask = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(statementTask);
  return response.status(201).send();

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const {id} = request.params;

  const todo = user.todos.find((todo) => todo.id === id)

  if(!todo){
    return response.status(400).json({error: "User not found"})
  }
  todo.title = title;
  todo.deadline = deadline;
  return response.status(201).send();

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {id} = request.params;
  const todo = user.todos.find((todo) => todo.id === id)

  if(!todo){
    return response.status(400).json({error: "User not found"})
  }
  todo.done = true;
  return response.status(201).send();

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { user } = request;
  const {id} = request.params;

  const todo = user.todos.findIndex((todo) => todo.id === id)

  if(todo === -1){
    return response.status(400).json({error: "User not found"})
  }

  user.todos.splice(todo, 1)
  return response.status(200).json(user);

});

module.exports = app;