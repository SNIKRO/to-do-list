const express = require('express');
const listService = require('../../services/items');
const ServiceError = require('../../errors/service');

const router = express.Router();

// get all item by list id
router.get('/:listId/items', async (request, response) => {
  const {
    limit = 25,
    offset = 0,
  } = request.query;
  try {
    const allList = await listService.getAllItemsById(
      request.user,
      request.params.listId,
      limit,
      offset,
    );
    response.send(allList);
  } catch (error) {
    response.status(500).send(error.message);
  }
});
// get single item by id
router.get('/:listId/items/:itemID', async (request, response) => {
  try {
    const singleList = await listService.getSingleItemById(
      request.params.itemID,
      request.params.listId,
      request.user,
    );
    response.send(singleList);
  } catch (error) {
    if (error instanceof ServiceError) {
      response.status(404).send(error.message);
      return;
    }
    response.sendStatus(500);
  }
});
// create item
router.post('/:listId/items', async (request, response) => {
  try {
    const lastID = await listService.createList(
      request.params.listId,
      request.user,
      request.body.description,
    );
    response.status(200).send(lastID);
  } catch (error) {
    if (error instanceof ServiceError) {
      response.status(400).send(error.message);
      return;
    }
    response.sendStatus(500);
  }
});
// update item by id
router.put('/:listId/items/:itemId', async (request, response) => {
  try {
    await listService.createList(
      request.params.itemId,
      request.params.listId,
      request.user,
      request.body.status,
      request.body.description,

    );
    response.sendStatus(200);
  } catch (error) {
    if (error instanceof ServiceError) {
      response.status(404).send(error.message);
      return;
    }
    response.sendStatus(500);
  }
});
// delete item by id
router.delete('/:listId/items/:itemId', async (request, response) => {
  try {
    await listService.deleteList(
      request.params.listId,
      request.params.itemId,
      request.user,
    );
    response.sendStatus(200);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

module.exports = router;
