const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

mongoose.connect(url)
  .then(() => console.log("Connected to DB"))
  .catch(e => console.log(`error connecting to DB: ${e.message}`));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3
  },
  number: {
    type: String,
    required: true,
    minlength:8,
    validate: {
      validator: v => /^\b\d{2,3}\b-\d+$/.test(v),
      message: props => `${props.value} is not a valid number`
    }
  },
});

personSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});


module.exports = mongoose.model("Person", personSchema);


