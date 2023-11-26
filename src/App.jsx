import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editedTodo, setEditedTodo] = useState(null);

  const CACHE_EXPIRATION_TIME = 1; 

  useEffect(() => {
    const getCurrentDate = () => new Date();

    const lastUpdateFromStorage = localStorage.getItem('lastCacheUpdate');
    if (!lastUpdateFromStorage || (getCurrentDate() - new Date(lastUpdateFromStorage)) > CACHE_EXPIRATION_TIME) {
      fetchTodosFromServer();
    } else {
      const cachedData = JSON.parse(localStorage.getItem('todos'));
      setTodos(cachedData);
    }
  }, []);

  const fetchTodosFromServer = () => {
    axios.get('http://localhost:3000/todo')
      .then(response => {
        console.log(response.data);
        setTodos(response.data);
        saveTodosToLocalStorage(response.data);
        localStorage.setItem('lastCacheUpdate', getCurrentDate().toString());
      })
      .catch(error => console.error('Error fetching todos:', error));
  };

  const getCurrentDate = () => new Date();

  const saveTodosToLocalStorage = (todos) => {
    localStorage.setItem('todos', JSON.stringify(todos));
  };

  const handleAddTodo = () => {
    axios.post('http://localhost:3000/todo', { text: newTodo, fecha: '', done: false })
      .then(response => {
        const updatedTodos = [...todos, response.data];
        setTodos(updatedTodos);
        saveTodosToLocalStorage(updatedTodos);
        setNewTodo('');
      })
      .catch(error => console.error('Error adding todo:', error));
  };

  const handleEditTodo = (_id, newText, newDone) => {
    axios.patch(`http://localhost:3000/todo/${_id}`, { text: newText, done: newDone })
      .then(response => {
        const updatedTodos = todos.map(todo => (todo._id === _id ? response.data : todo));
        setTodos(updatedTodos);
        saveTodosToLocalStorage(updatedTodos);
        setEditedTodo(null);
      })
      .catch(error => console.error('Error editing todo:', error));
  };

  const handleDeleteTodo = (_id) => {
    axios.delete(`http://localhost:3000/todo/${_id}`)
      .then(() => {
        const updatedTodos = todos.filter(todo => todo._id !== _id);
        setTodos(updatedTodos);
        saveTodosToLocalStorage(updatedTodos);
      })
      .catch(error => console.error('Error deleting todo:', error));
  };

  const handleToggleDone = (_id, currentDone) => {
    const newDone = !currentDone;
    const updatedTodos = todos.map(todo => (todo._id === _id ? { ...todo, done: newDone } : todo));
    setTodos(updatedTodos);
    saveTodosToLocalStorage(updatedTodos);
  };

  const handleEditTodoStart = (_id) => {
    setNewTodo(todos.find(todo => todo._id === _id).text);
    setEditedTodo(_id);
  };

  return (
    <div>
      <div className={`content-title`}>
        <h1>To do App</h1>
      </div>
      <div className={`request`}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Type your task"
        />
        <button
          onClick={handleAddTodo}
          disabled={editedTodo !== null}
          className={`add-button`}
        >
          Add New Task
        </button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo._id} className={todo.done ? 'done' : ''}>
            {editedTodo === todo._id ? (
              <>
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className={`input`}
                />
                <button onClick={() => handleEditTodo(todo._id, newTodo, todo.done)} className={`button`}>
                  Save
                </button>
              </>
            ) : (
              <>
                {todo.text}
                <div className="button-container">
                  <button onClick={() => handleEditTodoStart(todo._id)} disabled={editedTodo !== null} className={`button`}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTodo(todo._id)} disabled={editedTodo !== null} className={`button`}>
                    Delete
                  </button>
                  <button onClick={() => handleToggleDone(todo._id, todo.done)} className={`button`}>
                    {todo.done ? 'Undo' : 'Done'}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
