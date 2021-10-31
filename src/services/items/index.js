const ServiceError = require('../../errors/service');
const itemRepo = require('../../repositories/items');

async function getAllItemsById(userId, listId, limit, offset) {
  const items = await itemRepo.getAllItemsByUserIdAndListId(userId, listId, limit, offset);
  const total = await itemRepo.getItemsCountByUserIdAndListId(listId, userId);
  return {
    rows: items,
    pagination: {
      limit,
      offset,
      total,
    },
  };
}

async function getSingleItemById(itemId, listId, userId) {
  const item = await itemRepo.getSingleItemByListId(itemId, listId, userId);
  if (!item) {
    throw new ServiceError('Not found');
  }
  return item;
}

async function createItem(listId, userId, description) {
  const checkedListId = await itemRepo.listIdExistCheck(listId, userId);
  if (!checkedListId) {
    throw new ServiceError('Bad Request');
  }
  const insertItemId = await itemRepo.insertNewItem(description, listId);
  return insertItemId;
}

async function updateItemById(itemId, listId, userId, status, description) {
  const existItem = await itemRepo.getAllItemsByUserIdAndListId(itemId, listId, userId);
  if (!existItem) {
    throw new ServiceError('Not found');
  }
  const currentStatus = status ?? existItem.status;
  const currentDescription = description ?? existItem.description;
  await itemRepo.updateItemById(currentStatus, currentDescription, itemId);
}

async function deleteItem(listId, itemId, userId) {
  await itemRepo.deleteItem(listId, itemId, userId);
}
module.exports = {
  getAllItemsById,
  getSingleItemById,
  updateItemById,
  createItem,
  deleteItem,
};
