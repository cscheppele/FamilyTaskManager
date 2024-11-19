import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { json } from "body-parser";

const typeDefs = `#graphql
    type Task {
        id: ID!
        title: String!
        description: String!
        category: String!
        completed: Boolean!
    }

    type GroceryItem {
        id: ID!
        name: String!
        grabbed: Boolean!
    }

    type User {
        id: ID!
        username: String!
        password: String!
    }

    type Query {
        tasks(category: String): [Task]
        groceryItems: [GroceryItem]
    }

    type Mutation {
        addTask(title: String!, description: String, category: String!): Task
        removeTask(id: ID!): Task
        toggleTask(id: ID!): Task
        addGroceryItem(name: String!): GroceryItem
        removeGroceryItem(id: ID!): GroceryItem
        toggleGroceryItem(id: ID!): GroceryItem
    }
`

interface Task {
    id: string;
    title: string;
    description?: string;
    category: string;
    completed: boolean;
}

interface GroceryItem {
    id: string;
    name: string;
    grabbed: boolean;
}

let tasks: Task[] = [];
let groceryList: GroceryItem[] = [];

const resolvers = {
    Query: {
        tasks: (_:any, { category }: {category: string}) => {
            return category ? tasks.filter(task => task.category === category) : tasks
        },
        groceryList: () => groceryList,
    },
    Mutation: {
        addTask: (_:any, { title, description, category }: Task) => {
            const newTask: Task = { id: `${tasks.length + 1}`, title, description, category, completed: false };
            tasks.push(newTask);
            return newTask;
        },
        removeTask: (_:any, { id }: {id: string}) => {
            const index = tasks.findIndex(task => task.id === id);
            if (index !== -1) {
                return tasks.splice(index, 1)[0];
            }
            return null;
        },
        toggleTask: (_:any, { id }: {id: string}) => {
            const task = tasks.find(task => task.id === id);
            if (task) {
                task.completed = !task.completed;
            }
            return task;
        },
        addGroceryItem: (_:any, { name }: {name: string}) => {
             const newItem: GroceryItem = { id: `${groceryList.length + 1}`, name, grabbed: false };
            groceryList.push(newItem);
            return newItem;
        },
        removeGroceryItem: (_:any, { id }: {id: string}) => {
            const index = groceryList.findIndex(item => item.id === id);
            if (index !== -1) {
                return groceryList.splice(index, 1)[0];
            }
            return null;
        },
        toggleGroceryItem: (_:any, { id }: {id: string}) => {
            const item = groceryList.find(item => item.id === id);
            if (item) {
                item.grabbed = !item.grabbed;
            }
            return item;
        },
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
app.use(json());
app.use("/graphql", expressMiddleware(server));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));