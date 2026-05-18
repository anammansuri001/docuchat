from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz
from google import genai
from dotenv import load_dotenv
import os
import uuid

from chunker import chunk_text
from embedder import get_embeddings, model
from retriever import store_chunks, retrieve_chunks

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    doc_id = str(uuid.uuid4())
    filepath = os.path.join(UPLOAD_FOLDER, f"{doc_id}.pdf")
    file.save(filepath)

    pdf = fitz.open(filepath)
    text = ""
    for page in pdf:
        text += page.get_text()
    pdf.close()

    if not text.strip():
        return jsonify({"error": "Could not extract text from PDF"}), 400

    chunks = chunk_text(text)
    embeddings = get_embeddings(chunks)
    store_chunks(chunks, embeddings, doc_id)

    return jsonify({"doc_id": doc_id, "chunks": len(chunks)})


@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question")
    doc_id = data.get("doc_id")

    if not question or not doc_id:
        return jsonify({"error": "Missing question or doc_id"}), 400

    query_embedding = model.encode(question).tolist()
    relevant_chunks = retrieve_chunks(query_embedding)

    context = "\n\n".join(relevant_chunks)

    prompt = f"""You are a helpful assistant. Answer the user's question based ONLY on the document context below.
If the answer isn't in the context, say "I couldn't find that in the document."

Context:
{context}

Question: {question}

Answer:"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return jsonify({
        "answer": response.text,
        "sources": relevant_chunks
    })


@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "DocuChat backend running"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)