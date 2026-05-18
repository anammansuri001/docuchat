# DocuChat 🤖

Upload any PDF and chat with it using natural language, powered by a RAG pipeline.

## What it does
- Upload any PDF document
- Ask questions in natural language  
- Get AI-generated answers grounded in your document
- Source citations shown for every answer

## Tech Stack
- **Frontend:** React
- **Backend:** Python, Flask
- **Vector DB:** ChromaDB
- **Embeddings:** sentence-transformers
- **LLM:** Google Gemini 2.5 Flash

## How RAG works
1. PDF parsed and split into text chunks
2. Each chunk converted to vector embeddings
3. Stored in ChromaDB vector database
4. User question embedded and matched against stored chunks
5. Top matching chunks sent to Gemini with the question
6. Answer returned with source citations

## Run locally
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm start

## Author
Anam — Year 1 CS @ NTU Singapore