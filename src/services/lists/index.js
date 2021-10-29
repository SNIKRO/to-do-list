const ServiceError = require('../../errors/service');
const db = require('../../db');
const listRepo = require('../../repositories/list');

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

function shareList(userId, listId, email) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM list
            WHERE user_id = ? AND id = ?
            `,
      [userId, listId],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        if (!row) {
          reject(new ServiceError('Forbidden'));
          return;
        }
        db.get(
          `SELECT id FROM user
                WHERE email = ?
                `,
          [email],
          (userError, userRow) => {
            if (userError) {
              reject(userError);
              return;
            }
            if (!userRow) {
              reject(new ServiceError('User not found'));
              return;
            }
            db.run(
              `INSERT INTO shared_list(user_id, list_id)
                    VALUES (?, ?) ON CONFLICT DO NOTHING
                    `,
              [userRow.id, listId],
              (insertError) => {
                if (insertError) {
                  reject(insertError);
                  return;
                }
                resolve();
              },
            );
          },
        );
      },
    );
  });
}
module.exports = {
  getAllList: getAllLists,
  getListById,
  createList,
  updateList,
  deleteList,
  shareList,
};
