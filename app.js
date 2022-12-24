//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://soumyacode:soumya8755@cluster0.btzlms1.mongodb.net/?retryWrites=true&w=majority/todolistDB");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemschema=new mongoose.Schema({
    name:String
    
});
const Item=mongoose.model("Item",itemschema);
const item1=new Item({
  name:"buy food"
});
const item2=new Item({
  name:"eat food"
});
const item3=new Item({
  name:"eat more food"
});

const listschema=new mongoose.Schema({
  name:String,
  items:[itemschema]
});
const List=mongoose.model("List",listschema);


const defaultItems=[item1,item2,item3];

app.get("/", function(req, res) {


  Item.find({},function(err,items)
  {
    if(items.length===0)
    {
      Item.insertMany(defaultItems,function(err)
      {
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log("success");
      }
      });
      res.redirect("/");
    }
      res.render("list", {listTitle: "Today", newListItems: items});
  });
});



app.post("/", function(req, res){

   
  const itemName = req.body.newItem;
  const listname=req.body.list;

   const item=new Item({
    name:itemName
   });

   if(listname==="Today")
   {
    item.save();
    res.redirect("/");
   }
   else
   {
    List.findOne({name:listname},function(err,foundlist)
    {
foundlist.items.push(item);
foundlist.save();
res.redirect("/"+listname);
    });
   }
 
});

app.post("/delete",function(req,res)
{
  const itemid=req.body.checkbox;
  const listname=req.body.listname;
  if(listname==="Today")
  {
    Item.findByIdAndRemove(itemid,function(err)
    {
      if(err)
      {
        console.log(err);
      }
      else{
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items: {_id:itemid}}},function(err,foundlist)
    {
      if(!err)
      {
        res.redirect("/"+listname);
      }
    });
  }
 
});

app.get("/:customlistnames", function(req,res){
  const customlistnames=_.capitalize(req.params.customlistnames);
  List.findOne({name:customlistnames},function(err,foundlist)
  {
    if(!err)
    {
      if(!foundlist)
      {
        const list=new List({
          name:customlistnames,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+ customlistnames);
      }
      else
      {
res.render("list",{listTitle: foundlist.name, newListItems: foundlist.items});
      }
    }
  });
 
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
