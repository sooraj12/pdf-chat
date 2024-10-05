from rag.prompts import generate_prompt
from rag.config import ans_generator_llm, base_url

# from langchain_groq import ChatGroq

from langchain_community.chat_models import ChatOllama
from langchain_core.output_parsers import StrOutputParser


llm = ChatOllama(base_url=base_url, model=ans_generator_llm, temperature=0)

rag_chain = generate_prompt | llm | StrOutputParser()
