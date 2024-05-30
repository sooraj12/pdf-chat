from langchain_groq import ChatGroq
# from langchain_community.chat_models import ChatOllama
# from langchain_experimental.llms.ollama_functions import OllamaFunctions
from rag.prompts import (
    retriever_grader_prompt,
    hallucination_grader_prompt,
    ans_grader_prompt,
)
from rag.config import retriever_grader_llm_name, hallucination_grader, base_url
from rag.model import GradeDocuments, GradeHallucinations, GradeAnswer


# grader_llm = OllamaFunctions(
#     base_url=base_url, model=retriever_grader_llm_name, temperature=0, format="json"
# )

# hallucination_grader_llm = OllamaFunctions(
#     base_url=base_url, model=hallucination_grader, temperature=0, format="json"
# )

grader_llm = ChatGroq(
    model=retriever_grader_llm_name,
    temperature=0,
    groq_api_key= "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"
)


hallucination_grader_llm = ChatGroq(
    model=hallucination_grader,
    temperature=0,
    groq_api_key= "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"
)


def setup_retriever_grader():
    retrieval_grader = retriever_grader_prompt | grader_llm.with_structured_output(
        GradeDocuments
    )
    return retrieval_grader


def setup_hallucination_grader():
    hallucination_grader = (
        hallucination_grader_prompt
        | hallucination_grader_llm.with_structured_output(GradeHallucinations)
    )
    return hallucination_grader


def setup_ans_grader():
    ans_grader = ans_grader_prompt | hallucination_grader_llm.with_structured_output(
        GradeAnswer
    )
    return ans_grader
