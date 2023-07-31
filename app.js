const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
app.use(express.json());
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

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

//API 1
app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q = "" } = request.query;
  let getQuery = null;
  let dbList = "";
  switch (true) {
    case status !== undefined:
      const statusCheck = ["TO DO", "IN PROGRESS", "DONE"];
      if (statusCheck.includes(status)) {
        getQuery = `
             SELECT * FROM todo WHERE status='${status}';`;
        dbList = await db.all(getQuery);
        response.send(
          dbList.map((each) => ({
            id: each.id,
            todo: each.todo,
            priority: each.priority,
            status: each.status,
            category: each.category,
            dueDate: each.due_date,
          }))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case priority !== undefined:
      const prior = ["HIGH", "MEDIUM", "LOW"];
      if (prior.includes(priority)) {
        getQuery = `
             SELECT * FROM todo WHERE priority='${priority}';`;
        dbList = await db.all(getQuery);
        response.send(
          dbList.map((each) => ({
            id: each.id,
            todo: each.todo,
            priority: each.priority,
            status: each.status,
            category: each.category,
            dueDate: each.due_date,
          }))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case status !== undefined && priority !== undefined:
      getQuery = `
             SELECT * FROM todo WHERE status='${status}'AND priority='${priority}';`;
      dbList = await db.all(getQuery);
      response.send(
        dbList.map((each) => ({
          id: each.id,
          todo: each.todo,
          priority: each.priority,
          status: each.status,
          category: each.category,
          dueDate: each.due_date,
        }))
      );
      break;
    case category !== undefined && status !== undefined:
      getQuery = `
             SELECT * FROM todo WHERE status='${status}'AND category='${category}';`;
      dbList = await db.all(getQuery);
      response.send(
        dbList.map((each) => ({
          id: each.id,
          todo: each.todo,
          priority: each.priority,
          status: each.status,
          category: each.category,
          dueDate: each.due_date,
        }))
      );
      break;

    case category !== undefined:
      const categoryCheck = ["WORK", "HOME", "LEARNING"];
      if (categoryCheck.includes(category)) {
        getQuery = `
             SELECT * FROM todo WHERE category='${category}';`;
        dbList = await db.all(getQuery);
        response.send(
          dbList.map((each) => ({
            id: each.id,
            todo: each.todo,
            priority: each.priority,
            status: each.status,
            category: each.category,
            dueDate: each.due_date,
          }))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;
    case (category !== undefined) & (priority !== undefined):
      getQuery = `
             SELECT * FROM todo WHERE category='${category}' AND priority='${priority}';`;
      dbList = await db.all(getQuery);
      response.send(
        dbList.map((each) => ({
          id: each.id,
          todo: each.todo,
          priority: each.priority,
          status: each.status,
          category: each.category,
          dueDate: each.due_date,
        }))
      );
      break;
    default:
      getQuery = `
             SELECT * FROM todo WHERE todo LIKE "%${search_q}%";`;
      dbList = await db.all(getQuery);
      response.send(
        dbList.map((each) => ({
          id: each.id,
          todo: each.todo,
          priority: each.priority,
          status: each.status,
          category: each.category,
          dueDate: each.due_date,
        }))
      );
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
    SELECT * FROM todo 
    WHERE id=${todoId};`;
  const getSeparate = await db.get(getQuery);
  response.send({
    id: getSeparate.id,
    todo: getSeparate.todo,
    priority: getSeparate.priority,
    status: getSeparate.status,
    category: getSeparate.category,
    dueDate: getSeparate.due_date,
  });
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  if (isValid(new Date(date))) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const getDate = `
  SELECT * 
  FROM todo
  WHERE 
  due_date='${newDate}';`;
    const newArray = await db.all(getDate);
    response.send(
      newArray.map((each) => ({
        id: each.id,
        todo: each.todo,
        priority: each.priority,
        status: each.status,
        category: each.category,
        dueDate: each.due_date,
      }))
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const checkPriority = (priority) => {
    if (priority !== undefined) {
      const prior = ["HIGH", "MEDIUM", "LOW"];
      if (prior.includes(priority)) {
        return priority;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    }
  };
  const priorityRep = checkPriority(priority);
  const statusCheck = (status) => {
    if (status !== undefined) {
      const statusCheck = ["TO DO", "IN PROGRESS", "DONE"];
      if (statusCheck.includes(status)) {
        return status;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    }
  };
  const statusRep = statusCheck(status);

  const categoryRep = (category) => {
    if (category !== undefined) {
      const categoryCheck = ["WORK", "HOME", "LEARNING"];
      if (categoryCheck.includes(category)) {
        return category;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    }
  };
  const categoryValue = categoryRep(category);
  const checkDate = (dueDate) => {
    if (dueDate !== undefined) {
      if (isValid(new Date(dueDate))) {
        const newDate = format(new Date(dueDate), "yyyy-MM-dd");
        return newDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
    }
  };
  const dateValue = checkDate(dueDate);
  const getQuery = `
    INSERT INTO todo(id,todo,priority,status,category,due_date)
    VALUES 
    (
        ${id},'${todo}','${priorityRep}','${statusRep}','${categoryValue}','${dateValue}'
        
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
      break;
    case dueDate !== undefined:
      const dateValid = isValid(new Date(dueDate));
      if (isValid(new Date(dueDate))) {
        const dateFormat = format(new Date(dueDate), "yyyy-MM-dd");
        const getDateQuery = `
                UPDATE todo
                   SET
                due_date='${dueDate}'
                WHERE id=${todoId};`;
        await db.run(getDateQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
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
      break;
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
