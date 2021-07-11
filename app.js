//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const day = date.getDate();
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-eren:0HcbuseBhvrmRbvf@clustertodo.basdi.mongodb.net/TodolistappDatabase?retryWrites=true&w=majority",{useNewUrlParser:true, useUnifiedTopology: true });

const itemsSchema ={
  name: String
};
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const Item = mongoose.model("Item",itemsSchema);
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {


Item.find({},function(err,result){
    if (err) {
      console.log(err);
    } else {
      res.render("list", {listTitle: day, newListItems: result});
    }
  });
});

app.post("/", function(req, res){

  const item = new Item({
    name:req.body.newItem
  });

  if (req.body.list === day) {
    item.save(item)
    res.redirect("/");
  } else {
    List.findOne({name: req.body.list},function(err,foundList){
      if (!err) {
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+foundList.name);
        }
       else {
        console.log(err);
      }
    });
  }
  
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err,foundList){
    if (err) {
      console.log(err)
    } else {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: []
        });
        list.save(list);
        res.redirect("/"+list.name);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }  
    }
   
  });
  
});

app.get("/about", function(req, res){
  res.render("about");
});
app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === day) {
    Item.findByIdAndDelete(checkedItemId,function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Successful Deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
  
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port");
});
