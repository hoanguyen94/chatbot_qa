import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/apis/VectorOperationsApi.js";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import BadRequestError from "../error/bad-request-error.js";
import { YoutubeLoader } from "langchain/document_loaders/web/youtube";

export default class DocumentLoader {
  constructor(
    private log: any,
    private embeddings: OpenAIEmbeddings,
    private pineconeIndex: VectorOperationsApi
  ) {}

  async splitPDFData(
    pdfDocPath: string,
    chunkSize = 1000,
    chunkOverlap = 0
  ): Promise<Document<Record<string, any>>[]> {
    try {
      const loader = new PDFLoader(pdfDocPath);
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
      throw new BadRequestError((error as Error).message);
    }
  }

  async loadCSV(docPath: string): Promise<Document<Record<string, any>>[]> {
    try {
      const loader = new CSVLoader(docPath);
      const result = await loader.load();
      this.log.info(`Load the csv file to pinecone successfully`);
      return result;
    } catch (error) {
      this.log.error(
        "Error when loading csv files: %s",
        (error as Error).message
      );
      throw new BadRequestError((error as Error).message);
    }
  }

  async loadYoutubeVideos(link: string, chunkSize = 2000, chunkOverlap = 0) {
    try {
      const loader = YoutubeLoader.createFromUrl(link, {
        addVideoInfo: true,
        language: "en",
      });
      const docs = await loader.load();

      this.log.info(
        `Load ${docs.length} youtube file to pinecone successfully`
      );

      // split the texts
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
      });

      const docOutput = await splitter.splitDocuments(docs);
      this.log.info(
        `After splitting, you have ${docOutput.length} youtube file to pinecone successfully`
      );
      return docOutput;
    } catch (error) {
      this.log.error(
        "Error when loading youtube files: %s",
        (error as Error).message
      );
      throw new BadRequestError((error as Error).message);
    }
  }

  async uploadDoc(
    docs: Document<Record<string, any>>[],
    pineconeStore = PineconeStore
  ): Promise<PineconeStore> {
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
      throw new BadRequestError((error as Error).message);
    }
  }
}
