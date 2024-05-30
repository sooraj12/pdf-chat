from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from langchain.pydantic_v1 import BaseModel
from rag.rag import rag
from db import insert_or_update_chat, get_chat_titles, get_chat_history

server = FastAPI(
    title="RAG Server",
    version="1.0",
    description="A simple API server using LangChain's Runnable interfaces",
)

origins = ["*"]

server.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@server.get("/health")
async def health():
    return {"status": "OK"}


class Data(BaseModel):
    question: str
    id: str


# def create_generator(query):
#     for event in rag.invoke(query):
#         yield "data: " + event.content + "\n\n"


@server.post("/api/generate")
async def chat(data: Data):
    id = data.id
    question = data.question

    res = rag.invoke({"question": question}, {"recursion_limit" : 10})
    documents = res["documents"]
    ans = res["generation"]

    # for PyPDFLoader
    meta = [
        # {"page": doc.metadata["page"], "source": doc.metadata["source"]}
        # for doc in documents
    ]
    # for unstructuredPDFLoader
    # meta = [
    #     {"page": doc.metadata["page_number"], "source": doc.metadata["file_directory"]}
    #     for doc in documents
    # ]

    chat = {"answer": ans, "references": meta, "question": question}

    # save question, ans and references to db
    insert_or_update_chat(id, chat)

    return chat


@server.get("/api/titles")
async def get_titles():
    return get_chat_titles()


@server.get("/api/history")
async def get_history(id: str = Query(..., alias="id")):
    print(id)
    return get_chat_history(id)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app=server, host="0.0.0.0", port=8080)
