import { useEffect, useState } from 'react'

import numService from './services/phonebook'

const Number = ({name, number, id, delnumHandler}) => {
  return <p>{name} {number} <button name={name} id={id} onClick={delnumHandler}>delete</button></p>;
}

const Filter = ({target, handler}) => <div>filter shown with <input value={target} onChange={handler}/></div>
const AllNumbers = ({persons, filter, delNumberHandler}) => persons
.filter(p => p.name.toUpperCase().match(filter.toUpperCase()))
.map(p => 
    <Number name={p.name} number={p.number} id={p.id} key={p.name} delnumHandler={delNumberHandler}/>)
const NumForm = ({newName, newNameHandler, newNumber, newNumberHandler, submitHandler}) =>
  <form>
    <div>
      name: <input value={newName} onChange={newNameHandler}/>
    </div>
    <div>number: <input value={newNumber} onChange={newNumberHandler}/></div>
    <div>
      <button type="submit" onClick={submitHandler}>add</button>
    </div>
  </form>

const Message = ({message}) => {
  if (!message) return null;
  return (
    <div id='msgdiv' className={message.type}>
      {message.msg}
    </div>
  )
}

let timeout = null;

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState(null);


  useEffect(() => {
    numService.getAll().then(d => setPersons(d));
  },[]);
  useEffect(() => {
    if (!message) return;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      setMessage(null);
    }, 5000);
  }, [message]);

  const delnumHandler = e => {
    if (window.confirm(`Delete ${e.target.name} ?`)) {
      const resp = numService.delNumber(e.target.id);
      resp.then(r => {
        setPersons(persons.filter(p => p.name.toUpperCase() !== e.target.name.toUpperCase()));
        setMessage({msg:`deleted ${e.target.name}`, type:'success'});
      }).catch(exp => {
        if (exp.response.status === 404) {
          setPersons(persons.filter(p => p.name.toUpperCase() !== e.target.name.toUpperCase()));
          setMessage({msg:`failed to delete ${e.target.name}, doesn't exists on server`, type:'error'});
        }
        else {
          setMessage({msg:`failed to delete ${e.target.name}`, type:'error'});
        }
      });
    }
  }

  const click = (e) => {
    e.preventDefault();
    // tyhjät nimet / numerot?
    const p = persons.find(e => e.name.toUpperCase() === newName.toUpperCase());
    if (p) {
      if (window.confirm(`${newName} is already added to the phonebook, replace the old number with a new one?`)) {
        const resp = numService.updNumber(p.id, {name:newName, number:newNumber});
        resp.then(r => {
          setPersons(persons.map(mp => mp.name.toUpperCase() === p.name.toUpperCase() ? r : mp));
          setMessage({msg:`edited ${r.name} number from ${p.number} to ${r.number}`, type:'success'});
          setNewName('');
          setNewNumber('');
        }).catch(exp => {
          if (exp.request.status === 404) {
            setMessage({msg:`failed to edit ${p.name}, doesn't exists on server`, type:'error'});
            setPersons(persons.filter(p => p.name.toUpperCase() !== newName.toUpperCase()));
          }
          else {
            setMessage({msg:`failed to edit ${p.name}`, type:'error'});
          }
        });
      }
      return;
    }
    const resp = numService.addNumber({name:newName, number:newNumber});
    resp.then(r => {
      setPersons(persons.concat(r));
      setMessage({msg:`added ${r.name}`, type:'success'});
      setNewName('');
      setNewNumber('');
    }).catch(exp => {
        setMessage({msg:`${exp.response.data.error}`, type:'error'});
    });
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Message message={message}/>
      <Filter target={filter} handler={(e) => setFilter(e.target.value)} />
      <h2>add a new</h2>
      <NumForm newName={newName} 
        newNameHandler={e => setNewName(e.target.value)}
        newNumber={newNumber} 
        newNumberHandler={e => setNewNumber(e.target.value)}
        submitHandler={click}/>
      <h2>Numbers</h2>
      <AllNumbers persons={persons} filter={filter} delNumberHandler={delnumHandler}/>
    </div>
  )
}

export default App

