from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    UnstructuredFileLoader
)
# from langchain_community.vectorstores.utils import filter_complex_metadata


def load_urls(docs):
    docs = [PyPDFLoader(doc, extract_images=True).load() for doc in docs]
    docs_list = [item for sublist in docs for item in sublist]
    # split documents into chunks
    # TODO: fix chunk_overlap
    text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=500, chunk_overlap=100
    )
    doc_splits = text_splitter.split_documents(docs_list)
    print("**************Documents loaded from disk")

    return doc_splits


def load_unstructured_pdf(docs):
    docs = [UnstructuredFileLoader(doc).load() for doc in docs]
    docs_list = [item for sublist in docs for item in sublist]
    # split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=500, chunk_overlap=50
    )
    doc_splits = text_splitter.split_documents(docs_list)
    print("**************Documents loaded from disk")

    return doc_splits
