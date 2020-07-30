
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/todolistdb", {useNewUrlParser:true, useUnifiedTopology: true });
const db = mongoose.connection;

const itemsSchema = new mongoose.Schema({ //creates schema (plural)
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items:[itemsSchema]
});


const Item = new mongoose.model("Items", itemsSchema);  // ceates model (singular)
const List = new mongoose.model("List", listSchema);  // ceates model (singular)

const item1 = new Item({
  name: "This is Item 1"
});

const item2 = new Item({
  name: "This is Item 2"
});

const item3 = new Item({
  name: "This is Item 3"
});


const itemArray = [item1,item2,item3];

app.get("/", (req, res) => {

  const day = date.getDate();

  Item.find({},(err,foundItems)=>{
    res.render("list", {listTitle: "Today", newListItem: foundItems});
  });

});

app.post("/", (req, res) =>{

  const item = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name:item
  });

  if(listName==="Today"){
    newItem.save();
    res.redirect("/");
  } else{
    List.findOne({name:listName},(err, foundList)=>{
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
  
});


app.post('/delete', (req, res) => {

  const listName = req.body.listName;
  const checkItem = req.body.checkBox;

  if(listName==="Today"){
        Item.findByIdAndRemove({_id:checkItem},(err)=>{
      if (err){
        console.log(err);
      } else{
        console.log("Successfully deleted item.")
      }
    });
  } else{
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id:checkItem}}},(err, foundList)=>{ //finds item within list with given list name
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
});


app.get("/:listName", (req,res) =>{ // custom lists
  const listName = _.capitalize(req.params.listName);
  
  List.findOne({name:listName},(err, foundList)=>{
    if(!err){
      if(!foundList){
        // creates new list
        const list = new List({
          name:listName,
          items: itemArray
        });
      
        list.save();
        res.redirect("/"+listName);
      }
      else{
        // show existing list
        res.render("list", {listTitle: foundList.name, newListItem: foundList.items});

      }
    } 
  });

});


app.get("/about", (req, res) =>{
  res.render("about");
});



app.listen(3000, () => {
  console.log("Server started on port 3000");
});
