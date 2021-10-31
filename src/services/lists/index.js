const ServiceError = require('../../errors/service');
const listRepo = require('../../repositories/list');
const userRepo = require('../../repositories/user');

async function getAllLists(userId, limit, offset) {
  const lists = await listRepo.getListsByUserId(userId, limit, offset);
  const total = await listRepo.getListsCountByUserId(userId);
  return {
    rows: lists,
    pagination: {
      limit,
      offset,
      total,
    },
  };
}

async function getListById(listId, userId) {
  const list = await listRepo.getListById(listId, userId);
  if (list === undefined) {
    throw new ServiceError('Not found');
  }
  return list;
}

async function createList(listName, userId) {
  const listId = await listRepo.createList(listName, userId);
  return listId;
}

async function updateList(listName, listId, userId) {
  await listRepo.updateList(listName, listId, userId);
}

async function deleteList(listId, userId) {
  await listRepo.deleteList(listId, userId);
}

async function shareList(userId, listId, email) {
  const list = await listRepo.getListById(listId, userId);
  if (!list) {
    throw new ServiceError('Forbidden');
  }
  const userRow = await userRepo.getUserByEmail(email);
  if (!userRow) {
    throw new ServiceError('User not found');
  }
  await listRepo.shareList(userRow.id, listId);
}
module.exports = {
  getAllLists,
  getListById,
  createList,
  updateList,
  deleteList,
  shareList,
};
