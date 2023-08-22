import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/apis/VectorOperationsApi.js";

export default class DocumentLoader {
  constructor(
    private log: any,
    private embeddings: OpenAIEmbeddings,
    private pineconeIndex: VectorOperationsApi
  ) {}

  async splitData(pdfDocuments: string, chunkSize = 1000, chunkOverlap = 0) {
    try {
      const loader = new PDFLoader(pdfDocuments);
      const docs = await loader.load();
      this.log.info(`You have ${docs.length} documents`);

      // split the texts
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
      });

      const docOutput = await splitter.splitDocuments(docs);
      this.log.info(`After splitting, you have ${docOutput.length} documents`);
      return docOutput;
    } catch (error) {
      this.log.error(
        "Error when splitting pdf document: %s",
        (error as Error).message
      );
      throw error;
    }
  }

  async uploadDoc(
    docs: Document<Record<string, any>>[],
    pineconeStore = PineconeStore
  ) {
    try {
      const result = await pineconeStore.fromDocuments(docs, this.embeddings, {
        pineconeIndex: this.pineconeIndex,
      });
      this.log.info(`Upload the documents to pinecone successfully`);
      return result;
    } catch (error) {
      this.log.error(
        "Error when uploading document to vector database: %s",
        (error as Error).message
      );
      throw error;
    }
  }
}
