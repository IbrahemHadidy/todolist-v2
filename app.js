const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3001;
const _ = require('lodash');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));


async function main() {

    try {

        await mongoose.connect('mongodb+srv://admin:admin123@cluster0.uxugupx.mongodb.net/todolistDB');

        const itemsSchema = mongoose.Schema({
            name: String
        });

        const Item = mongoose.model('Item', itemsSchema);

        const item1 = new Item({
            name: 'Welcome to your ToDo list!'
        });

        const item2 = new Item({
            name: 'Hit the + button to add a new item.'
        });

        const item3 = new Item({
            name: '<<<  hit this to delete an item.'
        });

        const listSchema = {
            name: String,
            items: [itemsSchema]
        }

        const List = mongoose.model("List", listSchema);

        const day = "Today";

        app.post('/', async (req, res) => {

            const itemName = req.body.newItem;
            const listName = req.body.list;

            const item = new Item({
                name: itemName
            });

            if (listName === day) {
                await item.save();
                res.redirect("/");
            } else {
                const foundList = await List.findOne({
                    name: listName
                });
                foundList.items.push(item);
                await foundList.save();
                console.log(day);
                res.redirect("/" + listName);
            }

        });

        app.post('/delete', async (req, res) => {

            const checkedItemId = req.body.checkbox;
            const listName = req.body.listName;
            if (listName === "Today") {
                await Item.findByIdAndDelete(checkedItemId);
                res.redirect("/");
            } else {
                await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
                res.redirect("/" + listName);
            }

        });

        app.get('/', async (req, res) => {


            const defaultItems = [item1, item2, item3];
            const foundItems = await Item.find({});

            if (foundItems.length === 0) {

                await Item.insertMany(defaultItems);
                res.redirect("/");

            } else {

                res.render("list", {
                    listTitle: day,
                    newListItems: foundItems
                });

            }


        });

        app.get('/:customListName', async (req, res) => {

            const customListName = _.capitalize(req.params.customListName);

            const defaultItems = [item1, item2, item3];

            const foundList = await List.findOne({
                name: customListName
            });
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                await list.save();
                res.redirect("/" + customListName)
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }






        });

        app.get('/about', (req, res) => {

            res.render("about");

        });



    } catch (err) {
        console.log(err.stack);
    } finally {
        // mongoose.connection.close();
    }
}
main().catch(err => console.log(err));


const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
