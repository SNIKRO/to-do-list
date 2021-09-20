const express = require('express');
const listService = require('../../services/lists');
const ServiceError = require('../../errors/service');

const router = express.Router();
// take all list
router.get('/', async (request, response) => {
  const {
    limit = 25,
    offset = 0,
  } = request.query;
  try {
    const allLists = await listService.getAllList(request.user, limit, offset);
    response.send(allLists);
  } catch (error) {
    response.status(500).send(error.message);
  }
});
// request list by id
router.get('/:id', async (request, response) => {
  try {
    const listById = await listService.getListById(request.params.id, request.user);
    response.send(listById);
  } catch (error) {
    if (error instanceof ServiceError) {
      response.status(404).send(error.message);
      return;
    }
    response.sendStatus(500);
  }
});
// create new list
router.post('/', async (request, response) => {
  try {
    const newListId = await listService.createList(request.body.name, request.user);
    response.status(201).send(newListId);
  } catch (error) {
    response.status(500).send(error.message);
  }
});
// change list by id
router.put('/:id', async (request, response) => {
  try {
    await listService.updateList(request.body.name, request.params.id, request.user);
    response.sendStatus(200);
  } catch (error) {
    response.status(500).send(error.message);
  }
});
// delete list by id
router.delete('/:id', async (request, response) => {
  try {
    await listService.deleteList();
    response.sendStatus(200);
  } catch (error) {
    response.status(500).send(error.message);
  }
});
// shared list
router.post('/:listId/share', async (request, response) => {
  try {
    await listService.shareList(request.user, request.params.listId, request.body.email);
    response.send('List is shared to user');
  } catch (error) {
    if (error instanceof ServiceError) {
      response.status(404).send(error.message);
      return;
    }
    response.sendStatus(500);
  }
});
module.exports = router;
