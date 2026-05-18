import chromadb

client = chromadb.Client()
collection = client.get_or_create_collection("documents")

def store_chunks(chunks, embeddings, doc_id):
    collection.delete(where={"doc_id": doc_id}) if collection.count() > 0 else None
    ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids,
        metadatas=[{"doc_id": doc_id} for _ in chunks]
    )

def retrieve_chunks(query_embedding, n_results=5):
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    return results['documents'][0]