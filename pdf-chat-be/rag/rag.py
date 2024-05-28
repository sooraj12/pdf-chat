import os
from rag.loader import load_unstructured_pdf #load_urls
from rag.retriever import setup_retriever
from rag.graders import (
    setup_retriever_grader,
    setup_hallucination_grader,
    setup_ans_grader,
)
from typing_extensions import TypedDict
from typing import List
from langgraph.graph import StateGraph, END
from rag.generate import rag_chain
from rag.prompts import question_rewriter_prompt
from rag.config import rewriter_llm_name, base_url
# from langchain_groq import ChatGroq
from langchain_community.chat_models import ChatOllama
from langchain_core.output_parsers import StrOutputParser


script_dir = os.path.dirname(__file__)
project_root = os.path.join(script_dir, '..')

def get_file_path(file_name):
    relative_path = os.path.join(project_root, file_name)
    relative_path = os.path.normpath(relative_path)
    return relative_path

# load documents
docs = [
    get_file_path("Tech_Manual_partII_INS_SAMC.pdf"),
    # get_file_path("Updated-44738622-V1-MPS_TECHNICAL_MANUAL.pdf")
    # get_file_path("BNET_SDR.pdf")
]
doc_splits = load_unstructured_pdf(docs)

# setup retriever
retriever = setup_retriever(doc_splits)

## retrieval grader
retrieval_grader = setup_retriever_grader()

rewriter_llm = ChatOllama(base_url=base_url, model=rewriter_llm_name, temperature=0)
# rewriter_llm = ChatGroq(model=rewriter_llm_name, temperature=0)

question_rewriter = question_rewriter_prompt | rewriter_llm | StrOutputParser()

# hallucination grader
hallucination_grader = setup_hallucination_grader()

# answer grader
ans_grader = setup_ans_grader()


# state
class GraphState(TypedDict):
    """
    Represents the state of our graph

    Attributes:
        question: question
        generation: LLM generation
        valid_count: whether to retrieve more documents
        documents: list of documents
    """

    question: str
    generation: str
    documents: List[str]


# define all the nodes
def retrieve(state):
    """
    Retrieve documents from vectorstore

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, documents, that contains retrieved documents
    """
    print("---RETRIEVE---")
    question = state["question"]

    documents = retriever.invoke(question)

    return {
        "question": question,
        "documents": documents,
    }


def grade_documents(state):
    """
    Determines whether the retrieved documents are relevant to the question
    If any document is not relevant, we will set a flag to run web search

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Filtered out irrelevant documents and updated valid_count state
    """
    print("---CHECK DOCUMENT RELEVANCE TO QUESTION---")
    question = state["question"]
    documents = state["documents"]

    filtered_docs = []
    valid_count = 0
    for d in documents:
        score = retrieval_grader.invoke(
            {"question": question, "document": d.page_content}
        )
        grade = score.score
        print(score)

        if grade.lower() == "yes":
            filtered_docs.append(d)
            valid_count += 1
        else:
            continue

    return {
        "documents": filtered_docs,
        "question": question,
    }


def generate(state):
    """
    Generate answer using RAG on retrieved documents

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, generation, that contains LLM generation
    """
    print("---GENERATE---")
    question = state["question"]
    documents = state["documents"]

    generation = rag_chain.invoke({"question": question, "context": documents})

    return {
        "question": question,
        "documents": documents,
        "generation": generation,
    }


def transform_query(state):
    """
    Transform the query to produce a better question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates question key with a re-phrased question
    """

    print("---TRANSFORM QUERY---")
    question = state["question"]
    documents = state["documents"]

    # Re-write question
    better_question = question_rewriter.invoke({"question": question})
    return {"documents": documents, "question": better_question}


# conditional edges
def decide_to_generate(state):
    """
    Determines whether to generate an answer, or add web search

    Args:
        state (dict): The current graph state

    Returns:
        str: Binary decision for next node to call
    """

    print("---ASSESS GRADED DOCUMENTS---")
    filtered_documents = state["documents"]

    if not filtered_documents:
        # All documents have been filtered check_relevance
        # We will re-generate a new query
        print(
            "---DECISION: ALL DOCUMENTS ARE NOT RELEVANT TO QUESTION, TRANSFORM QUERY---"
        )
        return "transform_query"
    else:
        # We have relevant documents, so generate answer
        print("---DECISION: GENERATE---")
        return "generate"


def grade_generation_v_documents_and_question(state):
    """
    Determines whether the generation is grounded in the document and answers question.

    Args:
        state (dict): The current graph state

    Returns:
        str: Decision for next node to call
    """

    print("---CHECK HALLUCINATIONS---")
    question = state["question"]
    documents = state["documents"]
    generation = state["generation"]

    score = hallucination_grader.invoke(
        {"documents": documents, "generation": generation}
    )
    grade = score.score

    # check hallucination
    if grade == "yes":
        score = ans_grader.invoke({"question": question, "generation": generation})
        grade = score.score
        if grade == "yes":
            print("---ANSWER---")
            return "useful"
        else:
            return "not_useful"
    else:
        return "not_supported"


workflow = StateGraph(GraphState)


# define nodes
workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("generate", generate)
workflow.add_node("transform_query", transform_query)

# build graph
workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges(
    "grade_documents",
    decide_to_generate,
    {
        "transform_query": "transform_query",
        "generate": "generate",
    },
)
workflow.add_edge("transform_query", "retrieve")
workflow.add_conditional_edges(
    "generate",
    grade_generation_v_documents_and_question,
    {"not_supported": "generate", "useful": END, "not_useful": "transform_query"},
)

# compile
rag = workflow.compile()
