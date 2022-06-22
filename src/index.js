require("dotenv").config();
const express = require("express");
const app = express();
const Person = require("./models/person");

const cors = require("cors");
app.use(cors());

app.use(express.static("build"));

app.use(express.json());

var morgan = require("morgan");
morgan.token("data", req => {return JSON.stringify(req.body);});
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :data"));

/*let database = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
];
*/

app.get("/api/persons", (req, res, next) => {
  Person.find({}).then(d => res.json(d)).catch(e => next(e));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
  /*
    const id = Number(req.params.id);
    const person = database.find(p => p.id === id);
    if (person) {
        res.json(person);
    }
    else {
        res.status(404).end();
    }
    */
});

app.get("/info", (req, res, next) => {
  Person.countDocuments({})
    .then(r => {
      res.send(`<p>Phonebook has info for ${r} people<br/><br/> ${String(new Date())}</p>`);
    }).catch(e => next(e));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(d => {
      if (d) {
        res.status(204).end();
      }
      else {
        res.status(404).end();
      }
    }).catch(e => next(e));
  /*
    const id = Number(req.params.id);
    if (database.find(p => p.id === id)) {
      database = database.filter(p => p.id !== id);
      res.status(204).end();
    }
    else {
      res.status(404).end();
    }
    */
});

app.post("/api/persons", (req, res, next) => {
  const person = req.body;
  if (!person || !person.name || !person.number) {
    res.status(400).json({ error: "invalid data"});
    return;
  }
  const dbperson = new Person({name:person.name, number:person.number});
  dbperson.save()
    .then(p => res.json(p))
    .catch(e => next(e));
  /*
    if (database.find(p => p.name.toUpperCase() === person.name.toUpperCase())) {
        res.status(400).json({error: "name must be unique"});
        return;
    }
    const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const nperson = {...person, id:id};
    database.push(nperson);
    res.json(nperson);
    */
});

app.put("/api/persons/:id", (req, res, next) => {
  const person = req.body;
  if (!person || !person.name || !person.number) {
    res.status(400).json({ error: "invalid data"});
    return;
  }
  const nperson = {name:person.name, number:person.number};
  Person.findByIdAndUpdate(req.params.id, nperson, {new:true, runValidators:true, context:"query"})
    .then(d => res.json(d))
    .catch(e => next(e));
});

const unknownEntrypoint = (req, res) => {
  res.status(404).send({error:"unknown entrypoint"});
};

app.use(unknownEntrypoint);

const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.name === "CastError") {
    return res.status(400).send({error: "invalid id"});
  }
  if (err.name === "ValidationError") {
    return res.status(400).send({error: err.message});
  }
  next(err);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


