from pymongo import MongoClient, errors
from bson import ObjectId


def get_mongo_client():
    try:
        client = MongoClient("mongodb://db:27017")
        return client
    except errors.ConnectionFailure as e:
        print("Failed to connect to MongoDB server: %s", e)
        raise


client = get_mongo_client()

db = client["pdf-chat"]


def insert_or_update_chat(id, msg):
    # Define the filter for the document to update or insert
    filter = {"_id": id}

    # Define the update operation to push a new chat entry into the chats array
    msg_entry_with_id = {**msg, "id": str(ObjectId())}
    existing_title = db.chats.find_one(filter, {"title": 1})

    if not existing_title:
        update = {"$set": {"title": msg["question"]}}
        result = db.chats.update_one(filter, update, upsert=True)

    update = {
        "$push": {"chats": msg_entry_with_id},
    }
    result = db.chats.update_one(filter, update, upsert=True)

    return result


def get_chat_titles():
    projection = {"_id": 1, "title": 1}
    cursor = db.chats.find({}, projection)

    return list(cursor)


def get_chat_history(id):
    cursor = db.chats.find({"_id": id}, {"_id": 1, "chats": 1})

    return list(cursor)
