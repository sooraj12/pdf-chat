from langchain.prompts import PromptTemplate

retriever_grader_prompt = PromptTemplate(
    template="""<|begin_of_text|><|start_header_id|>system<|end_header_id|> You are a grader assessing relevance\n
    of a retrieved document to a user question. It does not need to be a stringent test. The goal is to filter out erroneous retrievals.\n
    If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant.\n
    Give a binary score 'yes' or 'no' score without preamble or explanation to indicate whether the document is relevant to the question. 'yes' means that the document is relevant to the user question.
     <|eot_id|> <|start_header_id|>user<|end_header_id|>
    Here is the retrieved document: \n\n {document} \n\n
    Here is the user question: {question} \n <|eot_id|><|start_header_id|>assistant<|end_header_id|>
    """,
    input_variables=["question", "document"],
)

generate_prompt = PromptTemplate(
    template="""<|begin_of_text|><|start_header_id|>system<|end_header_id|> You are an assistant for question-answering tasks.\n
    Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know.\n 
    Give a concise answer as per the user's requirements. <|eot_id|><|start_header_id|>user<|end_header_id|>
    Question: {question} 
    Context: {context} 
    Answer: <|eot_id|><|start_header_id|>assistant<|end_header_id|>""",
    input_variables=["question", "context"],
)

hallucination_grader_prompt = PromptTemplate(
    template=""" <|begin_of_text|><|start_header_id|>system<|end_header_id|> You are a grader assessing whether 
    an answer is grounded in / supported by a set of facts. Give a binary score 'yes' or 'no' score to indicate 
    whether the answer is grounded in / supported by a set of facts. Provide the binary score as a JSON with a 
    single key 'score' and no preamble or explanation. <|eot_id|><|start_header_id|>user<|end_header_id|>
    Here are the facts:
    \n ------- \n
    {documents} 
    \n ------- \n
    Here is the answer: {generation}  <|eot_id|><|start_header_id|>assistant<|end_header_id|>""",
    input_variables=["generation", "documents"],
)

ans_grader_prompt = PromptTemplate(
    template="""<|begin_of_text|><|start_header_id|>system<|end_header_id|> You are a grader assessing whether an\n
    answer is useful to resolve a question. Give a binary score 'yes' or 'no' without preamble or explanation to indicate whether the answer is\n
    useful to resolve a question. 'yes' means that the answer resolves the question. <|eot_id|><|start_header_id|>user<|end_header_id|> Here is the answer:
    \n ------- \n
    {generation} 
    \n ------- \n
    Here is the question: {question} <|eot_id|><|start_header_id|>assistant<|end_header_id|>""",
    input_variables=["generation", "question"],
)


question_rewriter_prompt = PromptTemplate(
    template="""<|begin_of_text|><|start_header_id|>system<|end_header_id|> You a question re-writer that converts an input question to a better version that is optimized \n 
     for vectorstore retrieval. Look at the input and try to reason about the underlying semantic intent / meaning.
     <|eot_id|><|start_header_id|>user<|end_header_id|> Here is the initial question:
     \n ------- \n
    {question} 
    \n ------- \n
    Formulate an improved question. <|eot_id|><|start_header_id|>assistant<|end_header_id|>""",
    input_variables=["question"]
)