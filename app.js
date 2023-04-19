//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");


const app = express();
let port = process.env.PORT || 3000;
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.CONN_URL, {useNewUrlParser:true})
.then(()=>{
   console.log("Connection Successful...");
}).catch((err)=>{
   console.log(err);
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Welcome to the To Do List!🙂"
});

const item2 = new Item({
  name: "Meet Vinit🙂🤩"
});

const defaultItems = [item1, item2];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
app.get("/", function(req, res) {

const day = date.getDate();

Item.find({}, function(err, foundItems){

  if (foundItems.length === 0) {
    Item.insertMany(defaultItems, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully saved default items to DB.");
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: day, newListItems: foundItems});
  }
});

});

// for finding the blank space at starting
function hasSpace(sentence) {
  return sentence.indexOf(" ") === 0;
}

app.post("/", function(req, res){
  const itemName = req.body.newItem;
   if(!hasSpace(itemName)){
     const item = new Item({
       name: itemName
     });
      item.save();
      console.log("1 item is added to the list");
   }
   res.redirect("/");
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;

    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log(`Server has started on the port ${port}`);
});
