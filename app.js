const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let db = null;
app.use(express.json());
var format = require("date-fns/format");
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running successfully");
    });
  } catch (e) {
    console.log(`Error :${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

const statusCheck = (requestQuery) => {
  return requestQuery !== undefined;
};
const priorityCheck = (requestQuery) => {
  return requestQuery !== undefined;
};
const checkPriorityandStatus = (status, priority) => {
  return status !== undefined && priority == undefined;
};
const checkCategoryAndWork = (category, status) => {
  return category !== undefined && status !== undefined;
};
const checkCategory = (category) => {
  return category !== undefined;
};
const checkCategoryAndPriority = (category, priority) => {
  return category !== undefined && priority == undefined;
};

//API 1
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  let getQuery = null;
  let dbList = "";
  switch (true) {
    case statusCheck(status):
      getQuery = `
             SELECT * FROM todo WHERE status='${status}';`;
      dbList = await db.all(getQuery);
      response.send(dbList);
      break;
    case priorityCheck(priority):
      getQuery = `
             SELECT * FROM todo WHERE priority='${priority}';`;
      dbList = await db.all(getQuery);
      response.send(dbList);
      break;
    case checkPriorityandStatus(status, priority):
      getQuery = `
             SELECT * FROM todo WHERE status='${status}'AND priority='${priority}';`;
      dbList = await db.all(getQuery);
      response.send(dbList);
      break;
    case checkCategoryAndWork(category, status):
      getQuery = `
             SELECT * FROM todo WHERE status='${status}'AND category='${category}';`;
      dbList = await db.all(getQuery);
      response.send(dbList);
      break;

    case checkCategory(category):
      getQuery = `
             SELECT * FROM todo WHERE category='${category}';`;
      dbList = await db.all(getQuery);
      response.send(dbList);
      break;
    case checkCategoryAndPriority(category, priority):
      getQuery = `
             SELECT * FROM todo WHERE category='${category}' AND priority='${priority}';`;
      dbList = await db.all(getQuery);
      response.send(dbList);
      break;
    default:
      getQuery = `
             SELECT * FROM todo WHERE todo LIKE "%${search_q}%";`;
      dbList = await db.all(getQuery);
      response.send(dbList);
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
    SELECT * FROM todo 
    WHERE id=${todoId};`;
  const getSeparate = await db.get(getQuery);
  response.send(getSeparate);
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const newDate = format(new Date(date), "yyyy-MM-dd");
  const getDate = `
  SELECT * 
  FROM todo
  WHERE 
  due_date='${newDate}';`;
  const newArray = await db.all(getDate);
  if (newArray !== undefined) {
    response.send(newArray);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const getQuery = `
    INSERT INTO todo(id,todo,priority,status,category,due_date)
    VALUES 
    (
        ${id},'${todo}','${priority}','${status}','${category}','${dueDate}'
        
    );`;
  await db.run(getQuery);
  response.send("Todo Successfully Added");
});

//API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  switch (true) {
    case status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const getQuery = `
                UPDATE todo
                 SET
                status='${status}'
                WHERE id=${todoId};`;
        await db.run(getQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const priorityQuery = `
    UPDATE todo
   SET
     priority='${priority}'
     WHERE id=${todoId};`;
        await db.run(priorityQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    case dueDate !== undefined:
      const getDateQuery = `
    UPDATE todo
   SET
     due_date='${dueDate}'
     WHERE id=${todoId};`;
      await db.run(getDateQuery);
      response.send("Due Date Updated");
    case category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        const getCateQuery = `
    UPDATE todo
   SET
     category='${category}'
     WHERE id=${todoId};`;
        await db.run(getCateQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    default:
      const getTodoQuery = `
    UPDATE todo
   SET
     todo='${todo}'
     WHERE id=${todoId};`;
      await db.run(getTodoQuery);
      response.send("Todo Updated");
  }
});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
    DELETE FROM 
     todo
     WHERE id=${todoId};`;
  await db.run(getQuery);
  response.send("Todo Deleted");
});

module.exports = app;
