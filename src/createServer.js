'use strict';

const express = require('express');

function createServer() {
  const app = express();

  app.use(express.json());

  let users = [];
  let expenses = [];

  const nextUserId = () => {
    if (users.length === 0) {
      return 1;
    }

    return Math.max(...users.map((user) => user.id)) + 1;
  };

  const nextExpensesId = () => {
    if (expenses.length === 0) {
      return 1;
    }

    return Math.max(...expenses.map((expense) => expense.id)) + 1;
  };

  app.get('/users', (req, res) => {
    res.json(users);
  });

  app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const chosenUser = users.find((user) => user.id === parseInt(id));

    if (!chosenUser) {
      return res.sendStatus(404);
    }
    res.send(chosenUser);
  });

  app.post('/users', express.json(), (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.sendStatus(400);
    }

    const user = { id: nextUserId(), name };

    users.push(user);
    res.status(201).send(user);
  });

  app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const newUsers = users.filter((user) => user.id !== parseInt(id));

    if (users.length === newUsers.length) {
      return res.sendStatus(404);
    }

    users = newUsers;
    res.sendStatus(204);
  });

  app.patch('/users/:id', express.json(), (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const chosenUser = users.find((user) => user.id === parseInt(id));

    if (typeof name !== 'string') {
      return res.sendStatus(400);
    }

    if (!chosenUser) {
      return res.sendStatus(404);
    }

    if (!name) {
      return res.sendStatus(400);
    }

    Object.assign(chosenUser, { name });
    res.send(chosenUser);
  });

  app.get('/expenses', (req, res) => {
    const { userId, from, to, categories } = req.query;

    if (!userId && !categories && (!from || !to)) {
      res.send(expenses);
    }

    const normalizedCategories =
      Array.isArray(categories) || !categories ? categories : [categories];

    let filteredExpenses = expenses;

    if (userId) {
      filteredExpenses = filteredExpenses.filter((expense) => {
        return expense.userId === parseInt(userId);
      });
    }

    if (normalizedCategories) {
      filteredExpenses = expenses.filter((expense) => {
        return normalizedCategories.includes(expense.category);
      });
    }

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      filteredExpenses = expenses.filter((expense) => {
        const spentAt = new Date(expense.spentAt);

        return spentAt >= fromDate && spentAt <= toDate;
      });
    }

    res.send(filteredExpenses);
  });

  app.get('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const chosenExpense = expenses.find(
      (expense) => expense.id === parseInt(id),
    );

    if (!chosenExpense) {
      res.sendStatus(404);

      return;
    }
    res.send(chosenExpense);
  });

  app.post('/expenses', express.json(), (req, res) => {
    const { userId, spentAt, title, amount, category, note } = req.body;

    if (!userId || !spentAt || !title || !amount || !category || !note) {
      return res.sendStatus(400);
    }

    const findUser = users.find((user) => user.id === userId);

    if (!findUser) {
      return res.sendStatus(400);
    }

    const newExpense = {
      id: nextExpensesId(),
      userId,
      spentAt,
      title,
      amount,
      category,
      note,
    };

    expenses.push(newExpense);
    res.status(201).send(newExpense);
  });

  app.delete('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const newExpenses = expenses.filter(
      (expense) => expense.id !== parseInt(id),
    );

    if (expenses.length === newExpenses.length) {
      return res.sendStatus(404);
    }
    expenses = newExpenses;
    res.sendStatus(204);
  });

  app.patch('/expenses/:id', express.json(), (req, res) => {
    const { id } = req.params;
    const chosenExpense = expenses.find(
      (expense) => expense.id === parseInt(id),
    );

    if (!chosenExpense) {
      return res.sendStatus(404);
    }
    Object.assign(chosenExpense, req.body);
    res.status(200).send(chosenExpense);
  });

  return app;
}

module.exports = {
  createServer,
};
