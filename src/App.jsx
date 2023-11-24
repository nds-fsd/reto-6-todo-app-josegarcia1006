import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editedTodo, setEditedTodo] = useState(null);

  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    } else {
      fetchTodos();
    }
  }, []);

  const fetchTodos = () => {
    axios.get('http://localhost:3000/todo')
      .then(response => {
        setTodos(response.data);
        saveTodosToLocalStorage(response.data);
      })
      .catch(error => console.error('Error fetching todos:', error));
  };

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

  const handleEditTodo = (id, newText, newDone) => {
    axios.patch(`http://localhost:3000/todo/${id}`, { text: newText, done: newDone })
      .then(response => {
        const updatedTodos = todos.map(todo => (todo.id === id ? response.data : todo));
        setTodos(updatedTodos);
        saveTodosToLocalStorage(updatedTodos);
        setEditedTodo(null);
      })
      .catch(error => console.error('Error editing todo:', error));
  };

  const handleDeleteTodo = (id) => {
    axios.delete(`http://localhost:3000/todo/${id}`)
      .then(() => {
        const updatedTodos = todos.filter(todo => todo.id !== id);
        setTodos(updatedTodos);
        saveTodosToLocalStorage(updatedTodos);
      })
      .catch(error => console.error('Error deleting todo:', error));
  };

  const handleToggleDone = (id, currentDone) => {
    const newDone = !currentDone;
    const updatedTodos = todos.map(todo => (todo.id === id ? { ...todo, done: newDone } : todo));
    setTodos(updatedTodos);
    saveTodosToLocalStorage(updatedTodos);
  };

  const handleEditTodoStart = (id) => {
    setNewTodo(todos.find(todo => todo.id === id).text);
    setEditedTodo(id);
  };

  return (
    <div>
      <div className={`content-title`}>
        <h1>House cleaning checklist</h1>
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
          <li key={todo.id} className={todo.done ? 'done' : ''}>
            <>
              {editedTodo === todo.id ? (
                <>
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    className={`input`}
                  />
                  <button onClick={() => handleEditTodo(todo.id, newTodo, todo.done)} className={`button`}>
                    Save
                  </button>
                </>
              ) : (
                <>
                  {todo.text}
                  <div className="button-container">
                    <button onClick={() => handleEditTodoStart(todo.id)} disabled={editedTodo !== null} className={`button`}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteTodo(todo.id)} disabled={editedTodo !== null} className={`button`}>
                      Delete
                    </button>
                    <button onClick={() => handleToggleDone(todo.id, todo.done)} className={`button`}>
                      {todo.done ? 'Undo' : 'Done'}
                    </button>
                  </div>
                </>
              )}
            </>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
